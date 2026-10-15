import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { COMPANY, EU_PRESENCE, companyAddressLine } from "@/lib/company"
import { MARKETS, isMarket } from "@/lib/markets"
import { marketAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

type Params = Promise<{ market: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market } = await params
  if (!isMarket(market)) return {}
  return { title: "About us", description: `Who runs ${COMPANY.tradingName}.`, alternates: marketAlternates(market, "/about") }
}

export default async function AboutPage({ params }: { params: Params }) {
  const { market } = await params
  if (!isMarket(market)) notFound()

  const rows: [string, string][] = [
    ["Company", COMPANY.legalName],
    ["Legal form", `${COMPANY.entityType}, ${COMPANY.stateOfFormation}, USA`],
    ["Address", companyAddressLine],
    ["Email", COMPANY.email],
    ["Phone", COMPANY.phoneDisplay],
    ["Hours", COMPANY.hours],
    ...(market === "eu" ? ([["EU VAT (OSS)", EU_PRESENCE.vatNumber]] as [string, string][]) : []),
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6">
      <Breadcrumbs items={[{ href: `/${market}`, label: "Home" }, { label: "About us" }]} />
      <header className="flex flex-col gap-4 border-b border-border pb-8">
        <p className="label-caps text-primary">{MARKETS[market].name} store</p>
        <h1 className="font-expanded text-4xl font-extrabold uppercase md:text-5xl">About us</h1>
        <p className="text-pretty text-lg leading-relaxed">
          {COMPANY.tradingName} sells tires, wheels and brake systems online from two regional stores: one for the United
          States, one for the European Union. Each store has its own stock, prices and policies, written for the law that
          applies where you live.
        </p>
      </header>
      <section className="flex flex-col gap-4 py-10">
        <h2 className="font-expanded text-lg font-extrabold uppercase">Company details</h2>
        <dl className="divide-y divide-border border-y border-border">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-3 sm:grid-cols-5 sm:gap-4">
              <dt className="text-sm text-muted-foreground sm:col-span-2">{k}</dt>
              <dd className="text-sm font-medium sm:col-span-3">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
