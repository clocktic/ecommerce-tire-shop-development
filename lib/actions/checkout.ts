"use server"

import { headers } from "next/headers"
import { getSessionUser } from "@/lib/auth"
import { offerFor, localizeProduct } from "@/lib/catalog"
import { getProductBySlug } from "@/lib/catalog/queries"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { sendMail } from "@/lib/email"
import { newId, newOrderNumber } from "@/lib/ids"
import { localeMeta, parseStore } from "@/lib/i18n/config"
import { extrasFor } from "@/lib/i18n/extras"
import { fmt } from "@/lib/i18n/fmt"
import { MARKETS, formatPrice } from "@/lib/markets"
import { POLICIES } from "@/lib/policies"

const MAX_PER_LINE = 8
const MAX_PER_ORDER = 24
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type PlaceOrderInput = {
  market: string
  lang: string
  lines: { slug: string; quantity: number }[]
  email: string
  phone: string
  firstName: string
  lastName: string
  address: string
  postal: string
  city: string
  state?: string
  country: string
  accepted: boolean
}

export type PlaceOrderResult = { ok: true; orderNumber: string } | { ok: false }

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const store = parseStore(String(input.market), String(input.lang))
  if (!store || input.accepted !== true || !Array.isArray(input.lines) || input.lines.length === 0) return { ok: false }

  const email = text(input.email, 200).toLowerCase()
  const fields = {
    phone: text(input.phone, 40),
    firstName: text(input.firstName, 80),
    lastName: text(input.lastName, 80),
    address: text(input.address, 200),
    postal: text(input.postal, 20),
    city: text(input.city, 100),
    state: text(input.state, 60),
    country: text(input.country, 2).toUpperCase(),
  }
  if (!EMAIL_RE.test(email) || !fields.phone || !fields.firstName || !fields.lastName || !fields.address || !fields.postal || !fields.city) {
    return { ok: false }
  }
  if (!MARKETS[store.market].shipsTo.some((c) => c.code === fields.country)) return { ok: false }

  // Merge duplicate slugs, then cap per line and per order.
  const merged = new Map<string, number>()
  for (const line of input.lines) {
    const qty = Number(line?.quantity)
    if (typeof line?.slug !== "string" || !Number.isInteger(qty) || qty < 1) return { ok: false }
    merged.set(line.slug, (merged.get(line.slug) ?? 0) + qty)
  }
  let totalQty = 0
  const items: (typeof orderItems.$inferInsert)[] = []
  const orderId = newId("ord")
  for (const [slug, quantity] of merged) {
    if (quantity > MAX_PER_LINE) return { ok: false }
    totalQty += quantity
    const base = await getProductBySlug(slug)
    if (!base) return { ok: false }
    const offer = offerFor(base, store.market)
    if (!offer || offer.availability === "out_of_stock") return { ok: false }
    const product = localizeProduct(base, store)
    items.push({
      id: newId("itm"),
      orderId,
      productSlug: slug,
      productName: product.name,
      brandName: product.brand,
      image: product.images[0] ?? null,
      unitPriceCents: offer.priceCents,
      quantity,
      lineTotalCents: offer.priceCents * quantity,
    })
  }
  if (totalQty > MAX_PER_ORDER) return { ok: false }

  const subtotalCents = items.reduce((sum, i) => sum + i.lineTotalCents, 0)
  const shippingCents = POLICIES[store.market].shipping.rateCents
  const user = await getSessionUser(await headers())
  const orderNumber = newOrderNumber(store.market)

  await db.insert(orders).values({
    id: orderId,
    orderNumber,
    market: store.market,
    lang: store.lang,
    userId: user?.id ?? null,
    email,
    phone: fields.phone,
    status: "pending",
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    currency: MARKETS[store.market].currency,
    shippingName: `${fields.firstName} ${fields.lastName}`,
    shippingAddress1: fields.address,
    shippingCity: fields.city,
    shippingRegion: fields.state || null,
    shippingPostalCode: fields.postal,
    shippingCountry: fields.country,
  })
  await db.insert(orderItems).values(items)

  const meta = localeMeta(store)
  const x = extrasFor(meta.content)
  await sendMail({
    to: email,
    subject: fmt(x.email.orderSubject, { number: orderNumber }),
    paragraphs: [
      fmt(x.email.orderBody, { number: orderNumber, total: formatPrice(subtotalCents + shippingCents, store.market, meta.intlLocale) }),
      ...items.map((i) => `${i.quantity} × ${i.productName}`),
      x.order.payment,
    ],
    signoff: x.email.signoff,
  })

  return { ok: true, orderNumber }
}
