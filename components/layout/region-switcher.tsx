"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MARKET_COOKIE, MARKETS, markets, type Market } from "@/lib/markets"
import { cn } from "@/lib/utils"

export function rememberMarket(market: Market) {
  document.cookie = `${MARKET_COOKIE}=${market}; path=/; max-age=31536000; samesite=lax`
}

export function swapMarket(pathname: string, target: Market) {
  return pathname.replace(/^\/(us|eu)(?=\/|$)/, `/${target}`)
}

export function RegionSwitcher({ market, tone = "dark" }: { market: Market; tone?: "dark" | "light" }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Choose your store region" className="flex items-center gap-1">
      {markets.map((m) => {
        const active = m === market
        return (
          <Link
            key={m}
            href={swapMarket(pathname, m)}
            onClick={() => rememberMarket(m)}
            aria-current={active ? "true" : undefined}
            hrefLang={MARKETS[m].hreflang[0]}
            className={cn(
              "font-mono text-xs uppercase tracking-[0.18em] px-2 py-1 transition-colors",
              tone === "dark"
                ? active
                  ? "bg-secondary-foreground text-secondary"
                  : "text-secondary-foreground/70 hover:text-secondary-foreground"
                : active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="sr-only">{MARKETS[m].name} store</span>
            <span aria-hidden="true">{MARKETS[m].short}</span>
          </Link>
        )
      })}
    </nav>
  )
}
