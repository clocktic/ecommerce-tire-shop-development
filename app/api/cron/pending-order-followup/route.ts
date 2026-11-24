import { and, eq, gte, isNull, lte } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { sendPendingOrderFollowupEmail } from "@/lib/email"
import type { Market } from "@/lib/markets"

export const dynamic = "force-dynamic"

// Only follow up on orders created on or after this timestamp so older historical pending orders are never emailed.
const FOLLOWUP_CUTOFF = new Date("2026-11-24T12:00:00Z")
const FOLLOWUP_DELAY_MS = 60 * 60 * 1000 // 1 hour

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const authHeader = request.headers.get("authorization")
  if (cronSecret) {
    return authHeader === `Bearer ${cronSecret}`
  }
  const userAgent = request.headers.get("user-agent") ?? ""
  return (
    request.headers.get("x-vercel-cron") === "1" ||
    userAgent.startsWith("vercel-cron/")
  )
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const eligibleBefore = new Date(Date.now() - FOLLOWUP_DELAY_MS)
  const candidates = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.status, "pending"),
        isNull(orders.followupSentAt),
        gte(orders.createdAt, FOLLOWUP_CUTOFF),
        lte(orders.createdAt, eligibleBefore),
      ),
    )
    .limit(25)

  const sent: string[] = []
  const failed: string[] = []

  for (const order of candidates) {
    // Atomically claim the order before sending to prevent duplicate emails across concurrent invocations.
    const claimed = await db
      .update(orders)
      .set({ followupSentAt: new Date() })
      .where(
        and(
          eq(orders.id, order.id),
          eq(orders.status, "pending"),
          isNull(orders.followupSentAt),
        ),
      )
      .returning({ id: orders.id })

    if (claimed.length === 0) continue

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))

    const ok = await sendPendingOrderFollowupEmail({
      orderNumber: order.orderNumber,
      market: (order.market === "eu" ? "eu" : "us") as Market,
      lang: order.lang,
      customerName: order.shippingName,
      email: order.email,
      totalCents: order.totalCents,
      items: items.map((item) => ({
        productName: item.productName,
        brandName: item.brandName,
        quantity: item.quantity,
        lineTotalCents: item.lineTotalCents,
      })),
    })

    if (ok) {
      sent.push(order.orderNumber)
    } else {
      await db
        .update(orders)
        .set({ followupSentAt: null })
        .where(eq(orders.id, order.id))
      failed.push(order.orderNumber)
    }
  }

  return NextResponse.json({
    ok: true,
    checked: candidates.length,
    sent,
    failed,
  })
}
