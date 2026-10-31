import Link from 'next/link'
import { referenceModels } from '@/lib/catalog/reference'
import { ReferenceModelCard } from './reference-model-card'
import { storePath, type Store } from '@/lib/i18n'
import { tireReferenceCopy } from '@/lib/i18n/tire-reference'

export function TireModelsSection({ store, filters }: { store: Store; filters: Record<string, string | undefined> }) {
  const t = tireReferenceCopy(store.lang)
  if (filters.price || filters.stock) return null
  const models = referenceModels.filter(m => (!filters.brand || m.brand === filters.brand) && (!filters.season || m.seasons.includes(filters.season)))
    .map(m => ({ ...m, variants: m.variants.filter(v =>
      (!filters.width || String(v.width) === filters.width) &&
      (!filters.aspect || String(v.aspect) === filters.aspect) &&
      (!filters.rim || String(v.rim) === filters.rim) &&
      (!filters.load || String(v.loadIndex) === filters.load) &&
      (!filters.speed || v.speedRating === filters.speed) &&
      (!filters.runFlat || v.runFlat === (filters.runFlat === 'yes')) &&
      (!filters.extraLoad || v.extraLoad === (filters.extraLoad === 'yes'))
    ) })).filter(m => m.variants.length)
  if (!models.length) return <p role="status" className="py-8 text-center text-muted-foreground">{t.empty}</p>
  const pages = Math.ceil(models.length / 24)
  const page = Math.min(pages, Math.max(1, Number.parseInt(filters.modelsPage || '1', 10) || 1))
  const href = (n: number) => {
    const query = new URLSearchParams(Object.entries(filters).filter((e): e is [string, string] => typeof e[1] === 'string'))
    query.set('modelsPage', String(n))
    return `${storePath(store, '/tires')}?${query}#all-tire-models`
  }
  return <section id="all-tire-models" aria-labelledby="all-models-heading" className="flex scroll-mt-44 flex-col gap-5 border-t border-border py-8">
    <header className="flex flex-wrap items-center justify-between gap-3"><h2 id="all-models-heading" className="text-2xl font-bold">{t.title}</h2><p className="font-mono text-sm text-muted-foreground">{models.length} {t.models}</p></header>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{models.slice((page-1)*24, page*24).map(model => <ReferenceModelCard key={model.slug} model={model} store={store} />)}</div>
    {pages > 1 && (
      <nav aria-label={t.title} className="flex flex-wrap items-center justify-center gap-1.5 py-4 font-mono text-sm">
        {page > 1 && (
          <Link
            href={href(page - 1)}
            className="flex h-9 min-w-9 items-center justify-center border border-border bg-card px-2.5 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            ←
          </Link>
        )}
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <Link
            key={n}
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={
              n === page
                ? "flex h-9 min-w-9 items-center justify-center border border-primary bg-primary px-2.5 font-semibold text-primary-foreground"
                : "flex h-9 min-w-9 items-center justify-center border border-border bg-card px-2.5 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            }
          >
            {n}
          </Link>
        ))}
        {page < pages && (
          <Link
            href={href(page + 1)}
            className="flex h-9 min-w-9 items-center justify-center border border-border bg-card px-2.5 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            →
          </Link>
        )}
      </nav>
    )}
  </section>
}
