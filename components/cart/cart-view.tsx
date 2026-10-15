"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, X } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { MAX_QUANTITY, useCart } from "@/components/cart/cart-provider"
import { useI18n } from "@/components/i18n/i18n-provider"
import { fmt } from "@/lib/i18n/fmt"
import { storePath } from "@/lib/i18n/config"
import { formatPrice } from "@/lib/markets"
import { POLICIES } from "@/lib/policies"
import { cn } from "@/lib/utils"

export function CartView() {
  const { lines, subtotalCents, setQuantity, remove } = useCart()
  const { store, t, intl } = useI18n()
  const { market } = store

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-16">
        <p className="font-expanded text-xl font-extrabold uppercase">{t.cart.empty}</p>
        <Link href={storePath(store, "/tires")} className={buttonVariants({ size: "lg" })}>
          {t.cart.shopTires}
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
                <Link href={storePath(store, `/product/${line.slug}`)} className="font-semibold leading-snug hover:text-primary">
                  {line.name}
                </Link>
                <button
                  type="button"
                  onClick={() => remove(line.slug)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                  aria-label={fmt(t.cart.remove, { name: line.name })}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center border border-border" role="group" aria-label={fmt(t.cart.quantityFor, { name: line.name })}>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.slug, line.quantity - 1)}
                    className="flex size-9 items-center justify-center hover:bg-muted"
                    aria-label={t.product.decrease}
                  >
                    <Minus className="size-3.5" aria-hidden="true" />
                  </button>
                  <span className="w-8 text-center font-mono text-sm tabular-nums">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.slug, line.quantity + 1)}
                    disabled={line.quantity >= MAX_QUANTITY}
                    className="flex size-9 items-center justify-center hover:bg-muted disabled:opacity-40"
                    aria-label={t.product.increase}
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
                <span className="font-mono font-semibold tabular-nums">
                  {formatPrice(line.priceCents * line.quantity, market, intl)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside aria-labelledby="summary-title" className="flex flex-col gap-4 border border-border bg-card p-5 lg:col-span-4 lg:self-start">
        <h2 id="summary-title" className="label-caps">
          {t.cart.summary}
        </h2>
        <SummaryRows subtotalCents={subtotalCents} />
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t.cart.delivery}
        </p>
        <Link href={storePath(store, "/checkout")} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
          {t.cart.checkout}
        </Link>
      </aside>
    </div>
  )
}

export function SummaryRows({ subtotalCents }: { subtotalCents: number }) {
  const { store, t, intl } = useI18n()
  const { market } = store
  const shipping = POLICIES[market].shipping
  const total = subtotalCents + shipping.rateCents
  return (
    <dl className="flex flex-col gap-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">{t.cart.subtotal}</dt>
        <dd className="font-mono tabular-nums">{formatPrice(subtotalCents, market, intl)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">{t.cart.shipping}</dt>
        <dd className="font-mono tabular-nums">
          {shipping.rateCents === 0 ? t.common.free : formatPrice(shipping.rateCents, market, intl)}
        </dd>
      </div>
      {t.cart.tax && (
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{t.cart.tax.label}</dt>
          <dd className="font-mono text-muted-foreground">{t.cart.tax.value}</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
        <dt>{t.cart.total}</dt>
        <dd className="font-mono tabular-nums">{formatPrice(total, market, intl)}</dd>
      </div>
      {t.cart.priceNote && <p className="text-xs text-muted-foreground">{t.cart.priceNote}</p>}
    </dl>
  )
}
