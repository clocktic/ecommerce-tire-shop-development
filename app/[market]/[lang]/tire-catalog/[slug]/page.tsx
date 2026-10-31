import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseStore, storePath } from '@/lib/i18n'
import { tireReferenceCopy } from '@/lib/i18n/tire-reference'
import { referenceModels, referenceSize, referenceSizes } from '@/lib/catalog/reference'
import { storeAlternates } from '@/lib/seo'
import { FilterSelect } from '@/components/catalog/filter-select'

type Props = { params: Promise<{ market: string; lang: string; slug: string }>; searchParams: Promise<{ size?: string | string[]; mpn?: string | string[]; gtin?: string | string[] }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params; const store = parseStore(p.market, p.lang); const model = referenceModels.find(m => m.slug === p.slug)
  if (!store || !model) return {}
  const t = tireReferenceCopy(store.lang)
  return { title: `${model.brand} ${model.name} | ${t.title}`, description: t.intro, alternates: storeAlternates(store, `/tire-catalog/${model.slug}`) }
}
export default async function ReferenceModelPage({ params, searchParams }: Props) {
  const p = await params; const store = parseStore(p.market, p.lang); const model = referenceModels.find(m => m.slug === p.slug)
  if (!store || !model) notFound()
  const t = tireReferenceCopy(store.lang)
  const query = await searchParams
  const size = typeof query.size === 'string' ? query.size : ''
  const mpn = typeof query.mpn === 'string' ? query.mpn : ''
  const gtin = typeof query.gtin === 'string' ? query.gtin : ''
  const variants = model.variants.filter(v => (!size || referenceSize(v) === size) && (!mpn || v.mpn === mpn) && (!gtin || v.gtin === gtin))
  const rims = [...new Set(model.variants.map(v => v.rim))].sort((a, b) => a - b)
  return <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
    <Link href={storePath(store, `/tire-catalog?brand=${encodeURIComponent(model.brand)}`)} className="text-sm text-muted-foreground underline underline-offset-4">← {t.back}</Link>
    <header className="my-8 flex flex-col gap-3"><p className="label-caps text-primary">{model.brand}</p><h1 className="font-expanded break-words text-3xl font-extrabold uppercase sm:text-4xl md:text-6xl">{model.name}</h1><p className="font-mono text-sm text-muted-foreground">{referenceSizes(model).length} {t.sizes} · {model.variants.length} {t.variants}</p></header>
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <figure className="flex flex-col gap-3"><div className="grid grid-cols-2 gap-2">{model.images.map((src, i) => <div key={src} className="relative aspect-square border border-border bg-white"><Image src={src} alt={`${model.brand} ${model.name} — ${i+1}`} fill priority={i===0} sizes="(max-width: 1024px) 45vw, 350px" className="object-contain p-4" /></div>)}</div><figcaption className="text-xs leading-relaxed text-muted-foreground">{t.photos}</figcaption></figure>
      <aside className="flex flex-col items-start gap-5 border border-border bg-card p-6 shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)]">
        <p className="label-caps text-primary">{t.title}</p>
        <dl className="grid w-full gap-3 border-y border-border py-4 text-sm">
          <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">{t.brand}</dt><dd className="font-semibold">{model.brand}</dd></div>
          <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">{t.season}</dt><dd className="font-semibold">{model.seasons.map(s => t[s as 'summer' | 'winter' | 'all-season']).join(' · ')}</dd></div>
          <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">{t.rim}</dt><dd className="font-mono font-semibold">{rims.map(r => `R${r}`).join(' · ')}</dd></div>
          <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">{t.sizes}</dt><dd className="font-mono font-semibold">{referenceSizes(model).length}</dd></div>
        </dl>
        <Link href={storePath(store, `/tires?brand=${encodeURIComponent(model.brand)}`)} className="bg-primary px-6 py-3 font-semibold text-primary-foreground">{t.shop} →</Link>
        <Link href={storePath(store, '/contact')} className="text-sm underline underline-offset-4">{t.contact}</Link>
      </aside>
    </div>
    <section className="mt-10 flex flex-col gap-5" aria-labelledby="model-sizes"><h2 id="model-sizes" className="text-2xl font-bold">{t.sizes}</h2><form method="get" className="flex flex-wrap items-end gap-3"><FilterSelect name="size" label={t.size} any={t.all} value={size} options={referenceSizes(model)} /><button type="submit" className="h-12 bg-primary px-5 font-semibold text-primary-foreground">{t.apply}</button><Link href={storePath(store, `/tire-catalog/${model.slug}`)} className="px-2 py-3 text-sm underline">{t.reset}</Link></form>
      <p className="font-mono text-sm text-muted-foreground">{variants.length} {t.variants}</p>
      <div className="overflow-x-auto border border-border shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)]"><table className="w-full text-left text-sm"><caption className="sr-only">{model.brand} {model.name} — {t.variants}</caption><thead className="bg-muted text-muted-foreground"><tr>{[t.size,t.load,t.marking,t.article].map(h => <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody>{variants.map((v,i) => <tr key={`${v.mpn}-${i}`} className="border-t border-border"><th scope="row" className="whitespace-nowrap px-4 py-3 font-mono font-medium">{referenceSize(v)}</th><td className="px-4 py-3 font-mono">{v.loadIndex}{v.speedRating}</td><td className="px-4 py-3">{[v.extraLoad && 'XL',v.runFlat && 'Run-flat'].filter(Boolean).join(' · ') || '—'}</td><td className="px-4 py-3 font-mono">{v.mpn}</td></tr>)}</tbody></table></div>
    </section>
  </div>
}
