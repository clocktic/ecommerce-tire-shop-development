"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { GEO_COOKIE, MARKET_COOKIE, MARKETS, isMarket, type Market } from "@/lib/markets"
import { rememberMarket, swapMarket } from "@/components/layout/region-switcher"

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`))
    ?.split("=")[1]
}

// Shown when the visitor's location points to the other store and they have not
// picked a store themselves. Never auto-redirects a prefixed URL.
export function GeoBanner({ market }: { market: Market }) {
  const pathname = usePathname()
  const [suggested, setSuggested] = useState<Market | null>(null)

  useEffect(() => {
    const geo = readCookie(GEO_COOKIE)
    const chosen = readCookie(MARKET_COOKIE)
    if (isMarket(geo) && geo !== market && !chosen) setSuggested(geo)
    else setSuggested(null)
  }, [market])

  if (!suggested) return null

  const dismiss = () => {
    rememberMarket(market)
    setSuggested(null)
  }

  return (
    <div role="region" aria-label="Store region suggestion" className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-sm md:px-6">
        <p className="text-pretty">
          {"You're viewing the "}
          {MARKETS[market].short}
          {" store. Shopping from "}
          {suggested === "us" ? "the United States" : "Europe"}
          {"?"}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={swapMarket(pathname, suggested)}
            onClick={() => rememberMarket(suggested)}
            className="font-mono text-xs uppercase tracking-[0.18em] underline underline-offset-4"
          >
            Go to {MARKETS[suggested].short} store
          </Link>
          <button type="button" onClick={dismiss} aria-label="Stay in this store" className="p-1">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
