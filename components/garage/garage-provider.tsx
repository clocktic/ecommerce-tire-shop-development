"use client"

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { deleteGarageVehicle, saveVehicleToGarage, setActiveGarageVehicle } from "@/lib/actions/garage"
import { encodeGarageCookie, GARAGE_COOKIE, type GarageSelection } from "@/lib/garage-cookie"
import type { SavedVehicleRow } from "@/lib/db/schema"
import type { Market } from "@/lib/markets"

type GarageContextValue = {
  active: GarageSelection | null
  saved: SavedVehicleRow[]
  market: Market
  pending: boolean
  signedIn: boolean
  applySelection: (selection: GarageSelection) => void
  selectSaved: (row: SavedVehicleRow) => void
  removeSaved: (id: string) => void
  clearActive: () => void
}

const GarageContext = createContext<GarageContextValue | null>(null)

function persistCookie(selection: GarageSelection | null) {
  if (selection) {
    document.cookie = `${GARAGE_COOKIE}=${encodeGarageCookie(selection)}; Path=/; Max-Age=31536000; SameSite=Lax`
  } else {
    document.cookie = `${GARAGE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
  }
}

export function GarageProvider({
  market,
  initialActive,
  initialSaved,
  children,
}: {
  market: Market
  initialActive: GarageSelection | null
  initialSaved: SavedVehicleRow[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data } = useSession()
  const signedIn = !!data?.user
  const [active, setActive] = useState<GarageSelection | null>(initialActive)
  const [pending, startTransition] = useTransition()

  const applySelection = useCallback(
    (selection: GarageSelection) => {
      setActive(selection)
      persistCookie(selection)
      if (signedIn) {
        startTransition(async () => {
          await saveVehicleToGarage({
            market,
            kind: selection.kind,
            label: selection.label,
            make: selection.make,
            model: selection.model,
            year: selection.year,
            vehicleId: selection.vehicleId,
            width: selection.width,
            aspect: selection.aspect,
            rim: selection.rim,
          })
          router.refresh()
        })
      }
    },
    [market, router, signedIn],
  )

  const selectSaved = useCallback(
    (row: SavedVehicleRow) => {
      const selection: GarageSelection = {
        kind: row.kind === "vehicle" ? "vehicle" : "size",
        label: row.label,
        make: row.make ?? undefined,
        model: row.model ?? undefined,
        year: row.year ?? undefined,
        vehicleId: row.vehicleId ?? undefined,
        width: row.width,
        aspect: row.aspect,
        rim: row.rim,
      }
      setActive(selection)
      persistCookie(selection)
      startTransition(async () => {
        await setActiveGarageVehicle(row.id, market)
        router.refresh()
      })
    },
    [market, router],
  )

  const removeSaved = useCallback(
    (id: string) => {
      startTransition(async () => {
        await deleteGarageVehicle(id)
        router.refresh()
      })
    },
    [router],
  )

  const clearActive = useCallback(() => {
    setActive(null)
    persistCookie(null)
  }, [])

  const value = useMemo<GarageContextValue>(
    () => ({ active, saved: initialSaved, market, pending, signedIn, applySelection, selectSaved, removeSaved, clearActive }),
    [active, initialSaved, market, pending, signedIn, applySelection, selectSaved, removeSaved, clearActive],
  )

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>
}

export function useGarage() {
  const ctx = useContext(GarageContext)
  if (!ctx) throw new Error("useGarage must be used inside GarageProvider")
  return ctx
}
