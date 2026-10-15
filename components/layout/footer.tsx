import Link from "next/link"
import { Logo } from "@/components/layout/logo"
import { RegionSwitcher } from "@/components/layout/region-switcher"
import { CookieSettingsButton } from "@/components/legal/cookie-settings-button"
import { CATEGORIES } from "@/lib/catalog"
import { COMPANY, EU_PRESENCE, companyAddressLine } from "@/lib/company"
import { POLICY_PAGES, policyHref } from "@/lib/legal/pages"
import { MARKETS, type Market } from "@/lib/markets"
import { POLICIES } from "@/lib/policies"

export function Footer({ market }: { market: Market }) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-12 md:px-6">
        <div className="flex flex-col gap-5 md:col-span-4">
          <Logo market={market} />
          <p className="max-w-sm text-sm leading-relaxed text-secondary-foreground/70">
            {COMPANY.tradingName} is operated by {COMPANY.legalName}, a {COMPANY.entityType.toLowerCase()} registered in{" "}
            {COMPANY.stateOfFormation}, United States.
          </p>
          <address className="flex flex-col gap-1 text-sm not-italic leading-relaxed text-secondary-foreground/70">
            <span>{companyAddressLine}</span>
            <a href={`tel:${COMPANY.phoneTel}`} className="hover:text-secondary-foreground">
              {COMPANY.phoneDisplay}
            </a>
            <a href={`mailto:${COMPANY.email}`} className="hover:text-secondary-foreground">
              {COMPANY.email}
            </a>
            <span>{COMPANY.hours}</span>
          </address>
          {market === "eu" && (
            <p className="text-xs leading-relaxed text-secondary-foreground/60">
              {EU_PRESENCE.vatScheme}: {EU_PRESENCE.vatNumber}
            </p>
          )}
        </div>

        <FooterColumn title="Shop" className="md:col-span-2">
          {CATEGORIES.map((c) => (
            <FooterLink key={c.slug} href={`/${market}/${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Help" className="md:col-span-2">
          <FooterLink href={`/${market}/faq`}>FAQ</FooterLink>
          <FooterLink href={`/${market}/contact`}>Contact</FooterLink>
          <FooterLink href={`/${market}/about`}>About us</FooterLink>
        </FooterColumn>

        <FooterColumn title={`${MARKETS[market].short} policies`} className="md:col-span-4">
          {POLICY_PAGES[market].map((p) => (
            <FooterLink key={p.slug} href={policyHref(market, p.slug)}>
              {p.title}
            </FooterLink>
          ))}
          <li>
            <CookieSettingsButton market={market} />
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-secondary-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-secondary-foreground/60">
            {"© "}
            {year} {COMPANY.legalName} · Prices in {MARKETS[market].currency} · {MARKETS[market].priceNote}
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-secondary-foreground/60">Store</span>
            <RegionSwitcher market={market} />
          </div>
        </div>
        <p className="sr-only">Accepted payment methods: {POLICIES[market].paymentMethods.join(", ")}</p>
      </div>
    </footer>
  )
}

function FooterColumn({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h2 className="label-caps mb-4 text-secondary-foreground/60">{title}</h2>
      <ul className="flex flex-col gap-2.5">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-secondary-foreground/85 hover:text-secondary-foreground">
        {children}
      </Link>
    </li>
  )
}
