import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validTireDraft, validateSelectionTarget } from './tire-draft-validation.mjs'

const product = () => ({
  id: 'test', brand: 'Test', mpn: '123', supplierSku: 'N123', source: 'verified-tire-drafts-v1',
  images: ['https://example.org/a.jpg', 'https://example.org/b.jpg'],
  verification: { status: 'draft', pending: ['Commercial approval'] },
  offers: { us: { priceCents: 10000, availability: 'out_of_stock' } },
  tire: { model: 'Model', width: 225, aspect: 45, rim: 18, loadIndex: 95, speedRating: 'Y', season: 'summer', runFlat: false, extraLoad: true, utqg: { treadwear: 300, traction: 'AA', temperature: 'A' } },
})
const selection = (brands = 12, models = 12) => Array.from({ length: brands }, (_, b) => Array.from({ length: models }, (_, m) => {
  const p = product()
  p.brand = `Brand ${b}`
  p.tire.model = `Model ${m}`
  return { products: [p], modelPhotos: [{ sha256: 'a'.repeat(64), width: 600, height: 600 }, { sha256: 'b'.repeat(64), width: 600, height: 600 }] }
})).flat()

test('ordinary verified grades remain accepted', () => assert.equal(validTireDraft(product()), true))
test('unknown summer grade cannot pass', () => { const p = product(); delete p.tire.utqg; assert.equal(validTireDraft(p), false) })
test('winter needs explicit applicability review', () => {
  const p = product(); p.tire.season = 'winter'; delete p.tire.utqg
  assert.equal(validTireDraft(p), false)
  p.verification.utqgStatus = 'winter-applicability-pending'
  p.verification.pending.push('Confirm UTQG applicability')
  assert.equal(validTireDraft(p), true)
})
test('draft cannot introduce in-stock or EU offers', () => {
  const p = product(); p.offers.us.availability = 'in_stock'; assert.equal(validTireDraft(p), false)
  p.offers.us.availability = 'out_of_stock'; p.offers.eu = { priceCents: 100 }; assert.equal(validTireDraft(p), false)
})
test('duplicate photos and invalid dimensions are rejected', () => {
  const p = product(); p.images[1] = p.images[0]; assert.equal(validTireDraft(p), false)
  const q = product(); q.tire.width = 31; assert.equal(validTireDraft(q), false)
})
test('12 brands with 12 models pass', () => assert.doesNotThrow(() => validateSelectionTarget(selection())))
test('article count cannot replace model quota', () => assert.throws(() => validateSelectionTarget(selection(12, 11))))
test('brand count must be within 12–15', () => {
  assert.throws(() => validateSelectionTarget(selection(11, 15)))
  assert.throws(() => validateSelectionTarget(selection(16, 15)))
})
test('duplicate model cannot fill a quota', () => { const s = selection(); s[1].products[0].tire.model = s[0].products[0].tire.model; assert.throws(() => validateSelectionTarget(s)) })
test('two different downloaded photos are mandatory', () => { const s = selection(); s[0].modelPhotos[1].sha256 = s[0].modelPhotos[0].sha256; assert.throws(() => validateSelectionTarget(s)) })
