import "server-only"

import { and, inArray, eq, sql } from "drizzle-orm"
import { localizeProduct, offerFor, tireCodeNotations, type Product } from "@/lib/catalog"
import { getProducts } from "@/lib/catalog/queries"
import { COMPANY } from "@/lib/company"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { feedExclusion, FeedValidationError, type FeedSkip } from "@/lib/feeds/google"
import { enrichedDescription, escapeFeedXml, feedText } from "@/lib/feeds/us-feed-format"
import { selectUsTop500, US_TOP500_PINNED, type DemandSignals, type ScoredProduct } from "@/lib/feeds/us-top500-selection"
import { storePath, type Store } from "@/lib/i18n/config"
import { POLICIES } from "@/lib/policies"
import { absoluteUrl, publicImageUrl } from "@/lib/seo"
import { getRatingsBySlug } from "@/lib/stamped-reviews"

type Node = { name: string; value: string } | { name: string; children: Node[] }
type Tire = Extract<Product, { category: "tires" }>
type Wheel = Extract<Product, { category: "wheels" }>
type Brake = Extract<Product, { category: "brakes" }>
type Segment = "commercial" | "winter" | "all-terrain" | "all-weather" | "performance" | "all-season"

const GOOGLE_CATEGORY = { tires: "6093", wheels: "6090", brakes: "2977", commercialTires: "911" } as const

const COPY = {
  en: {
    tire: "Tire",
    wheel: "Wheel",
    segment: {
      commercial: "Commercial Truck Tire", winter: "Winter Tire", "all-terrain": "All-Terrain Tire",
      "all-weather": "All-Weather Tire", performance: "Summer Performance Tire", "all-season": "All-Season Tire",
    } satisfies Record<Segment, string>,
    segmentPlural: {
      commercial: "Commercial Truck Tires", winter: "Winter Tires", "all-terrain": "All-Terrain Tires",
      "all-weather": "All-Weather Tires", performance: "Summer Performance Tires", "all-season": "All-Season Tires",
    } satisfies Record<Segment, string>,
    tires: "Tires", wheels: "Wheels", brakes: "Brakes", inchWheels: (d: number) => `${d} Inch Wheels`,
    brakeKind: {
      kit: "Big Brake Kits", "pads-and-discs": "Brake Pad & Rotor Kits", discs: "Brake Rotors", pads: "Brake Pads",
      caliper: "Brake Calipers", drum: "Brake Drums", shoes: "Brake Shoes", hose: "Brake Lines", sensor: "Brake Wear Sensors",
    } as Record<Brake["brake"]["kind"], string>,
    specs: "Specifications", fitment: "Fitment", sizing: "Sizing",
  },
  es: {
    tire: "Llanta",
    wheel: "Rin",
    segment: {
      commercial: "Llanta Comercial para Camión", winter: "Llanta de Invierno", "all-terrain": "Llanta Todo Terreno",
      "all-weather": "Llanta Todo Clima", performance: "Llanta de Alto Desempeño de Verano", "all-season": "Llanta para Todas las Estaciones",
    } satisfies Record<Segment, string>,
    segmentPlural: {
      commercial: "Llantas Comerciales", winter: "Llantas de Invierno", "all-terrain": "Llantas Todo Terreno",
      "all-weather": "Llantas Todo Clima", performance: "Llantas de Alto Desempeño", "all-season": "Llantas para Todas las Estaciones",
    } satisfies Record<Segment, string>,
    tires: "Llantas", wheels: "Rines", brakes: "Frenos", inchWheels: (d: number) => `Rines de ${d} Pulgadas`,
    brakeKind: {
      kit: "Kits de Frenos de Alto Rendimiento", "pads-and-discs": "Kits de Balatas y Discos", discs: "Discos de Freno",
      pads: "Balatas", caliper: "Calipers de Freno", drum: "Tambores de Freno", shoes: "Zapatas de Freno",
      hose: "Mangueras de Freno", sensor: "Sensores de Desgaste",
    } as Record<Brake["brake"]["kind"], string>,
    specs: "Especificaciones", fitment: "Compatibilidad", sizing: "Medidas",
  },
}

type Copy = (typeof COPY)["en"]

const ALL_TERRAIN = /\b(a\/t|at\d|at\b|trail terrain|duratrac|outpost|road venture|all terrain|m\/t)/i

