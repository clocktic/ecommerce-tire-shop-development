import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { COMPANY, EU_PRESENCE, companyAddressLine } from "@/lib/company"
import { getDictionary, parseStore, storePath } from "@/lib/i18n"
import { storeAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

type Params = Promise<{ market: string; lang: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  const t = getDictionary(store)
  return { title: t.about.title, description: t.about.description, alternates: storeAlternates(store, "/about") }
}

export default async function AboutPage({ params }: { params: Params }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const a = t.about

  const rows: [string, string][] = [
    [a.company, COMPANY.legalName],
    [a.legalForm, a.legalFormValue],
    [a.address, companyAddressLine],
    [a.email, COMPANY.email],
    [a.phone, COMPANY.phoneDisplay],
    [a.hours, t.company.hours],
    ...(a.vat ? ([[a.vat, EU_PRESENCE.vatNumber]] as [string, string][]) : []),
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6">
      <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: a.title }]} />
      <header className="flex flex-col gap-4 border-b border-border pb-8">
        <p className="label-caps text-primary">{a.eyebrow}</p>
        <h1 className="font-expanded text-4xl font-extrabold uppercase md:text-5xl">{a.title}</h1>
        <p className="text-pretty text-lg leading-relaxed">{a.lead}</p>
      </header>
      <section className="flex flex-col gap-4 py-10">
        <h2 className="font-expanded text-lg font-extrabold uppercase">{a.details}</h2>
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
