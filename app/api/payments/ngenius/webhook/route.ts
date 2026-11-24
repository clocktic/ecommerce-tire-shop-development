import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import {
  applyNgeniusPaymentUpdate,
  extractNgeniusOrderRef,
  getNgeniusOrderStatus,
  getOrderByNgeniusRef,
  verifyNgeniusWebhookSecret,
} from "@/lib/payments/ngenius"

export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 })
}

type WebhookBody = {
  eventId?: string
  eventName?: string
  orderReference?: string
  merchantOrderReference?: string
  order?: {
    reference?: string
    merchantOrderReference?: string
  }
}

export async function POST(request: Request) {
  if (!verifyNgeniusWebhookSecret(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  let body: WebhookBody
  try {
    body = (await request.json()) as WebhookBody
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  const orderRef = (body.order?.reference || body.orderReference || "").trim()
  const merchantOrderRef = (
    body.order?.merchantOrderReference ||
    body.merchantOrderReference ||
    ""
  )
    .trim()
    .toUpperCase()

  if (!orderRef && !merchantOrderRef) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  let order = merchantOrderRef
    ? (
        await db
          .select()
          .from(orders)
          .where(eq(orders.orderNumber, merchantOrderRef))
          .limit(1)
      )[0] ?? null
    : null

  if (!order && orderRef) {
    order = await getOrderByNgeniusRef(orderRef)
  }

  if (!order) {
    return NextResponse.json({ ok: true, found: false })
  }

  const refToVerify = orderRef || extractNgeniusOrderRef(order.notes)
  if (!refToVerify) {
    return NextResponse.json({ ok: true, verified: false })
  }

  // Always re-verify the authoritative payment state directly with N-Genius API.
  const ngeniusOrder = await getNgeniusOrderStatus(refToVerify)
  if (!ngeniusOrder) {
    return NextResponse.json({ ok: false, error: "Unable to verify N-Genius order" }, { status: 502 })
  }

  const update = await applyNgeniusPaymentUpdate(order, ngeniusOrder)
  return NextResponse.json({ ok: true, paid: update.paid, state: update.state })
}
