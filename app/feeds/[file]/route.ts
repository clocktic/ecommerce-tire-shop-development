import { buildGoogleFeed, FeedValidationError } from "@/lib/feeds/google"
import { localeMeta, parseStore } from "@/lib/i18n/config"

export const dynamic = "force-dynamic"

// XML remains available for every store; US stores also offer tab-delimited TXT.
export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
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
    console.error("Product feed generation failed", error instanceof FeedValidationError ? error.issues : "catalog unavailable")
    return new Response("Product feed temporarily unavailable. Please retry later.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "300" },
    })
  }
}

export async function HEAD(request: Request, ctx: { params: Promise<{ file: string }> }) {
  const res = await GET(request, ctx)
  return new Response(null, { status: res.status, headers: res.headers })
}
