import Link from "next/link"
import { Menu } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { LanguageMenu, RegionSwitcher } from "@/components/layout/region-switcher"
import { CartButton } from "@/components/cart/cart-button"
import { AccountButton } from "@/components/account/account-button"
import { FitmentBar } from "@/components/garage/fitment-bar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { CATEGORIES } from "@/lib/catalog"
import { getDictionary, storePath, type Store } from "@/lib/i18n"
import { getExtras } from "@/lib/i18n/extras"

export function Header({ store }: { store: Store }) {
  const t = getDictionary(store)
  const x = getExtras(store)
  const nav = [
    ...CATEGORIES.map((c) => ({ href: storePath(store, `/${c.slug}`), label: t.categories[c.slug].name })),
    { href: storePath(store, "/track"), label: x.track.nav },
    { href: storePath(store, "/faq"), label: t.common.help },
    { href: storePath(store, "/contact"), label: t.common.contact },
  ]

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 md:px-6">
          <p className="min-w-0 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-secondary-foreground/80 sm:truncate sm:text-xs sm:tracking-[0.18em]">
            <span className="text-secondary-foreground">{t.topbar.shipsTo}</span>
            <span aria-hidden="true"> · </span>
            {t.topbar.shipping}
            <span className="hidden lg:inline">
              <span aria-hidden="true"> · </span>
              {t.policy.days}
              <span aria-hidden="true"> · </span>
              {t.topbar.returns}
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <span aria-hidden="true" className="h-4 w-px bg-secondary-foreground/25" />
            <LanguageMenu />
            <span aria-hidden="true" className="h-4 w-px bg-secondary-foreground/25" />
            <RegionSwitcher />
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="@container/header mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 md:px-6">
          <Logo store={store} label={t.common.logoHome} />

          <nav aria-label={t.common.mainNav} className="hidden min-w-0 @min-[1100px]/header:block">
            <ul className="flex items-center">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block whitespace-nowrap px-2 py-2 text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary xl:px-3"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-0.5">
            <AccountButton />
            <CartButton />
            <details className="group relative @min-[1100px]/header:hidden">
              <summary className="cursor-pointer p-2" aria-label={t.common.openMenu}>
                <Menu className="size-5" aria-hidden="true" />
              </summary>
              <nav
                aria-label={t.common.mobileNav}
                className="absolute right-0 top-full mt-3 w-64 border border-border bg-card p-2 shadow-lg"
              >
                <ul className="flex flex-col">
                  {nav.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="block px-3 py-3 text-sm font-semibold uppercase tracking-wide">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>
          </div>
        </div>
      </div>

      <FitmentBar />
    </header>
  )
}
