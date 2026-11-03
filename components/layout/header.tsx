import Link from "next/link"
import { Logo } from "@/components/layout/logo"
import { LanguageMenu, RegionSwitcher } from "@/components/layout/region-switcher"
import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet"
import { CartButton } from "@/components/cart/cart-button"
import { AccountButton } from "@/components/account/account-button"
import { FitmentBar } from "@/components/garage/fitment-bar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { SearchModal } from "@/components/search/search-modal"
import { CATEGORIES } from "@/lib/catalog"
import { getDictionary, storePath, type Store } from "@/lib/i18n"
import { getExtras } from "@/lib/i18n/extras"
import { tireReferenceCopy } from "@/lib/i18n/tire-reference"

export function Header({ store }: { store: Store }) {
  const t = getDictionary(store)
  const x = getExtras(store)
  const nav = [
    ...CATEGORIES.map((c) => ({ href: storePath(store, `/${c.slug}`), label: t.categories[c.slug].name })),
    { href: storePath(store, "/tire-catalog"), label: tireReferenceCopy(store.lang, store.market).nav },
    { href: storePath(store, "/track"), label: x.track.nav },
    { href: storePath(store, "/faq"), label: t.common.faq },
    { href: storePath(store, "/about"), label: t.common.about },
    { href: storePath(store, "/contact"), label: t.common.contact },
  ]

  return (
    <>
      <div className="relative z-40 bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1 sm:px-4 sm:py-1.5 md:px-6">
          <p className="min-w-0 truncate font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-secondary-foreground/80 sm:text-xs sm:tracking-[0.18em]">
            <span className="text-secondary-foreground">{t.topbar.shipsTo}</span>
            <span className="hidden min-[420px]:inline">
              <span aria-hidden="true"> · </span>
              {t.topbar.shipping}
            </span>
            <span className="hidden lg:inline">
              <span aria-hidden="true"> · </span>
              {t.policy.days}
              <span aria-hidden="true"> · </span>
              {t.topbar.returns}
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <span aria-hidden="true" className="h-3.5 w-px bg-secondary-foreground/25" />
            <LanguageMenu />
            <span aria-hidden="true" className="h-3.5 w-px bg-secondary-foreground/25" />
            <RegionSwitcher />
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)]">
      <div className="@container/header border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4 sm:py-3 md:px-6">
          <Logo store={store} label={t.common.logoHome} />

          <div className="flex shrink-0 items-center gap-0.5">
            <SearchModal />
            <AccountButton />
            <CartButton />
            <MobileNavSheet nav={nav} openLabel={t.common.openMenu} navLabel={t.common.mobileNav} />
          </div>
        </div>

        <nav
          aria-label={t.common.mainNav}
          className="hidden border-t border-border/60 @min-[1100px]/header:block"
        >
          <ul className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-1 px-3 sm:px-4 md:px-6">
            {nav.map((item) => (
              <li key={item.href} className="first:-ml-2">
                <Link
                  href={item.href}
                  className="block whitespace-nowrap px-2 py-2 text-[13px] font-semibold uppercase tracking-wide transition-colors hover:text-primary xl:px-3"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <FitmentBar />
      </header>
    </>
  )
}
