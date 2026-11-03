// Single source for the store's legal identity. Footer, policies, contact page,
// checkout and schema.org Organization all read from here — never hardcode these
// values elsewhere.
//
// Sources: California Secretary of State Articles of Organization (filed
// 2026-10-16, entity no. B20260459523) and CDTFA Seller's Permit.

export const COMPANY = {
  tradingName: "TiresShop",
  domain: "tiresshop.net",
  legalName: "Semen Ti Trading LLC",
  entityType: "Limited liability company",
  stateOfFormation: "California",
  registrationNumber: "B20260459523",
  registrationAuthority: "California Secretary of State",
  sellerPermit: "209-079264-00001",
  sellerPermitAuthority: "California Department of Tax and Fee Administration (CDTFA)",
  caSellersPermit: "209-079264-00001",
  caSellersPermitIssuer: "California Department of Tax and Fee Administration (CDTFA)",
  representative: "Semen Titov",
  representativeRole: "Managing Member",
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
  whatsappUrl: "https://wa.me/17472876583",
  email: "info@tiresshop.net",
  privacyEmail: "info@tiresshop.net",
  hours: "Mon–Fri, 9:00 AM – 6:00 PM PT",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tiresshop.net",
} as const

export const companyAddressLine = `${COMPANY.street}, ${COMPANY.city}, ${COMPANY.region} ${COMPANY.postalCode}, ${COMPANY.country}`

export const physicalReturnsAddress = `${COMPANY.legalName} — Returns Department, ${companyAddressLine}`

// What EU consumers need to see in addition to the US entity details.
// Orders for the EU are shipped from the United States and sold DAP: the
// customer pays import duties and import VAT to the carrier / customs on
// delivery, and we refund the import VAT upon proof of payment.
// EU representative (Art. 27 GDPR) — source: deed of incorporation published in
// the Belgian Official Gazette (Belgisch Staatsblad) on 14/12/2022, ref. 22381428.
export const EU_REPRESENTATIVE = {
  legalName: "BBC TYRES BV",
  legalForm: "Besloten vennootschap (BV), Belgium",
  enterpriseNumber: "0794.652.803",
  register: "Crossroads Bank for Enterprises (KBO/BCE), Belgium",
  street: "Luitenant Graffplein 15",
  postalCode: "1780",
  city: "Wemmel",
  country: "Belgium",
  director: "Berkay Cetin",
  directorRole: "Director (bestuurder)",
  email: COMPANY.privacyEmail,
  mandatePdf: "/docs/eu-representative-mandate.pdf",
  mandateRef: "TS-EU-REP-2026-01",
} as const

export const euRepresentativeAddress = `${EU_REPRESENTATIVE.street}, ${EU_REPRESENTATIVE.postalCode} ${EU_REPRESENTATIVE.city}, ${EU_REPRESENTATIVE.country}`

export const EU_PRESENCE = {
  gdprRepresentative: {
    name: `${EU_REPRESENTATIVE.legalName} (KBO/BCE ${EU_REPRESENTATIVE.enterpriseNumber})`,
    address: euRepresentativeAddress,
    email: EU_REPRESENTATIVE.email,
    mandatePdf: EU_REPRESENTATIVE.mandatePdf,
  },
  // Goods are dispatched from California; returns go back to the US facility with an RMA number.
  returnsAddress: physicalReturnsAddress,
  dispatchCountry: "United States (California)",
} as const

export const US_PRESENCE = {
  returnsAddress: physicalReturnsAddress,
} as const

export function companyJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: COMPANY.tradingName,
    legalName: COMPANY.legalName,
    url: COMPANY.url,
    email: COMPANY.email,
    telephone: COMPANY.phoneTel,
    taxID: COMPANY.sellerPermit,
    iso6523Code: `0060:${COMPANY.registrationNumber}`,
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
      email: COMPANY.email,
      contactType: "customer service",
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      availableLanguage: ["English", "German", "French", "Italian", "Spanish", "Dutch"],
    },
  }
}
