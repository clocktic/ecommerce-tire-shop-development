import "server-only"

import { and, desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { savedVehicles, type SavedVehicleRow } from "@/lib/db/schema"
import type { GarageSelection } from "@/lib/garage-cookie"
import type { Market } from "@/lib/markets"

export async function getSavedVehicles(userId: string, market: Market): Promise<SavedVehicleRow[]> {
  return db
    .select()
    .from(savedVehicles)
    .where(and(eq(savedVehicles.userId, userId), eq(savedVehicles.market, market)))
    .orderBy(desc(savedVehicles.isActive), desc(savedVehicles.createdAt))
}

export function rowToSelection(row: SavedVehicleRow): GarageSelection {
  return {
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
}
