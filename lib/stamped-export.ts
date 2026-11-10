import "server-only"

import { eq } from "drizzle-orm"
import { offerFor, type Category, type Product } from "@/lib/catalog"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import type { Market } from "@/lib/markets"
import { absoluteUrl, publicImageUrl } from "@/lib/seo"
import { stampedProductId } from "@/lib/stamped"

const TIRE_BRAND_PRIORITY: Record<string, number> = {
  Michelin: 100,
  Continental: 98,
  Bridgestone: 95,
  Pirelli: 94,
  Goodyear: 92,
  Hankook: 89,
  Dunlop: 87,
  Nokian: 86,
  Yokohama: 85,
  BFGoodrich: 84,
  Falken: 82,
  Firestone: 80,
  Kumho: 78,
  Nexen: 76,
}

const POPULAR_TIRE_SIZES = new Set([
  "205/55R16",
  "225/45R17",
  "225/40R18",
  "195/65R15",
  "215/55R17",
  "215/60R16",
  "225/50R17",
  "235/45R18",
  "235/55R19",
  "245/40R18",
  "245/45R18",
  "255/35R19",
  "265/70R17",
  "275/55R20",
  "185/65R15",
  "205/60R16",
  "215/65R16",
  "225/55R17",
  "225/60R17",
  "235/60R18",
  "245/45R19",
  "255/45R20",
  "265/65R17",
  "275/40R20",
])

const FLAGSHIP_TIRE_KEYWORDS = [
  "pilot sport",
  "primacy",
  "crossclimate",
  "alpin",
  "defender",
  "premiumcontact",
  "sportcontact",
  "wintercontact",
  "allseasoncontact",
  "p zero",
  "cinturato",
  "scorpion",
  "potenza",
  "turanza",
  "blizzak",
  "eagle f1",
  "efficientgrip",
  "vector 4seasons",
  "assurance",
  "ventus",
  "kinergy",
  "i*cept",
  "hakkapeliitta",
  "advan",
  "geolandar",
  "all-terrain",
  "ko2",
  "wildpeak",
  "azenis",
  "destination",
]

const WHEEL_BRAND_PRIORITY: Record<string, number> = {
  BBS: 100,
  "OZ Racing": 98,
  Enkei: 96,
  Rotiform: 94,
  Konig: 92,
  Sparco: 90,
  "TSW Alloy": 88,
  "MSW (by OZ)": 87,
  Forgestar: 85,
  Motegi: 84,
  Niche: 82,
  "Black Rhino": 81,
  Fondmetal: 79,
  Beyern: 78,
  XXR: 76,
}

const BRAKE_BRAND_PRIORITY: Record<string, number> = {
  Brembo: 100,
  Bosch: 96,
  EBC: 94,
  Ferodo: 92,
  PowerStop: 90,
  Wilwood: 88,
  "Baer Brakes": 85,
  "TBM Brakes": 82,
}

