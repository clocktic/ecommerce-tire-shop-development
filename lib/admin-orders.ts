import "server-only"

import { and, desc, eq, ilike, inArray, isNotNull, or, type SQL } from "drizzle-orm"
import { db } from "@/lib/db"
import { orderItems, orders, type OrderItemRow, type OrderRow, type ShipmentEventRow } from "@/lib/db/schema"
import { getShipmentEventsForOrders } from "@/lib/shipping/events"

export type AdminOrder = Omit<OrderRow, "createdAt" | "updatedAt"> & {
  createdAt: string
  items: OrderItemRow[]
  events: (Omit<ShipmentEventRow, "createdAt"> & { createdAt: string })[]
}

export async function loadAdminOrders(opts: { status?: string; q?: string; shippedOnly?: boolean }): Promise<AdminOrder[]> {
  const where: SQL[] = []
  if (opts.status) where.push(eq(orders.status, opts.status))
  if (opts.shippedOnly) where.push(isNotNull(orders.trackingNumber))
  if (opts.q) {
    const like = `%${opts.q.trim()}%`
    where.push(or(ilike(orders.orderNumber, like), ilike(orders.email, like), ilike(orders.trackingNumber, like))!)
  }
  const rows = await db
    .select()
    .from(orders)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(200)
  if (rows.length === 0) return []
  const ids = rows.map((r) => r.id)
  const [items, events] = await Promise.all([
    db.select().from(orderItems).where(inArray(orderItems.orderId, ids)),
    getShipmentEventsForOrders(ids),
  ])
  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    items: items.filter((i) => i.orderId === r.id),
    events: (events[r.id] ?? []).map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
  }))
}
