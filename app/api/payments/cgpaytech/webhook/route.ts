import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import type { Market } from "@/lib/markets"
import { notifyTelegramOrderPaid } from "@/lib/telegram"

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
    }

    const merchantInfo = (body.MerchantInfo ?? body.merchantInfo ?? {}) as Record<string, unknown>
    const transactionObj = (body.Transaction ?? body.transaction ?? {}) as Record<string, unknown>

    const externalId = String(
      body.externalId ??
        merchantInfo.externalId ??
        transactionObj.externalId ??
        ""
    ).trim()

    const rawStatus = String(
      body.status ??
        transactionObj.status ??
        body.transactionStatus ??
        ""
    )
      .trim()
      .toLowerCase()

    if (externalId) {
      const [existing] = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, externalId))
        .limit(1)

      if (["success", "succeeded", "captured", "settled", "approved", "paid", "completed"].includes(rawStatus)) {
        await db
          .update(orders)
          .set({ status: "paid", updatedAt: new Date() })
          .where(eq(orders.orderNumber, externalId))

        if (existing && existing.status !== "paid") {
          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, existing.id))

          await notifyTelegramOrderPaid({
            orderNumber: existing.orderNumber,
            market: (existing.market === "eu" ? "eu" : "us") as Market,
            customerName: existing.shippingName,
            email: existing.email,
            phone: existing.phone,
            city: existing.shippingCity,
            country: existing.shippingCountry,
            totalCents: existing.totalCents,
            items: items.map((i) => ({
              productName: i.productName,
              brandName: i.brandName,
              quantity: i.quantity,
              lineTotalCents: i.lineTotalCents,
            })),
            source: "CGPayTech (эквайринг)",
          })
        }
      } else if (["failed", "declined", "error", "expired", "canceled", "cancelled"].includes(rawStatus)) {
        await db
          .update(orders)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(orders.orderNumber, externalId))
      }
    }

    // CommerceGate requires HTTP 200 or 201 to acknowledge webhook receipt
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error("[v0] CGPayTech webhook error:", err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
