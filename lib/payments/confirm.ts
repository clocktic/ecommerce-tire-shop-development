import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import type { Market } from "@/lib/markets"
import { notifyTelegramOrderPaid } from "@/lib/telegram"

export type PaymentConfirmationOptions = {
  /** Order lookup key — provide either orderId (UUID) or orderNumber (e.g. TS-US-XXXXXX) */
  orderId?: string
  orderNumber?: string
  /** Human-readable payment provider or method (e.g. "Stripe", "PayPal", "SEPA Bank Transfer", "CGPayTech", "Подтверждено в админке") */
  paymentMethod?: string | null
  /** Optional provider transaction / payment intent / capture ID */
  transactionId?: string | null
}

/**
 * Provider-agnostic helper to mark an order as paid and send a Telegram notification.
 * Safe against duplicate webhook deliveries: only notifies Telegram when the order transitions
 * from a non-paid status to "paid".
 *
 * Use this from any payment integration (Stripe webhook, PayPal webhook/capture,
 * CGPayTech webhook, SEPA/Bank Transfer confirmation, or manual confirmation in Admin).
 */
export async function confirmOrderPayment(
  options: PaymentConfirmationOptions,
): Promise<{ ok: boolean; alreadyPaid?: boolean; notFound?: boolean }> {
  const whereClause = options.orderId
    ? eq(orders.id, options.orderId)
    : options.orderNumber
      ? eq(orders.orderNumber, options.orderNumber)
      : null

  if (!whereClause) {
    return { ok: false, notFound: true }
  }

  const [existing] = await db.select().from(orders).where(whereClause).limit(1)
  if (!existing) {
    return { ok: false, notFound: true }
  }

  if (existing.status === "paid") {
    return { ok: true, alreadyPaid: true }
  }

  await db
    .update(orders)
    .set({ status: "paid", updatedAt: new Date() })
    .where(eq(orders.id, existing.id))

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
    paymentMethod: options.paymentMethod ?? null,
    transactionId: options.transactionId ?? null,
  })

  return { ok: true, alreadyPaid: false }
}
