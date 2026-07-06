import "@tanstack/react-start/server-only"
import { env } from "cloudflare:workers"

export type PurchaseStatus =
  | "pending"
  | "paid"
  | "processing"
  | "used"
  | "refunded"

export interface PurchaseRecord {
  token: string
  request_id: string
  status: PurchaseStatus
  customer_email: string | null
  checkout_id: string | null
  checkout_url: string | null
  order_id: string | null
  transaction_id: string | null
  product_id: string | null
  amount_cents: number | null
  currency: string | null
  credits_total: number
  credits_used: number
  creem_mode: string | null
  created_at: string
  updated_at: string
  paid_at: string | null
  used_at: string | null
  refunded_at: string | null
}

interface CreatePendingPurchaseOptions {
  token: string
  requestId: string
  customerEmail: string | null
}

interface CheckoutUpdateOptions {
  token: string
  checkoutId: string | null
  checkoutUrl: string | null
}

interface PaidPurchaseOptions {
  requestId: string
  customerEmail: string | null
  checkoutId: string | null
  orderId: string | null
  transactionId: string | null
  productId: string | null
  amountCents: number | null
  currency: string | null
  creemMode: string | null
  metadata: unknown
}

interface GenerationAttemptOptions {
  id: string
  purchaseToken: string
  status: "moderation_blocked" | "failed" | "succeeded"
  moderationId: string | null
  moderationDecision: string | null
  promptLength: number
  resultImageUrl: string | null
  errorMessage: string | null
}

export function getDb(): D1Database {
  if (!env.DB) {
    throw new Error("Cloudflare D1 binding DB is not configured")
  }

  return env.DB
}

export function normalizeEmail(email: string | null | undefined): string | null {
  const normalized = email?.trim().toLowerCase()
  return normalized || null
}

export async function createPendingPurchase(
  db: D1Database,
  { token, requestId, customerEmail }: CreatePendingPurchaseOptions,
): Promise<void> {
  const now = new Date().toISOString()

  await db
    .prepare(
      `
      INSERT INTO purchases (
        token,
        request_id,
        status,
        customer_email,
        credits_total,
        credits_used,
        created_at,
        updated_at
      )
      VALUES (?, ?, 'pending', ?, 1, 0, ?, ?)
      `,
    )
    .bind(token, requestId, normalizeEmail(customerEmail), now, now)
    .run()
}

export async function updateCheckoutDetails(
  db: D1Database,
  { token, checkoutId, checkoutUrl }: CheckoutUpdateOptions,
): Promise<void> {
  await db
    .prepare(
      `
      UPDATE purchases
      SET checkout_id = ?,
          checkout_url = ?,
          updated_at = ?
      WHERE token = ?
      `,
    )
    .bind(checkoutId, checkoutUrl, new Date().toISOString(), token)
    .run()
}

export async function getPurchaseByToken(
  db: D1Database,
  token: string,
): Promise<PurchaseRecord | null> {
  return db
    .prepare(
      `
      SELECT
        token,
        request_id,
        status,
        customer_email,
        checkout_id,
        checkout_url,
        order_id,
        transaction_id,
        product_id,
        amount_cents,
        currency,
        credits_total,
        credits_used,
        creem_mode,
        created_at,
        updated_at,
        paid_at,
        used_at,
        refunded_at
      FROM purchases
      WHERE token = ?
      `,
    )
    .bind(token)
    .first<PurchaseRecord>()
}

export async function reserveCredit(
  db: D1Database,
  token: string,
): Promise<PurchaseRecord | null> {
  const now = new Date().toISOString()
  const result = await db
    .prepare(
      `
      UPDATE purchases
      SET status = 'processing',
          updated_at = ?
      WHERE token = ?
        AND status = 'paid'
        AND credits_used < credits_total
      `,
    )
    .bind(now, token)
    .run()

  if (result.meta.changes !== 1) {
    return getPurchaseByToken(db, token)
  }

  return getPurchaseByToken(db, token)
}

