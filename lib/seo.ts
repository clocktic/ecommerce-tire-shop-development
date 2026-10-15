import type { Metadata } from "next"
import { COMPANY } from "@/lib/company"
import { markets, type Market } from "@/lib/markets"
import { localeMeta, storePath, storesOf, type Store } from "@/lib/i18n/config"

export const SITE_URL = COMPANY.url.replace(/\/$/, "")

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

// hreflang cluster for one page across every store language it exists in:
// /us/en → en-US, /us/es → es-US, /eu/<lang> → <lang>; the root redirect is x-default.
export function hreflangMap(path: string, availableIn: readonly Market[] = markets): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const m of availableIn) {
    for (const store of storesOf(m)) languages[localeMeta(store).hreflang] = absoluteUrl(storePath(store, path))
  }
  if (availableIn.length > 1) languages["x-default"] = absoluteUrl(!path || path === "/" ? "/" : path)
  return languages
}

export function storeAlternates(store: Store, path: string, availableIn: readonly Market[] = markets): Metadata["alternates"] {
  return { canonical: absoluteUrl(storePath(store, path)), languages: hreflangMap(path, availableIn) }
}
