import Link from "next/link"
import { ArrowRight, MessageSquareText } from "lucide-react"
import { storePath, type Store } from "@/lib/i18n"
import { getReviewsCopy } from "@/lib/i18n/reviews"
import { reviewStats, type StampedReview } from "@/lib/stamped-reviews"
import { ReviewCard } from "@/components/reviews/review-card"
import { ReviewSummary } from "@/components/reviews/review-summary"
import { EuReviewsLogisticsNote } from "@/components/reviews/eu-logistics-note"

export function ProductReviews({ reviews, store }: { reviews: StampedReview[]; store: Store }) {
  const copy = getReviewsCopy(store)
  const allHref = storePath(store, "/reviews")

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-24 border-t border-border py-10 sm:py-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{copy.collectedBy}</p>
          <h2 id="reviews-title" className="font-expanded text-lg font-extrabold uppercase sm:text-xl">
            {copy.productTitle}
          </h2>
        </div>
        <Link href={allHref} className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.16em] underline underline-offset-4">
          {copy.viewAll}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      {reviews.length > 0 && <EuReviewsLogisticsNote store={store} className="mb-5" />}

      {reviews.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-6">
          <ReviewSummary stats={reviewStats(reviews)} store={store} copy={copy} className="self-start sm:grid-cols-1 sm:gap-6 lg:sticky lg:top-40" />
          <ul className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} store={store} copy={copy} showProduct={false} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3 border border-dashed border-border bg-card/60 p-6 sm:flex-row sm:items-center sm:gap-5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted">
            <MessageSquareText aria-hidden="true" className="size-5 text-muted-foreground" />
          </span>
          <div className="flex flex-1 flex-col gap-1">
            <p className="font-semibold">{copy.noReviewsTitle}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{copy.noReviewsLead}</p>
          </div>
          <Link
            href={allHref}
            className="inline-flex shrink-0 items-center gap-2 border border-foreground px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-foreground hover:text-background"
          >
            {copy.readMore}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      )}
    </section>
  )
}
