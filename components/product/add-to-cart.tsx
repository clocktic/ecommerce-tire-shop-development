"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Check, Minus, Plus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MAX_QUANTITY, useCart } from "@/components/cart/cart-provider"
import { useI18n } from "@/components/i18n/i18n-provider"
import { storePath } from "@/lib/i18n/config"
import { formatPrice } from "@/lib/markets"

type Props = {
  slug: string
  name: string
  image: string
  priceCents: number
  defaultQuantity: number
  showSetPreset?: boolean
  disabled?: boolean
}

export function AddToCart({ slug, name, image, priceCents, defaultQuantity, showSetPreset, disabled }: Props) {
  const { add } = useCart()
  const { store, t, intl } = useI18n()
  const [quantity, setQuantity] = useState(defaultQuantity)
  const [added, setAdded] = useState(false)
  const [showSticky, setShowSticky] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 72)
      },
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (showSticky) root.dataset.stickyBuy = ""
    else delete root.dataset.stickyBuy
    return () => {
      delete root.dataset.stickyBuy
    }
  }, [showSticky])

  const handleAdd = () => {
    add({ slug, name, image, priceCents, quantity })
    setAdded(true)
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      <div className="flex items-stretch gap-2">
        <div
          className="flex items-center border border-border bg-card shadow-chip transition-transform duration-200 hover:-translate-y-0.5"
          role="group"
          aria-label={t.product.quantity}
        >
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-12 w-11 items-center justify-center hover:bg-muted"
            aria-label={t.product.decrease}
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <output className="w-8 text-center font-mono text-base tabular-nums" aria-live="polite">
            {quantity}
          </output>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
            className="flex h-12 w-11 items-center justify-center hover:bg-muted"
            aria-label={t.product.increase}
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
        {showSetPreset && (
          <div className="flex items-stretch border border-border bg-card font-mono text-xs font-semibold">
            <button
              type="button"
              onClick={() => setQuantity(1)}
              aria-pressed={quantity === 1}
              className={`px-2.5 transition-colors ${quantity === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              1×
            </button>
            <button
              type="button"
              onClick={() => setQuantity(4)}
              aria-pressed={quantity === 4}
              className={`border-l border-border px-2.5 transition-colors ${quantity === 4 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              4×
            </button>
          </div>
        )}
        <Button size="lg" className="flex-1" disabled={disabled} onClick={handleAdd}>
          {added ? <Check aria-hidden="true" /> : null}
          {added ? t.product.added : t.product.add}
        </Button>
      </div>
      {added && (
        <Link href={storePath(store, "/cart")} className="text-sm underline underline-offset-4">
          {t.product.viewCart}
        </Link>
      )}

      {/* Mobile Sticky Quick-Buy Bar when main CTA scrolls above viewport */}
      {showSticky && (
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 animate-in fade-in slide-in-from-bottom-4 duration-200 border-t border-border bg-card/95 px-3 py-2.5 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-2.5">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-semibold">{name}</span>
              <span className="font-mono text-xs font-bold text-primary tabular-nums">
                {quantity} × {formatPrice(priceCents, store.market, intl)}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <div className="flex items-center border border-border bg-background">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex size-9 items-center justify-center hover:bg-muted"
                  aria-label={t.product.decrease}
                >
                  <Minus className="size-3.5" aria-hidden="true" />
                </button>
                <span className="w-6 text-center font-mono text-xs font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                  className="flex size-9 items-center justify-center hover:bg-muted"
                  aria-label={t.product.increase}
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                </button>
              </div>
              <Button size="sm" className="h-9 gap-1.5 px-3" disabled={disabled} onClick={handleAdd}>
                {added ? <Check className="size-3.5" aria-hidden="true" /> : <ShoppingBag className="size-3.5" aria-hidden="true" />}
                <span>{added ? t.product.added : t.product.add}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
