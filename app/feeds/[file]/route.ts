import { buildGoogleFeed, FeedValidationError } from "@/lib/feeds/google"
import { buildUsTop500Feed } from "@/lib/feeds/us-top500"
import { renderTop500Preview } from "@/lib/feeds/us-top500-preview"
import { US_MASTER_FEED_LIMIT } from "@/lib/feeds/us-top500-selection"
import { localeMeta, parseStore } from "@/lib/i18n/config"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const CONTENT_TYPES = {
  xml: "application/xml; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  html: "text/html; charset=utf-8",
} as const

function unavailable(error: unknown) {
  console.error("Product feed generation failed", error instanceof FeedValidationError ? error.issues : "catalog unavailable")
  return new Response("Product feed temporarily unavailable. Please retry later.", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "300" },
  })
}

// US Master Cumulative, Top-N, and Daily Batches:
// - /feeds/google-us-<lang>-master.(xml|txt|html) -> Single cumulative master feed (default US_MASTER_FEED_LIMIT)
// - /feeds/google-us-<lang>-cumulative-<N>.(xml|txt|html) -> Cumulative feed of N unique items (preserves all prior batches)
// - /feeds/google-us-<lang>-top500.(xml|txt|html) -> Batch 2 (500 items)
// - /feeds/google-us-<lang>-top600.(xml|txt|html) -> Batch 3 (+600 brand-new items, 0 overlap with starter 100 & top500)
// - /feeds/google-us-<lang>-batch<B>-<N>.(xml|txt|html) -> Batch B (+N brand-new items, 0 overlap with Batches 1..B-1)
async function topFeed(
  file: string,
  lang: string,
  requestedTotal: number,
  ext: keyof typeof CONTENT_TYPES,
  batch?: number,
  options?: { cumulative?: boolean; isMaster?: boolean },
) {
  const store = parseStore("us", lang)
  if (!store || !Number.isFinite(requestedTotal) || requestedTotal < 100 || requestedTotal > 10000) {
    return new Response("Not found", { status: 404 })
  }
  try {
    const isCumulative = Boolean(options?.cumulative)
    const effectiveBatch = isCumulative ? 0 : (batch ?? (requestedTotal === 500 ? 2 : 3))
    const feed = await buildUsTop500Feed(store, requestedTotal, effectiveBatch, { cumulative: isCumulative })
    const base = options?.isMaster
      ? `/feeds/google-us-${lang}-master`
      : isCumulative
        ? `/feeds/google-us-${lang}-cumulative-${requestedTotal}`
        : batch && batch >= 4
          ? `/feeds/google-us-${lang}-batch${batch}-${requestedTotal}`
          : `/feeds/google-us-${lang}-top${requestedTotal}`
    const body =
      ext === "xml"
        ? feed.xml
        : ext === "txt"
          ? feed.text
          : renderTop500Preview(feed, { xml: `${base}.xml`, txt: `${base}.txt`, lang })
    const headers: Record<string, string> = {
      "Content-Type": CONTENT_TYPES[ext],
      "Content-Language": localeMeta(store).hreflang,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Feed-Version": options?.isMaster
        ? `master-${feed.items.length}`
        : isCumulative
          ? `cumulative-${feed.items.length}`
          : `top${feed.items.length}-b${effectiveBatch}`,
      "X-Feed-Items": String(feed.items.length),
      "X-Feed-Mode": isCumulative ? "cumulative" : "batch",
      "X-Feed-Batch": String(effectiveBatch),
    }
    if (ext === "html") headers["X-Robots-Tag"] = "noindex, nofollow"
    else headers["Content-Disposition"] = `attachment; filename="${file}"`
    return new Response(body, { headers })
  } catch (error) {
    return unavailable(error)
  }
}

// XML remains available for every store; US stores also offer tab-delimited TXT.
export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const masterMatch = file.match(/^google-us-([a-z]{2})-master\.(xml|txt|html)$/)
  if (masterMatch) {
    const url = new URL(request.url)
    const limitOverride = Number(url.searchParams.get("limit"))
    const total = Number.isFinite(limitOverride) && limitOverride >= 100 ? limitOverride : US_MASTER_FEED_LIMIT
    return topFeed(file, masterMatch[1], total, masterMatch[2] as keyof typeof CONTENT_TYPES, undefined, {
      cumulative: true,
      isMaster: true,
    })
  }

  const cumulativeMatch = file.match(/^google-us-([a-z]{2})-cumulative-(\d{3,5})\.(xml|txt|html)$/)
  if (cumulativeMatch) {
    const total = Number(cumulativeMatch[2])
    return topFeed(file, cumulativeMatch[1], total, cumulativeMatch[3] as keyof typeof CONTENT_TYPES, undefined, {
      cumulative: true,
    })
  }

  const batchMatch = file.match(/^google-us-([a-z]{2})-batch(\d{1,2})-(\d{3,4})\.(xml|txt|html)$/)
  if (batchMatch) {
    const batchNum = Number(batchMatch[2])
    const total = Number(batchMatch[3])
    if (batchNum < 2 || batchNum > 20) return new Response("Not found", { status: 404 })
    return topFeed(file, batchMatch[1], total, batchMatch[4] as keyof typeof CONTENT_TYPES, batchNum)
  }

  const top = file.match(/^google-us-([a-z]{2})-top(\d{3,5})\.(xml|txt|html)$/)
  if (top) {
    const url = new URL(request.url)
    const limitOverride = Number(url.searchParams.get("limit"))
    const batchOverride = Number(url.searchParams.get("batch"))
    const total = Number.isFinite(limitOverride) && limitOverride >= 100 ? limitOverride : Number(top[2])
    const batch = Number.isFinite(batchOverride) && batchOverride >= 2 ? batchOverride : undefined
    return topFeed(file, top[1], total, top[3] as keyof typeof CONTENT_TYPES, batch)
  }

  const match = file.match(/^google-(us|eu)-([a-z]{2})\.(xml|txt)$/)
  const store = match ? parseStore(match[1], match[2]) : null
  const isText = match?.[3] === "txt"
  if (!store || (isText && store.market !== "us")) return new Response("Not found", { status: 404 })

  const url = new URL(request.url)
  const fullCatalog = url.searchParams.get("mode") === "all" || url.searchParams.get("all") === "1"
  try {
    const { xml, text, included, skipped } = await buildGoogleFeed(store, { fullCatalog })
    return new Response(isText ? text : xml, {
      headers: {
        "Content-Type": isText ? "text/plain; charset=utf-8" : "application/xml; charset=utf-8",
        "Content-Language": localeMeta(store).hreflang,
        "Content-Disposition": `attachment; filename="${file}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Feed-Version": "2",
        "X-Feed-Items": String(included),
        "X-Feed-Skipped": String(skipped.length),
      },
    })
  } catch (error) {
    return unavailable(error)
  }
}

export async function HEAD(request: Request, ctx: { params: Promise<{ file: string }> }) {
  const res = await GET(request, ctx)
  return new Response(null, { status: res.status, headers: res.headers })
}
