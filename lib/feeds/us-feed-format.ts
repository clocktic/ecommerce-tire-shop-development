import { offerFor, tireCodeNotations, tireServiceDescription, tireSize, type Product } from "@/lib/catalog"
import { storePath, type Store } from "@/lib/i18n/config"
import { POLICIES } from "@/lib/policies"
import { absoluteUrl } from "@/lib/seo"

const CATEGORIES = { tires: "6093", wheels: "6090", brakes: "2977" } as const
const PRODUCT_TYPES = { tires: "Automotive Tires", wheels: "Automotive Wheels", brakes: "Automotive Brakes" } as const
const SHIPPING_HEADER = "shipping(country:price:min_handling_time:max_handling_time:min_transit_time:max_transit_time)"
const HEADERS = [
  "id", "title", "description", "link", "image_link", "availability", "availability_date",
  "price", "condition", "brand", "gtin", "mpn", "google_product_category", "product_type",
  "size", "color", "custom_label_0", SHIPPING_HEADER,
] as const

type Row = Record<(typeof HEADERS)[number], string>

export function feedText(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim()
}

export function escapeFeedXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&apos;")
}

export function enrichedDescription(product: Product): string {
  const base = feedText(product.description)
  if (!base) return ""
  if (product.category === "tires" && product.tire) {
    const t = product.tire
    const codes = tireCodeNotations(t)
    const seasonLabel = t.season === "all-season" ? "All-Season" : t.season === "winter" ? "Winter" : "Summer"
    const extraSpecs: string[] = []
    if (!base.includes("Tyre Code:") && !base.includes("Tyre Code / Tire Code:")) {
      extraSpecs.push(codes.specBlock)
    }
    if (!base.includes(`Section Width: ${t.width} mm`)) extraSpecs.push(`Section Width: ${t.width} mm`)
    if (!base.includes(`Aspect Ratio: ${t.aspect}`)) extraSpecs.push(`Aspect Ratio: ${t.aspect}%`)
    if (!base.includes(`Rim Diameter: ${t.rim} in`)) extraSpecs.push(`Rim Diameter: ${t.rim} in (${t.rim}" R${t.rim})`)
    if (!base.includes(`Load Index: ${t.loadIndex}`)) extraSpecs.push(`Load Index: ${t.loadIndex}`)
    if (!base.includes(`Speed Rating: ${t.speedRating}`)) extraSpecs.push(`Speed Rating: ${t.speedRating}`)
    if (!base.includes(`Load Range: ${codes.loadRange}`)) extraSpecs.push(`Load Range: ${codes.loadRange}`)
    if (t.season && !base.includes(`Season: ${seasonLabel}`) && !base.includes(`Season: ${seasonLabel.replace("-", " ")}`)) {
      extraSpecs.push(`Season: ${seasonLabel}`)
    }
    if (product.mpn && !base.includes(product.mpn)) extraSpecs.push(`MPN: ${product.mpn}`)
    if (product.gtin && !base.includes(product.gtin)) extraSpecs.push(`GTIN: ${product.gtin}`)
    if (!extraSpecs.length) return base.slice(0, 5000)
    return feedText(`${base} ${extraSpecs.join(". ")}.`).slice(0, 5000)
  }
  if (product.category === "wheels" && product.wheel) {
    const w = product.wheel
    const wheelSize = `${w.diameter}x${w.width} ${w.boltPattern} ET${w.offset}`
    const extraSpecs = [
      `Size: ${wheelSize} (${w.diameter}x${w.width} in)`,
      `Bolt Pattern: ${w.boltPattern}`,
      `Offset: ET${w.offset}`,
      ...(w.centerBore ? [`Center Bore: ${w.centerBore} mm`] : []),
      ...(w.finish ? [`Color: ${w.finish}`] : []),
      ...(product.mpn ? [`MPN: ${product.mpn}`] : []),
      ...(product.gtin ? [`GTIN: ${product.gtin}`] : []),
    ].join(". ")
    return feedText(`${base} ${extraSpecs}.`).slice(0, 5000)
  }
  return base.slice(0, 5000)
}

