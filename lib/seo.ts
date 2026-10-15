import type { Metadata } from "next"
import { COMPANY } from "@/lib/company"
import { MARKETS, markets, type Market } from "@/lib/markets"

export const SITE_URL = COMPANY.url.replace(/\/$/, "")

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

// hreflang cluster: /us answers en-US, /eu answers en-<every EU state>, root is x-default.
export function marketAlternates(
  market: Market,
  path: string,
  availableIn: readonly Market[] = markets,
): Metadata["alternates"] {
  const suffix = path === "/" || path === "" ? "" : path
  const languages: Record<string, string> = {}
  for (const m of availableIn) {
    for (const tag of MARKETS[m].hreflang) languages[tag] = absoluteUrl(`/${m}${suffix}`)
  }
  if (availableIn.length > 1) languages["x-default"] = absoluteUrl(suffix || "/")
  return { canonical: absoluteUrl(`/${market}${suffix}`), languages }
}
