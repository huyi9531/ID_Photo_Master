import { createFileRoute } from "@tanstack/react-router"
import { env } from "cloudflare:workers"
import { z } from "zod"
import { createCreemCheckout, getCreemProductId } from "@/lib/creem.server"
import {
  createPendingPurchase,
  getDb,
  normalizeEmail,
  updateCheckoutDetails,
} from "@/lib/db.server"

const checkoutRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((value) => normalizeEmail(value)),
})

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown

        try {
          body = await request.json()
        } catch (parseError: unknown) {
          console.error("Invalid checkout request JSON", { parseError })
          return Response.json({ error: "Invalid JSON body" }, { status: 400 })
        }

        const parsed = checkoutRequestSchema.safeParse(body)

        if (!parsed.success) {
          console.error("Invalid checkout request body", {
            issues: parsed.error.issues,
          })
          return Response.json({ error: "Invalid email address" }, { status: 400 })
        }

        const db = getDb()
        const token = crypto.randomUUID()
        const requestId = `photoid_${token}`
        const siteUrl = getPublicSiteUrl(request)
        const successUrl = `${siteUrl}/success?token=${encodeURIComponent(token)}`
        const productId = getCreemProductId()

        try {
          await createPendingPurchase(db, {
            token,
            requestId,
            customerEmail: parsed.data.email,
          })

          const checkout = await createCreemCheckout({
            requestId,
            productId,
            successUrl,
            customerEmail: parsed.data.email,
            metadata: {
              purchaseToken: token,
              product: "single-photo-credit",
              brand: "AIConductor PhotoID",
            },
          })

          await updateCheckoutDetails(db, {
            token,
            checkoutId: checkout.id,
            checkoutUrl: checkout.checkoutUrl,
          })

          return Response.json({
            checkoutUrl: checkout.checkoutUrl,
            token,
          })
        } catch (checkoutError: unknown) {
          const message =
            checkoutError instanceof Error ? checkoutError.message : "Checkout failed"

          console.error("Failed to create Creem checkout", {
            message,
            requestId,
            productId,
            hasEmail: Boolean(parsed.data.email),
            checkoutError,
          })

          return Response.json(
            { error: "Unable to start checkout. Please try again." },
            { status: 500 },
          )
        }
      },
    },
  },
})

function getPublicSiteUrl(request: Request): string {
  const configured =
    env.PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? new URL(request.url).origin

  return configured.replace(/\/+$/, "")
}
