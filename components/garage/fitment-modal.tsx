"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Check, Search, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useGarage } from "@/components/garage/garage-provider"
import { TireSizeIcon, VehicleIcon, WheelRimIcon } from "@/components/garage/fitment-icons"
import { getVehicleMakeIconUrl } from "@/lib/brand-icons"
import {
  findVehicleById,
  isCatalogTireSize,
  makesFor,
  POPULAR_TIRE_SIZES,
  validAspectsForWidth,
  validRimsForWidthAspect,
  vehiclesFor,
  type VehicleModel,
} from "@/lib/catalog/vehicles"
import { TIRE_OPTIONS } from "@/lib/catalog"
import { storePath } from "@/lib/i18n/config"
import type { GarageSelection } from "@/lib/garage-cookie"
import { cn } from "@/lib/utils"

const SIZE_PATTERN = /^\s*(\d{3})\s*[/\s-]?\s*(\d{2})\s*[zZ]?[rR]?\s*(\d{2})\s*$/

const PRIORITY_MAKES: Record<"us" | "eu", string[]> = {
  us: ["Toyota", "Ford", "Honda", "Chevrolet", "BMW", "Tesla", "Jeep", "Mercedes-Benz", "Hyundai", "Subaru", "Audi", "Kia", "Porsche", "Ram", "GMC", "Lexus", "Volkswagen", "Mazda", "Nissan", "Volvo"],
  eu: ["Volkswagen", "BMW", "Mercedes-Benz", "Audi", "Toyota", "Peugeot", "Skoda", "Renault", "Ford", "Porsche", "Volvo", "Hyundai", "Kia", "Tesla", "Seat", "Cupra", "Opel", "Citroen", "Dacia", "Fiat"],
}

