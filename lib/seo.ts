import type { Metadata } from "next"
import { COMPANY } from "@/lib/company"
import { markets, type Market } from "@/lib/markets"
import { localeMeta, storePath, storesOf, type Store } from "@/lib/i18n/config"

export const SITE_URL = COMPANY.url.replace(/\/$/, "")

const VERCEL_BLOB_PREFIX = "https://tpnykvdnqxyidby1.public.blob.vercel-storage.com/"

export function absoluteUrl(path: string): string {
  const url = new URL(path, `${SITE_URL}/`)
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Expected an HTTP or HTTPS URL")
  }
  return url.href
}

export function publicImageUrl(path: string): string {
  if (!path) return ""
  if (path.startsWith(VERCEL_BLOB_PREFIX)) {
    const rest = path.slice(VERCEL_BLOB_PREFIX.length)
    return `${SITE_URL}/images/blob/${rest}`
  }
  return absoluteUrl(path)
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

/** @deprecated Kept for stale preview snapshots of the pre-[lang] layout; use storeAlternates. */
export function marketAlternates(market: Market, path: string, availableIn: readonly Market[] = markets): Metadata["alternates"] {
  return storeAlternates({ market, lang: "en" }, path, availableIn)
}
