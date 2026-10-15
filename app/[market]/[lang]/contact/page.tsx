import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Mail, Phone, Clock, MapPin } from "lucide-react"
import { COMPANY, EU_PRESENCE, US_PRESENCE, companyAddressLine } from "@/lib/company"
import { getDictionary, parseStore, storePath } from "@/lib/i18n"
import { policyHref } from "@/lib/legal/pages"
import { storeAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

type Params = Promise<{ market: string; lang: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  const t = getDictionary(store)
  return { title: t.contact.title, description: t.contact.description, alternates: storeAlternates(store, "/contact") }
}

export default async function ContactPage({ params }: { params: Params }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const c = t.contact

  const cards = [
    { icon: Mail, label: c.email, value: COMPANY.email, href: `mailto:${COMPANY.email}` },
    { icon: Phone, label: c.phone, value: COMPANY.phoneDisplay, href: `tel:${COMPANY.phoneTel}` },
    { icon: Clock, label: c.hours, value: t.company.hours },
    { icon: MapPin, label: c.address, value: companyAddressLine },
  ]
  const links = [
    { href: storePath(store, "/faq"), label: t.common.faq },
    { href: policyHref(store, "returns"), label: c.returns },
    { href: policyHref(store, "privacy"), label: c.privacy },
    { href: policyHref(store, "terms"), label: c.terms },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: c.title }]} />
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <p className="label-caps text-primary">{c.eyebrow}</p>
        <h1 className="font-expanded text-4xl font-extrabold uppercase md:text-5xl">{c.title}</h1>
        <p className="max-w-xl leading-relaxed text-muted-foreground">{c.lead}</p>
      </header>

      <div className="grid gap-10 py-10 lg:grid-cols-12">
        <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:col-span-8">
          {cards.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex flex-col gap-3 bg-card p-6">
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <span className="label-caps text-muted-foreground">{label}</span>
              {href ? (
                <a href={href} className="break-words font-semibold hover:text-primary">
                  {value}
                </a>
              ) : (
                <span className="font-semibold">{value}</span>
              )}
            </li>
          ))}
        </ul>

        <aside className="flex flex-col gap-6 lg:col-span-4">
          <div className="flex flex-col gap-2">
            <h2 className="label-caps">{c.returnsAddress}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {store.market === "eu" ? EU_PRESENCE.returnsAddress : US_PRESENCE.returnsAddress}. {c.returnsNote}
            </p>
          </div>
          {c.euRep && (
            <div className="flex flex-col gap-2">
              <h2 className="label-caps">{c.euRep}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {EU_PRESENCE.gdprRepresentative.name}, {EU_PRESENCE.gdprRepresentative.address}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h2 className="label-caps">{c.quickLinks}</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="underline underline-offset-4">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
