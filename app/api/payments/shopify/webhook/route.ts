import { NextResponse } from "next/server"
import {
  handleShopifyOrderPaidWebhook,
  SHOPIFY_STORE_DOMAIN,
  verifyShopifyWebhookHmac,
} from "@/lib/payments/shopify"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const hmac = request.headers.get("x-shopify-hmac-sha256")
    if (!verifyShopifyWebhookHmac(rawBody, hmac)) {
      return NextResponse.json(
        { received: false, error: "Invalid Shopify HMAC signature" },
        { status: 401 },
      )
    }

    const payload = JSON.parse(rawBody) as {
      id?: number | string
      order_number?: number | string
      financial_status?: string
      note?: string | null
      note_attributes?: Array<{ name?: string; value?: string }>
    }

    await handleShopifyOrderPaidWebhook(payload)
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ received: false }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    provider: "shopify-webhook",
    shop: SHOPIFY_STORE_DOMAIN,
  })
}
