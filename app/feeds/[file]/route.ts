import { buildGoogleFeed } from "@/lib/feeds/google"
import { localeMeta, parseStore } from "@/lib/i18n/config"

export const revalidate = 3600

// Serves /feeds/google-<market>-<lang>.xml, e.g. google-us-es.xml or google-eu-nl.xml.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const match = file.match(/^google-(us|eu)-([a-z]{2})\.xml$/)
  const store = match ? parseStore(match[1], match[2]) : null
  if (!store) return new Response("Not found", { status: 404 })

  const { xml, included, skipped } = buildGoogleFeed(store)
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Language": localeMeta(store).htmlLang,
      "X-Feed-Items": String(included),
      "X-Feed-Skipped": String(skipped.length),
    },
  })
}