function tireSegment(t: Tire): Segment {
  if (!Number.isInteger(t.tire.rim)) return "commercial"
  if (t.tire.season === "winter") return "winter"
  const model = t.tire.model ?? t.name
  if (ALL_TERRAIN.test(model)) return "all-terrain"
  if (t.tire.season === "summer") return "performance"
  const text = [...t.highlights, ...t.specs.map((s) => s.value), t.description].join(" ")
  return /3PMSF|three-peak|3-peak/i.test(text) ? "all-weather" : "all-season"
}

// Truck tires carry a dual (single/twin-mount) service description such as "160K (158L)".
function serviceDescription(t: Tire): string {
  const dual = t.name.match(/\((\d{3}[A-Z])\)/)?.[1]
  const base = `${t.tire.loadIndex}${t.tire.speedRating}`
  if (!Number.isInteger(t.tire.rim)) return dual ? `${base}/${dual}` : base
  return `${base}${t.tire.extraLoad ? " XL" : ""}${t.tire.runFlat ? " RFT" : ""}`
}

function sizeCode(t: Tire) {
  return `${t.tire.width}/${t.tire.aspect}R${t.tire.rim}`
}

function wheelStyle(w: Wheel) {
  return w.name.replace(/\s+\d{1,2}(?:\.\d)?x\d{1,2}(?:\.\d)?\b.*$/i, "").trim() || w.name
}

function brandPrefixed(brand: string, text: string) {
  return text.toLowerCase().startsWith(brand.toLowerCase()) ? text : `${brand} ${text}`
}

function title(p: Product, copy: Copy, lang: "en" | "es"): string {
  if (p.category === "tires") {
    const model = p.tire.model || p.name.replace(/\s+\d{3}\/.*$/, "")
    const core = `${p.brand} ${model} ${sizeCode(p)} ${serviceDescription(p)}`
    const segment = copy.segment[tireSegment(p)]
    return feedText(lang === "es" ? `${copy.tire} ${core} ${segment.replace(/^Llanta\s*/, "")}` : `${core} ${segment}`).slice(0, 150)
  }
  if (p.category === "wheels") {
    const w = p.wheel
    const size = `${w.diameter}x${w.width} ${w.boltPattern} ET${w.offset}`
    const core = `${p.brand} ${wheelStyle(p)} ${size} ${w.finish}`
    return feedText(lang === "es" ? `${copy.wheel} ${core} ${w.construction}` : `${core} ${w.construction} ${copy.wheel}`).slice(0, 150)
  }
  return feedText(brandPrefixed(p.brand, p.name)).slice(0, 150)
}

function productType(p: Product, copy: Copy): string {
  if (p.category === "tires") {
    return [copy.tires, copy.segmentPlural[tireSegment(p)], p.brand, p.tire.model].filter(Boolean).join(" > ")
  }
  if (p.category === "wheels") return [copy.wheels, copy.inchWheels(p.wheel.diameter), p.brand, wheelStyle(p)].join(" > ")
  return [copy.brakes, copy.brakeKind[p.brake.kind], p.brand].join(" > ")
}

function inches(mm: number) {
  return Math.round((mm / 25.4) * 10) / 10
}

function tireGeometry(t: Tire) {
  const sidewallMm = (t.tire.width * t.tire.aspect) / 100
  const diameterIn = t.tire.rim + (2 * sidewallMm) / 25.4
  return {
    diameter: `${diameterIn.toFixed(1)} in (${Math.round(diameterIn * 25.4)} mm)`,
    sidewall: `${inches(sidewallMm)} in (${Math.round(sidewallMm)} mm)`,
    width: `${inches(t.tire.width)} in (${t.tire.width} mm)`,
    revsPerMile: String(Math.round(63360 / (Math.PI * diameterIn))),
  }
}

