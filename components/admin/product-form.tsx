"use client"

import { useActionState, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { saveProduct, type ActionResult } from "@/lib/actions/admin"
import type { Product } from "@/lib/catalog/types"
import { markets } from "@/lib/markets"
import { cn } from "@/lib/utils"

const AVAILABILITY_RU = { in_stock: "В наличии", out_of_stock: "Нет в наличии", preorder: "Предзаказ" } as const

function toMoney(cents?: number) {
  return cents ? (cents / 100).toFixed(2) : ""
}

function toLocalInput(iso?: string) {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Category block, specs and translations are edited as JSON so every field the
// storefront and feeds rely on (EU label, UTQG, approvals) stays editable.
function extraJson(product: Product) {
  const { tire, wheel, brake } = product as Partial<{ tire: unknown; wheel: unknown; brake: unknown }>
  return JSON.stringify(
    { ...(tire ? { tire } : {}), ...(wheel ? { wheel } : {}), ...(brake ? { brake } : {}), specs: product.specs, translations: product.translations ?? {} },
    null,
    2,
  )
}

export function ProductForm({ product, archived, isNew }: { product: Product; archived: boolean; isNew: boolean }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveProduct, null)
  const [images, setImages] = useState<string[]>(product.images)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [slug, setSlug] = useState(product.slug)

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setUploadError(null)
    try {
      for (const file of Array.from(files)) {
        const body = new FormData()
        body.append("file", file)
        body.append("slug", slug)
        const res = await fetch("/api/admin/upload", { method: "POST", body })
        const json = (await res.json()) as { url?: string; error?: string }
        if (!res.ok || !json.url) throw new Error(json.error ?? "Ошибка загрузки")
        setImages((prev) => [...prev, json.url!])
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form action={action} className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/catalog" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> Каталог
        </Link>
        <div className="flex items-center gap-3">
          {state && (
            <p role="status" className={cn("text-sm", state.ok ? "text-foreground" : "text-primary")}>
              {state.ok ? state.message : state.error}
            </p>
          )}
          {!isNew && (
            <a href={`/us/en/product/${product.slug}`} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">
              На витрине
            </a>
          )}
          <Button type="submit" disabled={pending || uploading}>
            {pending ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </div>

      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="category" value={product.category} />
      <input type="hidden" name="images" value={images.join("\n")} />

      <Section title="Основное">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Название (EN)" name="name" defaultValue={product.name} required />
          <Field label="Бренд" name="brand" defaultValue={product.brand} required />
          <Field label="Slug (URL)" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[a-z0-9-]+" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="GTIN (реальный или пусто)" name="gtin" defaultValue={product.gtin} inputMode="numeric" />
            <Field label="MPN" name="mpn" defaultValue={product.mpn} />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="sample" defaultChecked={!!product.sample} className="size-4 accent-primary" />
            Демо-товар (noindex, не в фиде)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="archived" defaultChecked={archived} className="size-4 accent-primary" />
            В архиве (скрыт с витрины)
          </label>
        </div>
      </Section>

      <Section title="Фото">
        <ul className="flex flex-wrap gap-3">
          {images.map((src, i) => (
            <li key={src} className="relative size-28 border border-border bg-photo">
              <Image src={src} alt={`Фото ${i + 1}`} fill className="object-contain p-1" sizes="112px" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((s) => s !== src))}
                aria-label={`Удалить фото ${i + 1}`}
                className="absolute right-1 top-1 bg-background/90 p-1"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
              {i === 0 && <span className="absolute bottom-1 left-1 bg-background/90 px-1 text-[10px]">Главное</span>}
            </li>
          ))}
          <li>
            <label className="flex size-28 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-border text-xs text-muted-foreground hover:border-foreground">
              <Upload className="size-5" aria-hidden="true" />
              {uploading ? "Загрузка…" : "Добавить"}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
            </label>
          </li>
        </ul>
        {uploadError && <p className="text-sm text-primary">{uploadError}</p>}
        <p className="text-xs text-muted-foreground">Только настоящие фото именно этого товара. Первое фото идёт в фид как основное.</p>
      </Section>

      <Section title="Цены и наличие">
        <div className="grid gap-4 lg:grid-cols-2">
          {markets.map((m) => {
            const offer = product.offers[m]
            return (
              <fieldset key={m} className="flex flex-col gap-3 border border-border p-4">
                <legend className="px-1">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" name={`${m}.enabled`} defaultChecked={!!offer} className="size-4 accent-primary" />
                    Продаётся в {m.toUpperCase()} ({m === "us" ? "USD" : "EUR"})
                  </label>
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Цена" name={`${m}.price`} defaultValue={toMoney(offer?.priceCents)} inputMode="decimal" />
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="label-caps text-muted-foreground">Наличие</span>
                    <select name={`${m}.availability`} defaultValue={offer?.availability ?? "in_stock"} className="h-10 border border-border bg-background px-3">
                      {Object.entries(AVAILABILITY_RU).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field label="Старая цена (скидка)" name={`${m}.compareAt`} defaultValue={toMoney(offer?.compareAtCents)} inputMode="decimal" />
                  <Field label="Скидка до" name={`${m}.saleEndsAt`} type="datetime-local" defaultValue={toLocalInput(offer?.saleEndsAt)} />
                  <Field label="Предзаказ: доступен с" name={`${m}.availableFrom`} type="date" defaultValue={offer?.availableFrom?.slice(0, 10)} />
                </div>
              </fieldset>
            )
          })}
        </div>
      </Section>

      <Section title="Тексты (EN, базовые)">
        <TextArea label="Короткое описание" name="shortDescription" defaultValue={product.shortDescription} rows={2} />
        <TextArea label="Описание" name="description" defaultValue={product.description} rows={6} />
        <TextArea label="Преимущества — по одному в строке" name="highlights" defaultValue={product.highlights.join("\n")} rows={4} />
      </Section>

      <Section title="Характеристики, параметры категории и переводы (JSON)">
        <TextArea label="tire / wheel / brake, specs, translations" name="extra" defaultValue={extraJson(product)} rows={18} mono />
      </Section>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border border-border bg-card p-5">
      <h2 className="label-caps">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="label-caps text-muted-foreground">{label}</span>
      <input name={name} className="h-10 border border-border bg-background px-3" {...props} />
    </label>
  )
}

function TextArea({ label, name, mono, ...props }: { label: string; name: string; mono?: boolean } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="label-caps text-muted-foreground">{label}</span>
      <textarea name={name} className={cn("border border-border bg-background px-3 py-2 leading-relaxed", mono && "font-mono text-xs")} {...props} />
    </label>
  )
}
