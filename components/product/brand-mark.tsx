import Link from "next/link"
import { getBrandIconUrl } from "@/lib/brand-icons"
import { cn } from "@/lib/utils"

export function BrandMark({
  brand,
  size = "xs",
  className,
  textClassName,
}: {
  brand: string
  size?: "xs" | "sm" | "md"
  className?: string
  textClassName?: string
}) {
  const iconUrl = getBrandIconUrl(brand)

  const boxSizes = {
    xs: "size-5 p-0.5",
    sm: "size-6 p-1",
    md: "size-8 p-1.5",
  }[size]

  const imgSizes = {
    xs: 14,
    sm: 16,
    md: 20,
  }[size]

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      {iconUrl && (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center border border-border bg-muted/60",
            boxSizes,
          )}
        >
          <img
            src={iconUrl}
            alt=""
            aria-hidden="true"
            width={imgSizes}
            height={imgSizes}
            loading="lazy"
            className="size-full object-contain opacity-90 dark:invert"
          />
        </span>
      )}
      <span
        className={cn(
          "label-caps truncate text-[10px] text-muted-foreground sm:text-xs",
          textClassName,
        )}
      >
        {brand}
      </span>
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
  const iconUrl = getBrandIconUrl(brand)

  const inner = (
    <>
      {iconUrl && (
        <span className="flex size-7 shrink-0 items-center justify-center border border-border bg-muted/60 p-1 transition-colors group-hover:border-primary/50">
          <img
            src={iconUrl}
            alt=""
            aria-hidden="true"
            width={18}
            height={18}
            loading="lazy"
            className="size-full object-contain opacity-90 dark:invert"
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
          "group inline-flex w-fit items-center gap-2 border border-border bg-card px-2.5 py-1 transition-colors hover:border-primary",
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
        "inline-flex w-fit items-center gap-2 border border-border bg-card px-2.5 py-1",
        className,
      )}
    >
      {inner}
    </div>
  )
}
