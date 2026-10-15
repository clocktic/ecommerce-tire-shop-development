"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, X } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { MAX_QUANTITY, useCart } from "@/components/cart/cart-provider"
import { MARKETS, formatPrice } from "@/lib/markets"
import { POLICIES, deliveryLabel } from "@/lib/policies"
import { cn } from "@/lib/utils"

export function CartView() {
  const { market, lines, subtotalCents, setQuantity, remove } = useCart()
  const shipping = POLICIES[market].shipping

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-16">
        <p className="font-expanded text-xl font-extrabold uppercase">Your cart is empty</p>
        <Link href={`/${market}/tires`} className={buttonVariants({ size: "lg" })}>
          Shop tires
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-10 py-8 lg:grid-cols-12">
      <ul className="flex flex-col divide-y divide-border border-y border-border lg:col-span-8">
        {lines.map((line) => (
          <li key={line.slug} className="flex gap-4 py-4">
            <div className="relative size-24 shrink-0 bg-photo">
              <Image src={line.image || "/placeholder.svg"} alt="" fill sizes="96px" className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <Link href={`/${market}/product/${line.slug}`} className="font-semibold leading-snug hover:text-primary">
                  {line.name}
                </Link>
                <button
                  type="button"
                  onClick={() => remove(line.slug)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${line.name}`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center border border-border" role="group" aria-label={`Quantity for ${line.name}`}>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.slug, line.quantity - 1)}
                    className="flex size-9 items-center justify-center hover:bg-muted"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-3.5" aria-hidden="true" />
                  </button>
                  <span className="w-8 text-center font-mono text-sm tabular-nums">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.slug, line.quantity + 1)}
                    disabled={line.quantity >= MAX_QUANTITY}
                    className="flex size-9 items-center justify-center hover:bg-muted disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
                <span className="font-mono font-semibold tabular-nums">
                  {formatPrice(line.priceCents * line.quantity, market)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside aria-labelledby="summary-title" className="flex flex-col gap-4 border border-border bg-card p-5 lg:col-span-4 lg:self-start">
        <h2 id="summary-title" className="label-caps">
          Order summary
        </h2>
        <SummaryRows subtotalCents={subtotalCents} />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Delivery in {deliveryLabel(market)} to {shipping.area}.
        </p>
        <Link href={`/${market}/checkout`} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
          Checkout
        </Link>
      </aside>
    </div>
  )
}

export function SummaryRows({ subtotalCents }: { subtotalCents: number }) {
  const { market } = useCart()
  const shipping = POLICIES[market].shipping
  const total = subtotalCents + shipping.rateCents
  return (
    <dl className="flex flex-col gap-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="font-mono tabular-nums">{formatPrice(subtotalCents, market)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Shipping</dt>
        <dd className="font-mono tabular-nums">{shipping.rateCents === 0 ? "Free" : formatPrice(shipping.rateCents, market)}</dd>
      </div>
      {market === "us" && (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Sales tax</dt>
          <dd className="font-mono text-muted-foreground">At checkout</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
        <dt>Total</dt>
        <dd className="font-mono tabular-nums">{formatPrice(total, market)}</dd>
      </div>
      {market === "eu" && <p className="text-xs text-muted-foreground">{MARKETS.eu.priceNote}.</p>}
    </dl>
  )
}
