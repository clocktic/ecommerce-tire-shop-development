import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isMarket } from "@/lib/markets"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata: Metadata = { title: "Checkout", robots: { index: false } }

export default async function CheckoutPage({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params
  if (!isMarket(market)) notFound()
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs
        items={[{ href: `/${market}`, label: "Home" }, { href: `/${market}/cart`, label: "Cart" }, { label: "Checkout" }]}
      />
      <h1 className="font-expanded text-4xl font-extrabold uppercase">Checkout</h1>
      <CheckoutForm />
    </div>
  )
}
