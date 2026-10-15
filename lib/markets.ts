// Two storefronts share one codebase: /us and /eu. Everything that differs by
// region (currency, tax wording, policies, feeds, consent defaults) keys off Market.

export const markets = ["us", "eu"] as const
export type Market = (typeof markets)[number]

export const defaultMarket: Market = "us"

// Explicit choice made with the region switcher. Always wins over geo.
export const MARKET_COOKIE = "cp_market"
// Country-derived market, refreshed by proxy.ts on every page request.
export const GEO_COOKIE = "cp_geo"

export const EU_COUNTRIES = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
] as const

// Non-EU European countries are routed to the EU store (closest catalog and
// units), but the EU store only ships to EU_COUNTRIES — policies say so.
const OTHER_EUROPE = ["GB", "CH", "NO", "IS", "LI", "MC", "SM", "AD", "VA", "AL", "BA", "ME", "MK", "RS", "MD", "UA", "XK"]
const US_AND_TERRITORIES = ["US", "PR", "GU", "VI", "AS", "MP", "UM"]

const EU_CODES: Set<string> = new Set(EU_COUNTRIES.map((c) => c.code))

export function marketFromCountry(country: string | null | undefined): Market | null {
  if (!country) return null
  const code = country.toUpperCase()
  if (US_AND_TERRITORIES.includes(code)) return "us"
  if (EU_CODES.has(code) || OTHER_EUROPE.includes(code)) return "eu"
  return null
}

export function isMarket(value: string | undefined | null): value is Market {
  return !!value && (markets as readonly string[]).includes(value)
}

// Language-specific wording (names, notes, hreflang) lives in lib/i18n.
export type MarketConfig = {
  code: Market
  name: string
  short: string
  currency: "USD" | "EUR"
  // Fallback number format when no language is known (feeds, emails).
  intlLocale: string
  shipsTo: readonly { code: string; name: string }[]
}

export const MARKETS: Record<Market, MarketConfig> = {
  us: {
    code: "us",
    name: "United States",
    short: "US",
    currency: "USD",
    intlLocale: "en-US",
    shipsTo: [{ code: "US", name: "United States" }],
  },
  eu: {
    code: "eu",
    name: "European Union",
    short: "EU",
    currency: "EUR",
    intlLocale: "en-IE",
    shipsTo: EU_COUNTRIES,
  },
}

export function otherMarket(market: Market): Market {
  return market === "us" ? "eu" : "us"
}

export function formatPrice(cents: number, market: Market, locale: string = MARKETS[market].intlLocale): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: MARKETS[market].currency }).format(cents / 100)
}
