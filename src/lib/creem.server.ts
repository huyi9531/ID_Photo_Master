import "@tanstack/react-start/server-only"
import { env } from "cloudflare:workers"

const DEFAULT_CREEM_API_BASE = "https://test-api.creem.io"

interface CreateCheckoutOptions {
  requestId: string
  productId: string
  successUrl: string
  customerEmail: string | null
  metadata: Record<string, string>
}

interface CreemCheckoutResponse {
  id?: string
  checkout_url?: string
}

interface ScreenPromptResponse {
  id: string
  decision: "allow" | "deny" | "flag"
}

type SecretName =
  | "CREEM_API_KEY"
  | "CREEM_WEBHOOK_SECRET"
  | "CREEM_PRODUCT_ID"

function getSecret(name: SecretName): string {
  const value = env[name] ?? process.env[name]

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

export function getCreemApiBase(): string {
  const base = env.CREEM_API_BASE ?? process.env.CREEM_API_BASE ?? DEFAULT_CREEM_API_BASE
  return base.replace(/\/+$/, "")
}

export function getCreemProductId(): string {
  return getSecret("CREEM_PRODUCT_ID")
}

export async function createCreemCheckout({
  requestId,
  productId,
  successUrl,
  customerEmail,
  metadata,
}: CreateCheckoutOptions): Promise<{ id: string | null; checkoutUrl: string }> {
  const response = await fetch(`${getCreemApiBase()}/v1/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getSecret("CREEM_API_KEY"),
    },
    body: JSON.stringify({
      request_id: requestId,
      product_id: productId,
      units: 1,
      success_url: successUrl,
      metadata,
      ...(customerEmail ? { customer: { email: customerEmail } } : {}),
    }),
  })

  const responseText = await response.text()
  let payload: CreemCheckoutResponse | null = null

  try {
    payload = responseText ? (JSON.parse(responseText) as CreemCheckoutResponse) : null
  } catch (parseError: unknown) {
    console.error("Failed to parse Creem checkout response JSON", {
      status: response.status,
      responseText,
      parseError,
    })
  }

  if (!response.ok) {
    throw new Error(`Creem checkout error ${response.status}: ${responseText}`)
  }

  if (!payload?.checkout_url) {
    console.error("Creem checkout response missing checkout_url", { payload })
    throw new Error("Creem checkout did not return a checkout URL")
  }

  return {
    id: payload.id ?? null,
    checkoutUrl: payload.checkout_url,
  }
}

export async function screenPrompt(
  prompt: string,
  externalId: string,
): Promise<ScreenPromptResponse> {
  const response = await fetch(`${getCreemApiBase()}/v1/moderation/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getSecret("CREEM_API_KEY"),
    },
    body: JSON.stringify({
      prompt,
      external_id: externalId,
    }),
  })

  const responseText = await response.text()
  let payload: ScreenPromptResponse | null = null

  try {
    payload = responseText ? (JSON.parse(responseText) as ScreenPromptResponse) : null
  } catch (parseError: unknown) {
    console.error("Failed to parse Creem moderation response JSON", {
      status: response.status,
      responseText,
      externalId,
      parseError,
    })
  }

  if (!response.ok) {
    throw new Error(`Creem moderation error ${response.status}: ${responseText}`)
  }

  if (
    !payload ||
    !payload.id ||
    (payload.decision !== "allow" &&
      payload.decision !== "deny" &&
      payload.decision !== "flag")
  ) {
    console.error("Creem moderation response has unexpected shape", {
      externalId,
      payload,
    })
    throw new Error("Creem moderation returned an unexpected response")
  }

  return payload
}

export async function verifyCreemWebhookSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret("CREEM_WEBHOOK_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody))
  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")

  return timingSafeEqual(expected, signature)
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false

  let diff = 0
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i)
  }

  return diff === 0
}
