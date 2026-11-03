import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { confirmOrderPayment } from "@/lib/payments/confirm"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get("stripe-signature")
  if (!secret || !signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret)
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object
    const orderNumber = session.metadata?.orderNumber ?? session.client_reference_id
    if (orderNumber && session.payment_status === "paid") {
      const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id
      await confirmOrderPayment({
        orderNumber,
        paymentMethod: "Stripe Checkout",
        transactionId: paymentIntent ?? session.id,
      })
    }
  }

  return NextResponse.json({ received: true })
}
