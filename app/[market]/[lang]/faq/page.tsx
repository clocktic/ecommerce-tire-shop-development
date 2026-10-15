import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { getDictionary, parseStore, storePath } from "@/lib/i18n"
import { storeAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

type Params = Promise<{ market: string; lang: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  const t = getDictionary(store)
  return { title: t.faq.metaTitle, description: t.faq.description, alternates: storeAlternates(store, "/faq") }
}

export default async function FaqPage({ params }: { params: Params }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const groups = t.faq.groups
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    ),
  }

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6">
      <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: t.faq.metaTitle }]} />
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <p className="label-caps text-primary">{t.faq.eyebrow}</p>
        <h1 className="font-expanded text-4xl font-extrabold uppercase md:text-5xl">{t.faq.title}</h1>
      </header>
      {groups.map((g) => (
        <section key={g.title} className="pt-10">
          <h2 className="label-caps mb-2 text-muted-foreground">{g.title}</h2>
          <div className="border-t border-border">
            {g.items.map((item) => (
              <details key={item.q} className="group border-b border-border">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 font-semibold">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="pb-5 leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  )
}
