import { createFileRoute } from "@tanstack/react-router"
import LegalDocument from "@/components/LegalDocument"
import { useI18n } from "@/lib/i18n"

export const Route = createFileRoute("/terms")({
  component: TermsPage,
})

function TermsPage() {
  const { language } = useI18n()
  const copy = termsCopy[language]

  return <LegalDocument {...copy} />
}

const termsCopy = {
  en: {
    title: "Terms of Service",
    subtitle:
      "These terms govern use of AIConductor PhotoID. The service formats photos and does not issue official identification documents.",
    updated: "July 6, 2026",
    backLabel: "Back to AIConductor PhotoID",
    updatedLabel: "Last updated",
    sections: [
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
    ],
  },
  zh: {
    title: "服务条款",
    subtitle:
      "本条款适用于证照优化大师的使用。本服务用于照片排版和风格优化，不签发任何官方身份证件。",
    updated: "2026 年 7 月 6 日",
    backLabel: "返回证照优化大师",
    updatedLabel: "最后更新",
    sections: [
      {
        title: "服务说明",
        body: [
          "证照优化大师为用户提交的照片提供智能证件照排版、背景颜色优化和服装风格优化。",
          "本服务不验证法定身份、不签发官方文件、不保证任何政府机构或第三方一定接受结果，也不授权任何欺诈性用途。",
        ],
      },
      {
        title: "一次性购买",
        body: [
          "单次购买价格为 $1.00 美元，提供 1 次智能证件照排版额度。",
          "额度仅在生成成功后扣除。生成失败、审核拦截或审核服务失败都不会扣除额度。",
        ],
      },
      {
        title: "用户责任",
        body: [
          "你必须拥有或已获授权使用每一张上传照片。未经适当授权，不得上传名人、公众人物、未成年人、私人个体或第三方照片。",
          "你同意不将本服务用于欺诈、伪造身份证明、冒充他人、换脸、深度伪造、成人内容、有害、违法或欺骗性用途。",
        ],
      },
      {
        title: "客服",
        body: [
          "如果付款成功但额度没有出现，请保留支付成功页展示的购买凭证，并联系 support@aiconductor.top。",
          "对于违反本条款、可接受使用政策、支付处理方要求或适用法律的请求，我们可能拒绝或拦截。",
        ],
      },
    ],
  },
} as const
