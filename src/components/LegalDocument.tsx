interface LegalSection {
  title: string
  body: readonly string[]
}

interface LegalDocumentProps {
  title: string
  subtitle: string
  updated: string
  sections: readonly LegalSection[]
  backLabel: string
  updatedLabel: string
}

export default function LegalDocument({
  title,
  subtitle,
  updated,
  sections,
  backLabel,
  updatedLabel,
}: LegalDocumentProps) {
  return (
    <article className="min-h-[calc(100vh-44px)] bg-white px-6 py-12">
      <div className="mx-auto max-w-[860px]">
        <a
          href="/"
          className="text-[#0071E3] font-body text-[14px] hover:underline"
        >
          {backLabel}
        </a>
        <header className="mt-8 border-b border-[#e8e8ed] pb-8">
          <p className="text-[#86868b] font-body text-[13px]">
            {updatedLabel}: {updated}
          </p>
          <h1 className="mt-3 text-[#1d1d1f] font-display text-[38px] font-semibold leading-tight">
            {title}
          </h1>
          <p className="mt-4 text-[#424245] font-body text-[16px] leading-7">
            {subtitle}
          </p>
        </header>

        <div className="mt-10 space-y-9">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-[#1d1d1f] font-display text-[22px] font-semibold">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[#424245] font-body text-[15px] leading-7"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
