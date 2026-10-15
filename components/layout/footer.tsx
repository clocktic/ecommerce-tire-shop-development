import Link from "next/link"
import { Logo } from "@/components/layout/logo"
import { LanguageSwitcher, RegionSwitcher } from "@/components/layout/region-switcher"
import { CookieSettingsButton } from "@/components/legal/cookie-settings-button"
import { CATEGORIES } from "@/lib/catalog"
import { COMPANY, EU_PRESENCE, companyAddressLine } from "@/lib/company"
import { getDictionary, storePath, type Store } from "@/lib/i18n"
import { policyLinks } from "@/lib/legal"
import { policyHref } from "@/lib/legal/pages"

export function Footer({ store }: { store: Store }) {
  const t = getDictionary(store)
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-12 md:px-6">
        <div className="flex flex-col gap-5 md:col-span-4">
          <Logo store={store} label={t.common.logoHome} />
          <p className="max-w-sm text-sm leading-relaxed text-secondary-foreground/70">{t.footer.about}</p>
          <address className="flex flex-col gap-1 text-sm not-italic leading-relaxed text-secondary-foreground/70">
            <span>{companyAddressLine}</span>
            <a href={`tel:${COMPANY.phoneTel}`} className="hover:text-secondary-foreground">
              {COMPANY.phoneDisplay}
            </a>
            <a href={`mailto:${COMPANY.email}`} className="hover:text-secondary-foreground">
              {COMPANY.email}
            </a>
            <span>{t.company.hours}</span>
          </address>
          {t.footer.vat && (
            <p className="text-xs leading-relaxed text-secondary-foreground/60">
              {t.footer.vat}: {EU_PRESENCE.vatNumber}
            </p>
          )}
        </div>

        <FooterColumn title={t.footer.shop} className="md:col-span-2">
          {CATEGORIES.map((c) => (
            <FooterLink key={c.slug} href={storePath(store, `/${c.slug}`)}>
              {t.categories[c.slug].name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title={t.footer.help} className="md:col-span-2">
          <FooterLink href={storePath(store, "/faq")}>{t.common.faq}</FooterLink>
          <FooterLink href={storePath(store, "/contact")}>{t.common.contact}</FooterLink>
          <FooterLink href={storePath(store, "/about")}>{t.common.about}</FooterLink>
        </FooterColumn>

        <FooterColumn title={t.footer.policies} className="md:col-span-4">
          {policyLinks(store).map((p) => (
            <FooterLink key={p.slug} href={policyHref(store, p.slug)}>
              {p.title}
            </FooterLink>
          ))}
          <li>
            <CookieSettingsButton label={t.footer.privacyLink} />
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-secondary-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-secondary-foreground/60">
            {"© "}
            {year} {COMPANY.legalName} · {t.footer.bottom}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-secondary-foreground/60">
                {t.footer.language}
              </span>
              <LanguageSwitcher />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-secondary-foreground/60">
                {t.footer.store}
              </span>
              <RegionSwitcher />
            </div>
          </div>
        </div>
        <p className="sr-only">{t.footer.payments}</p>
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
