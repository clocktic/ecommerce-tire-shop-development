import { buildGoogleFeed } from "@/lib/feeds/google"
import { localeMeta, parseStore } from "@/lib/i18n/config"

export const revalidate = 3600

// Serves /feeds/google-<market>-<lang>.xml, e.g. google-us-es.xml or google-eu-nl.xml.
export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const match = file.match(/^google-(us|eu)-([a-z]{2})\.xml$/)
  const store = match ? parseStore(match[1], match[2]) : null
  if (!store) return new Response("Not found", { status: 404 })

  const url = new URL(request.url)
  const fullCatalog = url.searchParams.get("mode") === "all" || url.searchParams.get("all") === "1"
  const { xml, included, skipped } = await buildGoogleFeed(store, { fullCatalog })
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Language": localeMeta(store).hreflang,
      "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600",
      "X-Feed-Items": String(included),
      "X-Feed-Skipped": String(skipped.length),
    },
  })
}

export async function HEAD(request: Request, ctx: { params: Promise<{ file: string }> }) {
  const res = await GET(request, ctx)
  return new Response(null, { status: res.status, headers: res.headers })
}
