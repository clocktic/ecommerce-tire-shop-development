import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareResearchUpdate } from './eprel-research-update.mjs'
import { buildEprelIndex, matchEprel } from './eprel-matching.mjs'

const decision = { productId: 'sku', brand: 'Michelin', catalogModel: 'Pilot Sport 4', catalogMpn: '54441', catalogGtin: '3528707611345', eprelId: '462016', officialMpn: '761134', officialModel: 'PILOT SPORT 4 MO1 A', sourceUrl: 'https://example.com/verified-article', sourceCheckedOn: '2026-10-30', corrections: [{ field: 'speedRating', from: 'Y', to: '(Y)' }] }
const product = { id: 'sku', brand: 'Michelin', mpn: '54441', gtin: '3528707611345', name: 'Pilot Sport 4 285/40 R19 107Y', tire: { model: 'Pilot Sport 4', width: 285, aspect: 40, rim: 19, loadIndex: 107, speedRating: 'Y', extraLoad: true, runFlat: false }, specs: [{ label: 'Speed Rating', value: 'Y' }], offers: { eu: { priceCents: 19999, stock: 4 }, us: { priceCents: 20999, stock: 3 } }, verification: { unrelated: true } }
const record = { supplierOrTrademark: 'MICHELIN', modelIdentifier: '761134', eprelRegistrationNumber: '462016', versionNumber: 1, status: 'PUBLISHED', blocked: false, tyreSection: 285, aspectRatio: 40, rimDiameter: 19, loadCapacityIndex: 107, speedCategorySymbol: 'PAR_Y_PAR', loadCapacityIndicator: 'XL', energyClass: 'B', wetGripClass: 'A', externalRollingNoiseClass: 'B', externalRollingNoiseValue: 73, severeSnowTyre: false, iceTyre: false, additionalDetails: { commercialName: 'PILOT SPORT 4 MO1 A', unrestrictedMobility: null, gtinIdentifier: null } }
const update = (p = product, r = record, d = decision, at = '2026-10-30T18:00:00Z') => prepareResearchUpdate(p, r, d, at)

test('uses explicit EAN crosswalk, corrects only reviewed fields and preserves commerce data', () => {
  const result = update()
  assert.equal(result.tire.euLabel.eprelId, '462016')
  assert.equal(result.tire.speedRating, '(Y)')
  assert.equal(result.name, 'Pilot Sport 4 285/40 R19 107(Y)')
  assert.equal(result.specs[0].value, '(Y)')
  assert.deepEqual(result.offers, product.offers)
  assert.equal(result.tire.model, product.tire.model)
  assert.equal(result.verification.unrelated, true)
  assert.equal(product.tire.speedRating, 'Y')
  assert.equal(result.verification.eprel.commercialName, 'PILOT SPORT 4 MO1 A')
})
test('repeating the same import is a no-op', () => {
  const result = update()
  assert.deepEqual(update(result, record, decision, '2026-10-30T19:00:00Z'), result)
})
test('crosswalk cannot bypass speed, size, load, XL, run-flat or GTIN conflicts', () => {
  for (const [field, value] of Object.entries({ width: 275, aspect: 35, rim: 20, loadIndex: 106, extraLoad: false })) {
    assert.throws(() => update({ ...product, tire: { ...product.tire, [field]: value } }))
  }
  assert.throws(() => update(product, { ...record, additionalDetails: { ...record.additionalDetails, unrestrictedMobility: true } }))
  assert.throws(() => update(product, { ...record, additionalDetails: { ...record.additionalDetails, gtinIdentifier: '3528701979151' } }))
  assert.throws(() => update({ ...product, tire: { ...product.tire, speedRating: 'W' } }))
})
test('rejects changed catalogue identifiers and OEM registration identity', () => {
  for (const field of ['id', 'mpn', 'gtin', 'brand']) assert.throws(() => update({ ...product, [field]: 'changed' }))
  assert.throws(() => update(product, { ...record, modelIdentifier: 'different' }))
  assert.throws(() => update(product, { ...record, additionalDetails: { ...record.additionalDetails, commercialName: 'PILOT SPORT 4 N0' } }))
  assert.throws(() => update(product, { ...record, blocked: true }))
  assert.throws(() => update(product, { ...record, status: 'DRAFT' }))
})
test('refuses unsupported corrections, conflicting display specs and existing labels', () => {
  assert.throws(() => update(product, record, { ...decision, corrections: [{ field: 'width', from: 285, to: 275 }] }))
  assert.throws(() => update({ ...product, specs: [{ label: 'Speed Rating', value: 'W' }] }))
  assert.throws(() => update({ ...product, tire: { ...product.tire, euLabel: { eprelId: '9999' } } }))
})
test('never interprets Y as the parenthesized (Y) index', () => {
  assert.equal(matchEprel(product, buildEprelIndex([record]), [decision]).status, 'specification-conflict')
  const corrected = update()
  assert.equal(matchEprel(corrected, buildEprelIndex([record]), [decision]).status, 'verified')
})
test('crosswalk does not spread to other SKUs or work with a changed EU identifier', () => {
  const corrected = update()
  for (const field of ['id', 'mpn', 'gtin']) {
    assert.notEqual(matchEprel({ ...corrected, [field]: 'different' }, buildEprelIndex([record]), [decision]).status, 'verified')
  }
  assert.notEqual(matchEprel(corrected, buildEprelIndex([{ ...record, modelIdentifier: 'wrong' }]), [decision]).status, 'verified')
  assert.notEqual(matchEprel(corrected, buildEprelIndex([record]), []).status, 'verified')
})
test('RF means reinforced, not run-flat, and requires extraLoad', () => {
  const corrected = update()
  const rf = { ...record, loadCapacityIndicator: 'RF' }
  assert.equal(matchEprel(corrected, buildEprelIndex([rf]), [decision]).status, 'verified')
  assert.equal(matchEprel({ ...corrected, tire: { ...corrected.tire, extraLoad: false } }, buildEprelIndex([rf]), [decision]).status, 'specification-conflict')
})
test('explicit XL correction updates technical fields without changing offers', () => {
  const xlDecision = { ...decision, corrections: [{ field: 'extraLoad', from: false, to: true }] }
  const p = { ...product, tire: { ...product.tire, speedRating: '(Y)', extraLoad: false }, specs: [{ label: 'Load Range', value: 'SL' }] }
  const result = update(p, record, xlDecision)
  assert.equal(result.tire.extraLoad, true)
  assert.equal(result.specs[0].value, 'XL')
  assert.deepEqual(result.offers, p.offers)
})
