import { isMarket, markets, otherMarket, type Market } from "@/lib/markets"

// URL shape: /<market>/<lang>/... — the market decides stock, prices and law,
// the language only decides the wording. The EU store speaks six languages,
// the US store English and Latin American Spanish.
export const LANGS = ["en", "de", "fr", "it", "es", "nl"] as const
export type Lang = (typeof LANGS)[number]

export const MARKET_LANGS: Record<Market, readonly Lang[]> = {
  us: ["en", "es"],
  eu: ["en", "de", "fr", "it", "es", "nl"],
}

export const DEFAULT_LANG: Lang = "en"

// Explicit language choice from the language switcher. Wins over Accept-Language.
export const LANG_COOKIE = "cp_lang"

export type Store = { market: Market; lang: Lang }

// Spanish in the US store is Latin American Spanish (llantas, rines), in the EU
// store it is Spanish from Spain (neumáticos, llantas) — different content keys.
export type ContentLang = "en" | "de" | "fr" | "it" | "es" | "es-419" | "nl"

export type LocaleMeta = {
  code: string
  native: string
  htmlLang: string
  intlLocale: string
  ogLocale: string
  hreflang: string
  content: ContentLang
}

const LOCALES: Record<Market, Partial<Record<Lang, LocaleMeta>>> = {
  us: {
    en: { code: "EN", native: "English", htmlLang: "en-US", intlLocale: "en-US", ogLocale: "en_US", hreflang: "en-US", content: "en" },
    es: {
      code: "ES",
      native: "Español (Latinoamérica)",
      htmlLang: "es-US",
      intlLocale: "es-US",
      ogLocale: "es_US",
      hreflang: "es-US",
      content: "es-419",
    },
  },
  eu: {
    en: { code: "EN", native: "English", htmlLang: "en", intlLocale: "en-IE", ogLocale: "en_IE", hreflang: "en", content: "en" },
    de: { code: "DE", native: "Deutsch", htmlLang: "de", intlLocale: "de-DE", ogLocale: "de_DE", hreflang: "de", content: "de" },
    fr: { code: "FR", native: "Français", htmlLang: "fr", intlLocale: "fr-FR", ogLocale: "fr_FR", hreflang: "fr", content: "fr" },
    it: { code: "IT", native: "Italiano", htmlLang: "it", intlLocale: "it-IT", ogLocale: "it_IT", hreflang: "it", content: "it" },
    es: { code: "ES", native: "Español (España)", htmlLang: "es", intlLocale: "es-ES", ogLocale: "es_ES", hreflang: "es", content: "es" },
    nl: { code: "NL", native: "Nederlands", htmlLang: "nl", intlLocale: "nl-NL", ogLocale: "nl_NL", hreflang: "nl", content: "nl" },
  },
}

export function isLang(value: string | undefined | null): value is Lang {
  return !!value && (LANGS as readonly string[]).includes(value)
}

export function isStoreLang(market: Market, value: string | undefined | null): value is Lang {
  return isLang(value) && MARKET_LANGS[market].includes(value)
}

export function parseStore(market: string, lang: string): Store | null {
  if (!isMarket(market) || !isStoreLang(market, lang)) return null
  return { market, lang }
}

export function localeMeta({ market, lang }: Store): LocaleMeta {
  return LOCALES[market][lang]!
}

export function storesOf(market: Market): Store[] {
  return MARKET_LANGS[market].map((lang) => ({ market, lang }))
}

export const ALL_STORES: Store[] = markets.flatMap(storesOf)

export function storeBase({ market, lang }: Store): string {
  return `/${market}/${lang}`
}

export function storePath(store: Store, path = ""): string {
  const clean = !path || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`
  return `${storeBase(store)}${clean}`
}

// Same language in the other market when it exists there, English otherwise.
export function counterpart(store: Store, market: Market = otherMarket(store.market)): Store {
  return { market, lang: isStoreLang(market, store.lang) ? store.lang : DEFAULT_LANG }
}

export function swapStorePath(pathname: string, target: Store): string {
  const rest = pathname.replace(/^\/(us|eu)(\/[a-z]{2})?(?=\/|$)/, "")
  return storePath(target, rest)
}

// Accept-Language: "de-AT,de;q=0.9,en;q=0.8" → first primary subtag the market offers.
export function langFromHeader(market: Market, header: string | null | undefined): Lang | null {
  if (!header) return null
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=")
      return { primary: tag.split("-")[0].toLowerCase(), q: q ? Number(q) : 1 }
    })
    .filter((x) => x.primary && !Number.isNaN(x.q))
    .sort((a, b) => b.q - a.q)
  return ranked.map((x) => x.primary).find((p): p is Lang => isStoreLang(market, p)) ?? null
}
