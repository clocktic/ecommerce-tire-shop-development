import { COMPANY } from "@/lib/company"

const REVALIDATE_SECONDS = 60 * 60

export type CheckShopScore = { score: number; verdict: string }

function checkShopVerdict(score: number) {
  if (score >= 85) return "Excellent"
  if (score >= 70) return "Good"
  if (score >= 50) return "Fair"
  return "Poor"
}

/** Public CheckShop.eu badge endpoint; cached and refreshed hourly. */
export async function getCheckShopScore(): Promise<CheckShopScore | null> {
  try {
    const res = await fetch(`https://checkshop.eu/api/v1/badge/${COMPANY.domain}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["trust-scores"] },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null
    const data: { score?: unknown; status?: unknown } = await res.json()
    if (typeof data.score !== "number" || data.status !== "APPROVED") return null
    const score = Math.max(0, Math.min(100, Math.round(data.score)))
    return { score, verdict: checkShopVerdict(score) }
  } catch {
    return null
  }
}
