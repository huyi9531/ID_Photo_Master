import { createFileRoute } from "@tanstack/react-router"
import LegalDocument from "@/components/LegalDocument"
import { useI18n } from "@/lib/i18n"

export const Route = createFileRoute("/refund")({
  component: RefundPage,
})

function RefundPage() {
  const { language } = useI18n()
  const copy = refundCopy[language]

  return <LegalDocument {...copy} />
}

const refundCopy = {
  en: {
    title: "Refund Policy",
    subtitle:
      "AIConductor PhotoID offers a 7-day refund window for unused single photo credits.",
    updated: "July 6, 2026",
    backLabel: "Back to AIConductor PhotoID",
    updatedLabel: "Last updated",
    sections: [
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
    ],
  },
  zh: {
    title: "退款政策",
    subtitle: "证照优化大师为未使用的单次生成额度提供 7 天退款窗口。",
    updated: "2026 年 7 月 6 日",
    backLabel: "返回证照优化大师",
    updatedLabel: "最后更新",
    sections: [
      {
        title: "可退款情况",
        body: [
          "购买后 7 天内，未使用的单次生成额度可以申请退款。申请退款时，请发送购买凭证和可用的支付邮箱到 support@aiconductor.top。",
          "如果付款已完成但因服务故障没有发放可用额度，请联系客服，我们会协助恢复额度或在适当情况下处理退款。",
        ],
      },
      {
        title: "不可退款的使用情况",
        body: [
          "已成功生成并消耗的额度通常不可退款，因为智能处理服务已经交付。",
          "被审核拦截、审核服务失败或图像生成失败的请求不会消耗额度，因此未使用额度的退款窗口仍然适用。",
        ],
      },
      {
        title: "退款处理",
        body: [
          "获批退款会通过 Creem 或原支付方式处理。到账时间取决于支付方式和银行网络。",
          "与滥用、欺诈、恶意拒付、违反政策或超出可接受使用政策相关的退款请求可能会被拒绝。",
        ],
      },
    ],
  },
} as const
