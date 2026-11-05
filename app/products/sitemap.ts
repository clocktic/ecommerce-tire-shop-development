import type { MetadataRoute } from "next"
import { getProducts } from "@/lib/catalog/queries"
import { ALL_STORES, storePath } from "@/lib/i18n/config"
import { markets } from "@/lib/markets"
import { absoluteUrl, hreflangMap } from "@/lib/seo"

// Each entry carries a full hreflang cluster (~1.5 KB), so a single sitemap of the
// whole catalog grew past Vercel's 20 MB prerender limit. Chunks of this size stay
// well under both that limit and the 50k-URL sitemap protocol cap.
const CHUNK_SIZE = 4000

async function indexableProducts(storeIndex: number) {
  const store = ALL_STORES[storeIndex]
  const products = await getProducts(store.market)
  return { store, products: products.filter((p) => !p.sample) }
}

export async function generateSitemaps() {
  const ids: { id: string }[] = []
  for (let storeIndex = 0; storeIndex < ALL_STORES.length; storeIndex++) {
    const { products } = await indexableProducts(storeIndex)
    const chunks = Math.max(1, Math.ceil(products.length / CHUNK_SIZE))
    for (let chunk = 0; chunk < chunks; chunk++) ids.push({ id: `${storeIndex}-${chunk}` })
  }
  return ids
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const [storeIndex, chunk] = (await id).split("-").map(Number)
  if (!ALL_STORES[storeIndex] || !Number.isInteger(chunk)) return []
  const { store, products } = await indexableProducts(storeIndex)
  return products.slice(chunk * CHUNK_SIZE, (chunk + 1) * CHUNK_SIZE).map((p) => {
    const path = `/product/${p.slug}`
    return {
      url: absoluteUrl(storePath(store, path)),
      alternates: { languages: hreflangMap(path, markets.filter((m) => p.offers[m])) },
    }
  })
}
