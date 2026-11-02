import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { confirmOrderPayment } from "@/lib/payments/confirm"

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

    const transactionId = String(
      transactionObj.id ??
        transactionObj.transactionId ??
        body.transactionId ??
        ""
    ).trim() || null

    const rawStatus = String(
      body.status ??
        transactionObj.status ??
        body.transactionStatus ??
        ""
    )
      .trim()
      .toLowerCase()

    if (externalId) {
      if (["success", "succeeded", "captured", "settled", "approved", "paid", "completed"].includes(rawStatus)) {
        await confirmOrderPayment({
          orderNumber: externalId,
          paymentMethod: "Карта (CGPayTech)",
          transactionId,
        })
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
