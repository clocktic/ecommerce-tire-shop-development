export function sourcePriceIssue(source) {
  if (!source) return 'missing-source-offer'
  const verification = source.verification
  const price = source.offers?.us?.priceCents
  if (!Number.isSafeInteger(price) || price <= 0) return 'invalid-source-price'
  if (Math.floor(price / 100) === 9999) return 'placeholder-price'
  if (verification?.referenceAvailability !== 'https://schema.org/InStock') return 'source-offer-not-available'
  if (verification.referencePrice?.currency !== 'USD' || verification.referencePrice.amountCents !== price) return 'source-price-mismatch'
  if (!Number.isFinite(Date.parse(verification.checkedAt))) return 'missing-source-check-date'
  const hasSource = verification.sources?.some(value => {
    try {
      const url = new URL(value)
      return url.protocol === 'https:' && ['prioritytire.com', 'www.prioritytire.com'].includes(url.hostname) && url.pathname !== '/'
    } catch { return false }
  })
  return hasSource ? null : 'missing-source-url'
}

export function publishedPriceIssue(product, source) {
  const issue = sourcePriceIssue(source)
  if (issue) return issue
  if (product.brand.toLowerCase() !== source.brand.toLowerCase() || product.mpn !== source.mpn) return 'article-mismatch'
  for (const key of ['width', 'aspect', 'rim', 'loadIndex', 'speedRating', 'extraLoad', 'runFlat']) {
    if (product.tire?.[key] !== source.tire?.[key]) return 'specification-mismatch'
  }
  const price = source.offers.us.priceCents
  const pricing = product.verification?.publicationPricing
  if (pricing?.sourceCurrency !== 'USD' || pricing.sourcePriceCents !== price) return 'missing-publication-price-evidence'
  if (product.offers.us && product.offers.us.priceCents !== price) return 'published-us-price-mismatch'
  if (product.offers.eu) {
    if (!Number.isFinite(pricing.usdPerEur) || pricing.usdPerEur <= 0 || !Number.isFinite(Date.parse(pricing.rateDate))) return 'missing-exchange-rate-evidence'
    if (product.offers.eu.priceCents !== Math.round(price / pricing.usdPerEur)) return 'published-eu-price-mismatch'
  }
  return null
}
