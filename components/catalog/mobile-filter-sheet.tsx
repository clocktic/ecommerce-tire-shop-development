"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowUpDown, ChevronDown, SlidersHorizontal, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type QuickPill = {
  key: string
  value: string
  label: string
}

export function MobileCatalogToolbar({
  title,
  activeCount,
  clearHref,
  clearLabel,
  applyLabel,
  sortValue,
  sortOptions,
  quickPills,
  activeQuickValue,
  quickParamKey,
  children,
}: {
  title: string
  activeCount: number
  clearHref: string
  clearLabel: string
  applyLabel: string
  sortValue?: string
  sortOptions: Array<{ value: string; label: string }>
  quickPills?: QuickPill[]
  activeQuickValue?: string
  quickParamKey?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    next.delete("page")
    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border py-3.5 md:hidden">
      <div className="grid grid-cols-2 gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="h-11 justify-between border-border bg-card px-3.5 font-mono text-xs font-semibold uppercase tracking-wider"
              />
            }
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
              <span>{title}</span>
            </span>
            {activeCount > 0 && (
              <Badge className="h-5 min-w-5 rounded-none px-1.5 font-mono text-[10px] tabular-nums">
                {activeCount}
              </Badge>
            )}
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="flex max-h-[86dvh] flex-col gap-0 rounded-none border-t border-foreground/30 bg-background p-0"
          >
            <SheetHeader className="shrink-0 border-b border-border bg-card px-4 py-3.5 pr-12 text-left">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
                <SheetTitle className="font-expanded text-base font-extrabold uppercase tracking-wide">
                  {title}
                </SheetTitle>
                {activeCount > 0 && (
                  <Badge variant="secondary" className="rounded-none font-mono text-xs">
                    {activeCount}
                  </Badge>
                )}
              </div>
            </SheetHeader>

            <form
              method="get"
              onSubmit={() => setOpen(false)}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              {searchParams.get("vehicle") && (
                <input type="hidden" name="vehicle" value={searchParams.get("vehicle")!} />
              )}
              <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-4">
                {children}
              </div>

              <SheetFooter className="shrink-0 flex-row items-center gap-2 border-t border-border bg-card p-4">
                {activeCount > 0 && (
                  <Link
                    href={clearHref}
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "gap-1.5 px-4 font-mono text-xs uppercase",
                    )}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                    {clearLabel}
                  </Link>
                )}
                <Button type="submit" size="lg" className="flex-1">
                  {applyLabel}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        {/* Quick Sort Dropdown */}
        <div className="relative flex min-w-0 items-center">
          <ArrowUpDown
            className="pointer-events-none absolute left-2.5 size-3.5 text-primary"
            aria-hidden="true"
          />
          <select
            aria-label="Sort"
            value={sortValue ?? ""}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="h-11 w-full truncate appearance-none border border-border bg-card pl-7 pr-6 font-mono text-[11px] font-semibold uppercase tracking-wide text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Horizontal quick-filter pills (e.g. tire seasons or wheel finishes) */}
      {quickPills && quickPills.length > 0 && quickParamKey && (
        <div className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => updateParam(quickParamKey, "")}
            className={cn(
              "shrink-0 border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors",
              !activeQuickValue
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {quickPills.map((pill) => {
            const isSelected = activeQuickValue === pill.value
            return (
              <button
                key={pill.value}
                type="button"
                onClick={() => updateParam(quickParamKey, isSelected ? "" : pill.value)}
                className={cn(
                  "shrink-0 border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {pill.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
