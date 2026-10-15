"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"

export function CartButton() {
  const { market, count } = useCart()
  return (
    <Link
      href={`/${market}/cart`}
      className="relative flex items-center gap-2 px-2 py-2 text-sm font-medium hover:text-primary"
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      <span className="hidden font-mono text-xs uppercase tracking-[0.18em] md:inline">Cart</span>
      <span
        aria-hidden="true"
        className="flex min-w-5 items-center justify-center bg-foreground px-1 font-mono text-xs text-background"
      >
        {count}
      </span>
    </Link>
  )
}
