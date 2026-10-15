import Link from "next/link"
import type { Block, PolicyDoc } from "@/lib/legal/types"
import { POLICY_PAGES, policyHref } from "@/lib/legal/pages"
import { MARKETS, type Market } from "@/lib/markets"
import { COMPANY } from "@/lib/company"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { cn } from "@/lib/utils"

export function ProsePage({
  market,
  doc,
  slug,
  updated,
  children,
}: {
  market: Market
  doc: PolicyDoc
  slug: string
  updated: string
  children?: React.ReactNode
}) {
  const formatted = new Intl.DateTimeFormat(MARKETS[market].intlLocale, { dateStyle: "long" }).format(new Date(updated))
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs items={[{ href: `/${market}`, label: "Home" }, { label: doc.title }]} />
      <div className="grid gap-12 pb-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav aria-label={`${MARKETS[market].short} policies`} className="lg:sticky lg:top-36">
            <p className="label-caps mb-3 text-muted-foreground">{MARKETS[market].short} store policies</p>
            <ul className="flex flex-col border-l border-border">
              {POLICY_PAGES[market].map((p) => (
                <li key={p.slug}>
                  <Link
                    href={policyHref(market, p.slug)}
                    aria-current={p.slug === slug ? "page" : undefined}
                    className={cn(
                      "-ml-px block border-l-2 py-1.5 pl-4 text-sm",
                      p.slug === slug ? "border-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="flex max-w-3xl flex-col gap-10 lg:col-span-8 lg:col-start-5">
          <header className="flex flex-col gap-4 border-b border-border pb-8">
            <p className="label-caps text-primary">{MARKETS[market].name} store</p>
            <h1 className="text-balance font-expanded text-3xl font-extrabold uppercase leading-tight md:text-5xl">
              {doc.title}
            </h1>
            <p className="text-pretty text-lg leading-relaxed">{doc.intro}</p>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Last updated <time dateTime={updated}>{formatted}</time>
            </p>
          </header>

          {doc.sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-4">
              <h2 className="font-expanded text-lg font-extrabold uppercase">{section.heading}</h2>
              {section.blocks.map((block, i) => (
                <BlockView key={i} block={block} />
              ))}
            </section>
          ))}

          {children}

          <footer className="border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
            Questions about this page? Contact {COMPANY.tradingName} at{" "}
            <a href={`mailto:${COMPANY.email}`} className="underline underline-offset-4">
              {COMPANY.email}
            </a>{" "}
            or{" "}
            <Link href={`/${market}/contact`} className="underline underline-offset-4">
              see all contact options
            </Link>
            .
          </footer>
        </article>
      </div>
    </div>
  )
}

function BlockView({ block }: { block: Block }) {
  if (typeof block === "string") return <p className="text-pretty leading-relaxed">{block}</p>
  if ("list" in block) {
    return (
      <ul className="flex flex-col gap-2">
        {block.list.map((item) => (
          <li key={item} className="flex gap-3 leading-relaxed">
            <span aria-hidden="true" className="mt-3 h-px w-3 shrink-0 bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )
  }
  if ("rows" in block) {
    return (
      <dl className="divide-y divide-border border-y border-border">
        {block.rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3 sm:grid-cols-5 sm:gap-4">
            <dt className="text-sm text-muted-foreground sm:col-span-2">{k}</dt>
            <dd className="text-sm font-medium sm:col-span-3">{v}</dd>
          </div>
        ))}
      </dl>
    )
  }
  if ("note" in block) return <p className="text-sm text-muted-foreground">{block.note}</p>
  return (
    <Link href={block.link.href} className="font-mono text-xs uppercase tracking-[0.18em] underline underline-offset-4">
      {block.link.label}
    </Link>
  )
}
