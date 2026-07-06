"use client"

export default function GlobalNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-xl h-11 flex items-center px-4">
      <div className="flex items-center gap-2.5">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="18" height="18" rx="3.5" stroke="white" strokeWidth="1.4" />
          <circle cx="10" cy="8" r="2.5" stroke="white" strokeWidth="1.4" />
          <path d="M5 17c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="text-white font-display text-[12px] tracking-[-0.12px] font-semibold">
          证照优化大师
        </span>
        <span className="text-white/40 font-body text-[10px] tracking-[-0.08px] hidden sm:inline">
          AI 驱动的专业证件照优化，一键修复、换背景和换服装
        </span>
      </div>
    </nav>
  )
}