export async function restoreReservedCredit(
  db: D1Database,
  token: string,
): Promise<void> {
  await db
    .prepare(
      `
      UPDATE purchases
      SET status = 'paid',
          updated_at = ?
      WHERE token = ?
        AND status = 'processing'
      `,
    )
    .bind(new Date().toISOString(), token)
    .run()
}

export async function consumeReservedCredit(
  db: D1Database,
  token: string,
): Promise<number> {
  const now = new Date().toISOString()

  const result = await db
    .prepare(
      `
      UPDATE purchases
      SET credits_used = credits_used + 1,
          status = CASE
            WHEN credits_used + 1 >= credits_total THEN 'used'
            ELSE 'paid'
          END,
          used_at = CASE
            WHEN credits_used + 1 >= credits_total THEN ?
            ELSE used_at
          END,
          updated_at = ?
      WHERE token = ?
        AND status = 'processing'
        AND credits_used < credits_total
      `,
    )
    .bind(now, now, token)
    .run()

  return result.meta.changes ?? 0
}

export async function markPurchasePaid(
  db: D1Database,
  {
    requestId,
    customerEmail,
    checkoutId,
    orderId,
    transactionId,
    productId,
    amountCents,
    currency,
    creemMode,
    metadata,
  }: PaidPurchaseOptions,
): Promise<number> {
  const now = new Date().toISOString()
  const result = await db
    .prepare(
      `
      UPDATE purchases
      SET status = CASE
            WHEN status = 'pending' THEN 'paid'
            ELSE status
          END,
          customer_email = COALESCE(?, customer_email),
          checkout_id = COALESCE(?, checkout_id),
          order_id = COALESCE(?, order_id),
          transaction_id = COALESCE(?, transaction_id),
          product_id = COALESCE(?, product_id),
          amount_cents = COALESCE(?, amount_cents),
          currency = COALESCE(?, currency),
          creem_mode = COALESCE(?, creem_mode),
          metadata_json = ?,
          paid_at = COALESCE(paid_at, ?),
          updated_at = ?
      WHERE request_id = ?
        AND status IN ('pending', 'paid')
      `,
    )
    .bind(
      normalizeEmail(customerEmail),
      checkoutId,
      orderId,
      transactionId,
      productId,
      amountCents,
      currency,
      creemMode,
      JSON.stringify(metadata ?? {}),
      now,
      now,
      requestId,
    )
    .run()

  return result.meta.changes ?? 0
}

export async function getWebhookEvent(
  db: D1Database,
  id: string,
): Promise<{ id: string } | null> {
  return db
    .prepare("SELECT id FROM webhook_events WHERE id = ?")
    .bind(id)
    .first<{ id: string }>()
}

export async function insertWebhookEvent(
  db: D1Database,
  {
    id,
    eventType,
    payloadJson,
    creemCreatedAt,
  }: {
    id: string
    eventType: string
    payloadJson: string
    creemCreatedAt: number | null
  },
): Promise<void> {
  await db
    .prepare(
      `
      INSERT OR IGNORE INTO webhook_events (
        id,
        event_type,
        payload_json,
        creem_created_at,
        processed_at
      )
      VALUES (?, ?, ?, ?, ?)
      `,
    )
    .bind(id, eventType, payloadJson, creemCreatedAt, new Date().toISOString())
    .run()
}

export async function logGenerationAttempt(
  db: D1Database,
  {
    id,
    purchaseToken,
    status,
    moderationId,
    moderationDecision,
    promptLength,
    resultImageUrl,
    errorMessage,
  }: GenerationAttemptOptions,
): Promise<void> {
  const now = new Date().toISOString()

  await db
    .prepare(
      `
      INSERT INTO generation_attempts (
        id,
        purchase_token,
        status,
        moderation_id,
        moderation_decision,
        prompt_length,
        result_image_url,
        error_message,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      id,
      purchaseToken,
      status,
      moderationId,
      moderationDecision,
      promptLength,
      resultImageUrl,
      errorMessage,
      now,
      now,
    )
    .run()
}
