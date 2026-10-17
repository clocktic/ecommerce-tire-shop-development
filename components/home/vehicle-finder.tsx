"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import { makesFor, sizeKey, vehiclesFor, type FactorySize, type VehicleModel } from "@/lib/catalog/vehicles"
import { storePath, type Lang } from "@/lib/i18n/config"

const COPY: Record<Lang, {
  eyebrow: string
  title: string
  lead: string
  make: string
  model: string
  year: string
  size: string
  submit: string
  inStock: string
  listed: string
  note: string
}> = {
  en: {
    eyebrow: "Fitment",
    title: "Shop by make and model",
    lead: "Factory size for the cars we see most. Match it to the sidewall before you order.",
    make: "Make",
    model: "Model",
    year: "Year",
    size: "Factory size",
    submit: "Shop this size",
    inStock: "In stock",
    listed: "Size listed — not on the rack yet",
    note: "Option packages change the size. The sidewall is the one that fits.",
  },
  es: {
    eyebrow: "Medida de origen",
    title: "Busca por marca y modelo",
    lead: "Medida de fábrica de los autos más comunes. Confírmala en el costado antes de pedir.",
    make: "Marca",
    model: "Modelo",
    year: "Año",
    size: "Medida de fábrica",
    submit: "Ver esta medida",
    inStock: "En existencia",
    listed: "Medida anotada — aún no en catálogo",
    note: "Los paquetes opcionales cambian la medida. Manda el costado del neumático.",
  },
  de: {
    eyebrow: "Erstausrüstung",
    title: "Nach Marke und Modell",
    lead: "Seriengröße der häufigsten Autos. Vor der Bestellung an der Flanke prüfen.",
    make: "Marke",
    model: "Modell",
    year: "Jahr",
    size: "Seriengröße",
    submit: "Diese Größe ansehen",
    inStock: "Auf Lager",
    listed: "Größe bekannt — noch nicht im Regal",
    note: "Sonderausstattung ändert die Größe. Es gilt die Flanke.",
  },
  fr: {
    eyebrow: "Monte d'origine",
    title: "Par marque et modèle",
    lead: "Dimension d'origine des voitures les plus courantes. Vérifiez le flanc avant de commander.",
    make: "Marque",
    model: "Modèle",
    year: "Année",
    size: "Dimension d'origine",
    submit: "Voir cette dimension",
    inStock: "En stock",
    listed: "Dimension notée — pas encore au catalogue",
    note: "Les options changent la dimension. Le flanc fait foi.",
  },
  it: {
    eyebrow: "Misura di serie",
    title: "Per marca e modello",
    lead: "Misura di fabbrica delle auto più comuni. Controlla il fianco prima di ordinare.",
    make: "Marca",
    model: "Modello",
    year: "Anno",
    size: "Misura di serie",
    submit: "Vedi questa misura",
    inStock: "Disponibile",
    listed: "Misura nota — non ancora a catalogo",
    note: "Gli allestimenti cambiano la misura. Vale il fianco.",
  },
  nl: {
    eyebrow: "Fabrieksmaat",
    title: "Op merk en model",
    lead: "Fabrieksmaat van de meest voorkomende auto's. Controleer de wang voor je bestelt.",
    make: "Merk",
    model: "Model",
    year: "Jaar",
    size: "Fabrieksmaat",
    submit: "Deze maat bekijken",
    inStock: "Op voorraad",
    listed: "Maat bekend — nog niet in het schap",
    note: "Optiepakketten wijzigen de maat. De wang telt.",
  },
}

