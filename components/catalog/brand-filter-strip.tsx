import Link from "next/link"
import { getProductBrandIconUrl } from "@/lib/brand-icons"
import { cn } from "@/lib/utils"

export function BrandFilterStrip({
  brands,
  activeBrand,
  basePath,
  currentFilters,
  allLabel,
  ariaLabel = "Filter by brand",
}: {
  brands: Array<{ name: string; count: number }>
  activeBrand?: string
  basePath: string
  currentFilters: Record<string, string | undefined>
  allLabel: string
  ariaLabel?: string
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
      aria-label={ariaLabel}
      className="flex items-center gap-2 overflow-x-auto border-b border-border py-3.5 [scrollbar-width:thin]"
    >
      <Link
        href={brandHref(undefined)}
        className={cn(
          "inline-flex h-11 shrink-0 items-center gap-2 border px-3.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5",
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
        const iconUrl = getProductBrandIconUrl(name)
        return (
          <Link
            key={name}
            href={brandHref(isSelected ? undefined : name)}
            aria-current={isSelected ? "true" : undefined}
            title={`${name} (${count})`}
            className={cn(
              "group inline-flex h-11 shrink-0 items-center gap-2.5 border p-1.5 pr-3 transition-all duration-200 hover:-translate-y-0.5",
              isSelected
                ? "border-primary bg-primary/15 text-foreground ring-1 ring-primary/50 shadow-[0_6px_18px_-4px_rgba(0,0,0,0.5)]"
                : "border-border bg-card text-foreground hover:border-foreground",
            )}
          >
            {iconUrl && (
              <span className="flex h-8 min-w-[72px] shrink-0 items-center justify-center border border-border/70 bg-white px-2.5 py-1">
                <img
                  src={iconUrl}
                  alt={name}
                  loading="lazy"
                  className="h-5 w-auto max-w-[92px] object-contain"
                />
              </span>
            )}
            <span className="font-mono text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">
              ({count})
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
