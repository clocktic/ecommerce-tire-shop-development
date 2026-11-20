import type { ContentLang, Store } from "@/lib/i18n/config"
import { localeMeta } from "@/lib/i18n/config"

export type CommercialCopy = {
  nav: string
  eyebrow: string
  title: string
  subtitle: string
  metaTitle: string
  metaDescription: string
  tabAll: string
  tabTires: string
  tabWheels: string
  allSizes: string
  allBrands: string
  allStandards: string
  standardUs: string
  standardEu: string
  complianceUs: string
  complianceEu: string
  showingCount: string
  resetFilters: string
  emptyState: string
  sortFeatured: string
  sortPriceAsc: string
  sortPriceDesc: string
  sortBrandAsc: string
}

const COPY: Record<ContentLang, CommercialCopy> = {
  en: {
    nav: "Trucks & Trailers",
    eyebrow: "Commercial Fleet & Heavy-Duty",
    title: "Truck & Trailer Tires & Wheels",
    subtitle:
      "Heavy-duty radial tires (385/65R22.5, 315/80R22.5, 295/75R22.5, 425/65R22.5) and forged aluminum or steel 22.5\" & 24.5\" wheels engineered for semi-trucks, regional tractors, and trailers across the US and Europe.",
    metaTitle: "Commercial Truck & Trailer Tires & Wheels (385/65R22.5, 22.5\" Rims)",
    metaDescription:
      "Shop commercial truck and trailer tires including 385/65R22.5, 315/80R22.5, 295/75R22.5, and heavy-duty Alcoa, Accuride, Speedline, Jantsa & Maxion 22.5\" and 24.5\" wheels.",
    tabAll: "All Commercial",
    tabTires: "Truck & Trailer Tires",
    tabWheels: "Truck & Trailer Wheels",
    allSizes: "All Sizes",
    allBrands: "All Brands",
    allStandards: "All Mount Standards",
    standardUs: "US Hub-Piloted (10x285.75)",
    standardEu: "EU ISO (10x335)",
    complianceUs: "US DOT · EPA SmartWay · Load Range G–L · SAE J267",
    complianceEu: "EU Reg. 2020/740 · M+S & 3PMSF · TÜV / ECE R124 / ISO 4107",
    showingCount: "{count} commercial products",
    resetFilters: "Reset filters",
    emptyState: "No commercial tires or wheels match these filters.",
    sortFeatured: "Featured",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    sortBrandAsc: "Brand: A–Z",
  },
  de: {
    nav: "LKW & Anhänger",
    eyebrow: "Nutzfahrzeuge & Schwerlast",
    title: "LKW- & Anhängerreifen & Felgen",
    subtitle:
      "Schwerlast-Radialreifen (385/65R22.5, 315/80R22.5, 295/75R22.5, 425/65R22.5) sowie geschmiedete Aluminium- und Stahlfelgen in 22.5\" & 24.5\" für Zugmaschinen und Auflieger in Europa und den USA.",
    metaTitle: "LKW- & Anhängerreifen & Felgen (385/65R22.5, 22.5\" Felgen)",
    metaDescription:
      "Nutzfahrzeugreifen 385/65R22.5, 315/80R22.5 und 22.5\" LKW-Felgen von Alcoa, Accuride, Speedline Truck, Jantsa und Maxion Wheels.",
    tabAll: "Alle Nutzfahrzeug-Teile",
    tabTires: "LKW- & Anhängerreifen",
    tabWheels: "LKW- & Anhängerfelgen",
    allSizes: "Alle Größen",
    allBrands: "Alle Marken",
    allStandards: "Alle Lochkreise",
    standardUs: "US Hub-Piloted (10x285,75)",
    standardEu: "EU ISO (10x335)",
    complianceUs: "US DOT · EPA SmartWay · Load Range G–L · SAE J267",
    complianceEu: "EU-VO 2020/740 · M+S & 3PMSF · TÜV / ECE R124 / ISO 4107",
    showingCount: "{count} Nutzfahrzeug-Produkte",
    resetFilters: "Filter zurücksetzen",
    emptyState: "Keine LKW-Reifen oder Felgen für diese Filter gefunden.",
    sortFeatured: "Empfohlen",
    sortPriceAsc: "Preis: aufsteigend",
    sortPriceDesc: "Preis: absteigend",
    sortBrandAsc: "Marke: A–Z",
  },
  fr: {
    nav: "Poids Lourds",
    eyebrow: "Flotte Commerciale & Poids Lourds",
    title: "Pneus & Jantes Poids Lourds et Remorques",
    subtitle:
      "Pneus radiaux poids lourds (385/65R22.5, 315/80R22.5, 295/75R22.5, 425/65R22.5) et jantes 22.5\" & 24.5\" en aluminium forgé ou acier pour tracteurs et semi-remorques.",
    metaTitle: "Pneus & Jantes Poids Lourds et Remorques (385/65R22.5, 22.5\")",
    metaDescription:
      "Pneus poids lourds et remorques 385/65R22.5, 315/80R22.5 et jantes 22.5\" Alcoa, Accuride, Speedline Truck, Jantsa et Maxion.",
    tabAll: "Tout Poids Lourds",
    tabTires: "Pneus Poids Lourds & Remorques",
    tabWheels: "Jantes Poids Lourds & Remorques",
    allSizes: "Toutes dimensions",
    allBrands: "Toutes marques",
    allStandards: "Tous entraxes",
    standardUs: "US Hub-Piloted (10x285.75)",
    standardEu: "EU ISO (10x335)",
    complianceUs: "US DOT · EPA SmartWay · Load Range G–L · SAE J267",
    complianceEu: "Règl. UE 2020/740 · M+S & 3PMSF · TÜV / ECE R124 / ISO 4107",
    showingCount: "{count} produits poids lourds",
    resetFilters: "Réinitialiser les filtres",
    emptyState: "Aucun pneu ou jante poids lourd ne correspond à ces filtres.",
    sortFeatured: "Sélection",
    sortPriceAsc: "Prix : croissant",
    sortPriceDesc: "Prix : décroissant",
    sortBrandAsc: "Marque : A–Z",
  },
  it: {
    nav: "Camion & Rimorchi",
    eyebrow: "Flotte Commerciali & Mezzi Pesanti",
    title: "Pneumatici e Cerchi per Camion e Rimorchi",
    subtitle:
      "Pneumatici radiali per veicoli industriali (385/65R22.5, 315/80R22.5, 295/75R22.5, 425/65R22.5) e cerchi 22.5\" & 24.5\" in alluminio forgiato o acciaio.",
    metaTitle: "Pneumatici e Cerchi Camion e Rimorchi (385/65R22.5, 22.5\")",
    metaDescription:
      "Pneumatici 385/65R22.5, 315/80R22.5 e cerchi 22.5\" Alcoa, Accuride, Speedline Truck, Jantsa e Maxion per camion e semirimorchi.",
    tabAll: "Tutto Commerciale",
    tabTires: "Pneumatici Camion & Rimorchi",
    tabWheels: "Cerchi Camion & Rimorchi",
    allSizes: "Tutte le misure",
    allBrands: "Tutti i marchi",
    allStandards: "Tutti gli attacchi",
    standardUs: "US Hub-Piloted (10x285.75)",
    standardEu: "EU ISO (10x335)",
    complianceUs: "US DOT · EPA SmartWay · Load Range G–L · SAE J267",
    complianceEu: "Reg. UE 2020/740 · M+S & 3PMSF · TÜV / ECE R124 / ISO 4107",
    showingCount: "{count} prodotti commerciali",
    resetFilters: "Azzera filtri",
    emptyState: "Nessun pneumatico o cerchio trovato per questi filtri.",
    sortFeatured: "In evidenza",
    sortPriceAsc: "Prezzo: crescente",
    sortPriceDesc: "Prezzo: decrescente",
    sortBrandAsc: "Marca: A–Z",
  },
  es: {
    nav: "Camiones y Remolques",
    eyebrow: "Flotas Comerciales y Carga Pesada",
    title: "Neumáticos y Llantas para Camiones y Remolques",
    subtitle:
      "Neumáticos radiales de carga pesada (385/65R22.5, 315/80R22.5, 295/75R22.5, 425/65R22.5) y llantas de aluminio forjado o acero de 22.5\" y 24.5\" para cabezas tractoras y semirremolques.",
    metaTitle: "Neumáticos y Llantas para Camiones y Remolques (385/65R22.5, 22.5\")",
    metaDescription:
      "Neumáticos comerciales 385/65R22.5, 315/80R22.5 y llantas 22.5\" Alcoa, Accuride, Speedline Truck, Jantsa y Maxion para camiones y remolques.",
    tabAll: "Todo Comercial",
    tabTires: "Neumáticos Camión y Remolque",
    tabWheels: "Llantas Camión y Remolque",
    allSizes: "Todas las medidas",
    allBrands: "Todas las marcas",
    allStandards: "Todos los anclajes",
    standardUs: "US Hub-Piloted (10x285.75)",
    standardEu: "EU ISO (10x335)",
    complianceUs: "US DOT · EPA SmartWay · Load Range G–L · SAE J267",
    complianceEu: "Regl. UE 2020/740 · M+S y 3PMSF · TÜV / ECE R124 / ISO 4107",
    showingCount: "{count} productos comerciales",
    resetFilters: "Restablecer filtros",
    emptyState: "No se encontraron neumáticos o llantas comerciales con estos filtros.",
    sortFeatured: "Destacados",
    sortPriceAsc: "Precio: menor a mayor",
    sortPriceDesc: "Precio: mayor a menor",
    sortBrandAsc: "Marca: A–Z",
  },
  "es-419": {
    nav: "Camiones y Tráilers",
    eyebrow: "Flotas Comerciales y Carga Pesada",
    title: "Llantas y Rines para Camiones y Tráilers",
    subtitle:
      "Llantas radiales de carga pesada (385/65R22.5, 315/80R22.5, 295/75R22.5, 425/65R22.5) y rines de aluminio forjado o acero de 22.5\" y 24.5\" para tractocamiones y remolques.",
    metaTitle: "Llantas y Rines para Camiones y Tráilers (385/65R22.5, 22.5\")",
    metaDescription:
      "Llantas comerciales 385/65R22.5, 295/75R22.5 y rines 22.5\" y 24.5\" Alcoa, Accuride, Speedline Truck, Jantsa y Maxion.",
    tabAll: "Todo Comercial",
    tabTires: "Llantas Camión y Tráiler",
    tabWheels: "Rines Camión y Tráiler",
    allSizes: "Todas las medidas",
    allBrands: "Todas las marcas",
    allStandards: "Todos los barrenados",
    standardUs: "US Hub-Piloted (10x285.75)",
    standardEu: "EU ISO (10x335)",
    complianceUs: "US DOT · EPA SmartWay · Load Range G–L · SAE J267",
    complianceEu: "Regl. UE 2020/740 · M+S y 3PMSF · TÜV / ECE R124 / ISO 4107",
    showingCount: "{count} productos comerciales",
    resetFilters: "Limpiar filtros",
    emptyState: "No hay llantas ni rines comerciales con estos filtros.",
    sortFeatured: "Destacados",
    sortPriceAsc: "Precio: menor a mayor",
    sortPriceDesc: "Precio: mayor a menor",
    sortBrandAsc: "Marca: A–Z",
  },
  nl: {
    nav: "Trucks & Trailers",
    eyebrow: "Bedrijfswagens & Zwaar Transport",
    title: "Truck- & Trailerbanden en Velgen",
    subtitle:
      "Zware radiaalbanden (385/65R22.5, 315/80R22.5, 295/75R22.5, 425/65R22.5) en gesmede aluminium of stalen 22.5\" & 24.5\" velgen voor trekkers en opleggers.",
    metaTitle: "Truck- & Trailerbanden en Velgen (385/65R22.5, 22.5\" Velgen)",
    metaDescription:
      "Truck- en trailerbanden 385/65R22.5, 315/80R22.5 en 22.5\" velgen van Alcoa, Accuride, Speedline Truck, Jantsa en Maxion Wheels.",
    tabAll: "Alles Commercieel",
    tabTires: "Truck- & Trailerbanden",
    tabWheels: "Truck- & Trailervelgen",
    allSizes: "Alle maten",
    allBrands: "Alle merken",
    allStandards: "Alle steekmaten",
    standardUs: "US Hub-Piloted (10x285.75)",
    standardEu: "EU ISO (10x335)",
    complianceUs: "US DOT · EPA SmartWay · Load Range G–L · SAE J267",
    complianceEu: "EU-verordening 2020/740 · M+S & 3PMSF · TÜV / ECE R124 / ISO 4107",
    showingCount: "{count} commerciële producten",
    resetFilters: "Filters wissen",
    emptyState: "Geen truckbanden of velgen gevonden voor deze filters.",
    sortFeatured: "Uitgelicht",
    sortPriceAsc: "Prijs: laag naar hoog",
    sortPriceDesc: "Prijs: hoog naar laag",
    sortBrandAsc: "Merk: A–Z",
  },
}

export function getCommercialCopy(store: Store): CommercialCopy {
  const key = localeMeta(store).content
  return COPY[key] ?? COPY.en
}
