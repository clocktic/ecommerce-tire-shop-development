# Stripe Integration — TODO

Hosted Stripe Checkout: the customer is redirected to a Stripe-hosted payment page for an existing TiresShop order.

## Values to Replace

No placeholder values are left in code. The `sample_only` fields use real values from the store:

**Files containing these values:**
- [app/api/payments/stripe/checkout/route.ts](app/api/payments/stripe/checkout/route.ts)

| Field | Current Value | Notes |
|-------|--------------|-------|
| mode | `payment` | Tyres are one-time purchases. Switch to `subscription` only if you sell recurring products (then also add `payment_method_collection: "always"`). |
| success_url | `{DOMAIN}/{market}/{lang}/order/{orderNumber}?session_id={CHECKOUT_SESSION_ID}` | Existing order page. `DOMAIN` env var is used; falls back to the request origin if empty. |
| cancel_url | `{DOMAIN}/{market}/{lang}/order/{orderNumber}` | Customer returns to the order page and can retry. |
| line_items | Built from the stored order (`price_data`) | Prices come from the `orders` / `order_items` tables computed server-side at order placement, not from Stripe Price IDs. If a member discount applies, a single line "Order TS-…" with the final total is sent so the Stripe amount always equals `orders.total_cents`. |

## Configured Parameters

These parameters were configured in Checkout Studio and are already set correctly.

**Files containing these parameters:**
- [app/api/payments/stripe/checkout/route.ts](app/api/payments/stripe/checkout/route.ts)

| Parameter | Value |
|-----------|-------|
| ui_mode | `hosted_page` (installed `stripe` SDK is v23.1.0, so the v21+ value is used) |
| billing_address_collection | `auto` |
| phone_number_collection | `{ enabled: true }` |
| automatic_tax | `{ enabled: false }` |
| allow_promotion_codes | `false` |
| payment_method_collection | omitted, since `mode` is `payment` |
| submit_type | `auto` |
| consent_collection | `{ terms_of_service: "required" }` |
| integration_identifier | `hosted_web_0001` |
| origin_context | `web` |

## Setup

1. **Environment variables** (already present in the Vercel project): `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. Success/cancel URLs are built from the request host, so they work on `firewheels.vercel.app` now and on the custom domain later without changes.
2. **Terms of Service URL**: `consent_collection.terms_of_service: "required"` fails unless a Terms of Service URL is set in Stripe Dashboard → Settings → Public details (https://dashboard.stripe.com/settings/public). Currently `https://firewheels.vercel.app/us/en/policies/terms` (or `/eu/en/policies/terms`); update to the custom domain when it goes live.
3. **Webhook endpoint**: Stripe Dashboard → Workbench → Webhooks (https://dashboard.stripe.com/workbench/webhooks) → add `https://firewheels.vercel.app/api/payments/stripe/webhook` (switch to the custom domain later; the signing secret changes if you create a new endpoint) with events `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. **Dependency**: `stripe` (v23.1.0) was added to `package.json`. The API version is not pinned in code, so the SDK default is used.

## New Files

```
lib/stripe.ts                                  Server-only Stripe client
app/api/payments/stripe/checkout/route.ts      POST: creates the Checkout Session and redirects (303)
app/api/payments/stripe/webhook/route.ts       Verifies signature, marks order paid
```

## How It Works

1. The existing checkout (`lib/actions/checkout.ts`) creates the order with status `pending` and server-side totals.
2. A form posts `orderNumber` to `/api/payments/stripe/checkout`. The endpoint loads the pending order, builds line items from the stored amounts and redirects to the Stripe-hosted page. An idempotency key (`checkout_{orderId}_{total}`) prevents duplicate sessions on retries.
3. After payment, Stripe redirects to the order page and sends `checkout.session.completed` to the webhook.
4. The webhook calls the existing `confirmOrderPayment()`, which sets the order to `paid` and sends the Telegram "order paid" notification (safe against duplicate deliveries).

### Not wired into the UI yet

The current checkout still sends customers to CGPayTech. To offer Stripe, add a button where you want it (for example on the order page for `pending` orders):

```tsx
<form action="/api/payments/stripe/checkout" method="POST">
  <input type="hidden" name="orderNumber" value={order.orderNumber} />
  <button type="submit">Pay by card (Stripe)</button>
</form>
```

## Testing

Use test-mode keys and these cards (any future expiry date, any CVC, any postal code):

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0000 0000 9995` | Declined (insufficient funds) |

Forward webhooks locally with the Stripe CLI: `stripe listen --forward-to localhost:3000/api/payments/stripe/webhook`.

## Next Steps

- Decide whether Stripe replaces CGPayTech in `placeOrder()` or is offered alongside it, then add the button above.
- Optionally save `session.id` / `payment_intent` on the order (needs a new column in `orders`) for refunds and reconciliation.
- Switch to live keys after testing.

## Resources

- https://support.stripe.com
- https://docs.stripe.com/mcp
