import test from 'node:test'
import assert from 'node:assert/strict'
import { sourcePriceIssue, publishedPriceIssue } from './tire-price-confirmation.mjs'

const source = { brand: 'Dunlop', mpn: 'test-article', tire: { width: 225, aspect: 60, rim: 17, loadIndex: 98, speedRating: 'H', extraLoad: false, runFlat: false }, offers: { us: { priceCents: 15000, availability: 'out_of_stock' } }, verification: { referenceAvailability: 'https://schema.org/InStock', referencePrice: { amountCents: 15000, currency: 'USD' }, checkedAt: '2026-10-30', sources: ['https://www.prioritytire.com/by-brand/dunlop-tires/test-article'] } }
const product = { ...source, offers: { us: { priceCents: 15000 }, eu: { priceCents: 13426 } }, verification: { publicationPricing: { sourceCurrency: 'USD', sourcePriceCents: 15000, usdPerEur: 1.1172, rateDate: '2026-10-29' } } }

test('uses source stock rather than unconfirmed store inventory', () => assert.equal(sourcePriceIssue(source), null))
test('rejects unavailable source offers even at a plausible price', () => assert.equal(sourcePriceIssue({ ...source, verification: { ...source.verification, referenceAvailability: 'https://schema.org/OutOfStock' } }), 'source-offer-not-available'))
test('rejects the reported placeholder even if marked in stock', () => assert.equal(sourcePriceIssue({ ...source, offers: { us: { priceCents: 999985 } } }), 'placeholder-price'))
test('rejects missing provenance', () => assert.equal(sourcePriceIssue(undefined), 'missing-source-offer'))
test('rejects mismatched source currency', () => assert.equal(sourcePriceIssue({ ...source, verification: { ...source.verification, referencePrice: { currency: 'EUR', amountCents: 15000 } } }), 'source-price-mismatch'))
test('accepts documented USD pricing and approved EUR conversion', () => assert.equal(publishedPriceIssue(product, source), null))
test('rejects undocumented opening catalogue prices', () => assert.equal(publishedPriceIssue({ ...product, verification: {} }, source), 'missing-publication-price-evidence'))
test('checks each exact article, not just its size', () => assert.equal(publishedPriceIssue({ ...product, mpn: 'different-article' }, source), 'article-mismatch'))
test('rejects modified US price', () => assert.equal(publishedPriceIssue({ ...product, offers: { us: { priceCents: 999985 } } }, source), 'published-us-price-mismatch'))
test('rejects incorrect EUR conversion', () => assert.equal(publishedPriceIssue({ ...product, offers: { ...product.offers, eu: { priceCents: 15000 } } }, source), 'published-eu-price-mismatch'))
