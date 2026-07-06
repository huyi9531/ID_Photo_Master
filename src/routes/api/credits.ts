import { createFileRoute } from "@tanstack/react-router"
import { getDb, getPurchaseByToken } from "@/lib/db.server"

export const Route = createFileRoute("/api/credits")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("token")?.trim()

        if (!token) {
          return Response.json({ error: "Missing token" }, { status: 400 })
        }

        const purchase = await getPurchaseByToken(getDb(), token)

        if (!purchase) {
          return Response.json({ error: "Purchase not found" }, { status: 404 })
        }

        const creditsRemaining =
          purchase.status === "paid"
            ? Math.max(0, purchase.credits_total - purchase.credits_used)
            : 0

        return Response.json({
          token: purchase.token,
          status: purchase.status,
          creditsRemaining,
          customerEmail: purchase.customer_email,
          paidAt: purchase.paid_at,
          usedAt: purchase.used_at,
        })
      },
    },
  },
})
