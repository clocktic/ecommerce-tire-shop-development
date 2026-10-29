"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useGarage } from "@/components/garage/garage-provider"
import { makesFor, vehiclesFor, type VehicleModel } from "@/lib/catalog/vehicles"
import { TIRE_OPTIONS } from "@/lib/catalog"
import { storePath } from "@/lib/i18n/config"
import type { GarageSelection } from "@/lib/garage-cookie"

const SIZE_PATTERN = /^\s*(\d{3})\s*[/\s-]?\s*(\d{2})\s*[zZ]?[rR]?\s*(\d{2})\s*$/

export function FitmentModal({ trigger }: { trigger: React.ReactElement }) {
  const [open, setOpen] = useState(false)
  const { store, x } = useI18n()
  const g = x.garage
  const { saved, signedIn, applySelection, selectSaved } = useGarage()
  const router = useRouter()

  const makes = useMemo(() => makesFor(store.market), [store.market])
  const [tab, setTab] = useState<"vehicle" | "size">("vehicle")

  // --- Vehicle tab state ---
  const [make, setMake] = useState(makes[0] ?? "")
  const models = useMemo(
    () =>
      vehiclesFor(store.market)
        .filter((v) => v.make === make)
        .sort((a, b) => a.model.localeCompare(b.model) || a.yearFrom - b.yearFrom),
    [store.market, make],
  )
  const [modelId, setModelId] = useState(models[0]?.id ?? "")
  const model = models.find((m) => m.id === modelId) ?? models[0]
  const [year, setYear] = useState(model?.yearTo ?? 2024)
  const [sizeId, setSizeId] = useState(model?.sizes[0]?.id ?? "")
  const vehicleSize = model?.sizes.find((s) => s.id === sizeId) ?? model?.sizes[0]
  const years = model ? range(model.yearFrom, model.yearTo) : []

  const pickMake = (next: string) => {
    const nextModels = vehiclesFor(store.market)
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
  const [tireSize, setTireSize] = useState({ width: "225", aspect: "45", rim: "17" })
  const [typed, setTyped] = useState("")
  const [typedError, setTypedError] = useState<string | null>(null)

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

  function confirmVehicle() {
    if (!model || !vehicleSize) return
    const selection: GarageSelection = {
      kind: "vehicle",
      label: `${year} ${model.make} ${model.model}`,
      make: model.make,
      model: model.model,
      year,
      vehicleId: model.id,
      width: vehicleSize.width,
      aspect: vehicleSize.aspect,
      rim: vehicleSize.rim,
    }
    applySelection(selection)
    close()
    router.push(
      `${storePath(store, "/tires")}?${new URLSearchParams({
        width: String(vehicleSize.width),
        aspect: String(vehicleSize.aspect),
        rim: String(vehicleSize.rim),
      }).toString()}`,
    )
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
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-none! p-0 sm:max-w-xl" showCloseButton>
        <DialogTitle className="sr-only">{g.addFitment}</DialogTitle>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "vehicle" | "size")} className="gap-0">
          <TabsList variant="line" className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="vehicle"
              className="h-auto flex-1 flex-col gap-0.5 rounded-none border-b-2 border-transparent px-4 py-3 text-base font-semibold data-active:border-primary data-active:bg-transparent data-active:text-foreground"
            >
              {g.vehicleTab}
              <span className="text-xs font-normal normal-case text-muted-foreground">{g.vehicleTabHint}</span>
            </TabsTrigger>
            <TabsTrigger
              value="size"
              className="h-auto flex-1 flex-col gap-0.5 rounded-none border-b-2 border-transparent px-4 py-3 text-base font-semibold data-active:border-primary data-active:bg-transparent data-active:text-foreground"
            >
              {g.sizeTab}
              <span className="text-xs font-normal normal-case text-muted-foreground">{g.sizeTabHint}</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex items-center gap-4">
              <Image
                src={tab === "vehicle" ? "/images/garage/vehicle-illustration.png" : "/images/garage/tire-diagram.png"}
                alt=""
                aria-hidden="true"
                width={72}
                height={72}
                className="size-16 shrink-0 object-contain"
              />
              <h2 className="font-expanded text-xl font-extrabold uppercase leading-tight">
                {tab === "vehicle" ? g.vehicleTitle : g.sizeTitle}
              </h2>
            </div>

            {signedIn && saved.length > 0 && (
              <div className="flex flex-col gap-2 border border-border bg-muted/40 p-3">
                <span className="label-caps text-muted-foreground">{g.yourGarage}</span>
                <ul className="flex flex-wrap gap-2">
                  {saved.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => pickSaved(row)}
                        className="flex items-center gap-1.5 border border-border bg-background px-3 py-2 text-left text-xs font-semibold hover:border-primary"
                      >
                        {row.isActive && <Check aria-hidden="true" className="size-3.5 text-primary" />}
                        {row.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <TabsContent value="vehicle" className="m-0 flex flex-col gap-4">
              <Step n={1} label={g.make}>
                <select
                  value={make}
                  onChange={(e) => pickMake(e.target.value)}
                  className="h-12 w-full border border-border bg-background px-3 text-base"
                >
                  {makes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Step>
              <Step n={2} label={g.model}>
                <select
                  value={model?.id ?? ""}
                  onChange={(e) => applyModel(models.find((m) => m.id === e.target.value))}
                  className="h-12 w-full border border-border bg-background px-3 text-base"
                >
                  {models.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.model} {item.yearFrom}–{item.yearTo}
                    </option>
                  ))}
                </select>
              </Step>
              <Step n={3} label={g.year}>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="h-12 w-full border border-border bg-background px-3 text-base"
                >
                  {years.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Step>
              {model && model.sizes.length > 1 && (
                <Step n={4} label={g.size}>
                  <div className="flex flex-wrap gap-2">
                    {model.sizes.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={item.id === sizeId}
                        onClick={() => setSizeId(item.id)}
                        className={`h-11 border px-3 text-left font-mono text-xs uppercase ${
                          item.id === sizeId ? "border-primary text-primary" : "border-border text-muted-foreground"
                        }`}
                      >
                        {item.label} {item.width}/{item.aspect}R{item.rim}
                      </button>
                    ))}
                  </div>
                </Step>
              )}

              {vehicleSize && (
                <p className="flex min-w-0 items-baseline gap-1 border-t border-border pt-4 font-expanded text-[clamp(1.5rem,8vw,2.75rem)] font-black leading-none tracking-tight">
                  <span>{vehicleSize.width}</span>
                  <span className="text-primary">/</span>
                  <span>{vehicleSize.aspect}</span>
                  <span className="ml-2 text-muted-foreground">R</span>
                  <span>{vehicleSize.rim}</span>
                </p>
              )}

              {!signedIn && (
                <p className="text-xs text-muted-foreground">{g.signInToSave}</p>
              )}

              <Button type="button" size="lg" className="w-full" onClick={confirmVehicle} disabled={!model || !vehicleSize}>
                {g.shopTires}
              </Button>
            </TabsContent>

            <TabsContent value="size" className="m-0 flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2">
                <SizeSelect label={g.width} value={tireSize.width} options={TIRE_OPTIONS.width} onChange={(width) => setTireSize((s) => ({ ...s, width }))} />
                <SizeSelect label={g.ratio} value={tireSize.aspect} options={TIRE_OPTIONS.aspect} onChange={(aspect) => setTireSize((s) => ({ ...s, aspect }))} />
                <SizeSelect
                  label={g.diameter}
                  value={tireSize.rim}
                  options={TIRE_OPTIONS.rim}
                  prefix="R"
                  onChange={(rim) => setTireSize((s) => ({ ...s, rim }))}
                />
              </div>

              <p className="flex min-w-0 items-baseline gap-1 font-expanded text-[clamp(1.5rem,8vw,2.75rem)] font-black leading-none tracking-tight">
                <span>{tireSize.width}</span>
                <span className="text-primary">/</span>
                <span>{tireSize.aspect}</span>
                <span className="ml-2 text-muted-foreground">R</span>
                <span>{tireSize.rim}</span>
              </p>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="garage-typed-size" className="label-caps text-muted-foreground">
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
                  className="h-12 border border-border bg-background px-3 font-mono text-sm uppercase placeholder:text-muted-foreground"
                />
                {typedError && <p className="text-sm text-primary">{typedError}</p>}
              </div>

              {!signedIn && <p className="text-xs text-muted-foreground">{g.signInToSave}</p>}

              <Button type="button" size="lg" className="w-full" onClick={confirmSize}>
                {g.useThisSize}
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          {n}
        </span>
        {label}
      </span>
      {children}
    </div>
  )
}

function SizeSelect({
  label,
  value,
  options,
  onChange,
  prefix = "",
}: {
  label: string
  value: string
  options: number[]
  onChange: (value: string) => void
  prefix?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="label-caps text-balance text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none border border-border bg-background px-3 font-mono text-base font-semibold"
      >
        {options.map((o) => (
          <option key={o} value={String(o)}>
            {prefix}
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function range(from: number, to: number): number[] {
  const years: number[] = []
  for (let year = to; year >= from; year -= 1) years.push(year)
  return years
}
