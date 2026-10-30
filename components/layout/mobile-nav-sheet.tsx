"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FitmentModal } from "@/components/garage/fitment-modal"
import { TireSizeIcon, VehicleIcon } from "@/components/garage/fitment-icons"
import { useGarage } from "@/components/garage/garage-provider"
import { useI18n } from "@/components/i18n/i18n-provider"
import { LanguageSwitcher, RegionSwitcher } from "@/components/layout/region-switcher"

type NavItem = { href: string; label: string }

export function MobileNavSheet({
  nav,
  openLabel,
  navLabel,
}: {
  nav: NavItem[]
  openLabel: string
  navLabel: string
}) {
  const [open, setOpen] = useState(false)
  const { active } = useGarage()
  const { x } = useI18n()
  const g = x.garage

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="@min-[1100px]/header:hidden"
            aria-label={openLabel}
          />
        }
      >
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[min(21rem,calc(100vw-1rem))] flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border bg-card px-5 py-4 pr-12">
          <SheetTitle className="font-expanded text-base font-extrabold uppercase tracking-wider">
            {navLabel}
          </SheetTitle>
        </SheetHeader>
        <Separator />
        <div className="border-b border-border bg-muted/25 p-3">
          <FitmentModal
            defaultTab={active?.kind === "size" ? "size" : "vehicle"}
            trigger={
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2.5 border border-border bg-card px-3 py-2.5 text-left text-xs font-semibold transition-colors hover:border-primary"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-foreground">
                    {active?.kind === "size" ? (
                      <TireSizeIcon className="size-5" />
                    ) : (
                      <VehicleIcon className="size-5 w-6 text-primary" />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold text-foreground">
                      {active ? active.label : g.addFitment}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {active ? `${active.width}/${active.aspect}R${active.rim}` : g.vehicleTabHint}
                    </span>
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
              </button>
            }
          />
        </div>
        <nav aria-label={navLabel} className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col divide-y divide-border/60">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between px-3 py-3.5 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-muted hover:text-primary"
                >
                  <span>{item.label}</span>
                  <ArrowRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-2.5 border-t border-border bg-card px-4 py-3.5">
          <LanguageSwitcher tone="light" />
          <RegionSwitcher tone="light" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
