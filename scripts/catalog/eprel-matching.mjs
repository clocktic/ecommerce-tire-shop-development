export function brandKey(value) {
  const key = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  return ({ TOYOTIRES: 'TOYO', NOKIANTYRES: 'NOKIAN' })[key] || key
}

export function mpnKey(value) {
  const key = String(value || '').trim().toUpperCase()
  return /^\d+$/.test(key) ? key.replace(/^0+(?=\d)/, '') : key
}

function gtinKey(value) {
  const text = String(value || '').trim()
  return /^(?:\d{8}|\d{12,14})$/.test(text) && /[1-9]/.test(text) ? text.padStart(14, '0') : ''
}

function gtins(record) {
  return (String(record.additionalDetails?.gtinIdentifier || '').match(/\b\d{8,14}\b/g) || []).map(gtinKey).filter(Boolean)
}

export function buildEprelIndex(records) {
  const index = new Map()
  for (const record of records) {
    if (record.status !== 'PUBLISHED' || record.blocked || !/^\d+$/.test(String(record.eprelRegistrationNumber))) continue
    const brand = brandKey(record.supplierOrTrademark)
    const keys = [record.modelIdentifier ? `${brand}:mpn:${mpnKey(record.modelIdentifier)}` : '', ...gtins(record).map(gtin => `${brand}:gtin:${gtin}`)].filter(Boolean)
    for (const key of keys) {
      const bucket = index.get(key) || new Map()
      const id = String(record.eprelRegistrationNumber)
      const prior = bucket.get(id)
      if (!prior || (record.versionNumber || 0) > (prior.versionNumber || 0)) bucket.set(id, record)
      index.set(key, bucket)
    }
  }
  return index
}

function specificationsMatch(product, record) {
  const t = product.tire
  const modelKey = value => String(value || '').toUpperCase().replaceAll('+', 'PLUS').replace(/[^A-Z0-9]/g, '')
  const model = modelKey(t.model || String(product.name || '').split(/\s+(?:LT|P)?\d{2,3}\//)[0])
  const officialModel = modelKey(record.additionalDetails?.commercialName)
  if (!model || !officialModel || model !== officialModel) return false
  if (![record.tyreSection, record.aspectRatio, record.rimDiameter, record.loadCapacityIndex].every(v => v !== null && v !== undefined)) return false
  if (Number(record.tyreSection) !== t.width || Number(record.aspectRatio) !== t.aspect || Number(record.rimDiameter) !== t.rim || Number(record.loadCapacityIndex) !== t.loadIndex) return false
  if (String(record.speedCategorySymbol).toUpperCase() !== t.speedRating.toUpperCase()) return false
  if (['XL', 'SL'].includes(record.loadCapacityIndicator) && (record.loadCapacityIndicator === 'XL') !== t.extraLoad) return false
  const runFlat = record.additionalDetails?.unrestrictedMobility
  if (typeof runFlat === 'boolean' && runFlat !== t.runFlat) return false
  const recordGtins = gtins(record)
  if (gtinKey(product.gtin) && recordGtins.length && !recordGtins.includes(gtinKey(product.gtin))) return false
  return true
}

export function labelFromRecord(record) {
  if (!/^[A-E]$/.test(record.energyClass) || !/^[A-E]$/.test(record.wetGripClass) || !/^[A-C]$/.test(record.externalRollingNoiseClass)) return null
  if (!Number.isInteger(record.externalRollingNoiseValue) || record.externalRollingNoiseValue < 40 || record.externalRollingNoiseValue > 110) return null
  if (typeof record.severeSnowTyre !== 'boolean' || typeof record.iceTyre !== 'boolean') return null
  return { fuelEfficiency: record.energyClass, wetGrip: record.wetGripClass, noiseDb: record.externalRollingNoiseValue, noiseClass: record.externalRollingNoiseClass, snowGrip: record.severeSnowTyre, iceGrip: record.iceTyre, eprelId: String(record.eprelRegistrationNumber) }
}

export function matchEprel(product, index) {
  const brand = brandKey(product.brand)
  const candidates = new Map()
  const keys = [product.mpn ? `${brand}:mpn:${mpnKey(product.mpn)}` : '', gtinKey(product.gtin) ? `${brand}:gtin:${gtinKey(product.gtin)}` : ''].filter(Boolean)
  for (const key of keys) for (const [id, record] of index.get(key) || []) candidates.set(id, record)
  if (!candidates.size) return { status: 'unmatched', candidateIds: [] }
  const exact = [...candidates.values()].filter(record => specificationsMatch(product, record))
  if (!exact.length) return { status: 'specification-conflict', candidateIds: [...candidates.keys()] }
  if (exact.length > 1) return { status: 'ambiguous', candidateIds: exact.map(r => String(r.eprelRegistrationNumber)) }
  const record = exact[0]
  const label = labelFromRecord(record)
  if (!label) return { status: 'incomplete-label', candidateIds: [String(record.eprelRegistrationNumber)] }
  return { status: 'verified', candidateIds: [label.eprelId], label, record }
}
