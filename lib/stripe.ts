import "server-only"

import Stripe from "stripe"

function isRealStripeKey(value?: string | null): value is string {
  const trimmed = value?.trim()
  return Boolean(trimmed && !trimmed.endsWith("...") && trimmed.length > 20)
}

export function getStripeSecretKey(): string | null {
  if (isRealStripeKey(process.env.STRIPE_ACCESS_TOKEN)) {
    return process.env.STRIPE_ACCESS_TOKEN.trim()
  }
  if (isRealStripeKey(process.env.STRIPE_SECRET_KEY)) {
    return process.env.STRIPE_SECRET_KEY.trim()
  }
  return null
}

export function getStripePublishableKey(): string {
  if (isRealStripeKey(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)) {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.trim()
  }
  if (isRealStripeKey(process.env.STRIPE_PUBLISHABLE_KEY)) {
    return process.env.STRIPE_PUBLISHABLE_KEY.trim()
  }
  return "pk_live_51UVIKtEHrRmAWhugtYXVfQ6JDTblYIzU7XglJk6eo7ySSt0hcGOHRwmVkJ6mq4WnpfLSJjZPEJyNF0eSpyaEgkxJ00qR7yXhd0"
}

export const stripe = new Stripe(getStripeSecretKey() ?? process.env.STRIPE_SECRET_KEY ?? "sk_placeholder")
