import Link from "next/link"
import { getBrandIconUrl } from "@/lib/brand-icons"
import { cn } from "@/lib/utils"

export function BrandFilterStrip({
  brands,
  activeBrand,
  basePath,
  currentFilters,
  allLabel,
}: {
  brands: Array<{ name: string; count: number }>
  activeBrand?: string
  basePath: string
  currentFilters: Record<string, string | undefined>
  allLabel: string
}) {
  if (brands.length === 0) return null

  function brandHref(brandName?: string) {
    const query = new URLSearchParams()
    for (const [k, v] of Object.entries(currentFilters)) {
      if (!v || k === "page" || k === "brand") continue
      query.set(k, v)
    }
    if (brandName) {
      query.set("brand", brandName)
    }
    const qs = query.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <nav
      aria-label="Filter by brand"
      className="flex items-center gap-2 overflow-x-auto border-b border-border py-3.5 [scrollbar-width:thin]"
    >
      <Link
        href={brandHref(undefined)}
        className={cn(
          "inline-flex h-10 shrink-0 items-center gap-2 border px-3 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5",
          !activeBrand
            ? "border-primary bg-primary text-primary-foreground shadow-[0_6px_18px_-4px_rgba(0,0,0,0.5)]"
            : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
        )}
      >
        <span>{allLabel}</span>
        <span className="opacity-75">({brands.length})</span>
      </Link>

      {brands.map(({ name, count }) => {
        const isSelected = activeBrand?.toLowerCase() === name.toLowerCase()
        const iconUrl = getBrandIconUrl(name)
        return (
          <Link
            key={name}
            href={brandHref(isSelected ? undefined : name)}
            aria-current={isSelected ? "true" : undefined}
            className={cn(
              "group inline-flex h-10 shrink-0 items-center gap-2 border px-2.5 transition-all duration-200 hover:-translate-y-0.5",
              isSelected
                ? "border-primary bg-primary/10 text-foreground shadow-[0_6px_18px_-4px_rgba(0,0,0,0.5)]"
                : "border-border bg-card text-foreground hover:border-foreground",
            )}
          >
            {iconUrl && (
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center border p-1 transition-colors",
                  isSelected
                    ? "border-primary/60 bg-background"
                    : "border-border bg-muted/60 group-hover:border-primary/50",
                )}
              >
                <img
                  src={iconUrl}
                  alt=""
                  aria-hidden="true"
                  width={16}
                  height={16}
                  loading="lazy"
                  className="size-full object-contain opacity-90 dark:invert"
                />
              </span>
            )}
            <span className="font-expanded text-xs font-extrabold uppercase tracking-wide group-hover:text-primary">
              {name}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">({count})</span>
          </Link>
        )
      })}
    </nav>
  )
}
