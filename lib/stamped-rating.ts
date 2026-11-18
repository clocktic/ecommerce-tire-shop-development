import "server-only"

import { cache } from "react"
import { STAMPED_PUBLIC_API_KEY, STAMPED_STORE_HASH, stampedProductId } from "@/lib/stamped"
import { STAMPED_REVIEWS_TAG } from "@/lib/stamped-reviews"

export type StampedRating = { rating: number; count: number }

type BadgeResponse = { productId?: string | number; rating?: number | string; count?: number | string }[]

const PUBLIC_KEY = process.env.STAMPED_PUBLIC_KEY || STAMPED_PUBLIC_API_KEY
const STORE_HASH = process.env.STAMPED_STORE_HASH || STAMPED_STORE_HASH

/**
 * Rating and review count for one product from Stamped's public badges API.
 * Returns null when Stamped is unreachable so callers can fall back to local data;
 * the result is cached under the reviews tag, which the Stamped webhook revalidates.
 */
export const getStampedProductRating = cache(async (slugOrId: string): Promise<StampedRating | null> => {
  if (!PUBLIC_KEY || !STORE_HASH) return null
  const productId = stampedProductId(slugOrId)
  try {
    const response = await fetch(
      "https://stamped.io/api/widget/badges?isIncludeBreakdown=false&isincludehtml=false",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ productIds: [{ productId }], apiKey: PUBLIC_KEY, storeUrl: STORE_HASH }),
        next: { revalidate: 1800, tags: [STAMPED_REVIEWS_TAG] },
        signal: AbortSignal.timeout(5000),
      },
    )
    if (!response.ok) return null
    const badges = (await response.json()) as BadgeResponse
    const badge = Array.isArray(badges) ? badges.find((b) => String(b.productId) === productId) : undefined
    if (!badge) return null
    const rating = Number(badge.rating)
    const count = Number(badge.count)
    return {
      rating: Number.isFinite(rating) ? rating : 0,
      count: Number.isInteger(count) && count > 0 ? count : 0,
    }
  } catch {
    return null
  }
})
