"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { useI18n } from "@/components/i18n/i18n-provider"
import { fmt } from "@/lib/i18n/fmt"
import { storePath } from "@/lib/i18n/config"

export function CartButton() {
  const { count } = useCart()
  const { store, t } = useI18n()
  return (
    <Link
      href={storePath(store, "/cart")}
      className="relative flex items-center gap-2 px-2 py-2 text-sm font-medium hover:text-primary"
      aria-label={fmt(t.cart.aria, { n: count })}
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      <span className="hidden font-mono text-xs uppercase tracking-[0.18em] md:inline">{t.common.cart}</span>
      <span
        aria-hidden="true"
        className="flex min-w-5 items-center justify-center bg-foreground px-1 font-mono text-xs text-background"
      >
        {count}
      </span>
    </Link>
  )
}
