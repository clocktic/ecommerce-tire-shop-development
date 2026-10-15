import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Mail, Phone, Clock, MapPin } from "lucide-react"
import { COMPANY, EU_PRESENCE, US_PRESENCE, companyAddressLine } from "@/lib/company"
import { policyHref } from "@/lib/legal/pages"
import { MARKETS, isMarket } from "@/lib/markets"
import { marketAlternates } from "@/lib/seo"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

type Params = Promise<{ market: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market } = await params
  if (!isMarket(market)) return {}
  return { title: "Contact", description: `Contact ${COMPANY.tradingName} customer service.`, alternates: marketAlternates(market, "/contact") }
}

export default async function ContactPage({ params }: { params: Params }) {
  const { market } = await params
  if (!isMarket(market)) notFound()

  const cards = [
    { icon: Mail, label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
    { icon: Phone, label: "Phone", value: COMPANY.phoneDisplay, href: `tel:${COMPANY.phoneTel}` },
    { icon: Clock, label: "Hours", value: COMPANY.hours },
    { icon: MapPin, label: "Company address", value: companyAddressLine },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs items={[{ href: `/${market}`, label: "Home" }, { label: "Contact" }]} />
      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <p className="label-caps text-primary">{MARKETS[market].name} store</p>
        <h1 className="font-expanded text-4xl font-extrabold uppercase md:text-5xl">Contact</h1>
        <p className="max-w-xl leading-relaxed text-muted-foreground">
          We reply to emails within 1 business day. Include your order number and, for fitment questions, your vehicle and
          current tire size.
        </p>
      </header>

      <div className="grid gap-10 py-10 lg:grid-cols-12">
        <ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:col-span-8">
          {cards.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex flex-col gap-3 bg-card p-6">
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <span className="label-caps text-muted-foreground">{label}</span>
              {href ? (
                <a href={href} className="font-semibold hover:text-primary">
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
            <h2 className="label-caps">Returns address</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {market === "eu" ? EU_PRESENCE.returnsAddress : US_PRESENCE.returnsAddress}. Please email us before sending a
              return.
            </p>
          </div>
          {market === "eu" && (
            <div className="flex flex-col gap-2">
              <h2 className="label-caps">EU representative (GDPR)</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {EU_PRESENCE.gdprRepresentative.name}, {EU_PRESENCE.gdprRepresentative.address}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h2 className="label-caps">Quick links</h2>
            <ul className="flex flex-col gap-1 text-sm">
              <li>
                <Link href={`/${market}/faq`} className="underline underline-offset-4">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href={policyHref(market, "returns")} className="underline underline-offset-4">
                  Returns
                </Link>
              </li>
              <li>
                <Link href={policyHref(market, "privacy")} className="underline underline-offset-4">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={policyHref(market, "terms")} className="underline underline-offset-4">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
