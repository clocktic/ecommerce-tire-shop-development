import { NextResponse } from "next/server"
import { createNgeniusHostedOrder } from "@/lib/payments/ngenius"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderNumber?: unknown }
    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : ""
    if (!orderNumber) {
      return NextResponse.json({ ok: false, error: "Missing orderNumber" }, { status: 400 })
    }

    const result = await createNgeniusHostedOrder(orderNumber)
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      forwardUrl: result.forwardUrl,
      orderRef: result.orderRef,
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to start N-Genius payment" },
      { status: 500 },
    )
  }
}
