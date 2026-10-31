"use client"

import { ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { CartSheet } from "@/components/cart/cart-sheet"
import { useI18n } from "@/components/i18n/i18n-provider"
import { fmt } from "@/lib/i18n/fmt"

export function CartButton() {
  const { count, setOpen } = useCart()
  const { t } = useI18n()
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 p-2 text-sm font-medium transition-colors hover:text-primary"
        aria-label={fmt(t.cart.aria, { n: count })}
      >
        <ShoppingBag className="size-5" aria-hidden="true" />
        <span className="hidden font-mono text-xs uppercase tracking-[0.18em] @min-[1100px]/header:inline">
          {t.common.cart}
        </span>
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground @min-[1100px]/header:static @min-[1100px]/header:min-w-5 @min-[1100px]/header:text-xs"
        >
          {count}
        </span>
      </button>
      <CartSheet />
    </>
  )
}
