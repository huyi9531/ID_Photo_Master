import { createFileRoute } from "@tanstack/react-router"
import LegalDocument from "@/components/LegalDocument"

export const Route = createFileRoute("/refund")({
  component: RefundPage,
})

function RefundPage() {
  return (
    <LegalDocument
      title="Refund Policy"
      subtitle="AIConductor PhotoID offers a 7-day refund window for unused single photo credits. 中文说明：购买后 7 天内，未使用额度支持退款。"
      updated="July 6, 2026"
      sections={[
        {
          title: "Eligible refunds",
          body: [
            "Unused single photo credits can be refunded within 7 days of purchase. To request a refund, email support@aiconductor.top with your purchase token and payment email if available.",
            "If payment completed but no usable credit was issued due to a service fault, contact support and we will help resolve the credit or refund the purchase where appropriate.",
          ],
        },
        {
          title: "Non-refundable usage",
          body: [
            "Credits consumed by a successful generation are generally non-refundable, because the AI processing service has already been delivered.",
            "Requests blocked by moderation, failed moderation availability, or failed image generation do not consume a credit, so the unused-credit refund window still applies.",
          ],
        },
        {
          title: "Refund processing",
          body: [
            "Approved refunds are processed through Creem or the original payment method when available. Processing time may depend on the payment method and banking network.",
            "We may deny refund requests connected to abuse, fraud, chargeback manipulation, policy violations, or use outside the Acceptable Use Policy.",
          ],
        },
      ]}
    />
  )
}
