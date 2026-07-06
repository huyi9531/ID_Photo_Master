export default function Footer() {
  return (
    <footer className="bg-[#f5f5f7] py-16">
      <div className="max-w-[980px] mx-auto px-6 text-center">
        <p className="text-[#7a7a7a] font-body text-[12px] tracking-[-0.12px]">
          证照优化大师 — AI 驱动的专业证件照优化工具
        </p>
        <p className="text-[#7a7a7a] font-body text-[12px] tracking-[-0.12px] mt-2">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  )
}
