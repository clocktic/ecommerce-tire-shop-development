import { NextResponse } from "next/server"
import { capturePayPalOrder } from "@/lib/payments/paypal"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      paypalOrderId?: string
      orderNumber?: string
    }
    const paypalOrderId = String(body.paypalOrderId ?? "").trim()
    const orderNumber = String(body.orderNumber ?? "").trim()
    if (!paypalOrderId) {
      return NextResponse.json(
        { ok: false, error: "Missing paypalOrderId" },
        { status: 400 },
      )
    }

    const result = await capturePayPalOrder(paypalOrderId, orderNumber)
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 },
    )
  }
}
