import { NextResponse } from "next/server"
import { createShopifyCheckoutSession } from "@/lib/payments/shopify"

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let orderNumber = ""

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { orderNumber?: string }
      orderNumber = String(body.orderNumber ?? "").trim()
    } else {
      const form = await request.formData()
      orderNumber = String(form.get("orderNumber") ?? "").trim()
    }

    if (!orderNumber) {
      return NextResponse.json(
        { ok: false, error: "Missing orderNumber" },
        { status: 400 },
      )
    }

    const result = await createShopifyCheckoutSession(orderNumber)
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 })
    }

    if (contentType.includes("application/json")) {
      return NextResponse.json({
        ok: true,
        forwardUrl: result.forwardUrl,
        orderNumber,
      })
    }

    return NextResponse.redirect(result.forwardUrl, 303)
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 },
    )
  }
}
