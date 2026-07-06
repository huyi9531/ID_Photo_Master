import { createFileRoute } from "@tanstack/react-router"
import LegalDocument from "@/components/LegalDocument"
import { useI18n } from "@/lib/i18n"

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
})

function PrivacyPage() {
  const { language } = useI18n()
  const copy = privacyCopy[language]

  return <LegalDocument {...copy} />
}

const privacyCopy = {
  en: {
    title: "Privacy Policy",
    subtitle:
      "AIConductor PhotoID helps users format ID photos. This policy explains what we collect, how we use it, and how to contact us.",
    updated: "July 6, 2026",
    backLabel: "Back to AIConductor PhotoID",
    updatedLabel: "Last updated",
    sections: [
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
    ],
  },
  zh: {
    title: "隐私政策",
    subtitle:
      "证照优化大师用于证件照排版、背景与服装风格优化。本政策说明我们收集哪些信息、如何使用信息，以及如何联系我们。",
    updated: "2026 年 7 月 6 日",
    backLabel: "返回证照优化大师",
    updatedLabel: "最后更新",
    sections: [
      {
        title: "我们收集的信息",
        body: [
          "当你购买一次生成额度时，我们会在 Cloudflare D1 中保存购买凭证、Creem 订单标识、支付状态、可选邮箱、额度使用状态和基础时间记录。",
          "当你提交照片进行排版时，图片和排版提示词会发送给图像生成服务商用于生成结果。证照优化大师不会在数据库中保存你上传的原图。",
        ],
      },
      {
        title: "信息用途",
        body: [
          "我们使用购买元数据确认付款、发放 1 次生成额度、防止回调重复处理、响应客服请求，以及处理符合条件的退款。",
          "上传图片仅用于完成你请求的证件照排版、背景优化和服装风格优化。",
        ],
      },
      {
        title: "服务提供方",
        body: [
          "Creem 处理支付和订单事件。Cloudflare 提供托管和 D1 存储。图像生成服务商处理生成结果所需的照片和提示词。",
          "我们不会出售个人信息，也不会把上传照片用于公开图库或营销宣传。",
        ],
      },
      {
        title: "保留与客服",
        body: [
          "购买和生成尝试的元数据可能会为客服、风控、会计和退款处理而保留。证照优化大师不会保留用户原图。",
          "隐私请求、购买凭证丢失或退款问题，请联系 support@aiconductor.top。",
        ],
      },
    ],
  },
} as const
