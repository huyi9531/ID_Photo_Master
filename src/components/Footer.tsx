import { useI18n } from "@/lib/i18n"

export default function Footer() {
  const { language } = useI18n()
  const isChinese = language === "zh"

  return (
    <footer className="bg-[#f5f5f7] py-12">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[#1d1d1f] font-body text-[13px] font-semibold">
              {isChinese ? "证照优化大师" : "AIConductor PhotoID"}
            </p>
            <p className="text-[#7a7a7a] font-body text-[12px] tracking-[0] mt-2">
              {isChinese
                ? "AI 驱动的证件照排版、背景与服装风格优化工具。"
                : "ID photo formatting, background, and attire style optimization."}
            </p>
            <a
              href="mailto:support@aiconductor.top"
              className="mt-2 inline-block text-[#0071E3] font-body text-[12px] hover:underline"
            >
              support@aiconductor.top
            </a>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
            <a className="footer-link" href="/privacy">
              {isChinese ? "隐私政策" : "Privacy Policy"}
            </a>
            <a className="footer-link" href="/terms">
              {isChinese ? "服务条款" : "Terms of Service"}
            </a>
            <a className="footer-link" href="/acceptable-use">
              {isChinese ? "可接受使用政策" : "Acceptable Use Policy"}
            </a>
            <a className="footer-link" href="/refund">
              {isChinese ? "退款政策" : "Refund Policy"}
            </a>
          </div>
        </div>
        <p className="text-[#7a7a7a] font-body text-[12px] tracking-[0] mt-8">
          {isChinese
            ? `© ${new Date().getFullYear()} 证照优化大师。保留所有权利。`
            : `© ${new Date().getFullYear()} AIConductor PhotoID. All rights reserved.`}
        </p>
      </div>
    </footer>
  )
}