function rowFor(product: Product, store: Store): Row {
  const offer = offerFor(product, "us")!
  const shipping = POLICIES.us.shipping
  const title = product.name.toLowerCase().startsWith(product.brand.toLowerCase())
    ? product.name : `${product.brand} ${product.name}`
  const image = product.images.find((src) => src && !/\.(avif|gif)(?:[?#]|$)/i.test(src))!
  return {
    id: product.id.slice(0, 50),
    title: feedText(title).slice(0, 150),
    description: enrichedDescription(product),
    link: absoluteUrl(storePath(store, `/product/${product.slug}`)),
    image_link: absoluteUrl(image),
    availability: offer.availability,
    availability_date: offer.availability === "preorder" ? offer.availableFrom! : "",
    price: `${(offer.priceCents / 100).toFixed(2)} USD`,
    condition: "new",
    brand: product.brand,
    gtin: product.gtin ?? "",
    mpn: product.mpn ?? "",
    google_product_category: CATEGORIES[product.category],
    product_type: PRODUCT_TYPES[product.category],
    size: product.category === "tires" ? `${product.tire.width}/${product.tire.aspect}R${product.tire.rim} ${tireServiceDescription(product.tire)}`
      : product.category === "wheels" ? `${product.wheel.diameter}x${product.wheel.width} ${product.wheel.boltPattern} ET${product.wheel.offset}` : "",
    color: product.category === "wheels" ? product.wheel.finish : "",
    custom_label_0: product.category,
    [SHIPPING_HEADER]: ["US", `${(shipping.rateCents / 100).toFixed(2)} USD`, ...shipping.handlingDays, ...shipping.transitDays].join(":"),
  }
}

export function buildUsFeedItems(products: Product[], store: Store): { items: string[]; text: string } {
  const rows = products.map((product) => rowFor(product, store))
  const items = rows.map((row, idx) => {
    const product = products[idx]
    const fields = HEADERS.filter((name) => name !== SHIPPING_HEADER && row[name])
      .map((name) => `      <g:${name}>${escapeFeedXml(feedText(row[name]))}</g:${name}>`)
    if (product.category === "tires" && product.tire) {
      const t = product.tire
      const codes = tireCodeNotations(t)
      const detailPairs: [string, string, string][] = [
        ["Sizing", "Size", `${codes.compact} (${codes.spaced}, ${codes.compactLoadRange}, ${codes.pMetric}${codes.isZR ? `, ${codes.zrCompact}` : ""}, ${t.rim} in)`],
        ["Sizing", "Tyre Code", `${codes.compact} ${codes.svc} (${codes.spaced} ${codes.svc}, ${codes.compactLoadRangeSvc}, ${codes.pMetricSvc}, ${codes.slashLoadRange})`],
        ["Sizing", "Tire Code", `${codes.compact} ${codes.svc} (${codes.compactLoadRangeSvc})`],
        ["Sizing", "Tire Size", `${codes.compact} ${codes.svc}`],
        ["Sizing", "Rim Size", `${t.rim} in (${t.rim}" R${t.rim})`],
        ["Specifications", "Section Width", `${t.width} mm`],
        ["Specifications", "Aspect Ratio", `${t.aspect}%`],
        ["Specifications", "Load Index", String(t.loadIndex)],
        ["Specifications", "Speed Rating", t.speedRating],
        ["Specifications", "Load Range", codes.loadRange],
      ]
      for (const [sec, attr, val] of detailPairs) {
        fields.push(
          `      <g:product_detail><g:section_name>${escapeFeedXml(sec)}</g:section_name><g:attribute_name>${escapeFeedXml(attr)}</g:attribute_name><g:attribute_value>${escapeFeedXml(val)}</g:attribute_value></g:product_detail>`,
        )
      }
    }
    const shippingNames = ["country", "price", "min_handling_time", "max_handling_time", "min_transit_time", "max_transit_time"]
    const shipping = row[SHIPPING_HEADER].split(":").map((value, index) =>
      `<g:${shippingNames[index]}>${escapeFeedXml(value)}</g:${shippingNames[index]}>`).join("")
    fields.push(`      <g:shipping>${shipping}</g:shipping>`)
    return `    <item>\n${fields.join("\n")}\n    </item>`
  })
  const text = [HEADERS.join("\t"), ...rows.map((row) => HEADERS.map((name) => feedText(row[name])).join("\t"))].join("\n") + "\n"
  return { items, text }
}
