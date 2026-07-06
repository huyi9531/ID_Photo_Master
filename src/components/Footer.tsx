export default function Footer() {
  return (
    <footer className="bg-[#f5f5f7] py-12">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[#1d1d1f] font-body text-[13px] font-semibold">
              AIConductor PhotoID
            </p>
            <p className="text-[#7a7a7a] font-body text-[12px] tracking-[0] mt-2">
              证照优化大师 | ID photo formatting and style optimization.
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
              Privacy Policy
            </a>
            <a className="footer-link" href="/terms">
              Terms of Service
            </a>
            <a className="footer-link" href="/acceptable-use">
              Acceptable Use Policy
            </a>
            <a className="footer-link" href="/refund">
              Refund Policy
            </a>
          </div>
        </div>
        <p className="text-[#7a7a7a] font-body text-[12px] tracking-[0] mt-8">
          © {new Date().getFullYear()} AIConductor PhotoID. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
