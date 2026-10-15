import type { Offer } from "@/lib/catalog"
import { MARKETS, formatPrice, type Market } from "@/lib/markets"
import { cn } from "@/lib/utils"

export function Price({
  offer,
  market,
  size = "md",
  showNote = false,
}: {
  offer: Offer
  market: Market
  size?: "md" | "lg"
  showNote?: boolean
}) {
  const onSale = offer.compareAtCents && offer.compareAtCents > offer.priceCents
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-mono font-semibold tabular-nums",
            size === "lg" ? "text-3xl" : "text-base",
            onSale && "text-primary",
          )}
        >
          {formatPrice(offer.priceCents, market)}
        </span>
        {onSale && (
          <s className="font-mono text-sm text-muted-foreground tabular-nums">
            <span className="sr-only">Was </span>
            {formatPrice(offer.compareAtCents!, market)}
          </s>
        )}
        {size === "md" && <span className="text-xs text-muted-foreground">/ each</span>}
      </div>
      {showNote && <p className="text-xs text-muted-foreground">{MARKETS[market].priceNote} · price per unit</p>}
    </div>
  )
}

export const AVAILABILITY_LABEL = {
  in_stock: "In stock",
  out_of_stock: "Out of stock",
  preorder: "Pre-order",
} as const
