export function validTireDraft(product) {
  const t = product?.tire
  const q = t?.utqg
  const validGrade = q && Number.isInteger(q.treadwear) && q.treadwear >= 0 && /^(AA|A|B|C)$/.test(q.traction) && /^[ABC]$/.test(q.temperature)
  const pendingWinter = !q && t?.season === 'winter' && product.verification?.utqgStatus === 'winter-applicability-pending' && product.verification.pending?.some(p => p.includes('UTQG applicability'))
  return Boolean(product?.source === 'verified-tire-drafts-v1' && product.verification?.status === 'draft' &&
    product.brand && product.mpn && product.supplierSku && Array.isArray(product.images) && new Set(product.images).size >= 2 &&
    product.images.every(url => typeof url === 'string' && url.startsWith('https://')) && (validGrade || pendingWinter) &&
    Number.isInteger(t.width) && t.width >= 100 && t.width <= 405 && Number.isInteger(t.aspect) && t.aspect >= 20 && t.aspect <= 90 &&
    Number.isInteger(t.rim) && t.rim >= 13 && t.rim <= 30 && Number.isInteger(t.loadIndex) && t.loadIndex >= 50 && t.loadIndex <= 130 &&
    /^[A-Z]$/.test(t.speedRating) && ['summer', 'winter', 'all-season'].includes(t.season) && typeof t.runFlat === 'boolean' && typeof t.extraLoad === 'boolean' &&
    Number.isInteger(product.offers?.us?.priceCents) && product.offers.us.priceCents > 0 && product.offers.us.availability === 'out_of_stock' && !product.offers.eu)
}

export function validateSelectionTarget(batches) {
  const brands = new Map()
  for (const batch of batches) {
    const names = new Set(batch.products.map(p => `${p.brand}:${p.tire.model.toLowerCase().replace(/[^a-z0-9]/g, '')}`))
    if (names.size !== 1 || !batch.products.length || !Array.isArray(batch.modelPhotos) || batch.modelPhotos.length < 2 ||
      new Set(batch.modelPhotos.map(p => p.sha256)).size < 2 || batch.modelPhotos.some(p => !/^[a-f0-9]{64}$/.test(p.sha256) || p.width < 200 || p.height < 200)) {
      throw new Error('Selection requires one actual model and two verified photos per batch')
    }
    const brand = batch.products[0].brand
    const models = brands.get(brand) ?? new Set()
    const key = [...names][0]
    if (models.has(key)) throw new Error(`Duplicate selected model ${key}`)
    models.add(key)
    brands.set(brand, models)
  }
  if (brands.size < 12 || brands.size > 15 || [...brands.values()].some(models => models.size < 12 || models.size > 15)) {
    throw new Error('Selection must contain 12–15 brands, each with 12–15 models')
  }
}
