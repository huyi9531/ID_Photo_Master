import { createFileRoute } from "@tanstack/react-router"
import LegalDocument from "@/components/LegalDocument"

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      subtitle="AIConductor PhotoID helps users format ID photos. This policy explains what we collect, how we use it, and how to contact us. 中文说明：我们只收集完成支付、额度查询和图片处理所必需的信息。"
      updated="July 6, 2026"
      sections={[
        {
          title: "Information we collect",
          body: [
            "When you buy a single photo credit, we store the purchase token, Creem checkout/order identifiers, payment status, optional email address, credit usage status, and basic timestamps in Cloudflare D1.",
            "When you submit a photo for formatting, the image and formatting prompt are sent to our AI image provider to produce the result. AIConductor PhotoID does not store your original uploaded photo in our database.",
          ],
        },
        {
          title: "How we use information",
          body: [
            "We use purchase metadata to confirm payment, issue one generation credit, prevent duplicate webhook processing, answer support requests, and process eligible refunds.",
            "We use the uploaded image only to perform ID photo formatting, background optimization, and attire style optimization requested by the user.",
          ],
        },
        {
          title: "Service providers",
          body: [
            "Creem processes checkout and payment events. Cloudflare provides hosting and D1 storage. Our image generation provider processes the photo and prompt needed to create the result.",
            "We do not sell personal information. We do not use uploaded photos to create public galleries or marketing claims.",
          ],
        },
        {
          title: "Retention and support",
          body: [
            "Purchase and generation attempt metadata may be retained for support, abuse prevention, accounting, and refund handling. Original uploaded photos are not retained by AIConductor PhotoID.",
            "For privacy requests, lost purchase tokens, or refund questions, contact support@aiconductor.top.",
          ],
        },
      ]}
    />
  )
}
