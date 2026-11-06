import { offerFor, tireServiceDescription, tireSize, type Product } from "@/lib/catalog"
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

function rowFor(product: Product, store: Store): Row {
  const offer = offerFor(product, "us")!
  const shipping = POLICIES.us.shipping
  const title = product.name.toLowerCase().startsWith(product.brand.toLowerCase())
    ? product.name : `${product.brand} ${product.name}`
  const image = product.images.find((src) => src && !/\.(avif|gif)(?:[?#]|$)/i.test(src))!
  return {
    id: product.id.slice(0, 50),
    title: feedText(title).slice(0, 150),
    description: feedText(product.description).slice(0, 5000),
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
    size: product.category === "tires" ? `${tireSize(product.tire)} ${tireServiceDescription(product.tire)}`
      : product.category === "wheels" ? `${product.wheel.diameter}x${product.wheel.width} ${product.wheel.boltPattern} ET${product.wheel.offset}` : "",
    color: product.category === "wheels" ? product.wheel.finish : "",
    custom_label_0: product.category,
    [SHIPPING_HEADER]: ["US", `${(shipping.rateCents / 100).toFixed(2)} USD`, ...shipping.handlingDays, ...shipping.transitDays].join(":"),
  }
}

export function buildUsFeedItems(products: Product[], store: Store): { items: string[]; text: string } {
  const rows = products.map((product) => rowFor(product, store))
  const items = rows.map((row) => {
    const fields = HEADERS.filter((name) => name !== SHIPPING_HEADER && row[name])
      .map((name) => `      <g:${name}>${escapeFeedXml(feedText(row[name]))}</g:${name}>`)
    const shippingNames = ["country", "price", "min_handling_time", "max_handling_time", "min_transit_time", "max_transit_time"]
    const shipping = row[SHIPPING_HEADER].split(":").map((value, index) =>
      `<g:${shippingNames[index]}>${escapeFeedXml(value)}</g:${shippingNames[index]}>`).join("")
    fields.push(`      <g:shipping>${shipping}</g:shipping>`)
    return `    <item>\n${fields.join("\n")}\n    </item>`
  })
  const text = [HEADERS.join("\t"), ...rows.map((row) => HEADERS.map((name) => feedText(row[name])).join("\t"))].join("\n") + "\n"
  return { items, text }
}
