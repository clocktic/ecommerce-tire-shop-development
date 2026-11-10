import { NextResponse } from "next/server"
import { handlePayPalWebhookEvent } from "@/lib/payments/paypal"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      event_type?: string
      resource?: Record<string, unknown>
    }
    await handlePayPalWebhookEvent(body)
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ received: false }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", provider: "paypal-webhook" })
}
