import { getProducts, localizeProduct, offerFor, tireServiceDescription, tireSize, type Product } from "@/lib/catalog"
import { COMPANY } from "@/lib/company"
import { getDictionary, storePath, type Dictionary, type Store } from "@/lib/i18n"
import { MARKETS, type Market } from "@/lib/markets"
import { POLICIES } from "@/lib/policies"
import { absoluteUrl } from "@/lib/seo"

// One feed per store language: /feeds/google-<market>-<lang>.xml, e.g.
// google-us-en.xml, google-us-es.xml, google-eu-de.xml. Register each as its own
// GMC data source with that content language, feed label US or EU and matching
// target countries (EU suggestion: de → DE, AT, LU, BE; fr → FR, BE, LU; nl → NL, BE;
// it → IT; es → ES; en → IE, MT and the remaining member states). Titles,
// descriptions and links follow the store language. Shipping and handling times
// come from lib/policies.ts — the same numbers as the Shipping page and JSON-LD.

const GOOGLE_CATEGORY: Record<Product["category"], string> = {
  tires: "6093", // Motor Vehicle Tires > Automotive Tires
  wheels: "6090", // Motor Vehicle Rims & Wheels > Automotive Rims & Wheels
  brakes: "2977", // Motor Vehicle Parts > Motor Vehicle Braking
}

const DESCRIPTION_LIMIT = 5000
const GTIN = /^\d{8}$|^\d{12,14}$/

function xml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function money(cents: number, market: Market) {
  return `${(cents / 100).toFixed(2)} ${MARKETS[market].currency}`
}

function feedId(product: Product): string {
  return product.id.slice(0, 50)
}

function description(product: Product): string {
  const sentence = (value: string) => (/[.!?]$/.test(value.trim()) ? value.trim() : `${value.trim()}.`)
  const specs = product.specs.map((s) => sentence(`${s.label}: ${s.value}`)).join(" ")
  const text = [product.description, ...product.highlights, specs].filter(Boolean).map(sentence).join(" ")
  const compact = text.replace(/\s+/g, " ").trim()
  return compact.length <= DESCRIPTION_LIMIT ? compact : compact.slice(0, DESCRIPTION_LIMIT).replace(/\s+\S*$/, "")
}

function categoryDetails(product: Product, market: Market, d: Dictionary): [string, string][] {
  const approval = d.product.spec.approval
  if (product.category === "tires") {
    const t = product.tire
    const rows: [string, string][] = [
      ["Size / LI / SI", `${tireSize(t)} ${tireServiceDescription(t)}`],
      [d.product.spec.season, d.labels.season[t.season]],
    ]
    const label = d.product.euLabel
    if (label && t.euLabel) {
      rows.push([label.fuel, t.euLabel.fuelEfficiency], [label.wet, t.euLabel.wetGrip], [label.noise, `${t.euLabel.noiseDb} dB (${t.euLabel.noiseClass})`])
    }
    if (d.product.utqg && t.utqg) rows.push(["UTQG", `${t.utqg.treadwear} ${t.utqg.traction} ${t.utqg.temperature}`])
    return rows
  }
  if (product.category === "wheels") {
    const w = product.wheel
    return [
      [d.catalog.diameter, `${w.diameter} x ${w.width} in`],
      [d.catalog.bolt, w.boltPattern],
      ["ET", `ET${w.offset}`],
      ["CB", `${w.centerBore} mm`],
      ...(w.approvals[market] ? ([[approval, w.approvals[market]!]] as [string, string][]) : []),
    ]
  }
  const b = product.brake
  return [
    [d.catalog.axle, d.labels.axleShort[b.axle]],
    ...(b.discDiameterMm ? ([[d.catalog.diameter, `${b.discDiameterMm} mm`]] as [string, string][]) : []),
    ...(b.approvals[market] ? ([[approval, b.approvals[market]!]] as [string, string][]) : []),
  ]
}

export type FeedSkip = { slug: string; reason: string }

// Why a product is not in the feed. Kept explicit so the catalog import can report it.
export function feedExclusion(product: Product, market: Market): string | null {
  const offer = offerFor(product, market)
  if (product.sample) return "sample record"
  if (!offer) return "not sold in this market"
  if (offer.priceCents <= 0) return "no price"
  if (product.images.length === 0) return "no image"
  if (!product.brand) return "no brand"
  if (offer.availability === "preorder" && !offer.availableFrom) return "preorder without availability date"
  if (product.name.length > 150) return "title over 150 characters"
  if (product.gtin && !GTIN.test(product.gtin)) return "invalid GTIN"
  if (market === "eu" && product.category === "tires" && !product.tire.euLabel) return "EU tyre label missing"
  return null
}

