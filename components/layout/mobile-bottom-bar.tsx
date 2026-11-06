"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/components/cart/cart-provider"
import { useGarage } from "@/components/garage/garage-provider"
import { FitmentModal } from "@/components/garage/fitment-modal"
import { BagIcon3D, HomeIcon3D, TireSizeIcon, VehicleIcon, WheelRimIcon } from "@/components/garage/fitment-icons"
import { useI18n } from "@/components/i18n/i18n-provider"
import { storePath } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

export function MobileBottomBar() {
  const pathname = usePathname()
  const { store, t, x } = useI18n()
  const { count, setOpen: setCartOpen } = useCart()
  const { active } = useGarage()

  const homeHref = storePath(store)
  const tiresHref = storePath(store, "/tires")
  const wheelsHref = storePath(store, "/wheels")

  const isHome = pathname === homeHref || pathname === `${homeHref}/`
  const isTires = pathname?.startsWith(tiresHref)
  const isWheels = pathname?.startsWith(wheelsHref)

  return (
    <nav
      aria-label={t.common.mobileNav}
      data-mobile-bottom-bar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md supports-[backdrop-filter]:bg-background/85 md:hidden"
    >
      <div className="mx-auto grid h-14 max-w-md grid-cols-5 items-stretch">
        <Link
          href={homeHref}
          aria-current={isHome ? "page" : undefined}
          className={cn(
            "relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
            isHome ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {isHome && <span aria-hidden="true" className="absolute inset-x-3 top-0 h-0.5 bg-primary" />}
          <HomeIcon3D className="size-6" />
          <span className="max-w-[4.25rem] truncate">{t.common.home}</span>
        </Link>

        <Link
          href={tiresHref}
          aria-current={isTires ? "page" : undefined}
          className={cn(
            "relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
            isTires ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {isTires && <span aria-hidden="true" className="absolute inset-x-3 top-0 h-0.5 bg-primary" />}
          <TireSizeIcon className="size-6" />
          <span className="max-w-[4.25rem] truncate">{t.categories.tires.name}</span>
        </Link>

        <Link
          href={wheelsHref}
          aria-current={isWheels ? "page" : undefined}
          className={cn(
            "relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
            isWheels ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {isWheels && <span aria-hidden="true" className="absolute inset-x-3 top-0 h-0.5 bg-primary" />}
          <WheelRimIcon className="size-6" />
          <span className="max-w-[4.25rem] truncate">{t.categories.wheels.name}</span>
        </Link>

        <FitmentModal
          defaultTab={active?.kind === "size" ? "size" : "vehicle"}
          trigger={
            <button
              type="button"
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="relative flex items-center justify-center">
                <VehicleIcon className="size-6 w-8" />
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1.5 -top-0.5 size-2 rounded-full bg-primary ring-2 ring-background"
                  />
                )}
              </span>
              <span className="max-w-[4.25rem] truncate font-mono">
                {active ? `${active.width}/${active.aspect}R${active.rim}` : x.garage.vehicleTab}
              </span>
            </button>
          }
        />

        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="relative flex items-center justify-center">
            <BagIcon3D className="size-6" />
            {count > 0 && (
              <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-primary px-1 font-mono text-[9px] font-bold text-primary-foreground tabular-nums">
                {count}
              </span>
            )}
          </span>
          <span className="max-w-[4.25rem] truncate">{t.common.cart}</span>
        </button>
      </div>
    </nav>
  )
}