function csvCell(value: string | number | undefined | null): string {
  const str = value == null ? "" : String(value).replace(/\r?\n/g, " ").trim()
  if (/[",]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function scoreProductPopularity(p: Product): number {
  let score = 0

  const hasUs = Boolean(offerFor(p, "us"))
  const hasEu = Boolean(offerFor(p, "eu"))
  if (hasUs && hasEu) score += 200
  else if (hasUs || hasEu) score += 80

  if (p.gtin) score += 25
  if (p.mpn) score += 15
  if (p.images?.length) score += 20
  if ((p.stock ?? 0) > 0) score += 20

  if (p.category === "tires") {
    score += TIRE_BRAND_PRIORITY[p.brand] ?? 65
    const sizeCode = `${p.tire.width}/${p.tire.aspect}R${p.tire.rim}`
    if (POPULAR_TIRE_SIZES.has(sizeCode)) score += 60
    if (p.tire.rim >= 16 && p.tire.rim <= 19) score += 25
    const lowerName = p.name.toLowerCase()
    if (FLAGSHIP_TIRE_KEYWORDS.some((kw) => lowerName.includes(kw))) {
      score += 45
    }
  } else if (p.category === "wheels") {
    score += WHEEL_BRAND_PRIORITY[p.brand] ?? 70
    if (p.wheel.diameter >= 17 && p.wheel.diameter <= 20) score += 45
    const bp = p.wheel.boltPattern.replace(/\s+/g, "").toLowerCase()
    if (["5x112", "5x114.3", "5x120", "5x100", "5x108", "5x127", "6x139.7"].includes(bp)) {
      score += 35
    }
  } else if (p.category === "brakes") {
    score += BRAKE_BRAND_PRIORITY[p.brand] ?? 75
    if (
      p.brake.kind === "pads" ||
      p.brake.kind === "discs" ||
      p.brake.kind === "pads-and-discs"
    ) {
      score += 35
    } else {
      score += 25
    }
    if (p.brake.axle === "front") score += 15
  }

  return score
}

function modelFamilyKey(p: Product): string {
  const cleaned = p.name
    .replace(/\b\d{3}\/\d{2}\s*R?\d{2}\b/gi, "")
    .replace(/\b\d{1,2}(\.\d)?x\d{1,2}(\.\d)?\b/gi, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(" ")
    .toLowerCase()
  return `${p.brand.toLowerCase()}::${cleaned || p.slug}`
}

/**
 * Selects the top `limit` products for a given category using market popularity scoring
 * plus round-robin brand & model-line interleaving so the exported list contains diverse,
 * recognizable bestsellers rather than 150 sizes of a single model.
 */
export function selectTopPopularByCategory(
  allProducts: Product[],
  category: Category,
  limit = 150,
): Product[] {
  const candidates = allProducts
    .filter((p) => p && !p.sample && p.category === category)
    .map((product) => ({
      product,
      score: scoreProductPopularity(product),
      family: modelFamilyKey(product),
    }))
    .sort((a, b) => b.score - a.score || a.product.slug.localeCompare(b.product.slug))

  const byBrand = new Map<string, typeof candidates>()
  for (const item of candidates) {
    const brand = item.product.brand || "Other"
    const list = byBrand.get(brand) ?? []
    list.push(item)
    byBrand.set(brand, list)
  }

  // Sort each brand's candidates so first pass prefers distinct model families
  for (const [brand, list] of byBrand.entries()) {
    const seenFamilies = new Map<string, number>()
    const reordered = list
      .map((item) => {
        const count = seenFamilies.get(item.family) ?? 0
        seenFamilies.set(item.family, count + 1)
        return { ...item, familyRepeat: count }
      })
      .sort(
        (a, b) =>
          a.familyRepeat - b.familyRepeat ||
          b.score - a.score ||
          a.product.slug.localeCompare(b.product.slug),
      )
    byBrand.set(brand, reordered)
  }

  const brandOrder = Array.from(byBrand.keys()).sort((a, b) => {
    const topA = byBrand.get(a)?.[0]?.score ?? 0
    const topB = byBrand.get(b)?.[0]?.score ?? 0
    return topB - topA || a.localeCompare(b)
  })

  const selected: Product[] = []
  const cursors = new Map<string, number>(brandOrder.map((b) => [b, 0]))

  while (selected.length < limit) {
    let addedInRound = false
    for (const brand of brandOrder) {
      if (selected.length >= limit) break
      const list = byBrand.get(brand)!
      const idx = cursors.get(brand) ?? 0
      if (idx < list.length) {
        selected.push(list[idx].product)
        cursors.set(brand, idx + 1)
        addedInRound = true
      }
    }
    if (!addedInRound) break
  }

  return selected
}

export function buildStampedProductsCsv(
  productList: Product[],
  explicitMarket: Market | null = null,
): string {
  const header = [
    "productId",
    "productSKU",
    "productHandle",
    "productTitle",
    "productBrand",
    "productType",
    "productBarcode",
    "productPrice",
    "productUrl",
    "productImageUrl",
    "productDescription",
  ].join(",")

  const lines: string[] = [header]

  for (const p of productList) {
    if (!p || p.sample) continue
    if (explicitMarket && !offerFor(p, explicitMarket)) continue

    const preferredMarket = explicitMarket ?? "us"
    const offer = offerFor(p, preferredMarket) ?? offerFor(p, "us") ?? offerFor(p, "eu")
    const market =
      offer === offerFor(p, "eu") && !offerFor(p, preferredMarket) ? "eu" : preferredMarket
    const price = offer ? (offer.priceCents / 100).toFixed(2) : "0.00"
    const imageUrl = p.images?.[0] ? publicImageUrl(p.images[0]) : ""
    const productUrl = absoluteUrl(`/${market}/en/product/${p.slug}`)
    const barcode = p.gtin || p.mpn || p.supplierSku || ""
    const title = p.name.toLowerCase().startsWith(p.brand.toLowerCase())
      ? p.name
      : `${p.brand} ${p.name}`

    lines.push(
      [
        csvCell(stampedProductId(p.slug)),
        csvCell(p.slug),
        csvCell(p.slug),
        csvCell(title),
        csvCell(p.brand),
        csvCell(p.category),
        csvCell(barcode),
        csvCell(price),
        csvCell(productUrl),
        csvCell(imageUrl),
        csvCell(p.shortDescription || p.description),
      ].join(","),
    )
  }

  return lines.join("\n")
}

export async function loadActiveCatalogProducts(): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.archived, false))
  return rows.map((r) => r.data).filter((p): p is Product => Boolean(p && !p.sample))
}
