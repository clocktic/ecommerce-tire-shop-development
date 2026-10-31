"use server"

import { headers } from "next/headers"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { savedVehicles } from "@/lib/db/schema"
import { getSessionUser } from "@/lib/auth"
import { newId } from "@/lib/ids"
import type { Market } from "@/lib/markets"

export type GarageInput = {
  market: Market
  kind: "vehicle" | "size"
  label: string
  make?: string
  model?: string
  year?: number
  vehicleId?: string
  width: number
  aspect: number
  rim: number
}

// Logged-in shoppers get their fitment choices saved server-side so the
// header remembers their garage on any device. Guests keep theirs in a cookie.
export async function saveVehicleToGarage(input: GarageInput): Promise<{ id: string } | { error: string }> {
  const user = await getSessionUser(await headers())
  if (!user) return { error: "signed-out" }
  if (!input.label || !Number.isFinite(input.width) || !Number.isFinite(input.aspect) || !Number.isFinite(input.rim)) {
    return { error: "invalid" }
  }

  const id = newId("veh")
  await db.transaction(async (tx) => {
    await tx
      .update(savedVehicles)
      .set({ isActive: false })
      .where(and(eq(savedVehicles.userId, user.id), eq(savedVehicles.market, input.market)))
    await tx.insert(savedVehicles).values({
      id,
      userId: user.id,
      market: input.market,
      kind: input.kind,
      label: input.label.slice(0, 120),
      make: input.make?.slice(0, 60) ?? null,
      model: input.model?.slice(0, 60) ?? null,
      year: input.year ?? null,
      vehicleId: input.vehicleId ?? null,
      width: Math.round(input.width),
      aspect: Math.round(input.aspect),
      rim: Math.round(input.rim),
      isActive: true,
    })
  })
  return { id }
}

export async function setActiveGarageVehicle(id: string, market: Market): Promise<{ ok: true } | { error: string }> {
  const user = await getSessionUser(await headers())
  if (!user) return { error: "signed-out" }

  await db.transaction(async (tx) => {
    await tx
      .update(savedVehicles)
      .set({ isActive: false })
      .where(and(eq(savedVehicles.userId, user.id), eq(savedVehicles.market, market)))
    await tx
      .update(savedVehicles)
      .set({ isActive: true })
      .where(and(eq(savedVehicles.id, id), eq(savedVehicles.userId, user.id)))
  })
  return { ok: true }
}

export async function deleteGarageVehicle(id: string): Promise<{ ok: true } | { error: string }> {
  const user = await getSessionUser(await headers())
  if (!user) return { error: "signed-out" }

  await db.delete(savedVehicles).where(and(eq(savedVehicles.id, id), eq(savedVehicles.userId, user.id)))
  return { ok: true }
}
