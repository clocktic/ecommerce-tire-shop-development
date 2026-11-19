import { buildGoogleFeed, FeedValidationError } from "@/lib/feeds/google"
import { buildUsTop500Feed } from "@/lib/feeds/us-top500"
import { renderTop500Preview } from "@/lib/feeds/us-top500-preview"
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

// US Top-N: /feeds/google-us-<lang>-top<N>.(xml|txt|html), e.g. top500, top600, top900, top1200.
// Each step N is a strict cumulative superset of previous steps for daily GMC scaling.
async function topFeed(file: string, lang: string, requestedTotal: number, ext: keyof typeof CONTENT_TYPES) {
  const store = parseStore("us", lang)
  if (!store || !Number.isFinite(requestedTotal) || requestedTotal < 100 || requestedTotal > 10000) {
    return new Response("Not found", { status: 404 })
  }
  try {
    const feed = await buildUsTop500Feed(store, requestedTotal)
    const base = `/feeds/google-us-${lang}-top${requestedTotal}`
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
      "X-Feed-Version": `top${feed.items.length}-1`,
      "X-Feed-Items": String(feed.items.length),
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
  const top = file.match(/^google-us-([a-z]{2})-top(\d{3,5})\.(xml|txt|html)$/)
  if (top) {
    const url = new URL(request.url)
    const limitOverride = Number(url.searchParams.get("limit"))
    const total = Number.isFinite(limitOverride) && limitOverride >= 100 ? limitOverride : Number(top[2])
    return topFeed(file, top[1], total, top[3] as keyof typeof CONTENT_TYPES)
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
