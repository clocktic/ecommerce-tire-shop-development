import "server-only"

import { cache } from "react"
import { unstable_cache } from "next/cache"
import { isMarket, type Market } from "@/lib/markets"
import { STAMPED_PUBLIC_API_KEY, STAMPED_STORE_HASH, stampedProductId } from "@/lib/stamped"
import { STAMPED_PRIVATE_API_KEY } from "@/lib/stamped-server"

export const STAMPED_REVIEWS_TAG = "stamped-reviews-v2"

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
  productId: string
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
  productId?: number | string | null
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

const HANDLE_ALIASES: Record<string, string> = {
  "calibre-exile-r-19x8-5-5x108-et33-gloss-black": "calibre-exile-r-19x8-5-5x120-et33-gloss-black",
  "ats-streetrallye-17x7-5x5x112-et45-dark-grey": "ats-streetrallye-17x7-5x112-et45-dark-grey",
  "ats-streetrallye-17x7-5-5x112-et45-dark-grey": "ats-streetrallye-17x7-5x112-et45-dark-grey",
}

const PRODUCT_ID_TO_SLUG: Record<string, string> = {
  "799949516897": "calibre-exile-r-19x8-5-5x120-et33-gloss-black",
  "189208241331": "ats-streetrallye-17x7-5x112-et45-dark-grey",
}

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

function marketFromUrl(url: string | null | undefined, productSlug: string): Market | null {
  if (productSlug.startsWith("ref-us-")) return "us"
  if (productSlug.startsWith("ref-eu-")) return "eu"
  if (!url) return null
  try {
    const segment = new URL(url).pathname.split("/")[1]
    return isMarket(segment) ? segment : null
  } catch {
    return null
  }
}

function canonicalSlug(rawHandle: string | null | undefined, rawProductId: number | string | null | undefined): string {
  const trimmed = (rawHandle ?? "").trim()
  const pid = rawProductId != null ? String(rawProductId).trim() : ""
  if (pid && PRODUCT_ID_TO_SLUG[pid]) return PRODUCT_ID_TO_SLUG[pid]
  if (trimmed && HANDLE_ALIASES[trimmed]) return HANDLE_ALIASES[trimmed]
  return trimmed
}

function normalize(review: DashboardReview): StampedReview | null {
  const productSlug = canonicalSlug(review.productHandle, review.productId)
  if (review.reviewState !== PUBLISHED || !productSlug) return null
  const rating = Math.min(5, Math.max(1, Math.round(review.rating)))
  const productId = review.productId != null ? String(review.productId) : stampedProductId(productSlug)
  const rawProductTitle = (review.productTitle ?? "").trim()
  const productTitle = rawProductTitle
    .replace(/\s+For\s+[A-Z0-9].*$/i, "")
    .replace(/\s+—\s+.*$/, "")
    .trim()

  return {
    id: review.id,
    author: shortName(review.author),
    location: (review.location ?? "").trim(),
    rating,
    title: (review.title ?? "").trim(),
    body: (review.body ?? "").trim(),
    reply: review.isPublicReply && review.reply ? review.reply.trim() : "",
    date: review.dateCreated,
    verified: (review.verifiedType ?? 0) > 0,
    productId,
    productSlug,
    productTitle,
    productImage: localImage(review.productImageUrl),
    productMarket: marketFromUrl(review.productUrl, productSlug),
  }
}

async function fetchPage(page: number): Promise<DashboardPage> {
  const auth = Buffer.from(`${STAMPED_PUBLIC_API_KEY}:${STAMPED_PRIVATE_API_KEY}`).toString("base64")
  const url = `https://stamped.io/api/v2/${encodeURIComponent(STAMPED_STORE_HASH)}/dashboard/reviews?page=${page}&take=${PAGE_SIZE}`
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) throw new Error(`Stamped reviews request failed: ${response.status}`)
      return (await response.json()) as DashboardPage
    } catch (err) {
      if (attempt === 1) throw err
    }
  }
  throw new Error("Stamped reviews request failed")
}

// Fetch all pages as a single atomic snapshot so page 1 and pages 2..N never
// cache at different timestamps and shift pagination boundaries out of sync.
const loadStampedReviewsSnapshot = unstable_cache(
  async (): Promise<StampedReview[]> => {
    const first = await fetchPage(1)
    const totalPages = Math.min(first.totalPages ?? 1, 50)
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) => fetchPage(i + 2)),
    )
    const candidates = [first, ...rest]
      .flatMap((page) => page.results ?? [])
      .map((row) => normalize(row.review))
      .filter((review): review is StampedReview => Boolean(review))
      .sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date) || b.id - a.id)

    const seenIds = new Set<number>()
    const seenProductAuthors = new Set<string>()
    const seenProductBodies = new Set<string>()

    return candidates
      .filter((review) => {
        if (seenIds.has(review.id)) return false
        const authorKey = `${review.productSlug}::${review.author.toLowerCase()}`
        const bodyKey = `${review.productSlug}::${review.title.toLowerCase()}::${review.body.toLowerCase()}`
        if (seenProductAuthors.has(authorKey) || seenProductBodies.has(bodyKey)) return false
        seenIds.add(review.id)
        seenProductAuthors.add(authorKey)
        seenProductBodies.add(bodyKey)
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
  },
  ["stamped-reviews-snapshot-v3"],
  { revalidate: 300, tags: [STAMPED_REVIEWS_TAG] },
)

// The dashboard API (private key, server only) returns every published review with the
// product handle, which the public widget API omits. Emails and IPs are dropped in normalize().
export const getStampedReviews = cache(async (): Promise<StampedReview[]> => {
  try {
    return await loadStampedReviewsSnapshot()
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
  const targetId = stampedProductId(slug)
  return (await getStampedReviews()).filter(
    (review) => review.productSlug === slug || review.productId === targetId,
  )
}
