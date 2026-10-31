"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { Market } from "@/lib/markets"

export type CartLine = {
  slug: string
  name: string
  image: string
  priceCents: number
  quantity: number
}

type CartContextValue = {
  market: Market
  lines: CartLine[]
  count: number
  subtotalCents: number
  open: boolean
  setOpen: (open: boolean) => void
  add: (line: CartLine, options?: { openDrawer?: boolean }) => void
  setQuantity: (slug: string, quantity: number) => void
  remove: (slug: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export const MAX_QUANTITY = 8

// Carts are per market: prices and currency differ, so a US cart never leaks into the EU store.
const storageKey = (market: Market) => `cp-cart-${market}-v1`

export function CartProvider({ market, children }: { market: Market; children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(market))
      setLines(raw ? (JSON.parse(raw) as CartLine[]) : [])
    } catch {
      setLines([])
    }
    setLoaded(true)
  }, [market])

  useEffect(() => {
    if (loaded) window.localStorage.setItem(storageKey(market), JSON.stringify(lines))
  }, [lines, loaded, market])

  const add = useCallback((line: CartLine, options?: { openDrawer?: boolean }) => {
    setLines((current) => {
      const existing = current.find((l) => l.slug === line.slug)
      if (existing) {
        return current.map((l) =>
          l.slug === line.slug ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + line.quantity) } : l,
        )
      }
      return [...current, { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity) }]
    })
    if (options?.openDrawer !== false) {
      setOpen(true)
    }
  }, [])

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setLines((current) =>
      current.map((l) => (l.slug === slug ? { ...l, quantity: Math.max(1, Math.min(MAX_QUANTITY, quantity)) } : l)),
    )
  }, [])

  const remove = useCallback((slug: string) => setLines((current) => current.filter((l) => l.slug !== slug)), [])
  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartContextValue>(
    () => ({
      market,
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotalCents: lines.reduce((sum, l) => sum + l.quantity * l.priceCents, 0),
      open,
      setOpen,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [market, lines, open, add, setQuantity, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
