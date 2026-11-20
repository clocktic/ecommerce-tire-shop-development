import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { fmt, getDictionary, parseStore, storePath, type Store } from "@/lib/i18n"
import { getReviewsCopy, starsLabel } from "@/lib/i18n/reviews"
import { storeAlternates } from "@/lib/seo"
import { getStampedReviews, reviewStats } from "@/lib/stamped-reviews"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ReviewCard } from "@/components/reviews/review-card"
import { ReviewSummary } from "@/components/reviews/review-summary"

type Params = Promise<{ market: string; lang: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const PER_PAGE = 24

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function reviewsHref(store: Store, rating: number | null, page = 1) {
  const query = new URLSearchParams()
  if (rating) query.set("rating", String(rating))
  if (page > 1) query.set("page", String(page))
  const qs = query.toString()
  return storePath(store, `/reviews${qs ? `?${qs}` : ""}`)
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) return {}
  const copy = getReviewsCopy(store)
  return { title: copy.pageTitle, description: copy.metaDescription, alternates: storeAlternates(store, "/reviews") }
}

export default async function ReviewsPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { market, lang } = await params
  const store = parseStore(market, lang)
  if (!store) notFound()
  const t = getDictionary(store)
  const copy = getReviewsCopy(store)
  const query = await searchParams

  const reviews = await getStampedReviews()
  const stats = reviewStats(reviews)
  const ratingParam = Number(single(query.rating))
  const rating = Number.isInteger(ratingParam) && ratingParam >= 1 && ratingParam <= 5 ? ratingParam : null
  const seenDirectoryKeys = new Set<string>()
  const uniqueDirectoryReviews = reviews.filter((r) => {
    const key = `${r.author.toLowerCase()}::${r.title.toLowerCase()}::${r.body.toLowerCase()}`
    if (seenDirectoryKeys.has(key)) return false
    seenDirectoryKeys.add(key)
    return true
  })
  const filtered = rating ? uniqueDirectoryReviews.filter((r) => r.rating === rating) : uniqueDirectoryReviews
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageParam = Number(single(query.page))
  const page = Number.isInteger(pageParam) ? Math.min(Math.max(pageParam, 1), pages) : 1
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const chips = [null, 5, 4, 3, 2, 1].filter((value) => value === null || stats.distribution[value as 1 | 2 | 3 | 4 | 5] > 0)

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
      <Breadcrumbs label={t.common.breadcrumb} items={[{ href: storePath(store), label: t.common.home }, { label: copy.pageTitle }]} />

      <header className="flex flex-col gap-3 border-b border-border pb-8">
        <p className="inline-flex items-center gap-1.5 label-caps text-primary">
          <BadgeCheck aria-hidden="true" className="size-4" />
          {copy.collectedBy}
        </p>
        <h1 className="font-expanded text-3xl font-extrabold uppercase sm:text-4xl md:text-5xl">{copy.pageTitle}</h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">{copy.pageLead}</p>
      </header>

      {reviews.length > 0 && (
        <ReviewSummary
          stats={stats}
          store={store}
          copy={copy}
          hrefFor={(value) => reviewsHref(store, value)}
          active={rating}
          className="mt-8"
        />
      )}

      <nav aria-label={copy.filterLabel} className="mt-8 flex flex-wrap items-center gap-2">
        {chips.map((value) => {
          const active = value === rating
          return (
            <Link
              key={value ?? "all"}
              href={reviewsHref(store, value)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 border px-3 font-mono text-xs uppercase tracking-[0.1em] transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {value === null ? copy.all : starsLabel(copy, value)}
            </Link>
          )
        })}
        {filtered.length > 0 && (
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {fmt(copy.showing, {
              from: (page - 1) * PER_PAGE + 1,
              to: Math.min(page * PER_PAGE, filtered.length),
              total: filtered.length,
            })}
          </span>
        )}
      </nav>

      {visible.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} store={store} copy={copy} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 border border-dashed border-border bg-card/60 p-8 text-center text-muted-foreground">{copy.emptyFilter}</p>
      )}

      {pages > 1 && (
        <nav aria-label={copy.pageTitle} className="mt-10 flex flex-wrap items-center justify-center gap-1.5 font-mono text-sm">
          <PageLink href={page > 1 ? reviewsHref(store, rating, page - 1) : null} label={copy.prev} rel="prev">
            <ChevronLeft aria-hidden="true" className="size-4" />
          </PageLink>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={reviewsHref(store, rating, n)}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "flex h-9 min-w-9 items-center justify-center border px-2.5 transition-colors",
                n === page
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {n}
            </Link>
          ))}
          <PageLink href={page < pages ? reviewsHref(store, rating, page + 1) : null} label={copy.next} rel="next">
            <ChevronRight aria-hidden="true" className="size-4" />
          </PageLink>
        </nav>
      )}
    </div>
  )
}

function PageLink({
  href,
  label,
  rel,
  children,
}: {
  href: string | null
  label: string
  rel: "prev" | "next"
  children: React.ReactNode
}) {
  const classes = "flex h-9 min-w-9 items-center justify-center border border-border bg-card px-2.5"
  if (!href) {
    return (
      <span aria-hidden="true" className={cn(classes, "opacity-40")}>
        {children}
      </span>
    )
  }
  return (
    <Link href={href} rel={rel} aria-label={label} className={cn(classes, "text-muted-foreground hover:border-foreground hover:text-foreground")}>
      {children}
    </Link>
  )
}
