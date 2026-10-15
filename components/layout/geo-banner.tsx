"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useI18n } from "@/components/i18n/i18n-provider"
import { rememberMarket } from "@/components/layout/region-switcher"
import { counterpart, swapStorePath } from "@/lib/i18n/config"
import { GEO_COOKIE, MARKET_COOKIE, isMarket } from "@/lib/markets"

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`))
    ?.split("=")[1]
}

// Shown when the visitor's location points to the other store and they have not
// picked a store themselves. Never auto-redirects a prefixed URL.
export function GeoBanner() {
  const pathname = usePathname()
  const { store, t } = useI18n()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const geo = readCookie(GEO_COOKIE)
    const chosen = readCookie(MARKET_COOKIE)
    setShow(isMarket(geo) && geo !== store.market && !chosen)
  }, [store.market])

  if (!show) return null

  const target = counterpart(store)
  const dismiss = () => {
    rememberMarket(store.market)
    setShow(false)
  }

  return (
    <div role="region" aria-label={t.geo.region} className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-sm md:px-6">
        <p className="text-pretty">{t.geo.text}</p>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={swapStorePath(pathname, target)}
            onClick={() => rememberMarket(target.market)}
            className="font-mono text-xs uppercase tracking-[0.18em] underline underline-offset-4"
          >
            {t.geo.go}
          </Link>
          <button type="button" onClick={dismiss} aria-label={t.geo.stay} className="p-1">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
