import Link from "next/link"
import { notFound } from "next/navigation"
import { getProducts } from "@/lib/catalog"
import { isMarket } from "@/lib/markets"
import { Hero } from "@/components/home/hero"
import { CategoryTiles } from "@/components/home/category-tiles"
import { SidewallDecoder } from "@/components/home/sidewall-decoder"
import { MarketPromise } from "@/components/home/market-promise"
import { ProductCard } from "@/components/product/product-card"

export default async function HomePage({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params
  if (!isMarket(market)) notFound()
  const featured = getProducts(market).slice(0, 4)

  return (
    <>
      <Hero market={market} />
      <CategoryTiles market={market} />
      <SidewallDecoder market={market} />

      <section aria-labelledby="featured-title" className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="featured-title" className="font-expanded text-2xl font-extrabold uppercase md:text-3xl">
            On the rack
          </h2>
          <Link href={`/${market}/tires`} className="font-mono text-xs uppercase tracking-[0.18em] underline underline-offset-4">
            All tires
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} market={market} />
          ))}
        </div>
      </section>

      <MarketPromise market={market} />
    </>
  )
}
