import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { referenceSizes, type ReferenceModel } from '@/lib/catalog/reference'
import { tireReferenceCopy } from '@/lib/i18n/tire-reference'
import { storePath, type Store } from '@/lib/i18n'

export function ReferenceModelCard({ model, store }: { model: ReferenceModel; store: Store }) {
  const t = tireReferenceCopy(store.lang)
  return <Link href={storePath(store, `/tire-catalog/${model.slug}`)} className="group flex flex-col overflow-hidden border border-border bg-card transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-ring">
    <div className="relative aspect-[4/3] overflow-hidden bg-white">
      <Image src={model.images[0]} alt={`${model.brand} ${model.name}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-5 transition-transform duration-300 motion-safe:group-hover:scale-105" />
    </div>
    <div className="flex flex-1 flex-col gap-3 p-5">
      <p className="label-caps text-primary">{model.brand}</p>
      <h2 className="text-xl font-bold leading-tight">{model.name}</h2>
      <p className="text-sm text-muted-foreground">{model.seasons.map(s => t[s as 'summer' | 'winter' | 'all-season']).join(' · ')}</p>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
        <span className="font-mono text-sm">{referenceSizes(model).length} {t.sizes}</span>
        <span className="flex items-center gap-1 text-sm font-semibold">{t.view}<ArrowUpRight className="size-4" aria-hidden="true" /></span>
      </div>
    </div>
  </Link>
}
