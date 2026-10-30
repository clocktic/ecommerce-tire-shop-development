'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import type { ReferenceVariant } from '@/lib/catalog/reference'

const sizeOf = (v: ReferenceVariant) => `${v.width}/${v.aspect} R${v.rim}`

export function ReferenceVariantPicker({ variants, href, labels }: {
  variants: ReferenceVariant[]
  href: string
  labels: { size: string; article: string; variants: string; view: string }
}) {
  const id = useId()
  const [index, setIndex] = useState(0)
  const selected = variants[index]
  if (!selected) return null
  const size = sizeOf(selected)
  const sizes = [...new Set(variants.map(sizeOf))]
  const options = variants.map((v, i) => ({ v, i })).filter(({ v }) => sizeOf(v) === size)
  return <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
    <label htmlFor={`${id}-size`} className="text-xs text-muted-foreground">{labels.size}</label>
    <select id={`${id}-size`} value={size} onChange={e => setIndex(variants.findIndex(v => sizeOf(v) === e.target.value))} className="h-11 w-full min-w-0 rounded-none border border-border bg-background px-2 text-sm focus-visible:outline-2 focus-visible:outline-ring">
      {sizes.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
    <label htmlFor={`${id}-variant`} className="text-xs text-muted-foreground">{labels.variants}</label>
    <select id={`${id}-variant`} value={index} onChange={e => setIndex(Number(e.target.value))} className="h-11 w-full min-w-0 rounded-none border border-border bg-background px-2 text-sm focus-visible:outline-2 focus-visible:outline-ring">
      {options.map(({ v, i }) => <option key={i} value={i}>{v.loadIndex}{v.speedRating}{v.extraLoad ? ' · XL' : ''}{v.runFlat ? ' · Run-flat' : ''} · {v.mpn}{v.gtin ? ` · ${v.gtin}` : ''}</option>)}
    </select>
    <dl aria-live="polite" className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
      <dt className="text-muted-foreground">MPN</dt><dd className="break-all text-right font-mono">{selected.mpn || '—'}</dd>
      <dt className="text-muted-foreground">EAN / GTIN</dt><dd className="break-all text-right font-mono">{selected.gtin || '—'}</dd>
    </dl>
    <Link href={`${href}?size=${encodeURIComponent(size)}&mpn=${encodeURIComponent(selected.mpn)}&gtin=${encodeURIComponent(selected.gtin)}`} className="mt-1 text-sm font-semibold underline underline-offset-4">{labels.view} →</Link>
  </div>
}
