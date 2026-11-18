import Link from "next/link"
import { ArrowRight, BadgeCheck } from "lucide-react"
import { storePath, type Store } from "@/lib/i18n"
import { fmt } from "@/lib/i18n/fmt"
import { formatRating, getReviewsCopy, reviewCountLabel } from "@/lib/i18n/reviews"
import { reviewStats, type StampedReview } from "@/lib/stamped-reviews"
import { ProductCarousel } from "@/components/home/product-carousel"
import { ReviewCard } from "@/components/reviews/review-card"
import { StarRating } from "@/components/reviews/star-rating"

const SHOWN = 12

// Strongest recent reviews from this market first, then the rest, so the carousel reads local.
function pickReviews(reviews: StampedReview[], store: Store) {
  const good = reviews.filter((r) => r.rating >= 4 && r.body.length >= 40).sort((a, b) => b.rating - a.rating)
  const local = good.filter((r) => r.productMarket === store.market)
  const other = good.filter((r) => r.productMarket !== store.market)
  return [...local, ...other].slice(0, SHOWN)
}

export function ReviewsShowcase({ reviews, store }: { reviews: StampedReview[]; store: Store }) {
  if (!reviews.length) return null
  const copy = getReviewsCopy(store)
  const stats = reviewStats(reviews)
  const average = formatRating(store, stats.average)
  const shown = pickReviews(reviews, store)

  return (
    <section aria-labelledby="reviews-showcase-title" className="mx-auto max-w-7xl px-4 pt-12 sm:pt-24 md:px-6">
      <div className="mb-5 flex flex-col gap-5 sm:mb-8 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-xl flex-col gap-2">
          <p className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <BadgeCheck aria-hidden="true" className="size-3.5 text-rating" />
            {copy.homeEyebrow}
          </p>
          <h2 id="reviews-showcase-title" className="font-expanded text-xl font-extrabold uppercase sm:text-2xl md:text-3xl">
            {copy.homeTitle}
          </h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">{copy.homeLead}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 border border-border bg-card px-4 py-3 shadow-lifted">
            <span className="font-expanded text-3xl font-extrabold leading-none tabular-nums">{average}</span>
            <span className="flex flex-col gap-1">
              <StarRating rating={stats.average} label={fmt(copy.ratingLabel, { rating: average })} size="md" />
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                {fmt(copy.basedOn, { count: reviewCountLabel(copy, stats.count) })}
              </span>
            </span>
          </div>
          <Link
            href={storePath(store, "/reviews")}
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] underline underline-offset-4"
          >
            {copy.viewAll}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </div>

      <ProductCarousel labelledBy="reviews-showcase-title" prevLabel={copy.carouselPrev} nextLabel={copy.carouselNext} size="wide">
        {shown.map((review) => (
          <ReviewCard key={review.id} review={review} store={store} copy={copy} clamp />
        ))}
      </ProductCarousel>
    </section>
  )
}
