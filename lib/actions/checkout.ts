"use server"

import { headers } from "next/headers"
import { getSessionUser } from "@/lib/auth"
import { offerFor, localizeProduct } from "@/lib/catalog"
import { getProductBySlug } from "@/lib/catalog/queries"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { sendMail, sendStoreInboxMail } from "@/lib/email"
import { newId, newOrderNumber } from "@/lib/ids"
import { localeMeta, parseStore } from "@/lib/i18n/config"
import { extrasFor } from "@/lib/i18n/extras"
import { fmt } from "@/lib/i18n/fmt"
import { MARKETS, formatPrice } from "@/lib/markets"
import { computeMemberDiscountCents } from "@/lib/member-discount"
import { createStripeCheckoutSession } from "@/lib/payments/stripe"
import { POLICIES } from "@/lib/policies"
import { notifyTelegramNewOrder } from "@/lib/telegram"

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

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; forwardUrl?: string }
  | { ok: false }

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
  const reqHeaders = await headers()
  const user = await getSessionUser(reqHeaders)
  const discountCents = computeMemberDiscountCents(subtotalCents, Boolean(user))
  const totalCents = Math.max(0, subtotalCents - discountCents) + shippingCents
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
    totalCents,
    currency: MARKETS[store.market].currency,
    shippingName: `${fields.firstName} ${fields.lastName}`,
    shippingAddress1: fields.address,
    shippingCity: fields.city,
    shippingRegion: fields.state || null,
    shippingPostalCode: fields.postal,
    shippingCountry: fields.country,
    notes: discountCents > 0 ? "member_discount_7pct" : null,
  })
  await db.insert(orderItems).values(items)

  const host = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host") || "localhost:3000"
  const proto = reqHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https")
  const origin = `${proto}://${host}`

  const paymentSession = await createStripeCheckoutSession({
    order: {
      id: orderId,
      orderNumber,
      market: store.market,
      lang: store.lang,
      email,
      currency: MARKETS[store.market].currency,
      subtotalCents,
      shippingCents,
      totalCents,
    },
    items,
    origin,
  })

  const meta = localeMeta(store)
  const x = extrasFor(meta.content)
  const formattedTotal = formatPrice(totalCents, store.market, meta.intlLocale)
  await Promise.all([
    sendMail({
      to: email,
      template: "order",
      store,
      details: { orderNumber, subtotalCents, discountCents, shippingCents, totalCents, items },
      subject: fmt(x.email.orderSubject, { number: orderNumber }),
      paragraphs: [],
      signoff: x.email.signoff,
    }),
    sendStoreInboxMail({
      customerName: `${fields.firstName} ${fields.lastName}`,
      customerEmail: email,
      subject: `[Новый заказ] ${orderNumber} — ${formattedTotal} (${store.market.toUpperCase()})`,
      paragraphs: [
        `Оформлен новый заказ ${orderNumber} на сумму ${formattedTotal}.`,
        `Покупатель: ${fields.firstName} ${fields.lastName} <${email}>`,
        `Телефон: ${fields.phone}`,
        `Адрес доставки: ${[fields.address, `${fields.postal} ${fields.city}`, fields.state || null, fields.country].filter(Boolean).join(", ")}`,
        `Состав заказа:\n${items.map((i) => `• ${i.quantity} × ${i.productName} (${formatPrice(i.lineTotalCents, store.market, meta.intlLocale)})`).join("\n")}`,
      ],
    }),
    notifyTelegramNewOrder({
      orderNumber,
      market: store.market,
      lang: store.lang,
      customerName: `${fields.firstName} ${fields.lastName}`,
      email,
      phone: fields.phone,
      address: fields.address,
      postalCode: fields.postal,
      city: fields.city,
      region: fields.state || null,
      country: fields.country,
      subtotalCents,
      discountCents,
      shippingCents,
      totalCents,
      items: items.map((i) => ({
        productName: i.productName,
        brandName: i.brandName,
        quantity: i.quantity,
        lineTotalCents: i.lineTotalCents,
      })),
      paymentMethod: paymentSession.ok ? "Stripe Checkout" : "По реквизитам / при подтверждении",
      paymentStatusLabel: paymentSession.ok ? "Перенаправлен на оплату (Stripe)" : "Ожидает оплаты",
    }),
  ])

  if (paymentSession.ok) {
    return { ok: true, orderNumber, forwardUrl: paymentSession.forwardUrl }
  }

  return { ok: true, orderNumber }
}
