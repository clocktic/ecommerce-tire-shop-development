"use client"

import Link from "next/link"
import { useState } from "react"
import { Check, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MAX_QUANTITY, useCart } from "@/components/cart/cart-provider"

type Props = {
  slug: string
  name: string
  image: string
  priceCents: number
  defaultQuantity: number
  disabled?: boolean
}

export function AddToCart({ slug, name, image, priceCents, defaultQuantity, disabled }: Props) {
  const { add, market } = useCart()
  const [quantity, setQuantity] = useState(defaultQuantity)
  const [added, setAdded] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-stretch gap-2">
        <div className="flex items-center border border-border bg-card" role="group" aria-label="Quantity">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-12 w-11 items-center justify-center hover:bg-muted"
            aria-label="Decrease quantity"
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
            aria-label="Increase quantity"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>
        <Button
          size="lg"
          className="flex-1"
          disabled={disabled}
          onClick={() => {
            add({ slug, name, image, priceCents, quantity })
            setAdded(true)
          }}
        >
          {added ? <Check aria-hidden="true" /> : null}
          {added ? "Added to cart" : "Add to cart"}
        </Button>
      </div>
      {added && (
        <Link href={`/${market}/cart`} className="text-sm underline underline-offset-4">
          View cart and checkout
        </Link>
      )}
    </div>
  )
}
