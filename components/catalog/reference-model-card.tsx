import Image from 'next/image'
import Link from 'next/link'
import type { ReferenceModel } from '@/lib/catalog/reference'
import { ReferenceVariantPicker } from '@/components/catalog/reference-variant-picker'
import { tireReferenceCopy } from '@/lib/i18n/tire-reference'
import { storePath, type Store } from '@/lib/i18n'

export function ReferenceModelCard({ model, store }: { model: ReferenceModel; store: Store }) {
  const t = tireReferenceCopy(store.lang)
  return <article className="group flex flex-col overflow-hidden border border-border bg-card shadow-[0_4px_12px_rgba(0,0,0,0.22),0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-primary">
    <div className="relative aspect-[4/3] overflow-hidden bg-white">
      <Image src={model.images[0]} alt={`${model.brand} ${model.name}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-5 transition-transform duration-300 motion-safe:group-hover:scale-105" />
    </div>
    <div className="flex flex-1 flex-col gap-3 p-5">
      <p className="label-caps text-primary">{model.brand}</p>
      <h2 className="text-xl font-bold leading-tight"><Link href={storePath(store, `/tire-catalog/${model.slug}`)}>{model.name}</Link></h2>
      <p className="text-sm text-muted-foreground">{model.seasons.map(s => t[s as 'summer' | 'winter' | 'all-season']).join(' · ')}</p>
      <ReferenceVariantPicker variants={model.variants} href={storePath(store, `/tire-catalog/${model.slug}`)} labels={t} />
    </div>
  </article>
}
