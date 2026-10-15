import Link from "next/link"
import { Menu } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { RegionSwitcher } from "@/components/layout/region-switcher"
import { CartButton } from "@/components/cart/cart-button"
import { CATEGORIES } from "@/lib/catalog"
import { MARKETS, type Market } from "@/lib/markets"
import { POLICIES, deliveryLabel } from "@/lib/policies"

export function Header({ market }: { market: Market }) {
  const policy = POLICIES[market]
  const nav = [
    ...CATEGORIES.map((c) => ({ href: `/${market}/${c.slug}`, label: c.name })),
    { href: `/${market}/faq`, label: "Help" },
    { href: `/${market}/contact`, label: "Contact" },
  ]

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-secondary text-secondary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 md:px-6">
          <p className="truncate font-mono text-xs uppercase tracking-[0.18em] text-secondary-foreground/80">
            <span className="text-secondary-foreground">Ships to {MARKETS[market].short === "US" ? "US" : "EU-27"}</span>
            <span aria-hidden="true"> · </span>
            {policy.shipping.freeShipping ? "Free shipping" : "Shipping from checkout"}
            <span className="hidden sm:inline">
              <span aria-hidden="true"> · </span>
              {deliveryLabel(market)}
              <span aria-hidden="true"> · </span>
              {policy.returns.windowDays}-day returns
            </span>
          </p>
          <RegionSwitcher market={market} />
        </div>
      </div>

      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-6">
          <Logo market={market} />

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <CartButton />
            <details className="group relative md:hidden">
              <summary className="cursor-pointer p-2" aria-label="Open menu">
                <Menu className="size-5" aria-hidden="true" />
              </summary>
              <nav
                aria-label="Mobile"
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
    </header>
  )
}
