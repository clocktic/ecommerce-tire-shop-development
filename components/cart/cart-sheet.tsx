"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MAX_QUANTITY, useCart } from "@/components/cart/cart-provider"
import { SummaryRows } from "@/components/cart/cart-view"
import { useI18n } from "@/components/i18n/i18n-provider"
import { PAYMENT_BRAND_ICONS, theSvgUrl } from "@/lib/brand-icons"
import { fmt } from "@/lib/i18n/fmt"
import { storePath } from "@/lib/i18n/config"
import { formatPrice } from "@/lib/markets"
import { cn } from "@/lib/utils"

export function CartSheet() {
  const { lines, count, subtotalCents, open, setOpen, setQuantity, remove } = useCart()
  const { store, t, intl } = useI18n()
  const { market } = store

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-border bg-background p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border bg-card px-5 py-4">
          <div className="flex items-center gap-2.5 pr-8">
            <ShoppingBag className="size-5 text-primary" aria-hidden="true" />
            <SheetTitle className="font-expanded text-lg font-extrabold uppercase tracking-tight">
              {t.cart.title}
            </SheetTitle>
            <Badge variant="secondary" className="font-mono text-xs tabular-nums">
              {count}
            </Badge>
          </div>
          <SheetDescription className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <Truck className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span>{t.topbar.shipping} · {t.policy.days}</span>
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center border border-border bg-muted/40">
              <ShoppingBag className="size-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-expanded text-base font-extrabold uppercase">{t.cart.empty}</p>
              <p className="text-xs text-muted-foreground">{t.cart.delivery}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Link
                href={storePath(store, "/tires")}
                onClick={() => setOpen(false)}
                className={buttonVariants({ size: "sm" })}
              >
                {t.categories.tires.name}
              </Link>
              <Link
                href={storePath(store, "/wheels")}
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {t.categories.wheels.name}
              </Link>
              <Link
                href={storePath(store, "/brakes")}
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {t.categories.brakes.name}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex flex-1 flex-col divide-y divide-border overflow-y-auto px-5">
              {lines.map((line) => (
                <li key={line.slug} className="flex gap-3.5 py-4">
                  <Link
                    href={storePath(store, `/product/${line.slug}`)}
                    onClick={() => setOpen(false)}
                    className="relative size-20 shrink-0 overflow-hidden border border-border bg-photo"
                  >
                    <Image
                      src={line.image || "/placeholder.svg"}
                      alt={line.name}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={storePath(store, `/product/${line.slug}`)}
                        onClick={() => setOpen(false)}
                        className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary"
                      >
                        {line.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(line.slug)}
                        className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-destructive"
                        aria-label={fmt(t.cart.remove, { name: line.name })}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="flex items-center border border-border bg-card"
                        role="group"
                        aria-label={fmt(t.cart.quantityFor, { name: line.name })}
                      >
                        <button
                          type="button"
                          onClick={() => setQuantity(line.slug, line.quantity - 1)}
                          className="flex size-7 items-center justify-center hover:bg-muted"
                          aria-label={t.product.decrease}
                        >
                          <Minus className="size-3" aria-hidden="true" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.slug, line.quantity + 1)}
                          disabled={line.quantity >= MAX_QUANTITY}
                          className="flex size-7 items-center justify-center hover:bg-muted disabled:opacity-40"
                          aria-label={t.product.increase}
                        >
                          <Plus className="size-3" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-sm font-semibold tabular-nums">
                          {formatPrice(line.priceCents * line.quantity, market, intl)}
                        </span>
                        {line.quantity > 1 && (
                          <span className="block font-mono text-[11px] text-muted-foreground tabular-nums">
                            {line.quantity} × {formatPrice(line.priceCents, market, intl)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <SheetFooter className="border-t border-border bg-card px-5 py-4">
              <SummaryRows subtotalCents={subtotalCents} />
              <Separator className="my-1" />
              <div className="flex flex-col gap-2">
                <Link
                  href={storePath(store, "/checkout")}
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ size: "lg" }), "w-full justify-between font-bold uppercase tracking-wide")}
                >
                  <span>{t.cart.checkout}</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={storePath(store, "/cart")}
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
                  >
                    {t.product.viewCart}
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(false)}
                    className="w-full"
                  >
                    {t.product.notSold.back}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
                  {t.policy.warranty}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  {PAYMENT_BRAND_ICONS.slice(0, 4).map((icon) => (
                    <span
                      key={icon.slug}
                      title={icon.name}
                      className="flex h-5 items-center justify-center border border-border bg-white px-1.5"
                    >
                      <img
                        src={theSvgUrl(icon.slug, "default")}
                        alt={icon.name}
                        width={20}
                        height={12}
                        loading="lazy"
                        className="h-3 w-auto object-contain"
                      />
                    </span>
                  ))}
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
