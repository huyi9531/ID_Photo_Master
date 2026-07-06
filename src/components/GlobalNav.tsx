export default function GlobalNav() {
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
            AIConductor PhotoID
          </span>
          <span className="text-white/40 font-body text-[10px] tracking-[-0.08px] hidden sm:inline">
            证照优化大师
          </span>
        </a>

        <div className="hidden items-center gap-4 sm:flex">
          <a
            href="/#pricing"
            className="text-white/70 font-body text-[12px] hover:text-white"
          >
            Pricing
          </a>
          <a
            href="/acceptable-use"
            className="text-white/70 font-body text-[12px] hover:text-white"
          >
            AUP
          </a>
          <a
            href="mailto:support@aiconductor.top"
            className="text-white/70 font-body text-[12px] hover:text-white"
          >
            Support
          </a>
        </div>
      </div>
    </nav>
  )
}
