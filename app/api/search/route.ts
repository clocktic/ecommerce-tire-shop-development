import { NextResponse } from "next/server"
import { localizeProduct, offerFor, tireServiceDescription, tireSize } from "@/lib/catalog"
import { readProducts } from "@/lib/catalog/queries"
import { parseStore } from "@/lib/i18n"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") ?? "").trim()
  const market = searchParams.get("market") ?? "eu"
  const lang = searchParams.get("lang") ?? "en"
  const store = parseStore(market, lang) ?? { market: "eu" as const, lang: "en" as const }

  const catalog = await readProducts(store.market)
  if (!catalog.ok) {
    return NextResponse.json({ results: [] })
  }

  const normalizedQuery = q.toLowerCase().replace(/\s+/g, " ")
  // Also normalize compact tire size patterns like "225 45 17" or "225/45r17" -> "225/45 r17"
  const compactSizeMatch = normalizedQuery.match(/^(\d{3})[\s/-]*(\d{2})[\s/r-]*(\d{2})$/i)
  const sizeNeedle = compactSizeMatch
    ? `${compactSizeMatch[1]}/${compactSizeMatch[2]} r${compactSizeMatch[3]}`.toLowerCase()
    : null

  const tokens = normalizedQuery.split(" ").filter(Boolean)

  const scored: { score: number; item: Record<string, unknown> }[] = []

  for (const raw of catalog.data) {
    const p = localizeProduct(raw, store)
    const offer = offerFor(p, store.market)
    if (!offer) continue

    let specCode = ""
    let specMeta = ""
    if (p.category === "tires") {
      specCode = tireSize(p.tire)
      specMeta = `${tireServiceDescription(p.tire)} · ${p.tire.season}`
    } else if (p.category === "wheels") {
      specCode = `${p.wheel.diameter}×${p.wheel.width} ${p.wheel.boltPattern}`
      specMeta = `ET${p.wheel.offset} · ${p.wheel.construction}`
    } else {
      specCode = p.brake.discDiameterMm ? `Ø${p.brake.discDiameterMm} mm` : p.brake.kind
      specMeta = `${p.brake.kind} · ${p.brake.axle}`
    }

    const haystack = [
      p.brand,
      p.name,
      p.category,
      specCode,
      specCode.replace(/\s+/g, ""),
      specMeta,
      p.mpn ?? "",
      p.gtin ?? "",
      p.category === "tires" ? (p.tire.model ?? "") : "",
    ]
      .join(" ")
      .toLowerCase()

    if (!normalizedQuery) {
      scored.push({
        score: 1,
        item: {
          slug: p.slug,
          brand: p.brand,
          name: p.name,
          category: p.category,
          image: p.images[0] || "/placeholder.svg",
          specCode,
          specMeta,
          priceCents: offer.priceCents,
          availability: offer.availability,
          mpn: p.mpn,
          tire: p.category === "tires" ? { width: p.tire.width, aspect: p.tire.aspect, rim: p.tire.rim } : undefined,
          wheel:
            p.category === "wheels"
              ? { diameter: p.wheel.diameter, boltPattern: p.wheel.boltPattern }
              : undefined,
        },
      })
      continue
    }

    let score = 0
    if (sizeNeedle && specCode.toLowerCase() === sizeNeedle) {
      score += 100
    }
    if (p.mpn && p.mpn.toLowerCase() === normalizedQuery) {
      score += 90
    }
    if (p.gtin && p.gtin.toLowerCase() === normalizedQuery) {
      score += 90
    }
    if (p.brand.toLowerCase().startsWith(normalizedQuery)) {
      score += 40
    }
    if (p.name.toLowerCase().includes(normalizedQuery)) {
      score += 35
    }

    const allTokensMatch = tokens.every((tok) => haystack.includes(tok))
    if (allTokensMatch) {
      score += 25
    } else if (sizeNeedle && haystack.includes(sizeNeedle)) {
      score += 50
    }

    if (score > 0) {
      scored.push({
        score,
        item: {
          slug: p.slug,
          brand: p.brand,
          name: p.name,
          category: p.category,
          image: p.images[0] || "/placeholder.svg",
          specCode,
          specMeta,
          priceCents: offer.priceCents,
          availability: offer.availability,
          mpn: p.mpn,
          tire: p.category === "tires" ? { width: p.tire.width, aspect: p.tire.aspect, rim: p.tire.rim } : undefined,
          wheel:
            p.category === "wheels"
              ? { diameter: p.wheel.diameter, boltPattern: p.wheel.boltPattern }
              : undefined,
        },
      })
    }
  }

  scored.sort((a, b) => b.score - a.score)
  return NextResponse.json({ results: scored.slice(0, 16).map((s) => s.item) })
}
