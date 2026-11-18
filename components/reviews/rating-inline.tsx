import Link from "next/link"
import type { Store } from "@/lib/i18n"
import { fmt } from "@/lib/i18n/fmt"
import { formatRating, getReviewsCopy, reviewCountLabel } from "@/lib/i18n/reviews"
import type { RatingSummary } from "@/lib/stamped-reviews"
import { cn } from "@/lib/utils"
import { StarRating } from "@/components/reviews/star-rating"

export function RatingInline({
  rating,
  store,
  href,
  size = "sm",
  compact = false,
  className,
}: {
  rating: RatingSummary
  store: Store
  href?: string
  size?: "xs" | "sm" | "md"
  compact?: boolean
  className?: string
}) {
  const copy = getReviewsCopy(store)
  const average = formatRating(store, rating.average)
  const content = (
    <>
      <StarRating rating={rating.average} label={fmt(copy.ratingLabel, { rating: average })} size={size} />
      <span className="font-mono font-semibold tabular-nums text-foreground">{average}</span>
      {compact ? (
        <span className="text-muted-foreground">
          <span aria-hidden="true">({rating.count})</span>
          <span className="sr-only">{reviewCountLabel(copy, rating.count)}</span>
        </span>
      ) : (
        <span className="text-muted-foreground">({reviewCountLabel(copy, rating.count)})</span>
      )}
    </>
  )
  const classes = cn("inline-flex w-max max-w-full items-center gap-1.5", size === "md" ? "text-sm" : "text-xs", className)

  return href ? (
    <Link href={href} className={cn(classes, "hover:underline hover:underline-offset-4")}>
      {content}
    </Link>
  ) : (
    <span className={classes}>{content}</span>
  )
}
