import { NextResponse } from "next/server"
import {
  processZenWebhook,
  verifyZenWebhookSignature,
  type ZenWebhookPayload,
} from "@/lib/payments/zen"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    let payload: ZenWebhookPayload
    try {
      payload = JSON.parse(rawBody) as ZenWebhookPayload
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
    }

    const signatureHeader = request.headers.get("webhook-signature")
    if (process.env.ZEN_WEBHOOK_SIGNATURE?.trim()) {
      const valid = verifyZenWebhookSignature(signatureHeader, payload)
      if (!valid) {
        return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 })
      }
    }

    const result = await processZenWebhook(payload)
    return NextResponse.json({ ok: result.ok, handled: result.handled })
  } catch {
    return NextResponse.json({ ok: false, error: "Webhook processing failed" }, { status: 500 })
  }
}
