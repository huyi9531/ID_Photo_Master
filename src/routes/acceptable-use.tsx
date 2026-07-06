import { createFileRoute } from "@tanstack/react-router"
import LegalDocument from "@/components/LegalDocument"
import { useI18n } from "@/lib/i18n"

export const Route = createFileRoute("/acceptable-use")({
  component: AcceptableUsePage,
})

function AcceptableUsePage() {
  const { language } = useI18n()
  const copy = acceptableUseCopy[language]

  return <LegalDocument {...copy} />
}

const acceptableUseCopy = {
  en: {
    title: "Acceptable Use Policy",
    subtitle:
      "AIConductor PhotoID is designed for lawful ID photo formatting of images you own or are authorized to use.",
    updated: "July 6, 2026",
    backLabel: "Back to AIConductor PhotoID",
    updatedLabel: "Last updated",
    sections: [
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
    ],
  },
  zh: {
    title: "可接受使用政策",
    subtitle: "证照优化大师仅用于处理你本人拥有或已获授权使用的合法人像照片。",
    updated: "2026 年 7 月 6 日",
    backLabel: "返回证照优化大师",
    updatedLabel: "最后更新",
    sections: [
      {
        title: "允许的用途",
        body: [
          "你可以使用本服务处理合法人像照片，调整标准证件照背景色，并在保留人物身份特征的前提下进行简单服装风格优化。",
          "生成结果只应在接收机构或相关规则允许智能辅助排版的场景中使用。",
        ],
      },
      {
        title: "禁止内容",
        body: [
          "不得请求或上传成人内容、性内容、剥削性内容、仇恨内容、暴力内容、自伤内容或其他有害材料。",
          "不得请求换脸、深度伪造、改变身份特征、名人图片、公众人物图片，或未经明确授权的第三方照片。",
        ],
      },
      {
        title: "禁止行为",
        body: [
          "不得使用本服务伪造身份证明、实施欺诈、冒充他人、绕过验证系统、误导身份，或制作具有欺骗性的官方外观材料。",
          "规避审核、自动化滥用、探测支付系统或未经许可转售额度的行为可能会被拦截。",
        ],
      },
      {
        title: "执行方式",
        body: [
          "我们会在图像生成前进行提示词审核。被标记为拒绝或风险的请求会被拦截，且不会消耗额度。",
          "如果你认为请求被误拦截，请携带购买凭证和合法用途说明联系 support@aiconductor.top。",
        ],
      },
    ],
  },
} as const
