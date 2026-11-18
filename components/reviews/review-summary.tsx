import Link from "next/link"
import type { Store } from "@/lib/i18n"
import { fmt } from "@/lib/i18n/fmt"
import { formatRating, reviewCountLabel, starsLabel, type ReviewsCopy } from "@/lib/i18n/reviews"
import type { ReviewStats } from "@/lib/stamped-reviews"
import { cn } from "@/lib/utils"
import { StarRating } from "@/components/reviews/star-rating"

const RATINGS = [5, 4, 3, 2, 1] as const

export function ReviewSummary({
  stats,
  store,
  copy,
  hrefFor,
  active,
  className,
}: {
  stats: ReviewStats
  store: Store
  copy: ReviewsCopy
  hrefFor?: (rating: number) => string
  active?: number | null
  className?: string
}) {
  const average = formatRating(store, stats.average)

  return (
    <div className={cn("grid gap-6 border border-border bg-card p-5 shadow-lifted sm:grid-cols-[auto_1fr] sm:gap-10 sm:p-6", className)}>
      <div className="flex flex-col gap-2 sm:min-w-44">
        <p className="flex items-baseline gap-1.5">
          <span className="font-expanded text-5xl font-extrabold leading-none tabular-nums">{average}</span>
          <span className="font-mono text-sm text-muted-foreground">/ 5</span>
        </p>
        <StarRating rating={stats.average} label={fmt(copy.ratingLabel, { rating: average })} size="lg" />
        <p className="text-sm text-muted-foreground">{fmt(copy.basedOn, { count: reviewCountLabel(copy, stats.count) })}</p>
      </div>

      <ul aria-label={hrefFor ? copy.filterLabel : undefined} className="flex flex-col justify-center gap-1.5">
        {RATINGS.map((rating) => {
          const count = stats.distribution[rating]
          const percent = stats.count ? Math.round((count / stats.count) * 100) : 0
          const label = starsLabel(copy, rating)
          const row = (
            <>
              <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">{label}</span>
              <span aria-hidden="true" className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span className="absolute inset-y-0 left-0 rounded-full bg-rating" style={{ width: `${percent}%` }} />
              </span>
              <span className="w-10 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">{count}</span>
            </>
          )
          return (
            <li key={rating}>
              {hrefFor && count > 0 ? (
                <Link
                  href={hrefFor(rating)}
                  aria-current={active === rating ? "true" : undefined}
                  aria-label={`${label}: ${reviewCountLabel(copy, count)}`}
                  className={cn(
                    "-mx-2 flex items-center gap-3 rounded-[var(--radius-sm)] px-2 py-1 transition-colors hover:bg-muted/60",
                    active === rating && "bg-muted",
                  )}
                >
                  {row}
                </Link>
              ) : (
                <span className="flex items-center gap-3 py-1">{row}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
