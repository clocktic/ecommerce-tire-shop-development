import Link from "next/link"
import { ArrowRight, BadgeCheck } from "lucide-react"
import { storePath, type Store } from "@/lib/i18n"
import { fmt } from "@/lib/i18n/fmt"
import { formatRating, getReviewsCopy, reviewCountLabel } from "@/lib/i18n/reviews"
import { getStampedReviews, reviewStats, type ReviewStats } from "@/lib/stamped-reviews"
import { StarRating } from "@/components/reviews/star-rating"

export function StampedBadgeCard({ store, stats }: { store: Store; stats: ReviewStats | null }) {
  const copy = getReviewsCopy(store)
  const hasStats = stats !== null && stats.count > 0
  const average = hasStats ? formatRating(store, stats.average) : null

  return (
    <Link
      href={storePath(store, "/reviews")}
      aria-label={hasStats ? fmt(copy.footerBadge, { rating: average!, count: stats.count }) : copy.readMore}
      className="group flex h-full w-full flex-col justify-between gap-2 rounded-md border border-secondary-foreground/15 bg-secondary-foreground/[0.04] px-3 py-2 transition-colors hover:border-secondary-foreground/35 hover:bg-secondary-foreground/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-48"
    >
      <span className="flex h-4 items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1">
          <BadgeCheck aria-hidden="true" className="size-4 shrink-0 text-rating" />
          <span className="truncate text-[13px] font-bold leading-none tracking-tight text-secondary-foreground">
            Stamped<span className="text-rating">.io</span>
          </span>
        </span>
        <ArrowRight
          aria-hidden="true"
          className="size-3.5 shrink-0 text-secondary-foreground/40 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-secondary-foreground"
        />
      </span>
      <span className="flex items-end justify-between gap-2">
        <span className="flex min-w-0 flex-col gap-1">
          <StarRating rating={hasStats ? stats.average : 0} size="sm" />
          <span className="truncate font-mono text-[10px] uppercase leading-tight tracking-[0.08em] text-secondary-foreground/60">
            {hasStats ? reviewCountLabel(copy, stats.count) : copy.nav}
          </span>
        </span>
        <span className="shrink-0 tabular-nums leading-none text-secondary-foreground">
          <span className="text-lg font-bold">{average ?? "—"}</span>
          <span className="text-[11px] text-secondary-foreground/60">/5</span>
        </span>
      </span>
    </Link>
  )
}

export async function StampedBadge({ store }: { store: Store }) {
  const reviews = await getStampedReviews()
  return <StampedBadgeCard store={store} stats={reviews.length ? reviewStats(reviews) : null} />
}
