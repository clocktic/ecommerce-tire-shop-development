// Temporarily disable PayPal in checkout UI, badges, and policies while account verification is pending.
// Flip to `true` to re-enable PayPal everywhere.
export const PAYPAL_CHECKOUT_ENABLED = false

export const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  "BAAXQHJ2tSH-f1Fe3l77oVoG5zApV8tpWLQ0e46xNOz42a7b3m3mOrOOVifL6mKAiPzBAV7a8o8yNKCTGY"

export const PAYPAL_WEBHOOK_ID =
  process.env.PAYPAL_WEBHOOK_ID || "5FC25015H5830411W"

