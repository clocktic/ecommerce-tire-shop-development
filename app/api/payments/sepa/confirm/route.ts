import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { orderItems, orders } from "@/lib/db/schema"
import { sendStoreInboxMail } from "@/lib/email"
import { formatPrice, type Market } from "@/lib/markets"
import { appendSepaReportedNote, getSepaReportedAt, SEPA_BANK_DETAILS } from "@/lib/payments/sepa"
import { notifyTelegramSepaTransferReported } from "@/lib/telegram"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  let body: { orderNumber?: unknown; senderNote?: unknown }
  try {
    body = (await request.json()) as { orderNumber?: unknown; senderNote?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim().slice(0, 64) : ""
  const senderNote = typeof body.senderNote === "string" ? body.senderNote.trim().slice(0, 120) : ""

  if (!orderNumber) {
    return NextResponse.json({ ok: false, error: "Missing orderNumber" }, { status: 400 })
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1)

  if (!order || order.market !== "eu") {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 })
  }

  if (order.status !== "pending") {
    return NextResponse.json({ ok: true, alreadyPaid: true, reportedAt: getSepaReportedAt(order.notes) })
  }

  const existingReportedAt = getSepaReportedAt(order.notes)
  if (existingReportedAt) {
    return NextResponse.json({ ok: true, alreadyReported: true, reportedAt: existingReportedAt })
  }

  const reportedAt = new Date().toISOString()
  const updatedNotes = appendSepaReportedNote(order.notes, reportedAt)

  await db
    .update(orders)
    .set({
      notes: updatedNotes,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, order.id))

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))

  const formattedTotal = formatPrice(order.totalCents, order.market as Market, "de-DE")

  await Promise.all([
    notifyTelegramSepaTransferReported({
      orderNumber: order.orderNumber,
      market: order.market as Market,
      customerName: order.shippingName,
      email: order.email,
      phone: order.phone,
      city: order.shippingCity,
      country: order.shippingCountry,
      totalCents: order.totalCents,
      senderNote: senderNote || null,
      items: items.map((i) => ({
        productName: i.productName,
        brandName: i.brandName,
        quantity: i.quantity,
        lineTotalCents: i.lineTotalCents,
      })),
    }),
    sendStoreInboxMail({
      customerName: order.shippingName || order.email,
      customerEmail: order.email,
      subject: `[SEPA: Я оплатил] ${order.orderNumber} — ${formattedTotal}`,
      paragraphs: [
        `Покупатель нажал «Я оплатил» по заказу ${order.orderNumber} на сумму ${formattedTotal} (SEPA Bank Transfer).`,
        `Проверьте поступление на счёт: ${SEPA_BANK_DETAILS.ibanFormatted} (${SEPA_BANK_DETAILS.beneficiary} / ${SEPA_BANK_DETAILS.bank}).`,
        `Покупатель: ${order.shippingName || "—"} <${order.email}>${order.phone ? `, тел: ${order.phone}` : ""}`,
        ...(senderNote ? [`Комментарий покупателя: ${senderNote}`] : []),
        `Состав заказа:\n${items.map((i) => `• ${i.quantity} × ${i.productName} (${formatPrice(i.lineTotalCents, order.market as Market, "de-DE")})`).join("\n")}`,
      ],
    }),
  ])

  return NextResponse.json({ ok: true, reportedAt })
}
