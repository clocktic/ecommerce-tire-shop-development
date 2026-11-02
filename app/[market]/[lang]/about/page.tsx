import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { COMPANY, companyAddressLine } from "@/lib/company"
import { getDictionary, parseStore, storePath } from "@/lib/i18n"
import { storeAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

type Params = Promise<{ market: string; lang: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  const a = getDictionary(store).about
  return {
    title: a.title,
    description: a.description,
    alternates: storeAlternates(store, "/about"),
  }
}

export default async function AboutPage({ params }: { params: Params }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const a = t.about

  const rows: [string, string][] = [
    ["Website name", `${COMPANY.tradingName} (${COMPANY.domain})`],
    [a.company, COMPANY.legalName],
    [a.legalForm, a.legalFormValue],
    [a.address, companyAddressLine],
    [a.email, COMPANY.email],
    [a.phone, COMPANY.phoneDisplay],
    ["Company number", `${COMPANY.registrationNumber} (${COMPANY.registrationAuthority})`],
    ["TAX Number", `${COMPANY.caSellersPermit} (${COMPANY.caSellersPermitIssuer})`],
    [a.hours, t.company.hours],
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: a.title }]} />
      <div className="max-w-3xl pb-16">
        <header className="flex flex-col gap-3 border-b border-border pb-8">
          <p className="label-caps text-primary">{a.eyebrow}</p>
          <h1 className="font-expanded text-4xl font-extrabold uppercase md:text-5xl">{a.title}</h1>
          <p className="text-pretty leading-relaxed text-muted-foreground">{a.lead}</p>
        </header>

        <section className="mt-10">
          <h2 className="font-expanded text-lg font-extrabold uppercase">{a.details}</h2>
          <dl className="mt-4 divide-y divide-border border border-border bg-card text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[220px_1fr]">
                <dt className="font-semibold text-foreground">{k}</dt>
                <dd className="text-muted-foreground">{v}</dd>
              </div>
            ))}
            <div className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[220px_1fr]">
              <dt className="font-semibold text-foreground">{t.common.contact}</dt>
              <dd className="text-muted-foreground">
                <Link href={storePath(store, "/contact")} className="font-semibold text-foreground underline underline-offset-4">
                  {storePath(store, "/contact")}
                </Link>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
