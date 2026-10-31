import Link from "next/link"
import { Logo } from "@/components/layout/logo"
import { LanguageSwitcher, RegionSwitcher } from "@/components/layout/region-switcher"
import { CookieSettingsButton } from "@/components/legal/cookie-settings-button"
import { PaymentBadges } from "@/components/ui/payment-badges"
import { CATEGORIES } from "@/lib/catalog"
import { COMPANY, companyAddressLine } from "@/lib/company"
import { getDictionary, storePath, type Store } from "@/lib/i18n"
import { getExtras } from "@/lib/i18n/extras"
import { policyLinks } from "@/lib/legal"
import { policyHref } from "@/lib/legal/pages"

export function Footer({ store }: { store: Store }) {
  const t = getDictionary(store)
  const x = getExtras(store)
  const year = new Date().getFullYear()
  const shop = [
    ...CATEGORIES.map((c) => ({ href: storePath(store, `/${c.slug}`), label: t.categories[c.slug].name })),
    { href: storePath(store, "/track"), label: x.track.nav },
    { href: storePath(store, "/faq"), label: t.common.faq },
    { href: storePath(store, "/contact"), label: t.common.contact },
    { href: storePath(store, "/about"), label: t.common.about },
  ]

  return (
    <footer className="mt-16 border-t border-border bg-secondary text-secondary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-8 pb-20 md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Logo store={store} label={t.common.logoHome} />
            <nav aria-label={t.footer.shop} className="flex flex-wrap gap-x-5 gap-y-2">
              {shop.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-secondary-foreground/85 hover:text-secondary-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <address className="flex flex-wrap gap-x-2 text-sm not-italic leading-relaxed text-secondary-foreground/70">
            <span>{companyAddressLine}</span>
            <span aria-hidden="true">{"·"}</span>
            <a href={`tel:${COMPANY.phoneTel}`} className="hover:text-secondary-foreground">
              {COMPANY.phoneDisplay}
            </a>
            <span aria-hidden="true">{"·"}</span>
            <a href={`mailto:${COMPANY.email}`} className="hover:text-secondary-foreground">
              {COMPANY.email}
            </a>
            <span aria-hidden="true">{"·"}</span>
            <span>{t.company.hours}</span>
          </address>
        </div>

        <nav
          aria-label={t.footer.policies}
          className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-secondary-foreground/15 pt-6"
        >
          {policyLinks(store).map((p) => (
            <Link
              key={p.slug}
              href={policyHref(store, p.slug)}
              className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground"
            >
              {p.title}
            </Link>
          ))}
          <CookieSettingsButton label={t.footer.privacyLink} />
        </nav>

        <div className="flex flex-col gap-4 border-t border-secondary-foreground/15 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <LanguageSwitcher />
            <RegionSwitcher />
          </div>

          <PaymentBadges includeCarriers ariaLabel={t.footer.payments} />
        </div>

        <p className="max-w-3xl font-mono text-xs uppercase leading-relaxed tracking-[0.18em] text-secondary-foreground/60">
          {"© "}
          {year} {COMPANY.legalName}
          <span className="normal-case tracking-normal">{" · "}</span>
          {t.footer.bottom}
        </p>
      </div>
    </footer>
  )
}
