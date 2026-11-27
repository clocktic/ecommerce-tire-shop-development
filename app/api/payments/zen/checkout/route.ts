import { NextResponse } from "next/server"
import { createZenHostedForm } from "@/lib/payments/zen"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderNumber?: unknown }
    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : ""
    if (!orderNumber) {
      return NextResponse.json({ ok: false, error: "Missing orderNumber" }, { status: 400 })
    }

    const result = await createZenHostedForm(orderNumber)
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      forwardUrl: result.forwardUrl,
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to start Zen Payments checkout" },
      { status: 500 },
    )
  }
}
