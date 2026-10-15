"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"
import { Check, ChevronDown, Globe } from "lucide-react"
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

export function LanguageMenu() {
  const pathname = usePathname()
  const { store, t } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const langs = MARKET_LANGS[store.market]
  const current = localeMeta(store)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    rootRef.current?.querySelector<HTMLAnchorElement>('[aria-current="true"]')?.focus()
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (langs.length < 2) return null

  const moveFocus = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
    e.preventDefault()
    const links = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>("a"))
    const i = links.indexOf(document.activeElement as HTMLAnchorElement)
    const next = e.key === "ArrowDown" ? (i + 1) % links.length : (i - 1 + links.length) % links.length
    links[next]?.focus()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1 font-mono text-xs uppercase tracking-[0.18em] text-secondary-foreground transition-colors hover:bg-secondary-foreground/10"
      >
        <Globe className="size-3.5" aria-hidden="true" />
        <span className="sr-only">{t.common.languageNav}: </span>
        <span>{current.code}</span>
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <ul
          id={listId}
          aria-label={t.common.languageNav}
          onKeyDown={moveFocus}
          className="absolute right-0 top-full z-50 mt-1.5 min-w-48 border border-border bg-card py-1 text-card-foreground shadow-lg"
        >
          {langs.map((lang) => {
            const target = { market: store.market, lang }
            const meta = localeMeta(target)
            const active = lang === store.lang
            return (
              <li key={lang}>
                <Link
                  href={swapStorePath(pathname, target)}
                  onClick={() => {
                    rememberLang(lang)
                    setOpen(false)
                  }}
                  aria-current={active ? "true" : undefined}
                  hrefLang={meta.hreflang}
                  lang={meta.htmlLang}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted",
                    active && "font-semibold",
                  )}
                >
                  <span className="w-6 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    {meta.code}
                  </span>
                  <span className="flex-1">{meta.native}</span>
                  {active && <Check className="size-4 text-primary" aria-hidden="true" />}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
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
