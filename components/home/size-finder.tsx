"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useGarage } from "@/components/garage/garage-provider"
import { FitmentModal } from "@/components/garage/fitment-modal"
import { Icon3D } from "@/components/ui/icon-3d"
import { TIRE_OPTIONS } from "@/lib/catalog"
import { POPULAR_TIRE_SIZES } from "@/lib/catalog/vehicles"
import { storePath } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

type Size = { width: string; aspect: string; rim: string }

const SIZE_PATTERN = /^\s*(\d{3})\s*[/\s-]?\s*(\d{2})\s*[zZ]?[rR]?\s*(\d{2})\s*$/

export function SizeFinder() {
  const router = useRouter()
  const { store, t, x } = useI18n()
  const f = t.home.finder
  const g = x.garage
  const { active, applySelection } = useGarage()
  const [size, setSize] = useState<Size>(() => ({
    width: String(active?.width ?? 225),
    aspect: String(active?.aspect ?? 45),
    rim: String(active?.rim ?? 17),
  }))
  const [typed, setTyped] = useState("")
  const [error, setError] = useState<string | null>(null)

  const submit = (s: Size) => {
    applySelection({
      kind: "size",
      label: `${s.width}/${s.aspect}R${s.rim}`,
      width: Number(s.width),
      aspect: Number(s.aspect),
      rim: Number(s.rim),
    })
    const params = new URLSearchParams({ width: s.width, aspect: s.aspect, rim: s.rim })
    router.push(`${storePath(store, "/tires")}?${params.toString()}`)
  }

  const onTyped = (value: string) => {
    setTyped(value)
    const match = value.match(SIZE_PATTERN)
    if (match) {
      setSize({ width: match[1], aspect: match[2], rim: match[3] })
      setError(null)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (typed && !SIZE_PATTERN.test(typed)) {
          setError(f.error)
          return
        }
        submit(size)
      }}
      className="relative flex flex-col gap-4 border border-foreground/80 bg-card p-4 shadow-lifted sm:gap-5 sm:p-5 md:p-7"
      aria-labelledby="size-finder-title"
    >
      <CornerMarks />
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Icon3D name="tiresize" size="sm" />
          <h2 id="size-finder-title" className="label-caps">
            {f.title}
          </h2>
        </div>
        <FitmentModal
          defaultTab="vehicle"
          trigger={
            <button
              type="button"
              className="group inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 py-1 pl-1 pr-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-foreground shadow-chip transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              <Icon3D name="vehicle" size="xs" />
              {g.vehicleTab}
            </button>
          }
        />
      </div>

      <p
        aria-live="polite"
        className="flex min-w-0 items-baseline gap-1 font-expanded text-[clamp(1.7rem,9.5vw,3.5rem)] font-black leading-none tracking-tight"
      >
        <span>{size.width}</span>
        <span className="text-primary">/</span>
        <span>{size.aspect}</span>
        <span className="ml-2 text-muted-foreground">R</span>
        <span>{size.rim}</span>
      </p>

      {/* Quick 1-Tap Popular Tire Sizes */}
      <div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {POPULAR_TIRE_SIZES[store.market].slice(0, 5).map((preset) => {
          const isPresetSelected =
            size.width === String(preset.width) &&
            size.aspect === String(preset.aspect) &&
            size.rim === String(preset.rim)
          const label = `${preset.width}/${preset.aspect}R${preset.rim}`
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                const next = {
                  width: String(preset.width),
                  aspect: String(preset.aspect),
                  rim: String(preset.rim),
                }
                setSize(next)
                setTyped("")
                setError(null)
              }}
              className={cn(
                "shrink-0 border px-2 py-1 font-mono text-[11px] font-semibold transition-colors",
                isPresetSelected
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-background/70 text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {preset.width}/{preset.aspect} R{preset.rim}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 *:min-w-0">
        <Segment id="width" label={f.width} unit="mm" value={size.width} options={TIRE_OPTIONS.width} onChange={(width) => setSize((s) => ({ ...s, width }))} />
        <Segment id="aspect" label={f.profile} unit="%" value={size.aspect} options={TIRE_OPTIONS.aspect} onChange={(aspect) => setSize((s) => ({ ...s, aspect }))} />
        <Segment id="rim" label={f.rim} unit="in" value={size.rim} options={TIRE_OPTIONS.rim} onChange={(rim) => setSize((s) => ({ ...s, rim }))} />
      </div>

      <div className="flex items-end gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor="typed-size" className="label-caps truncate text-[10px] text-muted-foreground sm:text-xs">
            {f.orType}
          </label>
          <input
            id="typed-size"
            value={typed}
            onChange={(e) => onTyped(e.target.value)}
            placeholder="225/45 R17"
            inputMode="text"
            autoComplete="off"
            aria-invalid={!!error}
            aria-describedby={error ? "typed-size-error" : undefined}
            className="h-11 w-full border border-border bg-background px-2.5 font-mono text-xs uppercase shadow-chip transition-transform duration-200 hover:-translate-y-0.5 placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring sm:h-12 sm:px-3 sm:text-sm"
          />
        </div>
        <Button type="submit" size="lg" className="h-11 shrink-0 px-4 sm:h-12 sm:min-w-44 sm:px-6">
          {f.submit}
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
      {error && (
        <p id="typed-size-error" className="-mt-3 text-sm text-primary">
          {error}
        </p>
      )}
    </form>
  )
}

function Segment({
  id: name,
  label,
  unit,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  unit: string
  value: string
  options: number[]
  onChange: (value: string) => void
}) {
  const id = `seg-${name}`
  return (
    <div className="flex min-w-0 flex-col justify-between gap-1.5">
      <label htmlFor={id} className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
        {label} <span className="normal-case tracking-normal">({unit})</span>
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-12 w-full appearance-none border border-border bg-background px-2.5 font-mono text-base font-semibold shadow-chip transition-transform duration-200 hover:-translate-y-0.5 sm:px-3",
          "focus-visible:outline-2 focus-visible:outline-ring",
        )}
      >
        {options.map((o) => (
          <option key={o} value={String(o)}>
            {name === "rim" ? `R${o}` : o}
          </option>
        ))}
      </select>
    </div>
  )
}

function CornerMarks() {
  const base = "pointer-events-none absolute size-3 border-primary"
  return (
    <>
      <span aria-hidden="true" className={`${base} -left-px -top-px border-l-2 border-t-2`} />
      <span aria-hidden="true" className={`${base} -right-px -top-px border-r-2 border-t-2`} />
      <span aria-hidden="true" className={`${base} -bottom-px -left-px border-b-2 border-l-2`} />
      <span aria-hidden="true" className={`${base} -bottom-px -right-px border-b-2 border-r-2`} />
    </>
  )
}
