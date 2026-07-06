import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { getCreemProductId, verifyCreemWebhookSignature } from "@/lib/creem.server"
import {
  getDb,
  getWebhookEvent,
  insertWebhookEvent,
  markPurchasePaid,
} from "@/lib/db.server"

const webhookSchema = z.object({
  id: z.string().min(1),
  eventType: z.string().min(1),
  created_at: z.number().nullable().optional(),
  object: z.record(z.string(), z.unknown()),
})

export const Route = createFileRoute("/api/webhooks/creem")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text()
        const signature = request.headers.get("creem-signature")
        const isValid = await verifyCreemWebhookSignature(rawBody, signature)

        if (!isValid) {
          console.error("Rejected Creem webhook with invalid signature", {
            hasSignature: Boolean(signature),
          })
          return Response.json({ error: "Invalid signature" }, { status: 401 })
        }

        let payload: unknown

        try {
          payload = JSON.parse(rawBody)
        } catch (parseError: unknown) {
          console.error("Invalid Creem webhook JSON", { parseError })
          return Response.json({ error: "Invalid JSON body" }, { status: 400 })
        }

        const parsed = webhookSchema.safeParse(payload)

        if (!parsed.success) {
          console.error("Unexpected Creem webhook payload", {
            issues: parsed.error.issues,
          })
          return Response.json({ error: "Unexpected webhook payload" }, { status: 400 })
        }

        const db = getDb()
        const existingEvent = await getWebhookEvent(db, parsed.data.id)

        if (existingEvent) {
          return Response.json({ received: true, duplicate: true })
        }

        if (parsed.data.eventType !== "checkout.completed") {
          await insertWebhookEvent(db, {
            id: parsed.data.id,
            eventType: parsed.data.eventType,
            payloadJson: rawBody,
            creemCreatedAt: parsed.data.created_at ?? null,
          })
          return Response.json({ received: true, ignored: true })
        }

        const checkout = parsed.data.object
        const productId = getProductId(checkout)
        const expectedProductId = getCreemProductId()

        if (productId !== expectedProductId) {
          console.error("Ignored Creem checkout webhook for unexpected product", {
            eventId: parsed.data.id,
            productId,
            expectedProductId,
          })
          await insertWebhookEvent(db, {
            id: parsed.data.id,
            eventType: parsed.data.eventType,
            payloadJson: rawBody,
            creemCreatedAt: parsed.data.created_at ?? null,
          })
          return Response.json({ received: true, ignored: true })
        }

        const requestId = getString(checkout.request_id)

        if (!requestId) {
          console.error("Creem checkout webhook missing request_id", {
            eventId: parsed.data.id,
          })
          return Response.json({ error: "Missing request_id" }, { status: 400 })
        }

        const changes = await markPurchasePaid(db, {
          requestId,
          customerEmail: getCustomerEmail(checkout),
          checkoutId: getString(checkout.id),
          orderId: getId(checkout.order),
          transactionId: getOrderTransactionId(checkout.order),
          productId,
          amountCents: getOrderAmount(checkout.order),
          currency: getOrderCurrency(checkout.order),
          creemMode: getString(checkout.mode),
          metadata: checkout.metadata ?? {},
        })

        if (changes !== 1) {
          console.error("Creem checkout webhook could not mark purchase paid", {
            eventId: parsed.data.id,
            requestId,
            changes,
          })
          return Response.json({ error: "Purchase not found" }, { status: 404 })
        }

        await insertWebhookEvent(db, {
          id: parsed.data.id,
          eventType: parsed.data.eventType,
          payloadJson: rawBody,
          creemCreatedAt: parsed.data.created_at ?? null,
        })

        return Response.json({ received: true })
      },
    },
  },
})

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null
}

function getNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function getRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null
}

function getId(value: unknown): string | null {
  if (typeof value === "string") return value
  return getString(getRecord(value)?.id)
}

function getProductId(checkout: Record<string, unknown>): string | null {
  return getId(checkout.product) ?? getId(getRecord(checkout.order)?.product)
}

function getCustomerEmail(checkout: Record<string, unknown>): string | null {
  return getString(getRecord(checkout.customer)?.email)
}

function getOrderAmount(order: unknown): number | null {
  return getNumber(getRecord(order)?.amount)
}

function getOrderCurrency(order: unknown): string | null {
  return getString(getRecord(order)?.currency)
}

function getOrderTransactionId(order: unknown): string | null {
  return getId(getRecord(order)?.transaction)
}
