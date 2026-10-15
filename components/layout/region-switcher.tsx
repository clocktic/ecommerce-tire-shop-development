"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "@/components/i18n/i18n-provider"
import { LANG_COOKIE, MARKET_LANGS, counterpart, localeMeta, swapStorePath, type Lang } from "@/lib/i18n/config"
import { MARKET_COOKIE, MARKETS, markets, type Market } from "@/lib/markets"
import { cn } from "@/lib/utils"

const YEAR = 31536000

export function rememberMarket(market: Market) {
  document.cookie = `${MARKET_COOKIE}=${market}; path=/; max-age=${YEAR}; samesite=lax`
}

export function rememberLang(lang: Lang) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${YEAR}; samesite=lax`
}

type Tone = "dark" | "light"

function itemClass(active: boolean, tone: Tone) {
  return cn(
    "font-mono text-xs uppercase tracking-[0.18em] px-2 py-1 transition-colors",
    tone === "dark"
      ? active
        ? "bg-secondary-foreground text-secondary"
        : "text-secondary-foreground/70 hover:text-secondary-foreground"
      : active
        ? "bg-foreground text-background"
        : "text-muted-foreground hover:text-foreground",
  )
}

export function RegionSwitcher({ tone = "dark" }: { tone?: Tone }) {
  const pathname = usePathname()
  const { store, t } = useI18n()

  return (
    <nav aria-label={t.common.regionNav} className="flex items-center gap-1">
      {markets.map((m) => {
        const target = m === store.market ? store : counterpart(store, m)
        const active = m === store.market
        return (
          <Link
            key={m}
            href={swapStorePath(pathname, target)}
            onClick={() => rememberMarket(m)}
            aria-current={active ? "true" : undefined}
            hrefLang={localeMeta(target).hreflang}
            className={itemClass(active, tone)}
          >
            <span className="sr-only">{t.common.storeName[m]}</span>
            <span aria-hidden="true">{MARKETS[m].short}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function LanguageSwitcher({ tone = "dark" }: { tone?: Tone }) {
  const pathname = usePathname()
  const { store, t } = useI18n()

  return (
    <nav aria-label={t.common.languageNav} className="flex flex-wrap items-center gap-1">
      {MARKET_LANGS[store.market].map((lang) => {
        const target = { market: store.market, lang }
        const meta = localeMeta(target)
        const active = lang === store.lang
        return (
          <Link
            key={lang}
            href={swapStorePath(pathname, target)}
            onClick={() => rememberLang(lang)}
            aria-current={active ? "true" : undefined}
            hrefLang={meta.hreflang}
            lang={meta.htmlLang}
            title={meta.native}
            className={itemClass(active, tone)}
          >
            <span className="sr-only">{meta.native}</span>
            <span aria-hidden="true">{meta.code}</span>
          </Link>
        )
      })}
    </nav>
  )
}