function item(product: Product, store: Store, d: Dictionary): string {
  const { market } = store
  const offer = offerFor(product, market)!
  const { shipping } = POLICIES[market]
  const link = absoluteUrl(storePath(store, `/product/${product.slug}`))
  const [hero, ...rest] = product.images.map((src) => absoluteUrl(src))
  const onSale = offer.compareAtCents && offer.compareAtCents > offer.priceCents
  const lines: string[] = []
  const tag = (name: string, value: string | number) => lines.push(`      <g:${name}>${xml(String(value))}</g:${name}>`)

  tag("id", feedId(product))
  lines.push(`      <title>${xml(product.name)}</title>`)
  lines.push(`      <description>${xml(description(product))}</description>`)
  lines.push(`      <link>${xml(link)}</link>`)
  tag("image_link", hero)
  rest.slice(0, 10).forEach((src) => tag("additional_image_link", src))
  tag("availability", offer.availability === "in_stock" ? "in_stock" : offer.availability === "preorder" ? "preorder" : "out_of_stock")
  if (offer.availability === "preorder" && offer.availableFrom) tag("availability_date", offer.availableFrom)
  if (onSale) {
    tag("price", money(offer.compareAtCents!, market))
    tag("sale_price", money(offer.priceCents, market))
    if (offer.saleEndsAt) tag("sale_price_effective_date", `${new Date().toISOString().slice(0, 10)}T00:00:00Z/${offer.saleEndsAt}`)
  } else {
    tag("price", money(offer.priceCents, market))
  }
  tag("condition", "new")
  tag("brand", product.brand)
  if (product.gtin) tag("gtin", product.gtin)
  if (product.mpn) tag("mpn", product.mpn)
  if (!product.gtin && !product.mpn) tag("identifier_exists", "no")
  tag("google_product_category", GOOGLE_CATEGORY[product.category])
  tag("product_type", d.categories[product.category].name)

  for (const [name, value] of [...product.specs.map((s) => [s.label, s.value] as [string, string]), ...categoryDetails(product, market, d)]) {
    lines.push(
      `      <g:product_detail><g:section_name>${xml(d.product.descSpecs)}</g:section_name><g:attribute_name>${xml(name)}</g:attribute_name><g:attribute_value>${xml(value)}</g:attribute_value></g:product_detail>`,
    )
  }

  if (market === "eu" && product.category === "tires" && product.tire.euLabel?.eprelId) {
    lines.push(
      `      <g:certification><g:certification_authority>EC</g:certification_authority><g:certification_name>EPREL</g:certification_name><g:certification_code>${xml(product.tire.euLabel.eprelId)}</g:certification_code></g:certification>`,
    )
  }

  tag("min_handling_time", shipping.handlingDays[0])
  tag("max_handling_time", shipping.handlingDays[1])
  for (const country of MARKETS[market].shipsTo) {
    lines.push(
      `      <g:shipping><g:country>${country.code}</g:country><g:price>${money(shipping.rateCents, market)}</g:price><g:min_transit_time>${shipping.transitDays[0]}</g:min_transit_time><g:max_transit_time>${shipping.transitDays[1]}</g:max_transit_time></g:shipping>`,
    )
  }

  return `    <item>\n${lines.join("\n")}\n    </item>`
}

export function buildGoogleFeed(store: Store): { xml: string; included: number; skipped: FeedSkip[] } {
  const { market } = store
  const d = getDictionary(store)
  const skipped: FeedSkip[] = []
  const items: string[] = []
  for (const base of getProducts(market)) {
    const product = localizeProduct(base, store)
    const reason = feedExclusion(product, market)
    if (reason) skipped.push({ slug: product.slug, reason })
    else items.push(item(product, store, d))
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${xml(`${COMPANY.tradingName} ${MARKETS[market].short} ${store.lang.toUpperCase()}`)}</title>
    <link>${xml(absoluteUrl(storePath(store)))}</link>
    <description>${xml(d.meta.description)}</description>
${items.join("\n")}
  </channel>
</rss>
`
  return { xml: body, included: items.length, skipped }
}
