import type { MetadataRoute } from "next"
import { CATEGORIES, getProducts } from "@/lib/catalog"
import { policySlugs } from "@/lib/legal"
import { MARKETS, markets, type Market } from "@/lib/markets"
import { absoluteUrl } from "@/lib/seo"

function languages(path: string, availableIn: readonly Market[]) {
  const out: Record<string, string> = {}
  for (const m of availableIn) for (const tag of MARKETS[m].hreflang) out[tag] = absoluteUrl(`/${m}${path}`)
  return out
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []
  const shared = ["", ...CATEGORIES.map((c) => `/${c.slug}`), "/faq", "/contact", "/about"]

  for (const market of markets) {
    for (const path of shared) {
      entries.push({ url: absoluteUrl(`/${market}${path}`), alternates: { languages: languages(path, markets) } })
    }
    for (const slug of policySlugs(market)) {
      const path = `/policies/${slug}`
      const availableIn = markets.filter((m) => policySlugs(m).includes(slug))
      entries.push({ url: absoluteUrl(`/${market}${path}`), alternates: { languages: languages(path, availableIn) } })
    }
    // Sample records are noindex and stay out of the sitemap.
    for (const product of getProducts(market).filter((p) => !p.sample)) {
      const path = `/product/${product.slug}`
      const availableIn = markets.filter((m) => product.offers[m])
      entries.push({ url: absoluteUrl(`/${market}${path}`), alternates: { languages: languages(path, availableIn) } })
    }
  }
  return entries
}
