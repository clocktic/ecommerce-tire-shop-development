import type { Offer } from "@/lib/catalog/types"
import type { ContentLang } from "@/lib/i18n/config"

export const BLACK_FRIDAY_PROMO = {
  active: true,
  discountPercent: 10,
} as const

export function applyBlackFridayDiscount(offer: Offer): Offer {
  if (!BLACK_FRIDAY_PROMO.active || offer.priceCents <= 0) return offer
  const discountedPriceCents = Math.max(
    1,
    Math.round((offer.priceCents * (100 - BLACK_FRIDAY_PROMO.discountPercent)) / 100),
  )
  const regularPriceCents =
    offer.compareAtCents && offer.compareAtCents > offer.priceCents
      ? offer.compareAtCents
      : offer.priceCents
  return {
    ...offer,
    priceCents: discountedPriceCents,
    compareAtCents: regularPriceCents,
  }
}

export type BlackFridayCopy = {
  eyebrow: string
  badge: string
  heroPill: string
  title: string
  lead: string
  autoApplied: string
  ctaTires: string
  ctaWheels: string
  ctaBrakes: string
  tagAll: string
}

const COPY: Record<ContentLang, BlackFridayCopy> = {
  en: {
    eyebrow: "LIMITED-TIME SITEWIDE EVENT",
    badge: "BLACK FRIDAY · −10%",
    heroPill: "BLACK FRIDAY: −10% OFF EVERYTHING",
    title: "BLACK FRIDAY SALE — 10% OFF ALL PRODUCTS",
    lead: "Save 10% automatically on every tire, alloy wheel, and brake kit in stock. Discounted prices are already applied sitewide — no promo code required.",
    autoApplied: "APPLIED AUTOMATICALLY AT EVERY PRODUCT",
    ctaTires: "Shop Tires −10%",
    ctaWheels: "Shop Wheels −10%",
    ctaBrakes: "Shop Brakes −10%",
    tagAll: "ALL BRANDS · NO CODE NEEDED",
  },
  de: {
    eyebrow: "ZEITLICH BEGRENZTE AKTION",
    badge: "BLACK FRIDAY · −10%",
    heroPill: "BLACK FRIDAY: −10% AUF ALLES",
    title: "BLACK FRIDAY SALE — 10% RABATT AUF ALLE PRODUKTE",
    lead: "Sparen Sie automatisch 10% auf alle Reifen, Felgen und Bremsen auf Lager. Die reduzierten Preise sind bereits aktiv — kein Gutscheincode nötig.",
    autoApplied: "AUTOMATISCH IM GESAMTEN SHOP AKTIV",
    ctaTires: "Reifen −10%",
    ctaWheels: "Felgen −10%",
    ctaBrakes: "Bremsen −10%",
    tagAll: "ALLE MARKEN · OHNE CODE",
  },
  fr: {
    eyebrow: "ÉVÉNEMENT LIMITÉ SUR TOUT LE SITE",
    badge: "BLACK FRIDAY · −10%",
    heroPill: "BLACK FRIDAY : −10% SUR TOUT",
    title: "BLACK FRIDAY — 10% DE RÉDUCTION SUR TOUS LES PRODUITS",
    lead: "Profitez automatiquement de −10% sur tous nos pneus, jantes et kits de freinage en stock. Prix remisés déjà affichés — aucun code requis.",
    autoApplied: "APPLIQUÉ AUTOMATIQUEMENT PARTOUT",
    ctaTires: "Pneus −10%",
    ctaWheels: "Jantes −10%",
    ctaBrakes: "Freins −10%",
    tagAll: "TOUTES MARQUES · SANS CODE",
  },
  es: {
    eyebrow: "EVENTO POR TIEMPO LIMITADO",
    badge: "BLACK FRIDAY · −10%",
    heroPill: "BLACK FRIDAY: −10% EN TODO",
    title: "BLACK FRIDAY — 10% DE DESCUENTO EN TODOS LOS PRODUCTOS",
    lead: "Ahorra un 10% automáticamente en cada neumático, llanta y kit de frenos en stock. Los precios ya incluyen el descuento — sin código promocional.",
    autoApplied: "APLICADO AUTOMÁTICAMENTE EN TODA LA TIENDA",
    ctaTires: "Neumáticos −10%",
    ctaWheels: "Llantas −10%",
    ctaBrakes: "Frenos −10%",
    tagAll: "TODAS LAS MARCAS · SIN CÓDIGO",
  },
  "es-419": {
    eyebrow: "EVENTO POR TIEMPO LIMITADO",
    badge: "BLACK FRIDAY · −10%",
    heroPill: "BLACK FRIDAY: −10% EN TODO",
    title: "BLACK FRIDAY — 10% DE DESCUENTO EN TODOS LOS PRODUCTOS",
    lead: "Ahorra un 10% automáticamente en cada llanta, rin y kit de frenos en stock. Los precios ya incluyen el descuento — sin código promocional.",
    autoApplied: "APLICADO AUTOMÁTICAMENTE EN TODA LA TIENDA",
    ctaTires: "Llantas −10%",
    ctaWheels: "Rines −10%",
    ctaBrakes: "Frenos −10%",
    tagAll: "TODAS LAS MARCAS · SIN CÓDIGO",
  },
  it: {
    eyebrow: "EVENTO A TEMPO LIMITATO",
    badge: "BLACK FRIDAY · −10%",
    heroPill: "BLACK FRIDAY: −10% SU TUTTO",
    title: "BLACK FRIDAY — 10% DI SCONTO SU TUTTI I PRODOTTI",
    lead: "Risparmia subito il 10% su tutti gli pneumatici, cerchi e kit freni disponibili. Prezzi già scontati in tutto il catalogo — nessun codice richiesto.",
    autoApplied: "APPLICATO AUTOMATICAMENTE SU TUTTO",
    ctaTires: "Pneumatici −10%",
    ctaWheels: "Cerchi −10%",
    ctaBrakes: "Freni −10%",
    tagAll: "TUTTI I MARCHI · SENZA CODICE",
  },
  nl: {
    eyebrow: "TIJDELIJKE ACTIE OP ALLES",
    badge: "BLACK FRIDAY · −10%",
    heroPill: "BLACK FRIDAY: −10% OP ALLES",
    title: "BLACK FRIDAY — 10% KORTING OP ALLE PRODUCTEN",
    lead: "Bespaar automatisch 10% op elke band, velg en remset op voorraad. De kortingsprijzen zijn al verwerkt in de hele shop — geen kortingscode nodig.",
    autoApplied: "AUTOMATISCH TOEGEPAST OP ELK PRODUCT",
    ctaTires: "Banden −10%",
    ctaWheels: "Velgen −10%",
    ctaBrakes: "Remmen −10%",
    tagAll: "ALLE MERKEN · GEEN CODE NODIG",
  },
}

export function blackFridayCopy(lang: ContentLang): BlackFridayCopy {
  return COPY[lang] ?? COPY.en
}
