import data from './reference-data.json'

export type ReferenceVariant = { width: number; aspect: number; rim: number; loadIndex: number; speedRating: string; extraLoad: boolean; runFlat: boolean; mpn: string; gtin: string }
export type ReferenceModel = { slug: string; brand: string; name: string; images: string[]; seasons: string[]; sourceUrl: string; variants: ReferenceVariant[] }
export const referenceModels = data as ReferenceModel[]
export const referenceBrands = [...new Set(referenceModels.map(m => m.brand))].sort()
export const referenceSize = (v: ReferenceVariant) => `${v.width}/${v.aspect} R${v.rim}`
export const referenceSizes = (m: ReferenceModel) => [...new Set(m.variants.map(referenceSize))]
export function filterReferenceModels(filters: Record<string, string>) {
  const q = (filters.q || '').toLowerCase().replace(/\s/g, '')
  return referenceModels.filter(m => (!filters.brand || m.brand === filters.brand) &&
    (!filters.season || m.seasons.includes(filters.season)) &&
    m.variants.some(v => (!filters.rim || String(v.rim) === filters.rim) &&
      (!q || `${m.brand} ${m.name}`.toLowerCase().replace(/\s/g, '').includes(q) || referenceSize(v).toLowerCase().replace(/\s/g, '').includes(q))))
}
