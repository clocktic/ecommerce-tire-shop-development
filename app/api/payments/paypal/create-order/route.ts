import { NextResponse } from "next/server"
import { createPayPalOrderForStoreOrder } from "@/lib/payments/paypal"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderNumber?: string }
    const orderNumber = String(body.orderNumber ?? "").trim()
    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, error: "Missing orderNumber" },
        { status: 400 },
      )
    }

    const result = await createPayPalOrderForStoreOrder(orderNumber)
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      id: result.paypalOrderId,
      orderNumber,
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 },
    )
  }
}
