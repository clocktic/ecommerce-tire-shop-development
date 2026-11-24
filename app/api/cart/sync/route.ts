import { NextResponse } from "next/server"
import { localizeProduct, offerFor } from "@/lib/catalog"
import { getProductsBySlugs } from "@/lib/catalog/queries"
import { parseStore } from "@/lib/i18n/config"

const MAX_SLUGS = 24

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      market?: unknown
      lang?: unknown
      slugs?: unknown
    }

    const store = parseStore(String(body.market ?? ""), String(body.lang ?? "en"))
    if (!store) {
      return NextResponse.json({ error: "Invalid store" }, { status: 400 })
    }

    if (!Array.isArray(body.slugs)) {
      return NextResponse.json({ error: "Invalid slugs" }, { status: 400 })
    }

    const slugs = Array.from(
      new Set(
        body.slugs
          .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
          .map((s) => s.trim().slice(0, 200)),
      ),
    ).slice(0, MAX_SLUGS)

    if (slugs.length === 0) {
      return NextResponse.json({ items: {} }, { headers: { "Cache-Control": "no-store" } })
    }

    const found = await getProductsBySlugs(store.market, slugs)
    const items: Record<
      string,
      { name: string; image: string; priceCents: number; available: boolean }
    > = {}

    for (const base of found) {
      const offer = offerFor(base, store.market)
      if (!offer) continue
      const localized = localizeProduct(base, store)
      items[base.slug] = {
        name: localized.name,
        image: localized.images[0] ?? "",
        priceCents: offer.priceCents,
        available: offer.availability !== "out_of_stock",
      }
    }

    return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 })
  }
}
