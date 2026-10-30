import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEprelIndex, matchEprel } from './eprel-matching.mjs'

const record = { supplierOrTrademark: 'MICHELIN', modelIdentifier: '000832', eprelRegistrationNumber: '408232', versionNumber: 1, status: 'PUBLISHED', blocked: false, tyreSection: 205, aspectRatio: 55, rimDiameter: 17, loadCapacityIndex: 91, speedCategorySymbol: 'W', loadCapacityIndicator: 'SL', energyClass: 'A', wetGripClass: 'B', externalRollingNoiseClass: 'A', externalRollingNoiseValue: 68, severeSnowTyre: false, iceTyre: false, additionalDetails: { commercialName: 'E PRIMACY', unrestrictedMobility: null, gtinIdentifier: null } }
const product = { brand: 'Michelin', mpn: '832', tire: { model: 'E Primacy', width: 205, aspect: 55, rim: 17, loadIndex: 91, speedRating: 'W', extraLoad: false, runFlat: false } }
const match = (p = product, rows = [record]) => matchEprel(p, buildEprelIndex(rows))

test('matches manufacturer article including leading-zero formatting and copies official values', () => {
  const result = match()
  assert.equal(result.status, 'verified')
  assert.deepEqual(result.label, { fuelEfficiency: 'A', wetGrip: 'B', noiseDb: 68, noiseClass: 'A', snowGrip: false, iceGrip: false, eprelId: '408232' })
})
test('never matches by name and size alone', () => assert.equal(match({ ...product, mpn: 'different' }).status, 'unmatched'))
test('rejects conflicting commercial model', () => assert.equal(match({ ...product, tire: { ...product.tire, model: 'Pilot Sport 4' } }).status, 'specification-conflict'))
test('does not cross manufacturers', () => assert.equal(match({ ...product, brand: 'Continental' }).status, 'unmatched'))
for (const [field, value] of Object.entries({ width: 215, aspect: 60, rim: 18, loadIndex: 95, speedRating: 'V', extraLoad: true })) {
  test(`rejects conflicting ${field}`, () => assert.equal(match({ ...product, tire: { ...product.tire, [field]: value } }).status, 'specification-conflict'))
}
test('rejects explicitly conflicting run-flat', () => assert.equal(match(product, [{ ...record, additionalDetails: { ...record.additionalDetails, unrestrictedMobility: true } }]).status, 'specification-conflict'))
test('rejects contradictory GTIN', () => assert.equal(match({ ...product, gtin: '1234567890123' }, [{ ...record, additionalDetails: { ...record.additionalDetails, gtinIdentifier: '1234567890124' } }]).status, 'specification-conflict'))
test('does not choose an arbitrary registration from ambiguous matches', () => assert.equal(match(product, [record, { ...record, eprelRegistrationNumber: '999999' }]).status, 'ambiguous'))
test('uses the latest version of the same registration', () => assert.equal(match(product, [record, { ...record, versionNumber: 2, externalRollingNoiseValue: 69 }]).label.noiseDb, 69))
test('does not generate missing label fields', () => assert.equal(match(product, [{ ...record, externalRollingNoiseValue: null }]).status, 'incomplete-label'))
test('ignores blocked and unpublished records', () => {
  assert.equal(match(product, [{ ...record, blocked: true }]).status, 'unmatched')
  assert.equal(match(product, [{ ...record, status: 'DRAFT' }]).status, 'unmatched')
})
test('matches exact GTIN when manufacturer identifiers differ', () => assert.equal(match({ ...product, mpn: 'local-format', gtin: '123456789012' }, [{ ...record, additionalDetails: { ...record.additionalDetails, gtinIdentifier: '0123456789012' } }]).status, 'verified'))
