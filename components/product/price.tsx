import { BLACK_FRIDAY_PROMO } from "@/lib/black-friday"
import type { Offer } from "@/lib/catalog"
import { getDictionary, localeMeta, type Store } from "@/lib/i18n"
import { MARKETS, formatPrice } from "@/lib/markets"
import { cn } from "@/lib/utils"

export function Price({
  offer,
  store,
  size = "md",
  showNote = false,
}: {
  offer: Offer
  store: Store
  size?: "md" | "lg"
  showNote?: boolean
}) {
  const t = getDictionary(store)
  const locale = localeMeta(store).intlLocale
  const onSale = Boolean(offer.compareAtCents && offer.compareAtCents > offer.priceCents)
  const discountPct = onSale ? Math.round((1 - offer.priceCents / offer.compareAtCents!) * 100) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          data-testid="product-unit-price"
          data-price={(offer.priceCents / 100).toFixed(2)}
          data-currency={MARKETS[store.market].currency}
          className={cn(
            "font-mono font-semibold tabular-nums",
            size === "lg" ? "text-3xl" : "text-base",
            onSale && "text-primary",
          )}
        >
          {formatPrice(offer.priceCents, store.market, locale)}
        </span>
        {onSale && (
          <s className={cn("font-mono text-muted-foreground tabular-nums", size === "lg" ? "text-base" : "text-xs sm:text-sm")}>
            <span className="sr-only">{t.product.was} </span>
            {formatPrice(offer.compareAtCents!, store.market, locale)}
          </s>
        )}
        {onSale && discountPct > 0 && (
          <span
            className={cn(
              "inline-flex items-center rounded-sm bg-primary/15 font-mono font-bold uppercase tracking-wider text-primary",
              size === "lg" ? "px-2 py-0.5 text-xs" : "px-1.5 py-0.5 text-[10px]",
            )}
          >
            {size === "lg" && BLACK_FRIDAY_PROMO.active ? `BLACK FRIDAY −${discountPct}%` : `−${discountPct}%`}
          </span>
        )}
        {size === "md" && <span className="text-xs text-muted-foreground">{t.product.each}</span>}
      </div>
      {showNote && <p className="text-xs text-muted-foreground">{t.product.priceNote}</p>}
    </div>
  )
}
