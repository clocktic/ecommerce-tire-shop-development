import { NextResponse } from "next/server"
import { syncNgeniusOrderStatus } from "@/lib/payments/ngenius"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderNumber?: unknown }
    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : ""
    if (!orderNumber) {
      return NextResponse.json({ ok: false, error: "Missing orderNumber" }, { status: 400 })
    }

    const result = await syncNgeniusOrderStatus(orderNumber)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ ok: false, error: "Verification failed" }, { status: 500 })
  }
}