function details(p: Product, copy: Copy): Node[] {
  const rows: [string, string, string][] = p.specs.map((s) => [copy.specs, s.label, s.value])
  if (p.category === "tires") {
    const g = tireGeometry(p)
    const codes = tireCodeNotations(p.tire)
    const isCommercial = !Number.isInteger(p.tire.rim)
    rows.push(
      [
        copy.sizing,
        "Size",
        isCommercial
          ? `${codes.compact} ${serviceDescription(p)} (${codes.spaced})`
          : `${codes.compact} ${serviceDescription(p)} (${codes.spaced}, ${codes.pMetric}, ${codes.zrCompact})`,
      ],
      [
        copy.sizing,
        "Tyre Code",
        `${codes.compact} ${serviceDescription(p)} (${codes.compact} ${codes.svcSpaced}, ${codes.slashR}, ${codes.filtered})`,
      ],
      [copy.sizing, "Tire Code", `${codes.compact} ${serviceDescription(p)}`],
      [copy.sizing, "Tire Size", `${sizeCode(p)} ${serviceDescription(p)}`],
      [copy.sizing, "Rim Size", `${p.tire.rim} in (${p.tire.rim}" R${p.tire.rim})`],
      [copy.sizing, "Overall Diameter", g.diameter],
      [copy.sizing, "Section Width", g.width],
      [copy.sizing, "Sidewall Height", g.sidewall],
      [copy.sizing, "Revolutions per Mile (approx.)", g.revsPerMile],
      [copy.specs, "Load Index", String(p.tire.loadIndex)],
      [copy.specs, "Speed Rating", p.tire.speedRating],
      ...(isCommercial ? [] : ([[copy.specs, "Load Range", codes.loadRange]] as [string, string, string][])),
      [copy.specs, "Run Flat", p.tire.runFlat ? "Yes" : "No"],
    )
    if (p.tire.utqg) rows.push([copy.specs, "UTQG", `${p.tire.utqg.treadwear} ${p.tire.utqg.traction} ${p.tire.utqg.temperature}`])
  } else if (p.category === "wheels") {
    const w = p.wheel
    rows.push(
      [copy.sizing, "Wheel Size", `${w.diameter} x ${w.width} in`],
      [copy.fitment, "Bolt Pattern", w.boltPattern],
      [copy.fitment, "Offset", `ET${w.offset} (${w.offset} mm)`],
      [copy.fitment, "Center Bore", `${w.centerBore} mm`],
      [copy.specs, "Construction", w.construction],
      [copy.specs, "Finish", w.finish],
    )
    if (w.loadRatingKg) rows.push([copy.specs, "Load Rating", `${Math.round(w.loadRatingKg * 2.20462).toLocaleString("en-US")} lb (${w.loadRatingKg} kg)`])
    if (w.approvals.us) rows.push([copy.specs, "Certification", w.approvals.us])
  } else {
    const b = p.brake
    rows.push([copy.specs, "Axle", b.axle === "front" ? "Front" : "Rear"])
    if (b.discDiameterMm) rows.push([copy.sizing, "Rotor Diameter", `${inches(b.discDiameterMm)} in (${b.discDiameterMm} mm)`])
    if (b.pistons) rows.push([copy.specs, "Caliper Pistons", `${b.pistons}-Piston`])
    if (b.fitment.length) rows.push([copy.fitment, "Compatible Vehicles", b.fitment.slice(0, 12).join(", ")])
    if (b.approvals.us) rows.push([copy.specs, "Certification", b.approvals.us])
  }
  if (p.mpn) rows.push([copy.specs, "Manufacturer Part Number", p.mpn])

  const seen = new Set<string>()
  return rows
    .map(([section, name, value]) => [section, feedText(name).slice(0, 140), feedText(value).slice(0, 1000)] as const)
    .filter(([, name, value]) => {
      const key = name.toLowerCase()
      if (!name || !value || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 40)
    .map(([section, name, value]) => ({
      name: "product_detail",
      children: [
        { name: "section_name", value: section },
        { name: "attribute_name", value: name },
        { name: "attribute_value", value },
      ],
    }))
}

function highlights(p: Product): string[] {
  const generated: string[] = []
  if (p.category === "tires") {
    const codes = tireCodeNotations(p.tire)
    const isCommercial = !Number.isInteger(p.tire.rim)
    generated.push(
      isCommercial
        ? `Size / Tyre Code: ${sizeCode(p)} ${serviceDescription(p)} (${codes.spaced}, ${codes.slashR}, ${codes.filtered})`
        : `Size / Tyre Code: ${sizeCode(p)} ${serviceDescription(p)} (${codes.spaced}, ${codes.pMetric}, ${codes.zrCompact})`,
    )
    generated.push(
      isCommercial
        ? `${sizeCode(p)} · Load Index ${p.tire.loadIndex} · Speed Rating ${p.tire.speedRating}`
        : `${sizeCode(p)} · Load Index ${p.tire.loadIndex} · Speed Rating ${p.tire.speedRating} · Load Range ${codes.loadRange}`,
    )
    if (p.tire.utqg) generated.push(`UTQG ${p.tire.utqg.treadwear} ${p.tire.utqg.traction} ${p.tire.utqg.temperature}`)
  } else if (p.category === "wheels") {
    generated.push(`${p.wheel.diameter}x${p.wheel.width} · ${p.wheel.boltPattern} · ET${p.wheel.offset} · ${p.wheel.centerBore} mm bore`)
  } else if (p.brake.fitment.length) {
    generated.push(`Fits ${p.brake.fitment.slice(0, 3).join(", ")}`)
  }
  const seen = new Set<string>()
  return [...p.highlights, ...generated]
    .map((h) => feedText(h).slice(0, 150))
    .filter((h) => h && !seen.has(h.toLowerCase()) && seen.add(h.toLowerCase()))
    .slice(0, 10)
}

function description(p: Product): string {
  if (p.category === "tires" && !Number.isInteger(p.tire.rim)) {
    return feedText(`${p.description} Size: ${sizeCode(p)} ${serviceDescription(p)}. Load Index: ${p.tire.loadIndex}. Speed Rating: ${p.tire.speedRating}.${p.mpn ? ` MPN: ${p.mpn}.` : ""}${p.gtin ? ` GTIN: ${p.gtin}.` : ""}`).slice(0, 5000)
  }
  return enrichedDescription(p) || feedText(p.description).slice(0, 5000)
}

function priceBand(cents: number) {
  if (cents < 10000) return "under-100"
  if (cents < 20000) return "100-199"
  if (cents < 35000) return "200-349"
  if (cents < 75000) return "350-749"
  return "750-plus"
}

function itemGroupId(p: Product) {
  const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  if (p.category === "tires") return `tire-${slug(p.brand)}-${slug(p.tire.model || p.name.replace(/\s+\d{3}\/.*$/, ""))}`.slice(0, 50)
  if (p.category === "wheels") return `wheel-${slug(p.brand)}-${slug(wheelStyle(p))}`.slice(0, 50)
  return null
}

function money(cents: number) {
  return `${(cents / 100).toFixed(2)} USD`
}

export type Top500Item = {
  product: Product
  entry: ScoredProduct
  title: string
  link: string
  image: string
  price: string
  nodes: Node[]
  flat: Record<string, string>
}

function buildItem(entry: ScoredProduct, store: Store): Top500Item {
  const lang = store.lang === "es" ? "es" : "en"
  const copy = COPY[lang]
  const p = entry.product
  const offer = offerFor(p, "us")!
  const { shipping } = POLICIES.us
  const link = absoluteUrl(storePath(store, `/product/${p.slug}`))
  const images = p.images.filter((src) => src && !/\.(avif|gif)(?:[?#]|$)/i.test(src)).map(publicImageUrl)
  const onSale = Boolean(offer.compareAtCents && offer.compareAtCents > offer.priceCents)
  const itemTitle = title(p, copy, lang)
  const segment =
    p.category === "tires" ? tireSegment(p)
    : p.category === "wheels" ? (/^(6|8)x/.test(p.wheel.boltPattern) ? "truck-suv" : "car")
    : p.brake.kind
  const shippingService = `Free Ground Shipping (${shipping.carriers.join(" / ")})`
  const tireOrWheelSize =
    p.category === "tires" ? `${sizeCode(p)} ${serviceDescription(p)}`
    : p.category === "wheels" ? `${p.wheel.diameter}x${p.wheel.width} ${p.wheel.boltPattern} ET${p.wheel.offset}` : ""

  const flat: Record<string, string> = {
    id: p.id.slice(0, 50),
    item_group_id: itemGroupId(p) ?? "",
    title: itemTitle,
    description: description(p),
    link,
    canonical_link: link,
    image_link: images[0],
    additional_image_link: images.slice(1, 11).join(","),
    availability: offer.availability,
    availability_date: offer.availability === "preorder" ? offer.availableFrom ?? "" : "",
    price: money(onSale ? offer.compareAtCents! : offer.priceCents),
    sale_price: onSale ? money(offer.priceCents) : "",
    sale_price_effective_date: onSale && offer.saleEndsAt ? `${new Date().toISOString().slice(0, 10)}T00:00:00Z/${offer.saleEndsAt}` : "",
    condition: "new",
    brand: p.brand,
    gtin: p.gtin ?? "",
    mpn: p.mpn ?? "",
    google_product_category:
      p.category === "tires" && segment === "commercial" ? GOOGLE_CATEGORY.commercialTires : GOOGLE_CATEGORY[p.category],
    product_type: productType(p, copy),
    size: tireOrWheelSize,
    color: p.category === "wheels" ? p.wheel.finish : "",
    material: p.category === "wheels" ? `${p.wheel.construction} Aluminum Alloy` : "",
    is_bundle: p.category === "brakes" && (p.brake.kind === "kit" || p.brake.kind === "pads-and-discs") ? "yes" : "",
    ships_from_country: "US",
    min_handling_time: String(shipping.handlingDays[0]),
    max_handling_time: String(shipping.handlingDays[1]),
    custom_label_0: p.category,
    custom_label_1: segment,
    custom_label_2: priceBand(offer.priceCents),
    custom_label_3: entry.tier,
    custom_label_4:
      p.category === "tires" ? `rim-${p.tire.rim}` : p.category === "wheels" ? `rim-${p.wheel.diameter}` : `axle-${p.brake.axle}`,
  }

  const nodes: Node[] = []
  const push = (name: string, value: string) => value && nodes.push({ name, value: feedText(value) })
  for (const key of ["id", "item_group_id", "title", "description", "link", "canonical_link", "image_link"]) push(key, flat[key])
  images.slice(1, 11).forEach((src) => push("additional_image_link", src))
  for (const key of [
    "availability", "availability_date", "price", "sale_price", "sale_price_effective_date", "condition", "brand",
    "gtin", "mpn", "google_product_category", "product_type", "size", "color", "material", "is_bundle",
  ]) push(key, flat[key])
  highlights(p).forEach((h) => push("product_highlight", h))
  nodes.push(...details(p, copy))
  push("ships_from_country", flat.ships_from_country)
  nodes.push({
    name: "shipping",
    children: [
      { name: "country", value: "US" },
      { name: "service", value: shippingService },
      { name: "price", value: money(shipping.rateCents) },
      { name: "min_handling_time", value: String(shipping.handlingDays[0]) },
      { name: "max_handling_time", value: String(shipping.handlingDays[1]) },
      { name: "min_transit_time", value: String(shipping.transitDays[0]) },
      { name: "max_transit_time", value: String(shipping.transitDays[1]) },
    ],
  })
  push("min_handling_time", flat.min_handling_time)
  push("max_handling_time", flat.max_handling_time)
  for (const key of ["custom_label_0", "custom_label_1", "custom_label_2", "custom_label_3", "custom_label_4"]) push(key, flat[key])

  flat["shipping(country:service:price:min_handling_time:max_handling_time:min_transit_time:max_transit_time)"] = [
    "US", shippingService.replaceAll(":", " "), money(shipping.rateCents), ...shipping.handlingDays, ...shipping.transitDays,
  ].join(":")
  flat.product_highlight = highlights(p).join(",").replaceAll("\t", " ")

  return {
    product: p,
    entry,
    title: itemTitle,
    link,
    image: images[0],
    price: onSale ? money(offer.priceCents) : flat.price,
    nodes,
    flat,
  }
}

function renderNode(node: Node, indent: string): string {
  if ("value" in node) return `${indent}<g:${node.name}>${escapeFeedXml(node.value)}</g:${node.name}>`
  return `${indent}<g:${node.name}>\n${node.children.map((c) => renderNode(c, `${indent}  `)).join("\n")}\n${indent}</g:${node.name}>`
}

const TEXT_COLUMNS = [
  "id", "item_group_id", "title", "description", "link", "canonical_link", "image_link", "additional_image_link",
  "availability", "availability_date", "price", "sale_price", "sale_price_effective_date", "condition", "brand", "gtin",
  "mpn", "google_product_category", "product_type", "size", "color", "material", "is_bundle", "product_highlight",
  "ships_from_country", "shipping(country:service:price:min_handling_time:max_handling_time:min_transit_time:max_transit_time)",
  "min_handling_time", "max_handling_time", "custom_label_0", "custom_label_1", "custom_label_2", "custom_label_3", "custom_label_4",
] as const

async function demandSignals(): Promise<DemandSignals> {
  const [ordered, ratings] = await Promise.all([
    db
      .select({ slug: orderItems.productSlug, qty: sql<number>`sum(${orderItems.quantity})::int` })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(eq(orders.market, "us"), inArray(orders.status, ["paid", "shipped", "delivered", "completed"])))
      .groupBy(orderItems.productSlug)
      .catch(() => [] as { slug: string; qty: number }[]),
    getRatingsBySlug().catch(() => new Map<string, { count: number }>()),
  ])
  return {
    orderedQty: new Map(ordered.map((row) => [row.slug, Number(row.qty) || 0])),
    reviewCount: new Map([...ratings].map(([slug, summary]) => [slug, summary.count])),
  }
}

export type Top500Feed = {
  xml: string
  text: string
  items: Top500Item[]
  skipped: FeedSkip[]
  generatedAt: string
  total: number
}

export async function buildUsTop500Feed(store: Store, requestedTotal = 500): Promise<Top500Feed> {
  if (store.market !== "us") throw new Error("The US Top feed is US only")
  const [catalog, signals] = await Promise.all([getProducts("us"), demandSignals()])
  const skipped: FeedSkip[] = []
  const seenIds = new Set<string>()
  const seenGtins = new Set<string>()
  const eligible: Product[] = []
  for (const base of catalog) {
    const product = localizeProduct(base, store)
    const reason = feedExclusion(product, "us")
    if (reason) {
      if (US_TOP500_PINNED.includes(product.slug)) skipped.push({ slug: product.slug, reason })
      continue
    }
    if (offerFor(product, "us")?.availability === "out_of_stock") continue
    const id = product.id.slice(0, 50)
    if (seenIds.has(id) || (product.gtin && seenGtins.has(product.gtin))) continue
    seenIds.add(id)
    if (product.gtin) seenGtins.add(product.gtin)
    eligible.push(product)
  }

  for (const slug of US_TOP500_PINNED) {
    if (!eligible.some((p) => p.slug === slug) && !skipped.some((s) => s.slug === slug)) {
      skipped.push({ slug, reason: "pinned product missing from the US catalog" })
    }
  }
  if (skipped.length) throw new FeedValidationError(skipped)

  const total = Math.min(Math.max(100, Math.trunc(requestedTotal)), eligible.length)
  const selection = selectUsTop500(eligible, signals, new Date(), total)
  if (selection.length < total) throw new FeedValidationError([{ slug: "feed", reason: `only ${selection.length} eligible products (requested ${total})` }])

  const items = selection.map((entry) => buildItem(entry, store))
  const generatedAt = new Date().toISOString()
  const counts = { tires: 0, wheels: 0, brakes: 0 }
  for (const item of items) counts[item.product.category] += 1
  const brands = new Set(items.map((i) => i.product.brand)).size

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  ${COMPANY.tradingName} · Google Merchant Center · United States · Top ${items.length} (${store.lang.toUpperCase()})
  Generated ${generatedAt}
  ${items.length} items: ${counts.tires} tires · ${counts.wheels} wheels · ${counts.brakes} brakes · ${brands} brands
  Selection: US bestseller model lines, USTMA top replacement sizes, seasonal demand, store orders and reviews.
  custom_label_0 category · 1 segment · 2 price band · 3 popularity tier · 4 rim size / axle
-->
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeFeedXml(`${COMPANY.tradingName} US Top ${items.length} ${store.lang.toUpperCase()}`)}</title>
    <link>${escapeFeedXml(absoluteUrl(storePath(store)))}</link>
    <description>${escapeFeedXml(`The ${items.length} most popular tires, wheels and brakes in the United States from ${COMPANY.tradingName}.`)}</description>
${items.map((item) => `    <item>\n${item.nodes.map((node) => renderNode(node, "      ")).join("\n")}\n    </item>`).join("\n")}
  </channel>
</rss>
`

  const text =
    [TEXT_COLUMNS.join("\t"), ...items.map((item) => TEXT_COLUMNS.map((c) => feedText(item.flat[c] ?? "").replaceAll("\t", " ")).join("\t"))].join("\n") + "\n"

  return { xml, text, items, skipped, generatedAt, total: items.length }
}
