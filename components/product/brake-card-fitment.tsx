"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { groupBrakeFitment } from "@/lib/catalog/vehicles"
import type { ContentLang } from "@/lib/i18n"
import type { Market } from "@/lib/markets"
import { cn } from "@/lib/utils"

const LABELS: Record<ContentLang, { models: string; hide: string }> = {
  en: { models: "models", hide: "Hide" },
  de: { models: "Modelle", hide: "Weniger" },
  fr: { models: "modèles", hide: "Masquer" },
  it: { models: "modelli", hide: "Nascondi" },
  es: { models: "modelos", hide: "Ocultar" },
  "es-419": { models: "modelos", hide: "Ocultar" },
  nl: { models: "modellen", hide: "Minder" },
}

export function BrakeCardFitment({
  fitment,
  label,
  market,
  lang,
}: {
  fitment: string[]
  label: string
  market: Market
  lang: ContentLang
}) {
  const [expanded, setExpanded] = useState(false)
  if (!fitment || fitment.length === 0) return null

  const groups = groupBrakeFitment(fitment, market)
  const copy = LABELS[lang] ?? LABELS.en
  const makeNames = groups.map((g) => g.make)
  const previewMakes =
    makeNames.length <= 2 ? makeNames.join(", ") : `${makeNames.slice(0, 2).join(", ")} +${makeNames.length - 2}`

  return (
    <div className="relative z-10 mt-1">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setExpanded((v) => !v)
        }}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-1.5 rounded border border-border/80 bg-muted/35 px-2 py-1 text-left text-[11px] leading-snug text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-muted/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="min-w-0 truncate">
          <span className="font-semibold text-foreground/85">{label}:</span>{" "}
          {previewMakes}{" "}
          <span className="font-mono text-[10px]">
            ({fitment.length} {copy.models})
          </span>
        </span>
        <ChevronDown
          className={cn("size-3.5 shrink-0 transition-transform duration-150", expanded && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-1.5 flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded border border-border bg-background/95 p-2 text-[11px] shadow-chip"
        >
          {groups.map((group) => (
            <div key={group.make} className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
                {group.make}
              </span>
              <ul className="flex flex-col gap-0.5 pl-1.5">
                {group.entries.map((entry) => (
                  <li key={entry.raw} className="text-foreground/90">
                    {entry.model}
                    {entry.years ? (
                      <span className="ml-1 font-mono text-[10px] text-muted-foreground">{entry.years}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
