"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TIRE_OPTIONS } from "@/lib/catalog"
import type { Market } from "@/lib/markets"
import { cn } from "@/lib/utils"

type Size = { width: string; aspect: string; rim: string }

const SIZE_PATTERN = /^\s*(\d{3})\s*[/\s-]?\s*(\d{2})\s*[zZ]?[rR]?\s*(\d{2})\s*$/

export function SizeFinder({ market }: { market: Market }) {
  const router = useRouter()
  const [size, setSize] = useState<Size>({ width: "225", aspect: "45", rim: "17" })
  const [typed, setTyped] = useState("")
  const [error, setError] = useState<string | null>(null)

  const submit = (s: Size) => {
    const params = new URLSearchParams({ width: s.width, aspect: s.aspect, rim: s.rim })
    router.push(`/${market}/tires?${params.toString()}`)
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
          setError("Use the format 225/45 R17")
          return
        }
        submit(size)
      }}
      className="relative flex flex-col gap-6 border border-foreground/80 bg-card p-5 md:p-7"
      aria-labelledby="size-finder-title"
    >
      <CornerMarks />
      <div className="flex items-center justify-between gap-4">
        <h2 id="size-finder-title" className="label-caps">
          Tire size finder
        </h2>
        <span className="label-caps text-muted-foreground">Read it off your sidewall</span>
      </div>

      <p
        aria-live="polite"
        className="flex items-baseline gap-1 font-expanded text-5xl font-black leading-none tracking-tight sm:text-6xl"
      >
        <span>{size.width}</span>
        <span className="text-primary">/</span>
        <span>{size.aspect}</span>
        <span className="ml-2 text-muted-foreground">R</span>
        <span>{size.rim}</span>
      </p>

      <div className="grid grid-cols-3 gap-2">
        <Segment label="Width" unit="mm" value={size.width} options={TIRE_OPTIONS.width} onChange={(width) => setSize((s) => ({ ...s, width }))} />
        <Segment label="Profile" unit="%" value={size.aspect} options={TIRE_OPTIONS.aspect} onChange={(aspect) => setSize((s) => ({ ...s, aspect }))} />
        <Segment label="Rim" unit="in" value={size.rim} options={TIRE_OPTIONS.rim} onChange={(rim) => setSize((s) => ({ ...s, rim }))} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="typed-size" className="label-caps text-muted-foreground">
            Or type it
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
            className="h-12 border border-border bg-background px-3 font-mono text-sm uppercase placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
          />
        </div>
        <Button type="submit" size="lg" className="sm:min-w-48">
          Find tires
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
  label,
  unit,
  value,
  options,
  onChange,
}: {
  label: string
  unit: string
  value: string
  options: number[]
  onChange: (value: string) => void
}) {
  const id = `seg-${label.toLowerCase()}`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label-caps text-muted-foreground">
        {label} <span className="normal-case tracking-normal">({unit})</span>
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-12 w-full appearance-none border border-border bg-background px-3 font-mono text-base font-semibold",
          "focus-visible:outline-2 focus-visible:outline-ring",
        )}
      >
        {options.map((o) => (
          <option key={o} value={String(o)}>
            {label === "Rim" ? `R${o}` : o}
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
