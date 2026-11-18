import Image from "next/image"
import Link from "next/link"
import { BadgeCheck, MessageSquareReply } from "lucide-react"
import { counterpart, storePath, type Store } from "@/lib/i18n"
import { fmt } from "@/lib/i18n/fmt"
import { formatReviewDate, type ReviewsCopy } from "@/lib/i18n/reviews"
import type { StampedReview } from "@/lib/stamped-reviews"
import { cn } from "@/lib/utils"
import { StarRating } from "@/components/reviews/star-rating"

function productHref(store: Store, review: StampedReview) {
  const target = review.productMarket && review.productMarket !== store.market ? counterpart(store, review.productMarket) : store
  return storePath(target, `/product/${review.productSlug}`)
}

function initials(name: string) {
  return name
    .replace(/\./g, "")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function ReviewCard({
  review,
  store,
  copy,
  showProduct = true,
  clamp = false,
  className,
}: {
  review: StampedReview
  store: Store
  copy: ReviewsCopy
  showProduct?: boolean
  clamp?: boolean
  className?: string
}) {
  return (
    <article className={cn("flex h-full min-w-0 flex-col gap-4 border border-border bg-card p-4 shadow-lifted sm:p-5", className)}>
      <header className="flex items-center justify-between gap-3">
        <StarRating rating={review.rating} label={fmt(copy.ratingLabel, { rating: review.rating })} size="md" />
        <time dateTime={review.date} className="shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {formatReviewDate(store, review.date)}
        </time>
      </header>

      <div className="flex flex-1 flex-col gap-1.5">
        {review.title && <h3 className="text-pretty text-base font-bold leading-snug">{review.title}</h3>}
        {review.body && (
          <p className={cn("text-pretty text-sm leading-relaxed text-muted-foreground", clamp && "line-clamp-5")}>{review.body}</p>
        )}
      </div>

      {review.reply && !clamp && (
        <div className="flex gap-2.5 border-l-2 border-primary bg-muted/50 px-3 py-2.5 text-sm">
          <MessageSquareReply aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="leading-relaxed">
            <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground">{copy.reply}</span>
            <span className="text-muted-foreground">{review.reply}</span>
          </p>
        </div>
      )}

      <footer className="flex flex-col gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold text-secondary-foreground"
          >
            {initials(review.author)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">{review.author}</span>
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              {review.verified && (
                <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <BadgeCheck aria-hidden="true" className="size-3.5" />
                  {copy.verified}
                </span>
              )}
              {review.location && <span className="truncate">{review.location}</span>}
            </span>
          </span>
        </div>

        {showProduct && review.productTitle && (
          <Link
            href={productHref(store, review)}
            className="group flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] border border-border bg-background/60 p-2 transition-colors hover:border-foreground/50"
          >
            {review.productImage ? (
              <span className="relative size-11 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-white">
                <Image src={review.productImage} alt="" fill sizes="44px" className="object-contain p-1" />
              </span>
            ) : null}
            <span className="flex min-w-0 flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{copy.reviewedProduct}</span>
              <span className="line-clamp-2 text-xs font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">
                {review.productTitle}
              </span>
            </span>
          </Link>
        )}
      </footer>
    </article>
  )
}
