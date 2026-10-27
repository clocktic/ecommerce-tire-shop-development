// Single source for the store's legal identity. Footer, policies, contact page,
// checkout and schema.org Organization all read from here — never hardcode these
// values elsewhere. Values in [brackets] are placeholders until the missing
// details are provided; GMC review must not start before they are filled.
//
// Sources: California Secretary of State Articles of Organization (filed
// 2026-10-16, entity no. B20260459523) and CDTFA Seller's Permit.

export const COMPANY = {
  tradingName: "Contact Patch",
  legalName: "Semen Ti Trading LLC",
  entityType: "Limited liability company",
  stateOfFormation: "California",
  registrationNumber: "B20260459523",
  sellerPermit: "209-079264-00001",
  sellerPermitAuthority: "California Department of Tax and Fee Administration (CDTFA)",
  representative: "Semen Titov",
  representativeRole: "Member",
  street: "265 W Tujunga Ave, Apt 126",
  city: "Burbank",
  region: "CA",
  postalCode: "91502",
  country: "United States",
  countryCode: "US",
  // Address for legal notices (agent for service of process).
  mailingAddress: "6550 Yucca Street, Apt 205, Los Angeles, CA 90028, United States",
  phoneDisplay: "+1 (747) 287-6583",
  phoneTel: "+17472876583",
  // Replace both once the domain is purchased.
  email: "support@[domain]",
  privacyEmail: "privacy@[domain]",
  hours: "Mon–Fri, 9:00 AM – 6:00 PM PT",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.example.com",
} as const

// What EU consumers need to see in addition to the US entity details.
// Orders for the EU are shipped from the United States and sold DAP: the
// customer pays import duties and import VAT to the carrier / customs on
// delivery, so we do not collect VAT and hold no OSS / IOSS registration.
export const EU_PRESENCE = {
  // GDPR Art. 27 — a non-EU controller that targets EU residents must appoint one.
  gdprRepresentative: {
    name: "[EU GDPR representative]",
    address: "[Representative address, EU member state]",
    email: "eu-rep@[domain]",
  },
  // Goods are dispatched from California; returns go back to the US.
  returnsAddress: "the address given in your return authorisation (RMA) email",
  dispatchCountry: "United States (California)",
} as const

export const US_PRESENCE = {
  returnsAddress: "the address given in your return authorization (RMA) email",
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
    founder: { "@type": "Person", name: COMPANY.representative },
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.street,
      postalCode: COMPANY.postalCode,
      addressLocality: COMPANY.city,
      addressRegion: COMPANY.region,
      addressCountry: COMPANY.countryCode,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: COMPANY.phoneTel,
      contactType: "customer service",
      availableLanguage: ["English", "German", "French", "Italian", "Spanish", "Dutch"],
    },
  }
}
