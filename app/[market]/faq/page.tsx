import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { getFaq } from "@/lib/legal/faq"
import { MARKETS, isMarket } from "@/lib/markets"
import { marketAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

type Params = Promise<{ market: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market } = await params
  if (!isMarket(market)) return {}
  return { title: "FAQ", description: "Delivery, returns, fitment and payment questions.", alternates: marketAlternates(market, "/faq") }
}

export default async function FaqPage({ params }: { params: Params }) {
  const { market } = await params
  if (!isMarket(market)) notFound()
  const groups = getFaq(market)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    ),
  }

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6">
      <Breadcrumbs items={[{ href: `/${market}`, label: "Home" }, { label: "FAQ" }]} />
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <p className="label-caps text-primary">{MARKETS[market].name} store</p>
        <h1 className="font-expanded text-4xl font-extrabold uppercase md:text-5xl">Questions</h1>
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
