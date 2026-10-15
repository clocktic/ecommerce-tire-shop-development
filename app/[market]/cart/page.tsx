import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { isMarket } from "@/lib/markets"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { CartView } from "@/components/cart/cart-view"

export const metadata: Metadata = { title: "Cart", robots: { index: false } }

export default async function CartPage({ params }: { params: Promise<{ market: string }> }) {
  const { market } = await params
  if (!isMarket(market)) notFound()
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <Breadcrumbs items={[{ href: `/${market}`, label: "Home" }, { label: "Cart" }]} />
      <h1 className="font-expanded text-4xl font-extrabold uppercase">Cart</h1>
      <CartView />
    </div>
  )
}
