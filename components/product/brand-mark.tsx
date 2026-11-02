import Link from "next/link"
import { getProductBrandIconUrl } from "@/lib/brand-icons"
import { cn } from "@/lib/utils"

export function BrandMark({
  brand,
  size = "xs",
  className,
}: {
  brand: string
  size?: "xs" | "sm" | "md"
  className?: string
  textClassName?: string
}) {
  const iconUrl = getProductBrandIconUrl(brand)

  const plateSizes = {
    xs: "h-5 px-2 py-0.5",
    sm: "h-6 px-2.5 py-0.5",
    md: "h-7 px-3 py-1",
  }[size]

  const imgSizes = {
    xs: "h-3.5 max-w-[82px]",
    sm: "h-4 max-w-[96px]",
    md: "h-5 max-w-[116px]",
  }[size]

  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center border border-border/80 bg-white shadow-2xs",
        plateSizes,
        className,
      )}
      title={brand}
    >
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={brand}
          loading="lazy"
          className={cn("w-auto object-contain", imgSizes)}
        />
      ) : (
        <span className="label-caps text-[10px] text-zinc-900">{brand}</span>
      )}
    </span>
  )
}

export function BrandBadge({
  brand,
  href,
  className,
}: {
  brand: string
  href?: string
  className?: string
}) {
  const iconUrl = getProductBrandIconUrl(brand)

  const inner = (
    <>
      {iconUrl && (
        <span className="flex h-7 shrink-0 items-center justify-center border border-border/80 bg-white px-2.5 py-1 transition-colors group-hover:border-primary/60">
          <img
            src={iconUrl}
            alt={brand}
            loading="lazy"
            className="h-4.5 w-auto max-w-[110px] object-contain"
          />
        </span>
      )}
      <span className="label-caps text-xs text-muted-foreground transition-colors group-hover:text-primary">
        {brand}
      </span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "group inline-flex w-fit items-center gap-2.5 border border-border bg-card p-1 pr-3 transition-colors hover:border-primary",
          className,
        )}
      >
        {inner}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        "inline-flex w-fit items-center gap-2.5 border border-border bg-card p-1 pr-3",
        className,
      )}
    >
      {inner}
    </div>
  )
}
