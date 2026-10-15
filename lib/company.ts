// Single source for the store's legal identity. Footer, policies, contact page,
// checkout and schema.org Organization all read from here — never hardcode these
// values elsewhere. Values in [brackets] are placeholders until the real US
// entity details are provided; GMC review must not start before they are filled.

export const COMPANY = {
  tradingName: "Contact Patch",
  legalName: "[Legal entity name] LLC",
  entityType: "Limited liability company",
  stateOfFormation: "[State of formation]",
  registrationNumber: "[State file number]",
  ein: "[EIN]",
  street: "[Street address]",
  city: "[City]",
  region: "[State]",
  postalCode: "[ZIP]",
  country: "United States",
  countryCode: "US",
  phoneDisplay: "[+1 (000) 000-0000]",
  phoneTel: "+10000000000",
  email: "support@[domain]",
  privacyEmail: "privacy@[domain]",
  hours: "Mon–Fri, 9:00 AM – 6:00 PM ET",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.example.com",
} as const

// What EU consumers need to see in addition to the US entity details.
export const EU_PRESENCE = {
  // GDPR Art. 27 — a non-EU controller that targets EU residents must appoint one.
  gdprRepresentative: {
    name: "[EU GDPR representative]",
    address: "[Representative address, EU member state]",
    email: "eu-rep@[domain]",
  },
  // VAT is collected under the EU One-Stop Shop (OSS) scheme.
  vatScheme: "EU VAT One-Stop Shop (OSS)",
  vatNumber: "[EU VAT / OSS identification number]",
  returnsAddress: "[EU returns address — warehouse or returns partner]",
  warehouseCountry: "[EU warehouse country]",
} as const

export const US_PRESENCE = {
  returnsAddress: "[US returns address — warehouse]",
} as const

export const companyAddressLine = `${COMPANY.street}, ${COMPANY.city}, ${COMPANY.region} ${COMPANY.postalCode}, ${COMPANY.country}`

export function companyJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.tradingName,
    legalName: COMPANY.legalName,
    url: COMPANY.url,
    email: COMPANY.email,
    telephone: COMPANY.phoneTel,
    taxID: COMPANY.ein,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.street,
      postalCode: COMPANY.postalCode,
      addressLocality: COMPANY.city,
      addressRegion: COMPANY.region,
      addressCountry: COMPANY.countryCode,
    },
  }
}
