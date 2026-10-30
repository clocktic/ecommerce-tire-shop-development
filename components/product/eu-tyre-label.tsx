import { Fuel, Snowflake, Volume2, CloudRain } from "lucide-react"
import type { EuTyreLabel as Label, LabelClass } from "@/lib/catalog"
import type { Dictionary } from "@/lib/i18n"
import { fmt } from "@/lib/i18n/fmt"
import { cn } from "@/lib/utils"

type Text = NonNullable<Dictionary["product"]["euLabel"]>

const CLASSES: LabelClass[] = ["A", "B", "C", "D", "E"]

// Regulation (EU) 2020/740: the label classes must be shown next to the price.
// When the EPREL id is known, link the official label and product information sheet.
export function EuTyreLabel({ label, text, compact = false }: { label: Label; text: Text; compact?: boolean }) {
  if (compact) {
    return (
      <dl className="flex items-center gap-3 font-mono text-xs" aria-label={text.title}>
        <div className="flex items-center gap-1">
          <dt>
            <Fuel className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{text.fuel}</span>
          </dt>
          <dd className="font-semibold">{label.fuelEfficiency}</dd>
        </div>
        <div className="flex items-center gap-1">
          <dt>
            <CloudRain className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{text.wet}</span>
          </dt>
          <dd className="font-semibold">{label.wetGrip}</dd>
        </div>
        <div className="flex items-center gap-1">
          <dt>
            <Volume2 className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{text.noise}</span>
          </dt>
          <dd className="font-semibold">{label.noiseDb} dB</dd>
        </div>
      </dl>
    )
  }

  return (
    <section aria-labelledby="eu-label-title" className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <h3 id="eu-label-title" className="label-caps">
          {text.title}
        </h3>
        <span className="font-mono text-xs text-muted-foreground">{text.regulation}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        <Scale icon={<Fuel className="size-4" aria-hidden="true" />} title={text.fuel} value={label.fuelEfficiency} classAria={text.classAria} />
        <Scale icon={<CloudRain className="size-4" aria-hidden="true" />} title={text.wet} value={label.wetGrip} classAria={text.classAria} />
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Volume2 className="size-4" aria-hidden="true" />
            {text.rollingNoise}
          </p>
          <p className="font-mono text-2xl font-semibold tabular-nums">
            {label.noiseDb}
            <span className="text-sm"> dB</span>
          </p>
          <p className="font-mono text-xs text-muted-foreground">{fmt(text.noiseClass, { c: label.noiseClass })}</p>
        </div>
      </div>
      {(label.snowGrip || label.iceGrip || label.eprelId) && (
        <div className="flex flex-wrap items-center gap-4 border-t border-border px-4 py-2 text-sm">
          {label.snowGrip && (
            <span className="flex items-center gap-1.5">
              <Snowflake className="size-4" aria-hidden="true" />
              {text.snow}
            </span>
          )}
          {label.iceGrip && <span>{text.ice}</span>}
          {label.eprelId && (
            <a
              href={`https://eprel.ec.europa.eu/screen/product/tyres/${label.eprelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {text.eprel} · EPREL {label.eprelId}
            </a>
          )}
        </div>
      )}
    </section>
  )
}

function Scale({ icon, title, value, classAria }: { icon: React.ReactNode; title: string; value: LabelClass; classAria: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </p>
      <ol className="flex gap-1" aria-label={fmt(classAria, { title, c: value })}>
        {CLASSES.map((c) => (
          <li
            key={c}
            aria-hidden="true"
            className={cn(
              "flex h-7 flex-1 items-center justify-center font-mono text-xs",
              c === value ? "bg-primary font-semibold text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {c}
          </li>
        ))}
      </ol>
    </div>
  )
}
