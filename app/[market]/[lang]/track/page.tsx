import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getDictionary, parseStore, storePath } from "@/lib/i18n"
import { getExtras } from "@/lib/i18n/extras"
import { storeAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { TrackForm } from "@/components/track/track-form"
import { COMPANY, companyAddressLine } from "@/lib/company"

type Params = Promise<{ market: string; lang: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  const tr = getExtras(store).track
  return {
    title: tr.title,
    description: tr.lead,
    alternates: storeAlternates(store, "/track"),
  }
}

export default async function TrackPage({ params }: { params: Params }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const tr = getExtras(store).track

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: tr.title }]} />
      <div className="flex max-w-2xl flex-col gap-8 pb-24 pt-4">
        <header className="flex flex-col gap-3">
          <p className="label-caps text-primary">{tr.nav}</p>
          <h1 className="font-expanded text-4xl font-extrabold uppercase md:text-5xl">{tr.title}</h1>
          <p className="leading-relaxed text-muted-foreground">{tr.lead}</p>
        </header>
        <TrackForm />

        <section className="border border-border bg-card p-6 text-xs text-muted-foreground">
          <h2 className="font-expanded text-sm font-bold uppercase tracking-wider text-foreground">
            {t.contact.title}
          </h2>
          <p className="mt-1.5 leading-relaxed">{t.contact.lead}</p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="font-semibold uppercase tracking-wider text-muted-foreground">{t.contact.email}</dt>
              <dd className="mt-0.5 text-foreground">{COMPANY.email}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wider text-muted-foreground">{t.contact.phone}</dt>
              <dd className="mt-0.5 text-foreground">
                <a href={`tel:${COMPANY.phoneTel}`} className="underline underline-offset-4">
                  {COMPANY.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wider text-muted-foreground">{t.contact.hours}</dt>
              <dd className="mt-0.5 text-foreground">{t.company.hours}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wider text-muted-foreground">{t.common.contact}</dt>
              <dd className="mt-0.5">
                <Link href={storePath(store, "/contact")} className="font-semibold text-foreground underline underline-offset-4">
                  {t.prose.allContact}
                </Link>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold uppercase tracking-wider text-muted-foreground">{t.contact.address}</dt>
              <dd className="mt-0.5 text-foreground">
                {COMPANY.legalName} — {companyAddressLine}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}

export default async function TrackPage({ params }: { params: Params }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const x = getExtras(store)
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: x.track.title }]} />
      <div className="flex max-w-2xl flex-col gap-6 pb-24 pt-4">
        <h1 className="font-expanded text-4xl font-extrabold uppercase text-balance md:text-5xl">{x.track.title}</h1>
        <p className="leading-relaxed text-muted-foreground">{x.track.lead}</p>
        <TrackForm />
      </div>
    </div>
  )
}