export function FitmentModal({
  trigger,
  defaultTab,
  initialMake,
}: {
  trigger: React.ReactElement
  defaultTab?: "vehicle" | "size"
  initialMake?: string
}) {
  const [open, setOpen] = useState(false)
  const { store, t, x } = useI18n()
  const g = x.garage
  const { active, saved, signedIn, applySelection, selectSaved } = useGarage()
  const router = useRouter()
  const pathname = usePathname()

  const allVehicles = useMemo(() => vehiclesFor(store.market), [store.market])
  const makes = useMemo(() => {
    const raw = makesFor(store.market)
    const priority = PRIORITY_MAKES[store.market]
    return [...raw].sort((a, b) => {
      const ia = priority.indexOf(a)
      const ib = priority.indexOf(b)
      if (ia !== -1 && ib !== -1) return ia - ib
      if (ia !== -1) return -1
      if (ib !== -1) return 1
      return a.localeCompare(b)
    })
  }, [store.market])

  const initialVehicle = useMemo(() => {
    if (initialMake) {
      const byInitialMake = allVehicles.find((v) => v.make === initialMake)
      if (byInitialMake) return byInitialMake
    }
    if (active?.vehicleId) {
      const found = findVehicleById(active.vehicleId)
      if (found && found.markets.includes(store.market)) return found
    }
    const firstMake = makes[0]
    return allVehicles.find((v) => v.make === firstMake) ?? allVehicles[0]
  }, [active?.vehicleId, allVehicles, initialMake, makes, store.market])

  const [tab, setTab] = useState<"vehicle" | "size">(
    defaultTab ?? (active?.kind === "size" ? "size" : "vehicle"),
  )

  // --- Vehicle tab state ---
  const [makeQuery, setMakeQuery] = useState("")
  const [showAllMakes, setShowAllMakes] = useState(false)
  const [make, setMake] = useState(initialVehicle?.make ?? makes[0] ?? "")

  const filteredMakes = useMemo(() => {
    const q = makeQuery.trim().toLowerCase()
    if (!q) return makes
    return makes.filter(
      (m) =>
        m.toLowerCase().includes(q) ||
        allVehicles.some((v) => v.make === m && `${v.make} ${v.model}`.toLowerCase().includes(q)),
    )
  }, [allVehicles, makeQuery, makes])

  const visibleMakes = useMemo(() => {
    if (makeQuery.trim() || showAllMakes) return filteredMakes
    const top = filteredMakes.slice(0, 12)
    if (make && !top.includes(make) && filteredMakes.includes(make)) {
      return [make, ...top.slice(0, 11)]
    }
    return top
  }, [filteredMakes, make, makeQuery, showAllMakes])

  const models = useMemo(() => {
    const q = makeQuery.trim().toLowerCase()
    const byMake = allVehicles
      .filter((v) => v.make === make)
      .sort((a, b) => a.model.localeCompare(b.model) || a.yearFrom - b.yearFrom)
    if (!q) return byMake
    const matchingQuery = byMake.filter((v) => `${v.make} ${v.model}`.toLowerCase().includes(q))
    return matchingQuery.length > 0 ? matchingQuery : byMake
  }, [allVehicles, make, makeQuery])

  const [modelId, setModelId] = useState(initialVehicle?.id ?? models[0]?.id ?? "")
  const model = models.find((m) => m.id === modelId) ?? models[0]
  const [year, setYear] = useState(active?.year ?? model?.yearTo ?? 2025)
  const [sizeId, setSizeId] = useState(() => {
    if (active && model) {
      const matching = model.sizes.find(
        (s) => s.width === active.width && s.aspect === active.aspect && s.rim === active.rim,
      )
      if (matching) return matching.id
    }
    return model?.sizes[0]?.id ?? ""
  })
  const vehicleSize = model?.sizes.find((s) => s.id === sizeId) ?? model?.sizes[0]
  const years = model ? range(model.yearFrom, model.yearTo) : []

  const pickMake = (next: string) => {
    const nextModels = allVehicles
      .filter((v) => v.make === next)
      .sort((a, b) => a.model.localeCompare(b.model) || a.yearFrom - b.yearFrom)
    setMake(next)
    applyModel(nextModels[0])
  }

  const applyModel = (next?: VehicleModel) => {
    if (!next) return
    setModelId(next.id)
    setYear(next.yearTo)
    setSizeId(next.sizes[0]?.id ?? "")
  }

  // --- Tire size tab state ---
  const [tireSize, setTireSize] = useState(() => ({
    width: String(active?.width ?? 225),
    aspect: String(active?.aspect ?? 45),
    rim: String(active?.rim ?? 17),
  }))
  const [typed, setTyped] = useState("")
  const [typedError, setTypedError] = useState<string | null>(null)

  const currentWidthNum = Number(tireSize.width) || 225
  const currentAspectNum = Number(tireSize.aspect) || 45
  const currentRimNum = Number(tireSize.rim) || 17

  const validAspects = useMemo(() => validAspectsForWidth(currentWidthNum), [currentWidthNum])
  const validRims = useMemo(
    () => validRimsForWidthAspect(currentWidthNum, currentAspectNum),
    [currentWidthNum, currentAspectNum],
  )
  const isExactCatalogMatch = isCatalogTireSize(currentWidthNum, currentAspectNum, currentRimNum)

  const pickWidth = (w: number) => {
    const aspects = validAspectsForWidth(w)
    const nextAspect = aspects.includes(currentAspectNum) ? currentAspectNum : (aspects[Math.floor(aspects.length / 2)] ?? 45)
    const rims = validRimsForWidthAspect(w, nextAspect)
    const nextRim = rims.includes(currentRimNum) ? currentRimNum : (rims[0] ?? 17)
    setTireSize({ width: String(w), aspect: String(nextAspect), rim: String(nextRim) })
    setTyped(`${w}/${nextAspect} R${nextRim}`)
    setTypedError(null)
  }

  const pickAspect = (a: number) => {
    const rims = validRimsForWidthAspect(currentWidthNum, a)
    const nextRim = rims.includes(currentRimNum) ? currentRimNum : (rims[0] ?? 17)
    setTireSize((s) => ({ ...s, aspect: String(a), rim: String(nextRim) }))
    setTyped(`${currentWidthNum}/${a} R${nextRim}`)
    setTypedError(null)
  }

  const pickRim = (r: number) => {
    setTireSize((s) => ({ ...s, rim: String(r) }))
    setTyped(`${currentWidthNum}/${currentAspectNum} R${r}`)
    setTypedError(null)
  }

  const pickPopularSize = (s: { width: number; aspect: number; rim: number }) => {
    setTireSize({ width: String(s.width), aspect: String(s.aspect), rim: String(s.rim) })
    setTyped(`${s.width}/${s.aspect} R${s.rim}`)
    setTypedError(null)
  }

  const onTyped = (value: string) => {
    setTyped(value)
    const match = value.match(SIZE_PATTERN)
    if (match) {
      setTireSize({ width: match[1], aspect: match[2], rim: match[3] })
      setTypedError(null)
    }
  }

  function close() {
    setOpen(false)
  }

  function buildVehicleSelection(): GarageSelection | null {
    if (!model || !vehicleSize) return null
    return {
      kind: "vehicle",
      label: `${year} ${model.make} ${model.model}`,
      make: model.make,
      model: model.model,
      year,
      vehicleId: model.id,
      boltPattern: model.boltPattern,
      centerBore: model.centerBore,
      sizeLabel: vehicleSize.label,
      width: vehicleSize.width,
      aspect: vehicleSize.aspect,
      rim: vehicleSize.rim,
    }
  }

  function confirmVehicle(target?: "tires" | "wheels") {
    const selection = buildVehicleSelection()
    if (!selection || !model || !vehicleSize) return
    applySelection(selection)
    close()

    const dest = target ?? (pathname?.endsWith("/wheels") ? "wheels" : "tires")
    if (dest === "wheels") {
      router.push(
        `${storePath(store, "/wheels")}?${new URLSearchParams({
          vehicle: model.id,
          diameter: String(vehicleSize.rim),
          bolt: model.boltPattern,
        }).toString()}`,
      )
    } else {
      router.push(
        `${storePath(store, "/tires")}?${new URLSearchParams({
          vehicle: model.id,
          width: String(vehicleSize.width),
          aspect: String(vehicleSize.aspect),
          rim: String(vehicleSize.rim),
        }).toString()}`,
      )
    }
  }

  function confirmSize() {
    if (typed && !SIZE_PATTERN.test(typed)) {
      setTypedError(g.error)
      return
    }
    const { width, aspect, rim } = tireSize
    const selection: GarageSelection = {
      kind: "size",
      label: `${width}/${aspect}R${rim}`,
      width: Number(width),
      aspect: Number(aspect),
      rim: Number(rim),
    }
    applySelection(selection)
    close()
    router.push(`${storePath(store, "/tires")}?${new URLSearchParams({ width, aspect, rim }).toString()}`)
  }

  function pickSaved(row: (typeof saved)[number]) {
    selectSaved(row)
    close()
    const foundVehicle = findVehicleById(row.vehicleId)
    if (pathname?.endsWith("/wheels") && foundVehicle) {
      router.push(
        `${storePath(store, "/wheels")}?${new URLSearchParams({
          vehicle: foundVehicle.id,
          diameter: String(row.rim),
          bolt: foundVehicle.boltPattern,
        }).toString()}`,
      )
    } else {
      const params = new URLSearchParams({
        width: String(row.width),
        aspect: String(row.aspect),
        rim: String(row.rim),
      })
      if (row.vehicleId) params.set("vehicle", row.vehicleId)
      router.push(`${storePath(store, "/tires")}?${params.toString()}`)
    }
  }

  const popularSizes = POPULAR_TIRE_SIZES[store.market]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent
        className="flex max-h-[92dvh] w-[calc(100vw-1rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-none! border border-foreground/30 bg-card p-0 shadow-2xl sm:max-w-2xl"
        showCloseButton
      >
        <DialogTitle className="sr-only">{g.addFitment}</DialogTitle>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "vehicle" | "size")}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          {/* Top Switcher Tabs with Custom Icons */}
          <TabsList
            variant="line"
            className="grid h-auto! w-full shrink-0 grid-cols-2 gap-0 rounded-none border-b border-border bg-muted/30 p-0 pr-10"
          >
            <TabsTrigger
              value="vehicle"
              className="group/tab relative flex h-auto! items-center justify-start gap-2 whitespace-normal rounded-none border-0 border-b-2 border-r border-border/60 border-b-transparent px-3 py-2.5 text-left transition-colors after:opacity-0! hover:bg-muted/50 data-active:border-b-primary data-active:bg-card data-active:text-foreground sm:gap-3 sm:px-4 sm:py-3"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center border transition-colors sm:size-10",
                  tab === "vehicle"
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border bg-background/60 text-muted-foreground group-hover/tab:text-foreground",
                )}
              >
                <VehicleIcon className="size-6 w-7 sm:size-7 sm:w-9" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-expanded text-xs font-extrabold uppercase tracking-wide sm:text-base">
                  {g.vehicleTab}
                </span>
                <span className="truncate text-[10px] font-normal normal-case leading-tight text-muted-foreground sm:text-[11px]">
                  {g.vehicleTabHint}
                </span>
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="size"
              className="group/tab relative flex h-auto! items-center justify-start gap-2 whitespace-normal rounded-none border-0 border-b-2 border-transparent px-3 py-2.5 text-left transition-colors after:opacity-0! hover:bg-muted/50 data-active:border-b-primary data-active:bg-card data-active:text-foreground sm:gap-3 sm:px-4 sm:py-3"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center border transition-colors sm:size-10",
                  tab === "size"
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border bg-background/60 text-muted-foreground group-hover/tab:text-foreground",
                )}
              >
                <TireSizeIcon className="size-6 sm:size-7" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-expanded text-xs font-extrabold uppercase tracking-wide sm:text-base">
                  {g.sizeTab}
                </span>
                <span className="truncate text-[10px] font-normal normal-case leading-tight text-muted-foreground sm:text-[11px]">
                  {g.sizeTabHint}
                </span>
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Saved Garage Quick Bar (if signed in & has saved vehicles) */}
          {signedIn && saved.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-muted/25 px-4 py-2.5 md:px-6">
              <span className="label-caps text-[10px] text-muted-foreground">{g.yourGarage}:</span>
              <ul className="flex flex-wrap gap-1.5">
                {saved.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => pickSaved(row)}
                      className={cn(
                        "flex items-center gap-1.5 border px-2.5 py-1 text-left text-xs font-semibold transition-colors",
                        row.isActive
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background hover:border-primary",
                      )}
                    >
                      {row.isActive && <Check aria-hidden="true" className="size-3 text-primary" />}
                      <span>{row.label}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {row.width}/{row.aspect}R{row.rim}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ================= VEHICLE TAB ================= */}
          <TabsContent value="vehicle" className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
              {/* Vehicle Hero Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-muted/20 p-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="relative flex h-12 w-16 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-foreground">
                    <VehicleIcon className="size-10 w-14" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h2 className="font-expanded text-base font-extrabold uppercase leading-tight sm:text-lg">
                      {g.vehicleTitle}
                    </h2>
                    <p className="font-mono text-xs text-muted-foreground">
                      {makes.length} {g.make.toLowerCase()}s · {allVehicles.length} OEM fitments
                    </p>
                  </div>
                </div>

                {/* Quick search make or model */}
                <div className="relative w-full sm:w-56">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="search"
                    value={makeQuery}
                    onChange={(e) => {
                      const val = e.target.value
                      setMakeQuery(val)
                      const q = val.trim().toLowerCase()
                      if (q) {
                        const hit = allVehicles.find((v) => `${v.make} ${v.model}`.toLowerCase().includes(q))
                        if (hit && hit.make !== make) {
                          setMake(hit.make)
                          applyModel(hit)
                        } else if (hit && hit.id !== modelId) {
                          applyModel(hit)
                        }
                      }
                    }}
                    placeholder={`${g.make} / ${g.model}...`}
                    aria-label={`${g.make} / ${g.model}`}
                    className="h-9 w-full border border-border bg-background pl-8 pr-7 font-mono text-xs placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  />
                  {makeQuery && (
                    <button
                      type="button"
                      onClick={() => setMakeQuery("")}
                      aria-label={g.remove}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* STEP 1: MAKE BUTTON GRID */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <StepHeader n={1} label={g.make} current={make} />
                  {filteredMakes.length > 12 && !makeQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => setShowAllMakes((s) => !s)}
                      className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary hover:underline"
                    >
                      {showAllMakes ? "Top makes" : `All makes (${filteredMakes.length})`}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5 min-[480px]:grid-cols-3 sm:grid-cols-4">
                  {visibleMakes.map((item) => {
                    const selected = item === make
                    const count = allVehicles.filter((v) => v.make === item).length
                    const monogram = item
                      .split(/[\s-]+/)
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                    const makeIcon = getVehicleMakeIconUrl(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => pickMake(item)}
                        className={cn(
                          "group flex h-10 items-center gap-2 border px-2.5 text-left text-xs font-semibold transition-transform duration-200 hover:-translate-y-0.5",
                          selected
                            ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)]"
                            : "border-border bg-background text-foreground hover:border-foreground/50 hover:bg-muted/40",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center font-mono text-[10px] font-bold transition-colors",
                            selected
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-muted text-muted-foreground group-hover:text-foreground",
                          )}
                        >
                          {makeIcon ? (
                            <img
                              src={makeIcon}
                              alt=""
                              width={15}
                              height={15}
                              loading="lazy"
                              className={cn(
                                "size-[15px] object-contain",
                                selected ? "invert" : "opacity-85 group-hover:opacity-100 dark:invert",
                              )}
                            />
                          ) : (
                            monogram
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{item}</span>
                        <span
                          className={cn(
                            "font-mono text-[10px]",
                            selected ? "text-primary-foreground/80" : "text-muted-foreground",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* STEP 2: MODEL SELECTION BUTTONS */}
              <div className="flex flex-col gap-2">
                <StepHeader n={2} label={g.model} current={model?.model} />
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {models.map((item) => {
                    const selected = item.id === model?.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => applyModel(item)}
                        className={cn(
                          "flex flex-col justify-between gap-1 border p-2.5 text-left transition-all",
                          selected
                            ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                            : "border-border bg-background hover:border-foreground/50 hover:bg-muted/30",
                        )}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-semibold leading-tight text-xs sm:text-sm">{item.model}</span>
                          {selected && <Check aria-hidden="true" className="size-3.5 shrink-0 text-primary" />}
                        </div>
                        <div className="flex items-center justify-between gap-1 font-mono text-[10px] text-muted-foreground">
                          <span>
                            {item.yearFrom}–{item.yearTo}
                          </span>
                          <span>{item.boltPattern.replace("x", "×")}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* STEP 3 & 4: YEAR + OEM SIZE PACKAGE */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <StepHeader n={3} label={g.year} current={String(year)} />
                  <div className="flex flex-wrap gap-1.5">
                    {years.map((item) => {
                      const selected = item === year
                      return (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setYear(item)}
                          className={cn(
                            "h-9 min-w-14 border px-2.5 font-mono text-xs font-semibold transition-all",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground hover:border-foreground/50",
                          )}
                        >
                          {item}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {model && (
                  <div className="flex flex-col gap-2">
                    <StepHeader
                      n={4}
                      label={g.size}
                      current={vehicleSize ? `${vehicleSize.width}/${vehicleSize.aspect}R${vehicleSize.rim}` : undefined}
                    />
                    <div className="flex flex-col gap-1.5">
                      {model.sizes.map((item) => {
                        const selected = item.id === (vehicleSize?.id ?? sizeId)
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setSizeId(item.id)}
                            className={cn(
                              "flex items-center justify-between gap-2 border px-3 py-2 text-left transition-all",
                              selected
                                ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                                : "border-border bg-background hover:border-foreground/50",
                            )}
                          >
                            <span className="flex flex-col">
                              <span className="text-xs font-semibold">{item.label}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                PCD {model.boltPattern.replace("x", "×")} · R{item.rim}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "font-mono text-xs font-bold uppercase",
                                selected ? "text-primary" : "text-foreground",
                              )}
                            >
                              {item.width}/{item.aspect} R{item.rim}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {!signedIn && <p className="text-xs text-muted-foreground">{g.signInToSave}</p>}
            </div>

            {/* Sticky Footer for Vehicle Tab */}
            <div className="flex shrink-0 flex-col gap-3 border-t border-border bg-background/95 px-4 py-3.5 backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between md:px-6">
              {model && vehicleSize ? (
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex flex-col">
                    <span className="truncate text-xs font-semibold text-muted-foreground">
                      {year} {model.make} {model.model}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <p className="font-expanded text-xl font-black leading-none tracking-tight sm:text-2xl">
                        <span>{vehicleSize.width}</span>
                        <span className="text-primary">/</span>
                        <span>{vehicleSize.aspect}</span>
                        <span className="ml-1 text-muted-foreground">R</span>
                        <span>{vehicleSize.rim}</span>
                      </p>
                      <span className="border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {model.boltPattern.replace("x", "×")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => confirmVehicle("wheels")}
                  disabled={!model || !vehicleSize}
                  className="gap-1.5 px-3 text-xs sm:text-sm"
                >
                  <WheelRimIcon className="size-4 text-primary" />
                  {t.categories.wheels.name}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => confirmVehicle("tires")}
                  disabled={!model || !vehicleSize}
                  className="flex-1 sm:flex-initial"
                >
                  {g.shopTires}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ================= TIRE SIZE TAB ================= */}
          <TabsContent value="size" className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
              {/* Top Hero Readout + Direct Type Input */}
              <div className="grid gap-3 border border-border bg-muted/20 p-3.5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-13 shrink-0 items-center justify-center border border-primary/40 bg-primary/10 text-foreground">
                    <TireSizeIcon className="size-10" />
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="label-caps text-[10px] text-muted-foreground">{g.sizeTitle}</span>
                    <p
                      aria-live="polite"
                      className="flex items-baseline gap-0.5 font-expanded text-2xl font-black leading-none tracking-tight sm:text-3xl"
                    >
                      <span>{tireSize.width}</span>
                      <span className="text-primary">/</span>
                      <span>{tireSize.aspect}</span>
                      <span className="ml-1.5 text-muted-foreground">R</span>
                      <span>{tireSize.rim}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1 sm:w-48">
                  <label htmlFor="garage-typed-size" className="label-caps text-[10px] text-muted-foreground">
                    {g.orType}
                  </label>
                  <input
                    id="garage-typed-size"
                    value={typed}
                    onChange={(e) => onTyped(e.target.value)}
                    placeholder={g.typedPlaceholder}
                    inputMode="text"
                    autoComplete="off"
                    aria-invalid={!!typedError}
                    className="h-9 border border-border bg-background px-2.5 font-mono text-xs uppercase placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  />
                </div>
              </div>
              {typedError && <p className="-mt-2 text-xs text-primary">{typedError}</p>}

              {/* Popular Quick-Select Sizes */}
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Sparkles aria-hidden="true" className="size-3 text-primary" />
                  Popular OEM Sizes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularSizes.map((s) => {
                    const code = `${s.width}/${s.aspect}R${s.rim}`
                    const isSelected =
                      Number(tireSize.width) === s.width &&
                      Number(tireSize.aspect) === s.aspect &&
                      Number(tireSize.rim) === s.rim
                    return (
                      <button
                        key={code}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => pickPopularSize(s)}
                        className={cn(
                          "flex items-center gap-1.5 border px-2.5 py-1 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/15 text-foreground ring-1 ring-primary"
                            : "border-border bg-background hover:border-foreground/50",
                        )}
                      >
                        <span className="font-mono text-xs font-bold">
                          {s.width}/{s.aspect} R{s.rim}
                        </span>
                        <span className="hidden text-[10px] text-muted-foreground sm:inline">· {s.tag}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 1: WIDTH Pill Buttons */}
              <div className="flex flex-col gap-2">
                <StepHeader n={1} label={`${g.width} (mm)`} current={`${tireSize.width} mm`} />
                <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8">
                  {TIRE_OPTIONS.width.map((w) => {
                    const selected = String(w) === tireSize.width
                    return (
                      <button
                        key={w}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => pickWidth(w)}
                        className={cn(
                          "h-9 border font-mono text-xs font-bold transition-all",
                          selected
                            ? "border-primary bg-primary text-primary-foreground shadow-xs"
                            : "border-border bg-background text-foreground hover:border-foreground/60 hover:bg-muted/40",
                        )}
                      >
                        {w}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 2: RATIO (PROFILE) Pill Buttons */}
              <div className="flex flex-col gap-2">
                <StepHeader n={2} label={`${g.ratio} (%)`} current={`${tireSize.aspect}%`} />
                <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
                  {TIRE_OPTIONS.aspect.map((a) => {
                    const selected = String(a) === tireSize.aspect
                    const available = validAspects.includes(a)
                    return (
                      <button
                        key={a}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => pickAspect(a)}
                        className={cn(
                          "h-9 border font-mono text-xs font-bold transition-all",
                          selected
                            ? "border-primary bg-primary text-primary-foreground shadow-xs"
                            : available
                              ? "border-border bg-background text-foreground hover:border-foreground/60 hover:bg-muted/40"
                              : "border-border/50 bg-muted/20 text-muted-foreground/50 hover:border-border hover:text-muted-foreground",
                        )}
                      >
                        {a}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 3: DIAMETER (RIM) Pill Buttons */}
              <div className="flex flex-col gap-2">
                <StepHeader n={3} label={`${g.diameter} (in)`} current={`R${tireSize.rim}`} />
                <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-11">
                  {TIRE_OPTIONS.rim.map((r) => {
                    const selected = String(r) === tireSize.rim
                    const available = validRims.includes(r)
                    return (
                      <button
                        key={r}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => pickRim(r)}
                        className={cn(
                          "h-9 border font-mono text-xs font-bold transition-all",
                          selected
                            ? "border-primary bg-primary text-primary-foreground shadow-xs"
                            : available
                              ? "border-border bg-background text-foreground hover:border-foreground/60 hover:bg-muted/40"
                              : "border-border/50 bg-muted/20 text-muted-foreground/50 hover:border-border hover:text-muted-foreground",
                        )}
                      >
                        R{r}
                      </button>
                    )
                  })}
                </div>
              </div>

              {!signedIn && <p className="text-xs text-muted-foreground">{g.signInToSave}</p>}
            </div>

            {/* Sticky Footer for Tire Size Tab */}
            <div className="flex shrink-0 flex-col gap-3 border-t border-border bg-background/95 px-4 py-3.5 backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between md:px-6">
              <div className="flex items-center gap-3">
                <p className="font-expanded text-xl font-black leading-none tracking-tight sm:text-2xl">
                  <span>{tireSize.width}</span>
                  <span className="text-primary">/</span>
                  <span>{tireSize.aspect}</span>
                  <span className="ml-1 text-muted-foreground">R</span>
                  <span>{tireSize.rim}</span>
                </p>
                <span
                  className={cn(
                    "border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase",
                    isExactCatalogMatch
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {isExactCatalogMatch ? g.inStock : g.sizeTab}
                </span>
              </div>

              <Button type="button" size="lg" className="w-full sm:w-auto sm:min-w-52" onClick={confirmSize}>
                {g.useThisSize}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function StepHeader({ n, label, current }: { n: number; label: string; current?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
        <span className="flex size-5 shrink-0 items-center justify-center bg-primary font-mono text-[11px] font-bold text-primary-foreground">
          {n}
        </span>
        {label}
      </span>
      {current && <span className="font-mono text-xs font-semibold text-primary">{current}</span>}
    </div>
  )
}

function range(from: number, to: number): number[] {
  const years: number[] = []
  for (let year = to; year >= from; year -= 1) years.push(year)
  return years
}
