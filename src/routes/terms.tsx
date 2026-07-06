import { createFileRoute } from "@tanstack/react-router"
import LegalDocument from "@/components/LegalDocument"

export const Route = createFileRoute("/terms")({
  component: TermsPage,
})

function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      subtitle="These terms govern use of AIConductor PhotoID, also known in Chinese as 证照优化大师. 中文说明：本服务用于证件照排版、背景和服装风格优化，不是政府证件签发服务。"
      updated="July 6, 2026"
      sections={[
        {
          title: "Service description",
          body: [
            "AIConductor PhotoID provides AI-assisted ID photo formatting, background color optimization, and attire style optimization for photos submitted by the user.",
            "The service does not verify legal identity, issue official documents, guarantee acceptance by any government agency, or authorize fraudulent use of an image.",
          ],
        },
        {
          title: "One-time purchase",
          body: [
            "A single purchase of AIConductor PhotoID - Single Photo Credit costs $1.00 USD and provides one AI photo formatting credit.",
            "A credit is consumed only after a generation succeeds. Failed AI generation, moderation blocks, and moderation service failures do not consume the credit.",
          ],
        },
        {
          title: "User responsibilities",
          body: [
            "You must own or be authorized to use every photo you upload. You may not submit photos of celebrities, public figures, minors, private individuals, or third parties without appropriate rights and consent.",
            "You agree not to use the service for fraud, forged identification, impersonation, face swap, deepfake, NSFW, harmful, unlawful, or deceptive purposes.",
          ],
        },
        {
          title: "Support",
          body: [
            "If a payment succeeds but the credit does not appear, keep the purchase token shown after checkout and contact support@aiconductor.top.",
            "We may refuse or block requests that violate these terms, the Acceptable Use Policy, payment processor requirements, or applicable law.",
          ],
        },
      ]}
    />
  )
}
