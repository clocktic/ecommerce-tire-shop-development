import Link from "next/link"
import { notFound } from "next/navigation"
import { localizeProduct } from "@/lib/catalog"
import { getProducts } from "@/lib/catalog/queries"
import { getDictionary, parseStore, storePath } from "@/lib/i18n"
import { Hero } from "@/components/home/hero"
import { VehicleFinder } from "@/components/home/vehicle-finder"
import { CategoryTiles } from "@/components/home/category-tiles"
import { SidewallDecoder } from "@/components/home/sidewall-decoder"
import { MarketPromise } from "@/components/home/market-promise"
import { ProductCard } from "@/components/product/product-card"

export default async function HomePage({ params }: { params: Promise<{ market: string; lang: string }> }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const listed = await getProducts(store.market)
  const featured = listed.slice(0, 4).map((p) => localizeProduct(p, store))
  const stockedSizes = listed.flatMap((product) =>
    product.category === "tires" ? [`${product.tire.width}/${product.tire.aspect}R${product.tire.rim}`] : [],
  )

  return (
    <>
      <Hero store={store} />
      <VehicleFinder stockedSizes={stockedSizes} />
      <CategoryTiles store={store} />
      <SidewallDecoder t={t} />

      <section aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="featured-title" className="font-expanded text-2xl font-extrabold uppercase md:text-3xl">
            {t.home.featured}
          </h2>
          <Link
            href={storePath(store, "/tires")}
            className="font-mono text-xs uppercase tracking-[0.18em] underline underline-offset-4"
          >
            {t.home.allTires}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} store={store} />
          ))}
        </div>
      </section>

      <MarketPromise store={store} />
    </>
  )
}
