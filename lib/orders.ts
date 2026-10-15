import "server-only"

import { and, desc, eq, inArray } from "drizzle-orm"
import { db } from "@/lib/db"
import { orderItems, orders, type OrderItemRow, type OrderRow } from "@/lib/db/schema"

export type OrderWithItems = OrderRow & { items: OrderItemRow[] }

async function attachItems(rows: OrderRow[]): Promise<OrderWithItems[]> {
  if (rows.length === 0) return []
  const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((r) => r.id)))
  return rows.map((r) => ({ ...r, items: items.filter((i) => i.orderId === r.id) }))
}

// Always scoped to the signed-in user's id.
export async function getOrdersForUser(userId: string, market: string): Promise<OrderWithItems[]> {
  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.market, market)))
    .orderBy(desc(orders.createdAt))
    .limit(50)
  return attachItems(rows)
}

export async function getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
  const [row] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber.toUpperCase())).limit(1)
  if (!row) return null
  const [withItems] = await attachItems([row])
  return withItems
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@")
  if (!domain) return email
  return `${user.slice(0, 2)}${"•".repeat(Math.max(1, user.length - 2))}@${domain}`
}