export function VehicleFinder({ stockedSizes }: { stockedSizes: string[] }) {
  const router = useRouter()
  const { store } = useI18n()
  const copy = COPY[store.lang] ?? COPY.en
  const makes = makesFor(store.market)
  const [make, setMake] = useState(makes[0] ?? "")
  const models = useMemo(
    () => vehiclesFor(store.market).filter((vehicle) => vehicle.make === make),
    [store.market, make],
  )
  const [modelId, setModelId] = useState(models[0]?.id ?? "")
  const model = models.find((item) => item.id === modelId) ?? models[0]
  const [year, setYear] = useState(model?.yearTo ?? 2024)
  const [sizeId, setSizeId] = useState(model?.sizes[0]?.id ?? "")
  const size = model?.sizes.find((item) => item.id === sizeId) ?? model?.sizes[0]
  const years = model ? range(model.yearFrom, model.yearTo) : []
  const key = size ? sizeKey(size.width, size.aspect, size.rim) : ""
  const inStock = stockedSizes.includes(key)

  const pickMake = (next: string) => {
    const nextModels = vehiclesFor(store.market).filter((vehicle) => vehicle.make === next)
    setMake(next)
    applyModel(nextModels[0])
  }

  const applyModel = (next?: VehicleModel) => {
    if (!next) return
    setModelId(next.id)
    setYear(next.yearTo)
    setSizeId(next.sizes[0]?.id ?? "")
  }

  const shop = () => {
    if (!size) return
    const params = new URLSearchParams({
      width: String(size.width),
      aspect: String(size.aspect),
      rim: String(size.rim),
    })
    router.push(`${storePath(store, "/tires")}?${params.toString()}`)
  }

  if (!model || !size) return null

  return (
    <section aria-labelledby="vehicle-finder-title" className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-16">
      <div className="mb-4 max-w-2xl">
        <p className="label-caps text-primary">{copy.eyebrow}</p>
        <h2 id="vehicle-finder-title" className="mt-2 font-expanded text-2xl font-extrabold uppercase leading-none md:text-4xl">
          {copy.title}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">{copy.lead}</p>
      </div>

      <div className="relative min-w-0 border border-foreground/80 bg-card p-4 md:p-7">
        <CornerMarks />
        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label={copy.make}>
          {makes.map((item) => {
            const selected = item === make
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => pickMake(item)}
                className={`h-11 shrink-0 border px-3 font-expanded text-xs font-bold uppercase tracking-wide ${
                  selected ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground"
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="label-caps text-muted-foreground">{copy.model}</span>
            <select
              value={model.id}
              onChange={(event) => applyModel(models.find((item) => item.id === event.target.value))}
              className="h-12 w-full border border-border bg-background px-3 text-base"
            >
              {models.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.model}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="label-caps text-muted-foreground">{copy.year}</span>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="h-12 w-full border border-border bg-background px-3 text-base"
            >
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        {model.sizes.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={copy.size}>
            {model.sizes.map((item) => (
              <SizeChoice key={item.id} size={item} selected={item.id === size.id} onSelect={() => setSizeId(item.id)} />
            ))}
          </div>
        )}

        <p aria-live="polite" className="mt-5 flex min-w-0 items-baseline gap-1 font-expanded text-[clamp(1.7rem,10vw,3.75rem)] font-black leading-none tracking-tight">
          <span>{size.width}</span>
          <span className="text-primary">/</span>
          <span>{size.aspect}</span>
          <span className="ml-2 text-muted-foreground">R</span>
          <span>{size.rim}</span>
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {model.make} {model.model} {year}
          {" · "}
          {inStock ? copy.inStock : copy.listed}
        </p>

        <Button type="button" size="lg" className="mt-5 w-full sm:w-auto sm:min-w-48" onClick={shop}>
          {copy.submit}
          <ArrowRight aria-hidden="true" />
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">{copy.note}</p>
      </div>
    </section>
  )
}

function SizeChoice({ size, selected, onSelect }: { size: FactorySize; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`h-11 border px-3 text-left font-mono text-xs uppercase ${
        selected ? "border-primary text-primary" : "border-border text-muted-foreground"
      }`}
    >
      {size.label} {size.width}/{size.aspect}R{size.rim}
    </button>
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

function range(from: number, to: number): number[] {
  const years: number[] = []
  for (let year = to; year >= from; year -= 1) years.push(year)
  return years
}
