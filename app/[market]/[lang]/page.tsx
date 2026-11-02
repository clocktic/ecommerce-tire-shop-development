import Link from "next/link"
import { notFound } from "next/navigation"
import { localizeProduct } from "@/lib/catalog"
import { readProducts } from "@/lib/catalog/queries"
import { CatalogUnavailable } from "@/components/catalog/catalog-unavailable"
import { getDictionary, parseStore, storePath } from "@/lib/i18n"
import { Hero } from "@/components/home/hero"
import { CategoryTiles } from "@/components/home/category-tiles"
import { MemberClubShowcase } from "@/components/home/member-club-showcase"
import { VehicleBrandGrid } from "@/components/home/vehicle-brand-grid"
import { CatalogBrandShowcase } from "@/components/home/catalog-brand-showcase"
import { SidewallDecoder } from "@/components/home/sidewall-decoder"
import { MarketPromise } from "@/components/home/market-promise"
import { ProductCard } from "@/components/product/product-card"

export default async function HomePage({ params }: { params: Promise<{ market: string; lang: string }> }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const catalog = await readProducts(store.market)
  const featured = catalog.ok ? catalog.data.slice(0, 4).map((p) => localizeProduct(p, store)) : []

  return (
    <>
      <Hero store={store} />
      <CategoryTiles store={store} />
      <MemberClubShowcase />
      <VehicleBrandGrid />
      <CatalogBrandShowcase />
      <SidewallDecoder t={t} />

      <section aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 pt-12 sm:pt-24 md:px-6">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8">
          <h2 id="featured-title" className="font-expanded text-xl font-extrabold uppercase sm:text-2xl md:text-3xl">
            {t.home.featured}
          </h2>
          <Link
            href={storePath(store, "/tires")}
            className="font-mono text-xs uppercase tracking-[0.18em] underline underline-offset-4"
          >
            {t.home.allTires}
          </Link>
        </div>
        {catalog.ok ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} store={store} />
            ))}
          </div>
        ) : (
          <CatalogUnavailable store={store} />
        )}
      </section>

      <MarketPromise store={store} />
    </>
  )
}
