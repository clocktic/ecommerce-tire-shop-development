export function brandKey(value) {
  const text = String(value || '').trim().toUpperCase()
  const trademarkWithPattern = text.match(/^(FALKEN|KUMHO|DUNLOP)(?:\s|$)/)
  if (trademarkWithPattern) return trademarkWithPattern[1]
  const key = text.replace(/[^A-Z0-9]/g, '')
  return ({ TOYOTIRES: 'TOYO', NOKIANTYRES: 'NOKIAN', HANKOOKTIRE: 'HANKOOK', NEXENTIRE: 'NEXEN' })[key] || key
}

export function mpnKey(value) {
  const key = String(value || '').trim().toUpperCase()
  return /^\d+$/.test(key) ? key.replace(/^0+(?=\d)/, '') : key
}

export function manufacturerKeys(brand, value) {
  const text = String(value || '').trim().toUpperCase()
  const keys = [mpnKey(text)]
  if (brand === 'PIRELLI' && /^\d{5}00$/.test(text)) keys.push(mpnKey(text.slice(0, 5)))
  if (brand === 'NEXEN' && /^[A-Z0-9]{5}NXK$/.test(text)) keys.push(mpnKey(text.slice(0, 5)))
  if (brand === 'CONTINENTAL' && /^\d{7}0000$/.test(text)) keys.push(mpnKey(text.slice(0, 7)))
  return [...new Set(keys.filter(Boolean))]
}

export function modelKey(brand, value) {
  const key = String(value || '').toUpperCase().replaceAll('+', 'PLUS').replace(/[^A-Z0-9]/g, '')
  const aliases = {
    KUMHO: { CRUGENHP71: 'HP71', CRUGENHP91: 'HP91', CRUGENHT51: 'HT51', ECOWINGES31: 'ES31', ECOWINGES01KH27: 'KH27', ECSTASPORTPS72: 'ECSTASPORT', ROADVENTUREAT52: 'AT52', SOLUS4SHA32: 'HA32' },
    CONTINENTAL: { CONTISPORTCONTACT2: 'SPORTCONTACT2', CONTISPORTCONTACT5SUV: 'CONTISPORTCONTACT5' },
    PIRELLI: { PZEROPZ4SPORT: 'PZERO', PZEROCORSAPZC4: 'PZEROCORSA', PZEROROSSOASIMMETRICO: 'PZEROROSSO' },
  }
  return aliases[brand]?.[key] || key
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
    const keys = [`${brand}:eprel:${record.eprelRegistrationNumber}`, ...manufacturerKeys(brand, record.modelIdentifier).map(code => `${brand}:mpn:${code}`), ...gtins(record).map(gtin => `${brand}:gtin:${gtin}`)]
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
  const brand = brandKey(product.brand)
  const model = modelKey(brand, t.model || String(product.name || '').split(/\s+(?:LT|P)?\d{2,3}\//)[0])
  const officialModel = modelKey(brand, record.additionalDetails?.commercialName)
  if (!model || !officialModel || model !== officialModel) return false
  if (![record.tyreSection, record.aspectRatio, record.rimDiameter, record.loadCapacityIndex].every(v => v !== null && v !== undefined)) return false
  if (Number(record.tyreSection) !== t.width || Number(record.aspectRatio) !== t.aspect || Number(record.rimDiameter) !== t.rim || Number(record.loadCapacityIndex) !== t.loadIndex) return false
  const officialSpeed = record.speedCategorySymbol === 'PAR_Y_PAR' ? '(Y)' : String(record.speedCategorySymbol).toUpperCase()
  if (officialSpeed !== t.speedRating.toUpperCase()) return false
  if (['XL', 'RF', 'SL'].includes(record.loadCapacityIndicator) && ['XL', 'RF'].includes(record.loadCapacityIndicator) !== t.extraLoad) return false
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

export function matchEprel(product, index, crosswalks = []) {
  const brand = brandKey(product.brand)
  const proofs = crosswalks.filter(proof => proof.productId === product.id
    && brandKey(proof.brand) === brand
    && proof.catalogMpn === product.mpn
    && gtinKey(proof.catalogGtin) && gtinKey(proof.catalogGtin) === gtinKey(product.gtin)
    && modelKey(brand, proof.catalogModel) === modelKey(brand, product.tire.model)
    && /^https:\/\//.test(proof.sourceUrl || ''))
  const candidates = new Map()
  const keys = [...manufacturerKeys(brand, product.mpn).map(code => `${brand}:mpn:${code}`), gtinKey(product.gtin) ? `${brand}:gtin:${gtinKey(product.gtin)}` : '', ...proofs.map(proof => `${brand}:eprel:${proof.eprelId}`)].filter(Boolean)
  for (const key of keys) for (const [id, record] of index.get(key) || []) candidates.set(id, record)
  if (!candidates.size) return { status: 'unmatched', candidateIds: [] }
  const proofFor = record => proofs.find(proof => proof.eprelId === String(record.eprelRegistrationNumber)
    && proof.officialMpn === record.modelIdentifier
    && proof.officialModel === record.additionalDetails?.commercialName)
  const exact = [...candidates.values()].filter(record => {
    const proof = proofFor(record)
    return specificationsMatch(proof ? { ...product, tire: { ...product.tire, model: proof.officialModel } } : product, record)
      && (proof || keys.some(key => !key.includes(':eprel:') && index.get(key)?.has(String(record.eprelRegistrationNumber))))
  })
  if (!exact.length) return { status: 'specification-conflict', candidateIds: [...candidates.keys()] }
  if (exact.length > 1) return { status: 'ambiguous', candidateIds: exact.map(r => String(r.eprelRegistrationNumber)) }
  const record = exact[0]
  const label = labelFromRecord(record)
  if (!label) return { status: 'incomplete-label', candidateIds: [String(record.eprelRegistrationNumber)] }
  return { status: 'verified', candidateIds: [label.eprelId], label, record, crosswalk: proofFor(record) }
}
