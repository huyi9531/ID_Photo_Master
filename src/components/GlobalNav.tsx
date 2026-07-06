import { Languages } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function GlobalNav() {
  const { language, toggleLanguage } = useI18n()
  const isChinese = language === "zh"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-xl h-11 flex items-center px-4">
      <div className="flex w-full items-center justify-between gap-4">
        <a href="/" className="flex min-w-0 items-center gap-2.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="1"
              y="1"
              width="18"
              height="18"
              rx="3.5"
              stroke="white"
              strokeWidth="1.4"
            />
            <circle cx="10" cy="8" r="2.5" stroke="white" strokeWidth="1.4" />
            <path
              d="M5 17c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5"
              stroke="white"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <span className="truncate text-white font-display text-[12px] tracking-[-0.12px] font-semibold">
            {isChinese ? "证照优化大师" : "AIConductor PhotoID"}
          </span>
        </a>

        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="/#pricing"
            className="hidden text-white/70 font-body text-[12px] hover:text-white sm:inline"
          >
            {isChinese ? "价格" : "Pricing"}
          </a>
          <a
            href="/acceptable-use"
            className="hidden text-white/70 font-body text-[12px] hover:text-white sm:inline"
          >
            {isChinese ? "使用政策" : "AUP"}
          </a>
          <a
            href="mailto:support@aiconductor.top"
            className="hidden text-white/70 font-body text-[12px] hover:text-white sm:inline"
          >
            {isChinese ? "客服" : "Support"}
          </a>
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3 font-body text-[12px] font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.14)] transition-[background-color,transform] duration-150 hover:bg-white/16 active:scale-[0.96]"
            aria-label={isChinese ? "切换到英文" : "Switch to Chinese"}
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{isChinese ? "EN" : "CN"}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
