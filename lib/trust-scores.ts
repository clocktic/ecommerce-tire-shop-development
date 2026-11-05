import { COMPANY } from "@/lib/company"

const REVALIDATE_SECONDS = 60 * 60

export type CheckShopScore = { score: number; verdict: string }

function checkShopVerdict(score: number) {
  if (score >= 85) return "Excellent"
  if (score >= 70) return "Good"
  if (score >= 50) return "Fair"
  return "Poor"
}

export type ScamAdviserScore = { score: number; verdict: string }

function scamAdviserVerdict(score: number) {
  if (score >= 80) return "Very likely safe"
  if (score >= 60) return "Likely safe"
  if (score >= 40) return "Medium risk"
  return "High risk"
}

function decodeHtmlAttribute(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
}

/*
 * ScamAdviser has no public API; its report page is an Inertia app whose
 * server-rendered `data-page` props include `score.ratingScore`.
 */
export async function getScamAdviserScore(): Promise<ScamAdviserScore | null> {
  try {
    const res = await fetch(`https://www.scamadviser.com/check-website/${COMPANY.domain}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["trust-scores"] },
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html",
      },
    })
    if (!res.ok) return null
    const html = await res.text()
    const match = html.match(/data-page="([^"]+)"/)
    if (!match) return null
    const page: { props?: { score?: { ratingScore?: unknown } } } = JSON.parse(decodeHtmlAttribute(match[1]))
    const raw = Number(page.props?.score?.ratingScore)
    if (!Number.isFinite(raw)) return null
    const score = Math.max(0, Math.min(100, Math.round(raw)))
    return { score, verdict: scamAdviserVerdict(score) }
  } catch {
    return null
  }
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
