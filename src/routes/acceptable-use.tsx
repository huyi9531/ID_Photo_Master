import { createFileRoute } from "@tanstack/react-router"
import LegalDocument from "@/components/LegalDocument"

export const Route = createFileRoute("/acceptable-use")({
  component: AcceptableUsePage,
})

function AcceptableUsePage() {
  return (
    <LegalDocument
      title="Acceptable Use Policy"
      subtitle="AIConductor PhotoID is designed for lawful ID photo formatting of images you own or are authorized to use. 中文说明：只允许处理本人或已获授权的人像照片。"
      updated="July 6, 2026"
      sections={[
        {
          title: "Allowed use",
          body: [
            "You may use the service to format a lawful portrait photo, adjust standard ID photo background colors, and apply simple attire style optimization while preserving the subject's identity features.",
            "The result should be used only where such AI-assisted formatting is permitted by the receiving organization or applicable rules.",
          ],
        },
        {
          title: "Prohibited content",
          body: [
            "You may not request or upload NSFW content, sexual content, exploitative content, hateful content, violent content, self-harm content, or other harmful material.",
            "You may not request face swaps, deepfakes, identity feature changes, celebrity images, public figure images, or third-party photos without explicit authorization.",
          ],
        },
        {
          title: "Prohibited conduct",
          body: [
            "You may not use the service to forge identity documents, commit fraud, impersonate another person, bypass verification systems, misrepresent identity, or create deceptive official-looking materials.",
            "Attempts to evade moderation, automate abuse, probe payment systems, or resell credits without permission may be blocked.",
          ],
        },
        {
          title: "Enforcement",
          body: [
            "We use prompt moderation before image generation. Requests marked deny or flag are blocked and do not consume a credit.",
            "If you believe a request was blocked in error, contact support@aiconductor.top with the purchase token and a short description of the intended lawful use.",
          ],
        },
      ]}
    />
  )
}
