import type { MetadataRoute } from "next"
import { CATEGORIES } from "@/lib/catalog"
import { referenceModels } from "@/lib/catalog/reference"
import { getProducts } from "@/lib/catalog/queries"
import { policySlugs } from "@/lib/legal"
import { storePath, storesOf } from "@/lib/i18n/config"
import { markets, type Market } from "@/lib/markets"
import { absoluteUrl, hreflangMap } from "@/lib/seo"

// One entry per store language, each listing the full hreflang cluster.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []
  const shared = ["", ...CATEGORIES.map((c) => `/${c.slug}`), "/tire-catalog", ...referenceModels.map(m => `/tire-catalog/${m.slug}`), "/faq", "/contact", "/about"]

  for (const market of markets) {
    const marketProducts = await getProducts(market)
    const pages: { path: string; availableIn: readonly Market[] }[] = [
      ...shared.map((path) => ({ path, availableIn: markets })),
      ...policySlugs(market).map((slug) => ({
        path: `/policies/${slug}`,
        availableIn: markets.filter((m) => policySlugs(m).includes(slug)),
      })),
      // Sample records are noindex and stay out of the sitemap.
      ...marketProducts
        .filter((p) => !p.sample)
        .map((p) => ({
          path: `/product/${p.slug}`,
          availableIn: markets.filter((m) => p.offers[m]),
        })),
    ]
    for (const store of storesOf(market)) {
      for (const { path, availableIn } of pages) {
        entries.push({ url: absoluteUrl(storePath(store, path)), alternates: { languages: hreflangMap(path, availableIn) } })
      }
    }
  }
  return entries
}
