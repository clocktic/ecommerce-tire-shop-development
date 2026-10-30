import assert from 'node:assert/strict'
import { isDeepStrictEqual } from 'node:util'
import { brandKey, modelKey, buildEprelIndex, matchEprel } from './eprel-matching.mjs'

export function prepareResearchUpdate(product, record, decision, checkedAt) {
  assert.equal(product.id, decision.productId, 'Article changed')
  assert.equal(product.mpn, decision.catalogMpn, 'MPN changed')
  assert.equal(product.gtin, decision.catalogGtin, 'GTIN changed')
  assert.equal(brandKey(product.brand), brandKey(decision.brand), 'Brand changed')
  assert.equal(modelKey(brandKey(product.brand), product.tire.model), modelKey(brandKey(decision.brand), decision.catalogModel), 'Model changed')
  assert.equal(String(record.eprelRegistrationNumber), decision.eprelId, 'Registration changed')
  assert.equal(record.modelIdentifier, decision.officialMpn, 'EU article changed')
  assert.equal(record.additionalDetails?.commercialName, decision.officialModel, 'OEM model changed')
  assert(!product.tire.euLabel || product.tire.euLabel.eprelId === decision.eprelId, 'Existing label conflicts')
  const data = structuredClone(product)
  for (const change of decision.corrections) {
    assert(change.field === 'speedRating' && change.from === 'Y' && change.to === '(Y)'
      || change.field === 'extraLoad' && change.from === false && change.to === true, 'Unapproved correction')
    assert(data.tire[change.field] === change.from || data.tire[change.field] === change.to, 'Source specification changed')
    data.tire[change.field] = change.to
    const specLabel = change.field === 'speedRating' ? 'Speed Rating' : 'Load Range'
    const from = change.field === 'speedRating' ? change.from : 'SL'
    const to = change.field === 'speedRating' ? change.to : 'XL'
    for (const spec of data.specs || []) {
      if (spec.label !== specLabel) continue
      assert(spec.value === from || spec.value === to, `Conflicting ${specLabel}`)
      spec.value = to
    }
    if (change.field === 'speedRating') {
      data.name = data.name.replace(new RegExp(`${data.tire.loadIndex}Y(?=\\s|$)`), `${data.tire.loadIndex}(Y)`)
    }
  }
  const result = matchEprel(data, buildEprelIndex([record]), [decision])
  assert.equal(result.status, 'verified', `Unverified specifications: ${product.id}`)
  assert.equal(result.label.eprelId, decision.eprelId)
  const evidence = {
    status: 'verified',
    sourceUrl: `https://eprel.ec.europa.eu/screen/product/tyres/${decision.eprelId}`,
    registrationNumber: decision.eprelId,
    versionNumber: record.versionNumber,
    manufacturerIdentifier: record.modelIdentifier,
    commercialName: record.additionalDetails.commercialName,
    catalogManufacturerIdentifier: product.mpn,
    match: 'documented catalogue article + GTIN to EU manufacturer identifier and OEM model; size, load, speed, reinforcement and declared run-flat validated',
    crosswalk: decision,
  }
  const { checkedAt: previousCheckedAt, ...previousEvidence } = product.verification?.eprel || {}
  data.tire.euLabel = result.label
  data.verification = { ...data.verification, eprel: {
    ...evidence,
    checkedAt: previousCheckedAt && isDeepStrictEqual(previousEvidence, evidence) && isDeepStrictEqual(product.tire.euLabel, result.label) ? previousCheckedAt : checkedAt,
  } }
  assert.deepEqual(data.offers, product.offers, 'Price or inventory changed')
  return data
}
