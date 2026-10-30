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
      <SheetContent side="right" className="flex w-72 flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border bg-card px-5 py-4">
          <SheetTitle className="font-expanded text-base font-extrabold uppercase tracking-wider">
            {navLabel}
          </SheetTitle>
        </SheetHeader>
        <Separator />
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
      </SheetContent>
    </Sheet>
  )
}
