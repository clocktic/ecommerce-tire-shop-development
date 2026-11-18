import "server-only"

import { cache } from "react"
import { isMarket, type Market } from "@/lib/markets"
import { STAMPED_PUBLIC_API_KEY, STAMPED_STORE_HASH } from "@/lib/stamped"
import { STAMPED_PRIVATE_API_KEY } from "@/lib/stamped-server"

export const STAMPED_REVIEWS_TAG = "stamped-reviews"

export type StampedReview = {
  id: number
  author: string
  location: string
  rating: number
  title: string
  body: string
  reply: string
  date: string
  verified: boolean
  productSlug: string
  productTitle: string
  productImage: string
  productMarket: Market | null
}

export type RatingSummary = { count: number; average: number }

export type ReviewStats = RatingSummary & {
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}

type DashboardReview = {
  id: number
  reviewState: number
  rating: number
  title?: string | null
  author?: string | null
  location?: string | null
  body?: string | null
  reply?: string | null
  isPublicReply?: boolean | null
  productHandle?: string | null
  productTitle?: string | null
  productUrl?: string | null
  productImageUrl?: string | null
  verifiedType?: number | null
  dateCreated: string
}

type DashboardPage = { totalPages?: number; results?: { review: DashboardReview }[] }

const PAGE_SIZE = 100
const PUBLISHED = 1

// "Arthur Piotrowski" → "Arthur P." — Stamped stores full names, the storefront only shows initials.
function shortName(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "Customer"
  const [first, ...rest] = parts
  const last = rest.at(-1)
  return last ? `${first} ${last[0].toUpperCase()}.` : first
}

// Images hosted on our own domain are served locally so they work on every preview/deployment.
function localImage(url: string | null | undefined) {
  if (!url) return ""
  try {
    const parsed = new URL(url)
    return parsed.hostname.endsWith("tiresshop.net") ? parsed.pathname : url
  } catch {
    return url.startsWith("/") ? url : ""
  }
}

function marketFromUrl(url: string | null | undefined): Market | null {
  if (!url) return null
  try {
    const segment = new URL(url).pathname.split("/")[1]
    return isMarket(segment) ? segment : null
  } catch {
    return null
  }
}

function normalize(review: DashboardReview): StampedReview | null {
  if (review.reviewState !== PUBLISHED || !review.productHandle) return null
  const rating = Math.min(5, Math.max(1, Math.round(review.rating)))
  return {
    id: review.id,
    author: shortName(review.author),
    location: review.location?.trim() ?? "",
    rating,
    title: review.title?.trim() ?? "",
    body: review.body?.trim() ?? "",
    reply: review.isPublicReply === false ? "" : (review.reply?.trim() ?? ""),
    date: review.dateCreated,
    verified: (review.verifiedType ?? 0) > 0,
    productSlug: review.productHandle,
    productTitle: review.productTitle?.trim() ?? "",
    productImage: localImage(review.productImageUrl),
    productMarket: marketFromUrl(review.productUrl),
  }
}

async function fetchPage(page: number): Promise<DashboardPage> {
  const auth = Buffer.from(`${STAMPED_PUBLIC_API_KEY}:${STAMPED_PRIVATE_API_KEY}`).toString("base64")
  const response = await fetch(
    `https://stamped.io/api/v2/${encodeURIComponent(STAMPED_STORE_HASH)}/dashboard/reviews?page=${page}&take=${PAGE_SIZE}`,
    {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
      next: { revalidate: 1800, tags: [STAMPED_REVIEWS_TAG] },
      signal: AbortSignal.timeout(8000),
    },
  )
  if (!response.ok) throw new Error(`Stamped reviews request failed: ${response.status}`)
  return response.json()
}

// The dashboard API (private key, server only) returns every published review with the
// product handle, which the public widget API omits. Emails and IPs are dropped in normalize().
export const getStampedReviews = cache(async (): Promise<StampedReview[]> => {
  try {
    const first = await fetchPage(1)
    const totalPages = Math.min(first.totalPages ?? 1, 50)
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) => fetchPage(i + 2).catch(() => ({ results: [] }) as DashboardPage)),
    )
    const seen = new Set<number>()
    return [first, ...rest]
      .flatMap((page) => page.results ?? [])
      .map((row) => normalize(row.review))
      .filter((review): review is StampedReview => {
        if (!review || seen.has(review.id)) return false
        seen.add(review.id)
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
})

export function reviewStats(reviews: StampedReview[]): ReviewStats {
  const distribution: ReviewStats["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let sum = 0
  for (const review of reviews) {
    distribution[review.rating as 1 | 2 | 3 | 4 | 5] += 1
    sum += review.rating
  }
  return { count: reviews.length, average: reviews.length ? sum / reviews.length : 0, distribution }
}

export const getRatingsBySlug = cache(async (): Promise<Map<string, RatingSummary>> => {
  const totals = new Map<string, { count: number; sum: number }>()
  for (const review of await getStampedReviews()) {
    const entry = totals.get(review.productSlug) ?? { count: 0, sum: 0 }
    entry.count += 1
    entry.sum += review.rating
    totals.set(review.productSlug, entry)
  }
  return new Map([...totals].map(([slug, { count, sum }]) => [slug, { count, average: sum / count }]))
})

export async function getProductReviews(slug: string): Promise<StampedReview[]> {
  return (await getStampedReviews()).filter((review) => review.productSlug === slug)
}
