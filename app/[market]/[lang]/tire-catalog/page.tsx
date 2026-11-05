import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { parseStore, storePath } from '@/lib/i18n'
import { tireReferenceCopy } from '@/lib/i18n/tire-reference'
import { storeAlternates } from '@/lib/seo'
import { filterReferenceModels, referenceBrands, referenceModels } from '@/lib/catalog/reference'
import { ReferenceModelCard } from '@/components/catalog/reference-model-card'
import { BrandFilterStrip } from '@/components/catalog/brand-filter-strip'
import { FilterSelect } from '@/components/catalog/filter-select'

type Props = { params: Promise<{ market: string; lang: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params; const store = parseStore(p.market, p.lang)
  if (!store) return {}
  const t = tireReferenceCopy(store.lang, store.market)
  return { title: t.title, description: t.intro, alternates: storeAlternates(store, '/tire-catalog') }
}
export default async function ReferenceCatalogue({ params, searchParams }: Props) {
  const p = await params; const store = parseStore(p.market, p.lang)
  if (!store) notFound()
  const raw = await searchParams
  const filters = Object.fromEntries(Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
  const t = tireReferenceCopy(store.lang, store.market)
  const models = filterReferenceModels(filters)
  const brandCounts = referenceBrands.map((name) => ({
    name,
    count: referenceModels.filter((m) => m.brand === name).length,
  }))
  const pages = Math.max(1, Math.ceil(models.length / 24))
  const page = Math.min(pages, Math.max(1, Number.parseInt(filters.page || '1', 10) || 1))
  const link = (n: number) => { const q = new URLSearchParams(filters); q.set('page', String(n)); return `${storePath(store, '/tire-catalog')}?${q}` }
  return <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
    <header className="flex flex-col gap-5 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 max-w-3xl flex-col gap-4"><p className="label-caps text-primary">{t.eyebrow}</p><h1 className="font-expanded break-words text-3xl font-extrabold uppercase leading-tight sm:text-4xl md:text-5xl">{t.title}</h1><p className="max-w-2xl leading-relaxed text-muted-foreground">{t.intro}</p></div>
      <p className="shrink-0 font-mono text-sm">{referenceBrands.length} {t.brands} · {referenceModels.length} {t.models}</p>
    </header>
    <BrandFilterStrip
      brands={brandCounts}
      activeBrand={filters.brand}
      basePath={storePath(store, '/tire-catalog')}
      currentFilters={filters}
      allLabel={t.all}
    />
    <form method="get" className="grid grid-cols-2 gap-3 border-b border-border py-5 sm:gap-4 sm:py-6 lg:grid-cols-6">
      <div className="col-span-2 flex flex-col gap-1.5 lg:col-span-2"><label htmlFor="model-search" className="label-caps text-muted-foreground">{t.search}</label><input id="model-search" name="q" defaultValue={filters.q} placeholder="Michelin · 225/45 R18" className="h-10 border border-border bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring sm:h-12" /></div>
      <FilterSelect name="brand" label={t.brand} any={t.all} value={filters.brand} options={referenceBrands} />
      <FilterSelect name="season" label={t.season} any={t.all} value={filters.season} options={['summer', 'winter', 'all-season']} labels={t} />
      <FilterSelect name="rim" label={t.rim} any={t.all} value={filters.rim} options={[...new Set(referenceModels.flatMap(m => m.variants.map(v => v.rim)))].sort((a,b) => a-b).map(String)} />
      <div className="flex items-end gap-2.5 sm:gap-3"><button type="submit" className="h-10 flex-1 bg-primary px-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:opacity-90 sm:h-12 sm:flex-initial sm:px-5 sm:text-sm">{t.apply}</button><Link href={storePath(store, '/tire-catalog')} className="py-2.5 text-xs underline sm:py-3 sm:text-sm">{t.reset}</Link></div>
    </form>
    <div className="flex flex-wrap items-center justify-between gap-3 py-5"><p aria-live="polite" className="font-mono text-sm text-muted-foreground">{models.length} {t.models}</p><Link href={storePath(store, '/tires')} className="text-sm font-semibold underline underline-offset-4">{t.shop} →</Link></div>
    {models.length ? <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{models.slice((page-1)*24, page*24).map(m => <ReferenceModelCard key={m.slug} model={m} store={store} />)}</div> : <p role="status" className="border border-border p-10 text-center text-muted-foreground">{t.empty}</p>}
    {pages > 1 && (
      <nav aria-label={t.models} className="flex flex-wrap items-center justify-center gap-1.5 py-8 font-mono text-sm">
        {page > 1 && (
          <Link
            rel="prev"
            href={link(page - 1)}
            className="flex h-9 min-w-9 items-center justify-center border border-border bg-card px-2.5 text-muted-foreground shadow-chip transition-transform duration-200 hover:-translate-y-0.5 hover:border-foreground hover:text-foreground"
          >
            ←
          </Link>
        )}
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <Link
            key={n}
            href={link(n)}
            aria-current={n === page ? "page" : undefined}
            className={
              n === page
                ? "flex h-9 min-w-9 items-center justify-center border border-primary bg-primary px-2.5 font-semibold text-primary-foreground shadow-chip transition-transform duration-200 hover:-translate-y-0.5"
                : "flex h-9 min-w-9 items-center justify-center border border-border bg-card px-2.5 text-muted-foreground shadow-chip transition-transform duration-200 hover:-translate-y-0.5 hover:border-foreground hover:text-foreground"
            }
          >
            {n}
          </Link>
        ))}
        {page < pages && (
          <Link
            rel="next"
            href={link(page + 1)}
            className="flex h-9 min-w-9 items-center justify-center border border-border bg-card px-2.5 text-muted-foreground shadow-chip transition-transform duration-200 hover:-translate-y-0.5 hover:border-foreground hover:text-foreground"
          >
            →
          </Link>
        )}
      </nav>
    )}
  </div>
}
