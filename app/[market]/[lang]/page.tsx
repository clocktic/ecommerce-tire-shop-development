import Link from "next/link"
import { notFound } from "next/navigation"
import { localizeProduct } from "@/lib/catalog"
import { readPopularProducts, readReviewedProducts } from "@/lib/catalog/queries"
import { ProductCarousel } from "@/components/home/product-carousel"
import { CatalogUnavailable } from "@/components/catalog/catalog-unavailable"
import { getDictionary, parseStore, storePath } from "@/lib/i18n"
import { Hero } from "@/components/home/hero"
import { BlackFridayBanner } from "@/components/home/black-friday-banner"
import { CategoryTiles } from "@/components/home/category-tiles"
import { MemberClubShowcase } from "@/components/home/member-club-showcase"
import { SidewallDecoder } from "@/components/home/sidewall-decoder"
import { MarketPromise } from "@/components/home/market-promise"
import { TrustStrip } from "@/components/home/trust-strip"
import { BrandMarquee } from "@/components/home/brand-marquee"
import { ReviewsShowcase } from "@/components/home/reviews-showcase"
import { ProductCard } from "@/components/product/product-card"
import { getRatingsBySlug, getStampedReviews } from "@/lib/stamped-reviews"

const MIN_REVIEWED = 4

export default async function HomePage({ params }: { params: Promise<{ market: string; lang: string }> }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const [reviews, ratings] = await Promise.all([getStampedReviews(), getRatingsBySlug()])
  const reviewed = await readReviewedProducts(store.market, ratings, 20)
  const catalog = reviewed.ok && reviewed.data.length >= MIN_REVIEWED ? reviewed : await readPopularProducts(store.market, 20)
  const featured = catalog.ok ? catalog.data.map((p) => localizeProduct(p, store)) : []

  return (
    <>
      <Hero store={store} />
      <BlackFridayBanner store={store} />
      <TrustStrip store={store} />
      <BrandMarquee store={store} />
      <CategoryTiles store={store} />
      <MemberClubShowcase />
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
          <ProductCarousel labelledBy="featured-title" prevLabel={t.home.carouselPrev} nextLabel={t.home.carouselNext}>
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} store={store} rating={ratings.get(p.slug)} />
            ))}
          </ProductCarousel>
        ) : (
          <CatalogUnavailable store={store} />
        )}
      </section>

      <ReviewsShowcase reviews={reviews} store={store} />

      <MarketPromise store={store} />
    </>
  )
}
