import "server-only"

import { randomInt } from "crypto"
import { desc, eq, inArray, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { orderItems, orders, shipmentEvents, type OrderRow, type ShipmentEventRow } from "@/lib/db/schema"
import { newId } from "@/lib/ids"
import { localeMeta, parseStore, storePath, type Store } from "@/lib/i18n/config"
import { extrasFor } from "@/lib/i18n/extras"
import { fmt } from "@/lib/i18n/fmt"
import { sendMail } from "@/lib/email"
import { absoluteUrl } from "@/lib/seo"
import { OWN_CARRIER, statusLabel, type ShipmentStatus } from "@/lib/shipping/tracking"
import type { Market } from "@/lib/markets"

// Carrier-style numbers: DHL-like JD + 18 digits in the EU, UPS-like 1Z + 16 in the US.
function randomTrackingNumber(market: Market): string {
  if (market === "eu") {
    let digits = ""
    for (let i = 0; i < 18; i++) digits += randomInt(10)
    return `JD${digits}`
  }
  const alphabet = "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
  let tail = ""
  for (let i = 0; i < 16; i++) tail += alphabet[randomInt(alphabet.length)]
  return `1Z${tail}`
}

export function orderStore(order: Pick<OrderRow, "market" | "lang">): Store {
  return parseStore(order.market, order.lang) ?? { market: order.market === "eu" ? "eu" : "us", lang: "en" }
}

export function trackingPageUrl(store: Store, code: string): string {
  return absoluteUrl(storePath(store, `/track/${encodeURIComponent(code)}`))
}

async function uniqueTrackingNumber(market: Market): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = randomTrackingNumber(market)
    const [hit] = await db.select({ id: orders.id }).from(orders).where(eq(orders.trackingNumber, code)).limit(1)
    if (!hit) return code
  }
  return randomTrackingNumber(market)
}

export async function ensureTrackingNumber(orderId: string): Promise<OrderRow | null> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) return null
  if (order.trackingNumber && order.carrier && order.trackingUrl) return order
  const trackingNumber = order.trackingNumber?.trim() || (await uniqueTrackingNumber(order.market as Market))
  const carrier = order.carrier?.trim() || OWN_CARRIER
  const trackingUrl = trackingPageUrl(orderStore(order), trackingNumber)
  await db.update(orders).set({ trackingNumber, carrier, trackingUrl, updatedAt: new Date() }).where(eq(orders.id, orderId))
  return { ...order, trackingNumber, carrier, trackingUrl }
}

// First "shipped" creates the tracking number and the label_created event once.
export async function ensureShipmentOnShip(orderId: string): Promise<{ order: OrderRow; created: boolean } | null> {
  const order = await ensureTrackingNumber(orderId)
  if (!order) return null
  const [existing] = await db
    .select({ id: shipmentEvents.id })
    .from(shipmentEvents)
    .where(eq(shipmentEvents.orderId, orderId))
    .limit(1)
  if (existing) return { order, created: false }
  await db.insert(shipmentEvents).values({
    id: newId("shp"),
    orderId,
    status: "label_created",
    carrier: order.carrier || OWN_CARRIER,
    createdAt: new Date(),
  })
  return { order, created: true }
}

export async function insertShipmentEvent(input: {
  orderId: string
  status: ShipmentStatus
  location: string | null
  comment: string | null
  carrier: string
}): Promise<ShipmentEventRow> {
  const row: ShipmentEventRow = { id: newId("shp"), ...input, createdAt: new Date() }
  await db.insert(shipmentEvents).values(row)
  const patch: Partial<OrderRow> = { carrier: input.carrier, updatedAt: new Date() }
  if (input.status === "delivered") patch.status = "delivered"
  await db.update(orders).set(patch).where(eq(orders.id, input.orderId))
  return row
}

export async function getShipmentEvents(orderId: string): Promise<ShipmentEventRow[]> {
  return db.select().from(shipmentEvents).where(eq(shipmentEvents.orderId, orderId)).orderBy(desc(shipmentEvents.createdAt))
}

export async function getShipmentEventsForOrders(orderIds: string[]): Promise<Record<string, ShipmentEventRow[]>> {
  if (orderIds.length === 0) return {}
  const rows = await db
    .select()
    .from(shipmentEvents)
    .where(inArray(shipmentEvents.orderId, orderIds))
    .orderBy(desc(shipmentEvents.createdAt))
  const grouped: Record<string, ShipmentEventRow[]> = {}
  for (const row of rows) (grouped[row.orderId] ??= []).push(row)
  return grouped
}

// Public lookup accepts the tracking number or the order number.
export async function getShipmentByCode(code: string) {
  const clean = code.trim().toUpperCase()
  if (!clean || clean.length > 40) return null
  const [order] = await db
    .select()
    .from(orders)
    .where(or(eq(orders.trackingNumber, clean), eq(orders.orderNumber, clean)))
    .limit(1)
  if (!order) return null
  const [events, items] = await Promise.all([
    getShipmentEvents(order.id),
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
  ])
  return { order, events, items }
}

export async function sendShipmentEventEmail(
  order: OrderRow,
  event: Pick<ShipmentEventRow, "status" | "location" | "comment" | "carrier">,
): Promise<boolean> {
  const store = orderStore(order)
  const x = extrasFor(localeMeta(store).content)
  const status = statusLabel(event.status, localeMeta(store).content, event.carrier)
  const paragraphs = [fmt(x.email.shipBody, { number: order.orderNumber, status })]
  // Location and comment go out exactly as the operator typed them.
  if (event.location) paragraphs.push(event.location)
  if (event.comment) paragraphs.push(event.comment)
  if (order.trackingNumber) paragraphs.push(`${x.track.number}: ${order.trackingNumber}`)
  return sendMail({
    to: order.email,
    subject: fmt(x.email.shipSubject, { number: order.orderNumber, status }),
    paragraphs,
    cta: order.trackingUrl ? { label: x.email.trackCta, href: order.trackingUrl } : undefined,
    signoff: x.email.signoff,
  })
}
