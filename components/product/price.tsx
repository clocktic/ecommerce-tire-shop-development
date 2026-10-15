import type { Offer } from "@/lib/catalog"
import { getDictionary, localeMeta, type Store } from "@/lib/i18n"
import { formatPrice } from "@/lib/markets"
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
  const onSale = offer.compareAtCents && offer.compareAtCents > offer.priceCents
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span
          className={cn(
            "font-mono font-semibold tabular-nums",
            size === "lg" ? "text-3xl" : "text-base",
            onSale && "text-primary",
          )}
        >
          {formatPrice(offer.priceCents, store.market, locale)}
        </span>
        {onSale && (
          <s className="font-mono text-sm text-muted-foreground tabular-nums">
            <span className="sr-only">{t.product.was} </span>
            {formatPrice(offer.compareAtCents!, store.market, locale)}
          </s>
        )}
        {size === "md" && <span className="text-xs text-muted-foreground">{t.product.each}</span>}
      </div>
      {showNote && <p className="text-xs text-muted-foreground">{t.product.priceNote}</p>}
    </div>
  )
}
