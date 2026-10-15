import type { Market } from "@/lib/markets"
import { EU_POLICIES } from "@/lib/legal/eu"
import { US_POLICIES } from "@/lib/legal/us"
import type { PolicyDoc } from "@/lib/legal/types"

const DOCS: Record<Market, Record<string, PolicyDoc>> = { us: US_POLICIES, eu: EU_POLICIES }

export function getPolicy(market: Market, slug: string): PolicyDoc | undefined {
  return DOCS[market][slug]
}

export function policySlugs(market: Market): string[] {
  return Object.keys(DOCS[market])
}

// Last material revision of the policy texts. Update when the wording changes.
export const POLICIES_UPDATED = "2026-10-15"
