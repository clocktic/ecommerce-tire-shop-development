import { buildGoogleFeed } from "@/lib/feeds/google"
import { isMarket } from "@/lib/markets"

export const revalidate = 3600

// Serves /feeds/google-us.xml and /feeds/google-eu.xml.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const market = file.match(/^google-(us|eu)\.xml$/)?.[1]
  if (!isMarket(market)) return new Response("Not found", { status: 404 })

  const { xml, included, skipped } = buildGoogleFeed(market)
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "X-Feed-Items": String(included),
      "X-Feed-Skipped": String(skipped.length),
    },
  })
}
