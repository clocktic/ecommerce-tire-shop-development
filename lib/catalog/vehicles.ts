import type { Market } from "@/lib/markets"

export type FactorySize = {
  id: string
  label: string
  width: number
  aspect: number
  rim: number
}

export type VehicleModel = {
  id: string
  make: string
  model: string
  yearFrom: number
  yearTo: number
  markets: Market[]
  boltPattern: string
  centerBore: number
  sizes: FactorySize[]
}

type SizeSpec = [string, string, number, number, number]
type VehicleSpec = [string, string, string, number, number, Market[], string, number, SizeSpec[]]

const us: Market[] = ["us"]
const eu: Market[] = ["eu"]
const both: Market[] = ["us", "eu"]

function size([id, label, width, aspect, rim]: SizeSpec): FactorySize {
  return { id, label, width, aspect, rim }
}

function vehicle([id, make, model, yearFrom, yearTo, markets, boltPattern, centerBore, sizes]: VehicleSpec): VehicleModel {
  return { id, make, model, yearFrom, yearTo, markets, boltPattern, centerBore, sizes: sizes.map(size) }
}

// Exact Width -> Aspect -> Rim map present in the live catalog database.
export const CATALOG_SIZE_MAP: Record<number, Record<number, number[]>> = {
  155: { 70: [19] },
  165: { 65: [14] },
  175: { 65: [14, 15, 17], 70: [13, 14] },
  185: { 55: [15, 16], 60: [14, 15], 65: [14, 15], 70: [14], 75: [14] },
  195: { 40: [17], 45: [16, 17], 50: [15, 16, 19], 55: [15, 16], 60: [14, 15, 16, 17], 65: [15], 70: [14], 75: [14] },
  205: { 40: [17, 18], 45: [16, 17], 50: [15, 16, 17], 55: [15, 16, 17], 60: [15, 16], 65: [15, 16], 70: [14, 15, 16], 75: [14, 15] },
  215: { 40: [17, 18], 45: [16, 17, 18, 20], 50: [17, 18, 19], 55: [16, 17, 18], 60: [15, 16, 17, 18], 65: [15, 16, 17], 70: [14, 15, 16, 17], 75: [14, 15] },
  225: { 35: [18, 19, 20], 40: [18, 19], 45: [16, 17, 18, 19, 21], 50: [15, 16, 17, 18], 55: [16, 17, 18, 19], 60: [16, 17, 18], 65: [16, 17], 70: [14, 15, 16], 75: [15, 16] },
  235: { 30: [20], 35: [19, 20], 40: [17, 18, 19, 20], 45: [17, 18, 19, 20, 21], 50: [17, 18, 19, 20, 21], 55: [16, 17, 18, 19, 20], 60: [15, 16, 17, 18, 19, 20], 65: [16, 17, 18, 19], 70: [15, 16, 17], 75: [15, 16, 17] },
  245: { 30: [19, 20, 21], 35: [18, 19, 20, 21], 40: [17, 18, 19, 20, 21], 45: [16, 17, 18, 19, 20, 21], 50: [16, 17, 18, 19, 20], 55: [17, 18, 19], 60: [15, 18, 20], 65: [17], 70: [16, 17], 75: [16, 17, 18] },
  255: { 30: [19, 20, 21, 22], 35: [18, 19, 20, 21], 40: [17, 18, 19, 20, 21, 22, 23], 45: [18, 19, 20, 21, 22], 50: [19, 20, 21], 55: [17, 18, 19, 20, 21], 60: [15, 17, 18, 19, 20], 65: [16, 17, 18, 19], 70: [15, 16, 17, 18], 75: [17] },
  265: { 30: [19, 20, 21], 35: [18, 19, 20, 21, 22], 40: [17, 18, 19, 20, 21, 22], 45: [18, 19, 20, 21], 50: [15, 19, 20, 22], 55: [19, 20], 60: [17, 18, 20], 65: [17, 18], 70: [15, 16, 17, 18], 75: [15, 16] },
  275: { 30: [19, 20, 21], 35: [18, 19, 20, 21, 22, 23], 40: [17, 18, 19, 20, 21, 22], 45: [18, 19, 20, 21, 22], 50: [19, 20, 21, 22], 55: [19, 20, 21], 60: [15, 18, 20], 65: [18, 20], 70: [16] },
  285: { 25: [22], 30: [18, 19, 20, 21, 22], 35: [18, 19, 20, 21, 22, 23, 24], 40: [18, 19, 20, 21, 22, 23, 24], 45: [20, 21, 22], 50: [20], 60: [18], 65: [18, 20], 70: [17, 18] },
  295: { 25: [20, 22], 30: [18, 19, 20, 21, 22], 35: [18, 19, 20, 21, 22, 23, 24], 40: [19, 20, 21, 22], 45: [19, 20], 50: [15] },
  305: { 25: [21], 30: [19, 20, 21, 22], 35: [19, 20, 21, 22, 23, 24], 40: [20, 21, 22], 45: [22], 50: [20] },
  315: { 30: [18, 19, 20, 21, 22], 35: [20, 21, 22, 24], 40: [21], 45: [21] },
  325: { 25: [20, 21], 30: [19, 20, 21, 23], 35: [20, 22, 23], 40: [21, 22] },
}

export const POPULAR_TIRE_SIZES: Record<Market, { width: number; aspect: number; rim: number; tag: string }[]> = {
  us: [
    { width: 225, aspect: 65, rim: 17, tag: "RAV4 / CR-V" },
    { width: 235, aspect: 55, rim: 19, tag: "SUV / Crossover" },
    { width: 225, aspect: 45, rim: 18, tag: "Sport Sedan" },
    { width: 235, aspect: 60, rim: 18, tag: "Midsize SUV" },
    { width: 255, aspect: 45, rim: 20, tag: "Performance SUV" },
    { width: 275, aspect: 60, rim: 20, tag: "F-150 / Ram / Sierra" },
    { width: 265, aspect: 70, rim: 17, tag: "Tacoma / 4Runner" },
    { width: 235, aspect: 40, rim: 19, tag: "Model 3 / Accord" },
  ],
  eu: [
    { width: 205, aspect: 55, rim: 16, tag: "Golf / Octavia / A3" },
    { width: 225, aspect: 45, rim: 17, tag: "GTI / 3 Series" },
    { width: 225, aspect: 40, rim: 18, tag: "S line / AMG / M Sport" },
    { width: 235, aspect: 55, rim: 19, tag: "Tiguan / XC60 / ID.4" },
    { width: 235, aspect: 60, rim: 18, tag: "GLC / Q5 / XC60" },
    { width: 215, aspect: 55, rim: 17, tag: "Passat / Kona / Niro" },
    { width: 255, aspect: 45, rim: 20, tag: "Q5 / Model Y / Enyaq" },
    { width: 195, aspect: 55, rim: 16, tag: "Clio / 208 / Corsa" },
  ],
}

export function validAspectsForWidth(width: number): number[] {
  const byAspect = CATALOG_SIZE_MAP[width]
  if (!byAspect) return [35, 40, 45, 50, 55, 60, 65]
  return Object.keys(byAspect)
    .map(Number)
    .sort((a, b) => a - b)
}

export function validRimsForWidthAspect(width: number, aspect: number): number[] {
  const rims = CATALOG_SIZE_MAP[width]?.[aspect]
  if (rims && rims.length > 0) return rims
  const allForWidth = Object.values(CATALOG_SIZE_MAP[width] ?? {}).flat()
  return [...new Set(allForWidth)].sort((a, b) => a - b)
}

export function isCatalogTireSize(width: number, aspect: number, rim: number): boolean {
  return Boolean(CATALOG_SIZE_MAP[width]?.[aspect]?.includes(rim))
}

const SPECS: VehicleSpec[] = [
  // Acura
  ["acura-integra", "Acura", "Integra", 2023, 2026, us, "5x114.3", 64.1, [["17", "Base 17\"", 215, 50, 17], ["18", "A-Spec 18\"", 235, 40, 18], ["19", "Type S 19\"", 265, 30, 19]]],
  ["acura-tlx", "Acura", "TLX", 2021, 2026, us, "5x120", 64.1, [["18", "Base 18\"", 235, 50, 18], ["19", "A-Spec 19\"", 255, 40, 19], ["20", "Type S 20\"", 255, 35, 20]]],
  ["acura-rdx", "Acura", "RDX", 2019, 2026, us, "5x114.3", 64.1, [["19", "Technology 19\"", 235, 55, 19], ["20", "A-Spec 20\"", 255, 45, 20]]],
  ["acura-mdx", "Acura", "MDX", 2022, 2026, us, "5x120", 64.1, [["19", "Base 19\"", 255, 55, 19], ["20", "A-Spec / Advance 20\"", 255, 50, 20], ["21", "Type S 21\"", 275, 40, 21]]],
  ["acura-zdx", "Acura", "ZDX", 2024, 2026, us, "6x139.7", 78.1, [["20", "A-Spec 20\"", 265, 50, 20], ["22", "Type S 22\"", 275, 40, 22]]],

  // Alfa Romeo
  ["alfa-giulia", "Alfa Romeo", "Giulia", 2017, 2026, both, "5x110", 65.1, [["17", "Super 17\"", 225, 50, 17], ["18", "Ti / Sprint 18\"", 225, 45, 18], ["19", "Veloce 19\"", 225, 40, 19]]],
  ["alfa-stelvio", "Alfa Romeo", "Stelvio", 2018, 2026, both, "5x110", 65.1, [["18", "Sprint 18\"", 235, 60, 18], ["19", "Ti 19\"", 235, 55, 19], ["20", "Veloce 20\"", 255, 45, 20]]],
  ["alfa-tonale", "Alfa Romeo", "Tonale", 2023, 2026, both, "5x110", 65.1, [["18", "Sprint 18\"", 235, 50, 18], ["19", "Ti 19\"", 235, 45, 19], ["20", "Veloce 20\"", 235, 40, 20]]],

  // Audi
  ["audi-a1-eu", "Audi", "A1 Sportback", 2019, 2026, eu, "5x100", 57.1, [["16", "16-inch", 195, 55, 16], ["17", "S line 17\"", 215, 45, 17], ["18", "Competition 18\"", 215, 40, 18]]],
  ["audi-a3-eu", "Audi", "A3 / S3", 2020, 2026, both, "5x112", 57.1, [["16", "16-inch", 205, 55, 16], ["17", "17-inch", 225, 45, 17], ["18", "S line / S3 18\"", 225, 40, 18], ["19", "RS / Black Optic 19\"", 235, 35, 19]]],
  ["audi-a4", "Audi", "A4 / S4", 2016, 2026, both, "5x112", 66.6, [["17", "Premium 17\"", 225, 50, 17], ["18", "S line 18\"", 245, 40, 18], ["19", "S4 / Black Optic 19\"", 255, 35, 19]]],
  ["audi-a5", "Audi", "A5 / S5 Sportback", 2018, 2026, both, "5x112", 66.6, [["18", "18-inch", 245, 40, 18], ["19", "S line / S5 19\"", 255, 35, 19], ["20", "Rotor 20\"", 265, 30, 20]]],
  ["audi-a6-eu", "Audi", "A6 / S6", 2019, 2026, both, "5x112", 66.6, [["18", "18-inch", 225, 55, 18], ["19", "Sport 19\"", 245, 45, 19], ["20", "S line / S6 20\"", 255, 40, 20], ["21", "Black Optic 21\"", 255, 35, 21]]],
  ["audi-a7", "Audi", "A7 / RS7", 2019, 2026, both, "5x112", 66.6, [["19", "19-inch", 245, 45, 19], ["20", "S line 20\"", 255, 40, 20], ["21", "Sport 21\"", 275, 35, 21]]],
  ["audi-a8", "Audi", "A8 / S8", 2019, 2026, both, "5x112", 66.6, [["19", "19-inch", 255, 45, 19], ["20", "Executive 20\"", 265, 40, 20], ["21", "S8 21\"", 265, 35, 21]]],
  ["audi-q3-eu", "Audi", "Q3", 2019, 2026, both, "5x112", 57.1, [["17", "17-inch", 215, 65, 17], ["18", "S line 18\"", 235, 55, 18], ["19", "Black Optic 19\"", 255, 45, 19], ["20", "Sport 20\"", 255, 40, 20]]],
  ["audi-q4-etron", "Audi", "Q4 e-tron", 2022, 2026, both, "5x112", 57.1, [["19", "19-inch", 235, 55, 19], ["20", "S line 20\"", 235, 50, 20], ["21", "Edition 21\"", 255, 40, 21]]],
  ["audi-q5", "Audi", "Q5 / SQ5", 2018, 2026, both, "5x112", 66.6, [["18", "Premium 18\"", 235, 60, 18], ["19", "Premium Plus 19\"", 235, 55, 19], ["20", "S line / SQ5 20\"", 255, 45, 20], ["21", "SQ5 Sport 21\"", 255, 40, 21]]],
  ["audi-q7-us", "Audi", "Q7 / SQ7", 2020, 2026, both, "5x112", 66.6, [["19", "19-inch", 255, 55, 19], ["20", "55 TFSI 20\"", 285, 45, 20], ["21", "SQ7 21\"", 285, 40, 21], ["22", "Black Optic 22\"", 285, 35, 22]]],
  ["audi-q8", "Audi", "Q8 / RS Q8", 2019, 2026, both, "5x112", 66.6, [["20", "20-inch", 275, 50, 20], ["21", "S line 21\"", 285, 45, 21], ["22", "Sport 22\"", 285, 40, 22], ["23", "RS Q8 23\"", 295, 35, 23]]],
  ["audi-etron-gt", "Audi", "e-tron GT", 2022, 2026, both, "5x130", 71.6, [["20", "Front/Aero 20\"", 245, 45, 20], ["21", "RS Performance 21\"", 265, 35, 21]]],

  // BMW
  ["bmw-1-eu", "BMW", "1 Series", 2020, 2026, eu, "5x112", 66.6, [["16", "SE 16\"", 205, 55, 16], ["17", "Sport 17\"", 225, 45, 17], ["18", "M Sport / M135i 18\"", 225, 40, 18], ["19", "M Performance 19\"", 235, 35, 19]]],
  ["bmw-2-gran", "BMW", "2 Series / M2", 2021, 2026, both, "5x112", 66.6, [["17", "220i / 228i 17\"", 225, 45, 17], ["18", "230i M Sport 18\"", 225, 40, 18], ["19", "M240i / M2 19\"", 245, 35, 19]]],
  ["bmw-3", "BMW", "3 Series / M3", 2019, 2026, both, "5x112", 66.6, [["17", "320i / 330i 17\"", 225, 50, 17], ["18", "M Sport 18\"", 225, 45, 18], ["19", "M340i 19\"", 225, 40, 19], ["19-m3", "M3 Competition 19\"", 275, 35, 19]]],
  ["bmw-4", "BMW", "4 Series / i4", 2021, 2026, both, "5x112", 66.6, [["18", "430i / eDrive40 18\"", 245, 45, 18], ["19", "M Sport / M50 19\"", 245, 40, 19], ["20", "M Performance 20\"", 255, 35, 20]]],
  ["bmw-5", "BMW", "5 Series / i5", 2017, 2026, both, "5x112", 66.6, [["17", "Base 17\"", 225, 55, 17], ["18", "Sport 18\"", 245, 45, 18], ["19", "M Sport 19\"", 245, 45, 19], ["20", "M550i / i5 M60 20\"", 245, 40, 20]]],
  ["bmw-7", "BMW", "7 Series / i7", 2020, 2026, both, "5x112", 66.6, [["19", "740i 19\"", 245, 50, 19], ["20", "M Sport 20\"", 255, 45, 20], ["21", "Executive 21\"", 255, 40, 21]]],
  ["bmw-x1-eu", "BMW", "X1 / iX1", 2023, 2026, both, "5x112", 66.6, [["18", "xLine 18\"", 225, 55, 18], ["19", "M Sport 19\"", 245, 45, 19], ["20", "M35i 20\"", 245, 40, 20]]],
  ["bmw-x2", "BMW", "X2 / iX2", 2020, 2026, both, "5x112", 66.6, [["18", "18-inch", 225, 50, 18], ["19", "M Sport 19\"", 245, 45, 19], ["20", "M35i 20\"", 245, 40, 20]]],
  ["bmw-x3", "BMW", "X3 / X3 M", 2018, 2026, both, "5x112", 66.6, [["18", "xDrive30i 18\"", 225, 60, 18], ["19", "M Sport 19\"", 245, 50, 19], ["20", "M40i / M50 20\"", 245, 45, 20], ["21", "X3 M 21\"", 255, 40, 21]]],
  ["bmw-x4", "BMW", "X4", 2019, 2026, both, "5x112", 66.6, [["19", "xDrive30i 19\"", 245, 50, 19], ["20", "M40i 20\"", 245, 45, 20], ["21", "X4 M 21\"", 255, 40, 21]]],
  ["bmw-x5", "BMW", "X5 / X5 M", 2019, 2026, both, "5x112", 66.6, [["19", "xDrive40i 19\"", 265, 50, 19], ["20", "M Sport 20\"", 275, 45, 20], ["21", "M60i 21\"", 275, 40, 21], ["22", "Individual 22\"", 275, 35, 22]]],
  ["bmw-x6", "BMW", "X6", 2020, 2026, both, "5x112", 66.6, [["20", "M Sport 20\"", 275, 45, 20], ["21", "M60i 21\"", 275, 40, 21], ["22", "X6 M 22\"", 295, 35, 22]]],
  ["bmw-x7", "BMW", "X7", 2019, 2026, both, "5x112", 66.6, [["21", "xDrive40i 21\"", 285, 45, 21], ["22", "M60i 22\"", 275, 40, 22], ["23", "Alpina XB7 23\"", 285, 35, 23]]],
  ["bmw-ix", "BMW", "iX", 2022, 2026, both, "5x112", 66.6, [["20", "Aero 20\"", 235, 60, 20], ["21", "Sport 21\"", 255, 50, 21], ["22", "M60 22\"", 275, 40, 22]]],

  // Buick
  ["buick-encore-gx", "Buick", "Encore GX", 2020, 2026, us, "5x114.3", 70.3, [["18", "Preferred 18\"", 225, 55, 18]]],
  ["buick-enclave", "Buick", "Enclave", 2018, 2026, us, "6x120", 67.1, [["18", "Essence 18\"", 255, 65, 18], ["20", "Avenir 20\"", 255, 55, 20]]],
  ["buick-envista", "Buick", "Envista", 2024, 2026, us, "5x114.3", 70.3, [["18", "Sport Touring 18\"", 225, 55, 18], ["19", "Avenir 19\"", 245, 45, 19]]],

  // Cadillac
  ["cadillac-ct4", "Cadillac", "CT4 / CT4-V", 2020, 2026, us, "5x120", 66.9, [["17", "Luxury 17\"", 225, 45, 17], ["18", "Sport / V-Series 18\"", 235, 40, 18]]],
  ["cadillac-ct5", "Cadillac", "CT5 / CT5-V", 2020, 2026, us, "5x120", 66.9, [["18", "Luxury 18\"", 245, 45, 18], ["19", "Sport / V-Series 19\"", 245, 40, 19], ["20", "Blackwing 20\"", 275, 35, 20]]],
  ["cadillac-xt5", "Cadillac", "XT5", 2017, 2026, us, "6x120", 67.1, [["18", "Luxury 18\"", 235, 65, 18], ["20", "Premium Luxury 20\"", 235, 55, 20]]],
  ["cadillac-lyriq", "Cadillac", "LYRIQ", 2023, 2026, us, "6x120", 67.1, [["20", "Tech / Luxury 20\"", 265, 50, 20], ["22", "Sport 22\"", 275, 40, 22]]],
  ["cadillac-escalade", "Cadillac", "Escalade", 2021, 2026, us, "6x139.7", 78.1, [["22", "Luxury / Sport 22\"", 275, 50, 22], ["24", "V-Series 24\"", 285, 40, 24]]],

  // Chevrolet
  ["chevy-camaro", "Chevrolet", "Camaro", 2016, 2024, us, "5x120", 67.1, [["18", "LS / LT 18\"", 245, 50, 18], ["20", "RS / SS 20\"", 245, 40, 20], ["20-rear", "SS Rear / ZL1 20\"", 275, 35, 20]]],
  ["chevy-corvette", "Chevrolet", "Corvette C8", 2020, 2026, us, "5x120", 66.9, [["19", "Stingray Front 19\"", 245, 35, 19], ["20", "Stingray Rear 20\"", 305, 30, 20]]],
  ["chevy-trax", "Chevrolet", "Trax", 2024, 2026, us, "5x114.3", 70.3, [["17", "LS / 1RS 17\"", 225, 60, 17], ["18", "LT / ACTIV 18\"", 225, 55, 18], ["19", "2RS 19\"", 245, 45, 19]]],
  ["chevy-trailblazer", "Chevrolet", "Trailblazer", 2021, 2026, us, "5x114.3", 70.3, [["17", "LS / LT 17\"", 225, 60, 17], ["18", "RS 18\"", 225, 55, 18]]],
  ["chevy-equinox", "Chevrolet", "Equinox / Equinox EV", 2018, 2026, us, "5x114.3", 70.3, [["17", "LS / LT 17\"", 225, 65, 17], ["18", "Premier 18\"", 225, 60, 18], ["19", "RS 19\"", 235, 50, 19], ["20", "EV RS 20\"", 245, 50, 20]]],
  ["chevy-blazer", "Chevrolet", "Blazer / Blazer EV", 2019, 2026, us, "6x120", 67.1, [["18", "LT 18\"", 235, 65, 18], ["20", "RS / Premier 20\"", 235, 55, 20], ["21", "SS 21\"", 275, 45, 21]]],
  ["chevy-traverse", "Chevrolet", "Traverse", 2024, 2026, us, "6x120", 67.1, [["18", "LT / Z71 18\"", 255, 65, 18], ["20", "Premier 20\"", 255, 55, 20], ["22", "RS 22\"", 275, 45, 22]]],
  ["chevy-colorado", "Chevrolet", "Colorado", 2023, 2026, us, "6x139.7", 78.1, [["17", "WT / LT / Z71 17\"", 255, 65, 17], ["18", "Trail Boss 18\"", 265, 65, 18], ["20", "High Country 20\"", 265, 50, 20]]],
  ["chevy-silverado", "Chevrolet", "Silverado 1500", 2019, 2026, us, "6x139.7", 78.1, [["17", "WT / Custom 17\"", 265, 70, 17], ["18", "LT / Z71 18\"", 265, 65, 18], ["20", "RST / LTZ 20\"", 275, 60, 20], ["22", "High Country 22\"", 275, 50, 22]]],
  ["chevy-tahoe", "Chevrolet", "Tahoe / Suburban", 2021, 2026, us, "6x139.7", 78.1, [["18", "LS 18\"", 265, 65, 18], ["20", "LT / Z71 20\"", 275, 60, 20], ["22", "RST / Premier 22\"", 275, 50, 22]]],

  // Chrysler
  ["chrysler-pacifica", "Chrysler", "Pacifica", 2017, 2026, us, "5x127", 71.5, [["17", "Touring 17\"", 235, 65, 17], ["18", "Limited 18\"", 235, 60, 18], ["20", "S Appearance 20\"", 245, 50, 20]]],

  // Citroen
  ["citroen-c3", "Citroen", "C3 / e-C3", 2017, 2026, eu, "4x108", 65.1, [["15", "Feel 15\"", 185, 65, 15], ["16", "Shine 16\"", 205, 55, 16], ["17", "Max 17\"", 205, 50, 17]]],
  ["citroen-c4", "Citroen", "C4 / e-C4", 2021, 2026, eu, "4x108", 65.1, [["17", "17-inch", 215, 60, 17], ["18", "Shine 18\"", 195, 60, 17]]],
  ["citroen-c5", "Citroen", "C5 Aircross", 2019, 2026, eu, "5x108", 65.1, [["17", "Live 17\"", 215, 65, 17], ["18", "Shine 18\"", 225, 55, 18], ["19", "Black Pack 19\"", 205, 50, 19]]],

  // Cupra
  ["cupra-born", "Cupra", "Born", 2022, 2026, eu, "5x112", 57.1, [["18", "18-inch", 215, 55, 18], ["19", "Typhoon 19\"", 215, 50, 19], ["20", "Firestorm 20\"", 235, 40, 20]]],
  ["cupra-leon", "Cupra", "Leon", 2021, 2026, eu, "5x112", 57.1, [["18", "V1 18\"", 225, 40, 18], ["19", "VZ 19\"", 235, 35, 19]]],
  ["cupra-formentor", "Cupra", "Formentor", 2021, 2026, eu, "5x112", 57.1, [["18", "V1 18\"", 245, 45, 18], ["19", "VZ 19\"", 245, 40, 19], ["20", "VZ5 20\"", 255, 35, 20]]],
  ["cupra-terramar", "Cupra", "Terramar", 2024, 2026, eu, "5x112", 57.1, [["18", "18-inch", 235, 55, 18], ["19", "19-inch", 255, 45, 19], ["20", "VZ 20\"", 255, 40, 20]]],

  // Dacia
  ["dacia-sandero", "Dacia", "Sandero / Stepway", 2021, 2026, eu, "4x100", 60.1, [["15", "Essential 15\"", 185, 65, 15], ["16", "Stepway 16\"", 205, 60, 16]]],
  ["dacia-duster", "Dacia", "Duster", 2018, 2026, eu, "5x114.3", 66.1, [["16", "Expression 16\"", 215, 65, 16], ["17", "Journey 17\"", 215, 60, 17], ["18", "Extreme 18\"", 215, 60, 18]]],
  ["dacia-jogger", "Dacia", "Jogger", 2022, 2026, eu, "4x100", 60.1, [["16", "Extreme 16\"", 205, 60, 16]]],

  // Dodge
  ["dodge-charger", "Dodge", "Charger", 2015, 2026, us, "5x114.3", 71.5, [["18", "SXT / GT 18\"", 235, 55, 18], ["20", "R/T / Scat Pack 20\"", 245, 45, 20], ["20-wide", "Widebody 20\"", 305, 35, 20]]],
  ["dodge-hornet", "Dodge", "Hornet", 2023, 2026, us, "5x110", 65.1, [["17", "GT 17\"", 215, 60, 17], ["18", "R/T 18\"", 235, 50, 18], ["20", "Track Pack 20\"", 235, 40, 20]]],
  ["dodge-durango", "Dodge", "Durango", 2018, 2026, us, "5x127", 71.5, [["18", "SXT 18\"", 265, 60, 18], ["20", "GT / R/T / SRT 20\"", 265, 50, 20], ["20-srt", "SRT Hellcat 20\"", 295, 45, 20]]],

  // Fiat
  ["fiat-500", "Fiat", "500 / 500e", 2012, 2026, both, "4x98", 58.1, [["15", "Pop / Lounge 15\"", 185, 55, 15], ["16", "Sport 16\"", 195, 45, 16], ["17", "La Prima 17\"", 205, 45, 17]]],
  ["fiat-panda", "Fiat", "Panda", 2012, 2026, eu, "4x98", 58.1, [["14", "City 14\"", 175, 65, 14], ["15", "Cross 15\"", 185, 55, 15]]],
  ["fiat-tipo", "Fiat", "Tipo", 2016, 2026, eu, "5x110", 65.1, [["16", "16-inch", 205, 55, 16], ["17", "Cross 17\"", 215, 55, 17]]],
  ["fiat-600e", "Fiat", "600 / 600e", 2024, 2026, eu, "4x108", 65.1, [["17", "Red 17\"", 215, 60, 17], ["18", "La Prima 18\"", 215, 55, 18]]],

  // Ford
  ["ford-fiesta", "Ford", "Fiesta", 2017, 2024, eu, "4x108", 63.4, [["15", "Trend 15\"", 195, 60, 15], ["17", "ST-Line 17\"", 205, 45, 17], ["18", "ST 18\"", 205, 40, 18]]],
  ["ford-focus", "Ford", "Focus", 2018, 2026, eu, "5x108", 63.4, [["16", "Titanium 16\"", 205, 55, 16], ["17", "ST-Line 17\"", 215, 50, 17], ["18", "ST-Line X 18\"", 235, 40, 18], ["19", "Focus ST 19\"", 235, 35, 19]]],
  ["ford-puma", "Ford", "Puma", 2020, 2026, eu, "5x108", 63.4, [["17", "Titanium 17\"", 215, 55, 17], ["18", "ST-Line 18\"", 215, 50, 18], ["19", "Puma ST 19\"", 225, 40, 19]]],
  ["ford-kuga", "Ford", "Kuga", 2020, 2026, eu, "5x108", 63.4, [["17", "Titanium 17\"", 225, 65, 17], ["18", "ST-Line 18\"", 225, 60, 18], ["19", "ST-Line X 19\"", 225, 55, 19], ["20", "Vignale 20\"", 245, 45, 20]]],
  ["ford-escape", "Ford", "Escape", 2020, 2026, us, "5x108", 63.4, [["17", "Active 17\"", 225, 65, 17], ["18", "ST-Line 18\"", 225, 60, 18], ["19", "Platinum 19\"", 225, 55, 19]]],
  ["ford-bronco-sport", "Ford", "Bronco Sport", 2021, 2026, us, "5x108", 63.4, [["17", "Big Bend / Badlands 17\"", 225, 65, 17], ["18", "Outer Banks 18\"", 225, 60, 18]]],
  ["ford-bronco", "Ford", "Bronco", 2021, 2026, us, "6x139.7", 93.1, [["17", "Big Bend 17\"", 255, 75, 17], ["17-badlands", "Badlands 17\"", 285, 70, 17], ["18", "Outer Banks 18\"", 255, 70, 18]]],
  ["ford-maverick", "Ford", "Maverick", 2022, 2026, us, "5x108", 63.4, [["17", "XL / XLT 17\"", 225, 65, 17], ["18", "Lariat 18\"", 225, 60, 18], ["19", "Lobo 19\"", 225, 55, 19]]],
  ["ford-mustang", "Ford", "Mustang", 2015, 2026, both, "5x114.3", 70.5, [["18", "EcoBoost 18\"", 235, 50, 18], ["19", "GT / Dark Horse 19\"", 255, 40, 19], ["20", "Performance 20\"", 265, 35, 20]]],
  ["ford-mach-e", "Ford", "Mustang Mach-E", 2021, 2026, both, "5x108", 63.4, [["18", "Select 18\"", 225, 60, 18], ["19", "Premium 19\"", 225, 55, 19], ["20", "GT 20\"", 245, 45, 20]]],
  ["ford-explorer", "Ford", "Explorer", 2020, 2026, both, "5x114.3", 70.5, [["18", "Active 18\"", 255, 65, 18], ["20", "ST-Line / Platinum 20\"", 255, 55, 20], ["21", "Explorer ST 21\"", 275, 45, 21]]],
  ["ford-ranger-us", "Ford", "Ranger", 2019, 2026, both, "6x139.7", 93.1, [["17", "XL / XLT 17\"", 255, 70, 17], ["18", "Lariat / Wildtrak 18\"", 255, 65, 18], ["17-raptor", "Ranger Raptor 17\"", 285, 70, 17]]],
  ["ford-f150", "Ford", "F-150", 2021, 2026, us, "6x135", 87.1, [["17", "XL / Raptor 17\"", 265, 70, 17], ["18", "XLT / Lariat 18\"", 275, 65, 18], ["20", "Sport / King Ranch 20\"", 275, 60, 20], ["22", "Limited / Platinum 22\"", 275, 50, 22]]],
  ["ford-expedition", "Ford", "Expedition", 2018, 2026, us, "6x135", 87.1, [["18", "XLT 18\"", 275, 65, 18], ["20", "Limited 20\"", 275, 55, 20], ["22", "Platinum / Timberline 22\"", 285, 45, 22]]],

  // Genesis
  ["genesis-g70", "Genesis", "G70", 2019, 2026, us, "5x114.3", 67.1, [["19", "2.5T / 3.3T 19\"", 225, 40, 19], ["19-rear", "Sport Rear 19\"", 255, 35, 19]]],
  ["genesis-g80", "Genesis", "G80", 2021, 2026, us, "5x114.3", 67.1, [["18", "2.5T 18\"", 245, 50, 18], ["19", "Advanced 19\"", 245, 45, 19], ["20", "3.5T Sport 20\"", 245, 40, 20]]],
  ["genesis-gv70", "Genesis", "GV70", 2022, 2026, both, "5x114.3", 67.1, [["19", "Advanced 19\"", 235, 55, 19], ["21", "Sport Prestige 21\"", 255, 40, 21]]],
  ["genesis-gv80", "Genesis", "GV80", 2021, 2026, both, "5x114.3", 67.1, [["19", "Standard 19\"", 265, 55, 19], ["20", "Advanced 20\"", 265, 50, 20], ["22", "Prestige 22\"", 265, 40, 22]]],

  // GMC
  ["gmc-terrain", "GMC", "Terrain", 2018, 2026, us, "5x114.3", 70.3, [["17", "SLE / SLT 17\"", 225, 65, 17], ["19", "AT4 / Denali 19\"", 235, 50, 19]]],
  ["gmc-acadia", "GMC", "Acadia", 2024, 2026, us, "6x120", 67.1, [["18", "AT4 18\"", 255, 65, 18], ["20", "Elevation 20\"", 255, 55, 20], ["22", "Denali 22\"", 275, 45, 22]]],
  ["gmc-canyon", "GMC", "Canyon", 2023, 2026, us, "6x139.7", 78.1, [["18", "Elevation / AT4 18\"", 265, 65, 18], ["20", "Denali 20\"", 275, 60, 20]]],
  ["gmc-sierra", "GMC", "Sierra 1500", 2019, 2026, us, "6x139.7", 78.1, [["17", "Pro 17\"", 265, 70, 17], ["18", "SLE / AT4 18\"", 275, 65, 18], ["20", "Elevation / SLT 20\"", 275, 60, 20], ["22", "Denali Ultimate 22\"", 275, 50, 22]]],
  ["gmc-yukon", "GMC", "Yukon / Yukon XL", 2021, 2026, us, "6x139.7", 78.1, [["20", "SLT / AT4 20\"", 275, 60, 20], ["22", "Denali 22\"", 275, 50, 22]]],

  // Honda
  ["honda-civic", "Honda", "Civic / Civic Si", 2022, 2026, both, "5x114.3", 64.1, [["16", "LX 16\"", 215, 55, 16], ["17", "EX 17\"", 215, 50, 17], ["18", "Sport / Touring / Si 18\"", 235, 40, 18]]],
  ["honda-civic-typer", "Honda", "Civic Type R", 2018, 2026, both, "5x120", 64.1, [["19", "FL5 19\"", 265, 30, 19], ["20", "FK8 20\"", 245, 30, 20]]],
  ["honda-accord", "Honda", "Accord", 2018, 2026, us, "5x114.3", 64.1, [["17", "LX / EX 17\"", 225, 50, 17], ["19", "Sport / Touring 19\"", 235, 40, 19]]],
  ["honda-hrv", "Honda", "HR-V / ZR-V", 2023, 2026, both, "5x114.3", 64.1, [["17", "LX / Sport 17\"", 215, 60, 17], ["18", "EX-L / Advance 18\"", 225, 55, 18]]],
  ["honda-crv-17", "Honda", "CR-V (2017–2022)", 2017, 2022, both, "5x114.3", 64.1, [["17", "LX 17\"", 235, 65, 17], ["18", "EX / EX-L 18\"", 235, 60, 18], ["19", "Touring 19\"", 235, 55, 19]]],
  ["honda-crv-23", "Honda", "CR-V (2023–2026)", 2023, 2026, both, "5x114.3", 64.1, [["17", "LX 17\"", 235, 65, 17], ["18", "EX / Sport 18\"", 235, 60, 18], ["19", "Sport Touring 19\"", 235, 55, 19]]],
  ["honda-passport", "Honda", "Passport", 2019, 2026, us, "5x120", 64.1, [["18", "TrailSport 18\"", 245, 60, 18], ["20", "EX-L / Black Edition 20\"", 265, 45, 20]]],
  ["honda-pilot", "Honda", "Pilot", 2023, 2026, us, "5x120", 64.1, [["18", "TrailSport 18\"", 265, 60, 18], ["20", "Touring / Elite 20\"", 255, 50, 20]]],
  ["honda-odyssey", "Honda", "Odyssey", 2018, 2026, us, "5x120", 64.1, [["18", "EX / EX-L 18\"", 235, 60, 18], ["19", "Touring / Elite 19\"", 235, 55, 19]]],
  ["honda-prologue", "Honda", "Prologue", 2024, 2026, us, "6x120", 67.1, [["19", "EX / Touring 19\"", 255, 60, 19], ["21", "Elite 21\"", 275, 45, 21]]],

  // Hyundai
  ["hyundai-i20", "Hyundai", "i20", 2020, 2026, eu, "4x100", 54.1, [["15", "15-inch", 185, 65, 15], ["16", "Prime 16\"", 195, 55, 16], ["17", "N Line 17\"", 215, 45, 17]]],
  ["hyundai-i30", "Hyundai", "i30 / i30 N", 2017, 2026, eu, "5x114.3", 67.1, [["16", "Comfort 16\"", 205, 55, 16], ["17", "Prime 17\"", 225, 45, 17], ["18", "N Line 18\"", 225, 40, 18], ["19", "i30 N Performance 19\"", 235, 35, 19]]],
  ["hyundai-elantra", "Hyundai", "Elantra / Elantra N", 2021, 2026, us, "5x114.3", 67.1, [["15", "SE 15\"", 195, 65, 15], ["17", "SEL / Limited 17\"", 225, 45, 17], ["18", "N Line 18\"", 235, 40, 18], ["19", "Elantra N 19\"", 245, 35, 19]]],
  ["hyundai-sonata", "Hyundai", "Sonata", 2020, 2026, us, "5x114.3", 67.1, [["17", "SEL 17\"", 215, 55, 17], ["18", "Limited 18\"", 235, 45, 18], ["19", "N Line 19\"", 245, 40, 19]]],
  ["hyundai-kona", "Hyundai", "Kona / Kona Electric", 2018, 2026, both, "5x114.3", 67.1, [["17", "SE / SEL 17\"", 215, 60, 17], ["18", "Limited 18\"", 215, 55, 18], ["19", "N Line 19\"", 235, 45, 19]]],
  ["hyundai-tucson-us", "Hyundai", "Tucson", 2022, 2026, us, "5x114.3", 67.1, [["17", "SE / SEL 17\"", 235, 65, 17], ["18", "XRT 18\"", 235, 60, 18], ["19", "Limited / N Line 19\"", 235, 55, 19]]],
  ["hyundai-tucson-eu", "Hyundai", "Tucson", 2021, 2026, eu, "5x114.3", 67.1, [["17", "Select 17\"", 215, 65, 17], ["18", "Trend 18\"", 235, 55, 18], ["19", "N Line / Prime 19\"", 235, 50, 19]]],
  ["hyundai-santafe", "Hyundai", "Santa Fe", 2021, 2026, both, "5x114.3", 67.1, [["18", "SE / XRT 18\"", 235, 60, 18], ["20", "Limited 20\"", 255, 45, 20], ["21", "Calligraphy 21\"", 245, 45, 21]]],
  ["hyundai-palisade", "Hyundai", "Palisade", 2020, 2026, us, "5x114.3", 67.1, [["18", "SE / SEL 18\"", 245, 60, 18], ["20", "Limited / Calligraphy 20\"", 245, 50, 20]]],
  ["hyundai-ioniq5", "Hyundai", "IONIQ 5", 2022, 2026, both, "5x114.3", 67.1, [["19", "SE / SEL 19\"", 235, 55, 19], ["20", "Limited 20\"", 255, 45, 20], ["21", "IONIQ 5 N 21\"", 275, 35, 21]]],
  ["hyundai-ioniq6", "Hyundai", "IONIQ 6", 2023, 2026, both, "5x114.3", 67.1, [["18", "Long Range 18\"", 225, 55, 18], ["20", "SEL / Limited 20\"", 245, 40, 20]]],

  // Infiniti
  ["infiniti-qx50", "Infiniti", "QX50 / QX55", 2019, 2026, us, "5x114.3", 66.1, [["19", "Pure / Luxe 19\"", 235, 55, 19], ["20", "Sensory / Autograph 20\"", 255, 45, 20]]],
  ["infiniti-qx60", "Infiniti", "QX60", 2022, 2026, us, "5x114.3", 66.1, [["18", "Pure 18\"", 255, 60, 18], ["20", "Luxe / Sensory 20\"", 255, 50, 20]]],
  ["infiniti-qx80", "Infiniti", "QX80", 2020, 2026, us, "6x139.7", 77.8, [["20", "Luxe 20\"", 275, 60, 20], ["22", "Sensory / Autograph 22\"", 275, 50, 22]]],

  // Jaguar
  ["jaguar-fpace", "Jaguar", "F-PACE", 2017, 2026, both, "5x108", 63.4, [["19", "R-Dynamic 19\"", 255, 55, 19], ["20", "S 20\"", 255, 50, 20], ["21", "SVR 21\"", 265, 45, 21]]],
  ["jaguar-ipace", "Jaguar", "I-PACE", 2019, 2026, both, "5x108", 63.4, [["19", "S 19\"", 235, 60, 19], ["20", "SE / HSE 20\"", 245, 50, 20]]],

  // Jeep
  ["jeep-compass", "Jeep", "Compass", 2018, 2026, both, "5x110", 65.1, [["17", "Sport / Trailhawk 17\"", 225, 60, 17], ["18", "Limited 18\"", 225, 55, 18], ["19", "High Altitude 19\"", 235, 45, 19]]],
  ["jeep-wrangler", "Jeep", "Wrangler", 2018, 2026, both, "5x127", 71.5, [["17", "Sport / Willys 17\"", 245, 75, 17], ["17-rubicon", "Rubicon 33\" 17\"", 285, 70, 17], ["18", "Sahara 18\"", 255, 70, 18], ["20", "High Altitude 20\"", 275, 55, 20]]],
  ["jeep-gladiator", "Jeep", "Gladiator", 2020, 2026, us, "5x127", 71.5, [["17", "Sport / Overland 17\"", 245, 75, 17], ["17-mojave", "Rubicon / Mojave 17\"", 285, 70, 17], ["18", "High Altitude 18\"", 255, 70, 18]]],
  ["jeep-grand", "Jeep", "Grand Cherokee / L", 2021, 2026, both, "5x127", 71.5, [["18", "Laredo / Limited 18\"", 265, 60, 18], ["20", "Overland 20\"", 265, 50, 20], ["21", "Summit Reserve 21\"", 275, 45, 21]]],
  ["jeep-wagoneer", "Jeep", "Wagoneer / Grand Wagoneer", 2022, 2026, us, "6x139.7", 77.8, [["20", "Series I / II 20\"", 275, 55, 20], ["22", "Series III / Obsidian 22\"", 285, 45, 22]]],

  // Kia
  ["kia-ceed", "Kia", "Ceed / XCeed", 2018, 2026, eu, "5x114.3", 67.1, [["16", "Vision 16\"", 205, 55, 16], ["17", "Spirit 17\"", 225, 45, 17], ["18", "GT-Line / XCeed 18\"", 235, 45, 18]]],
  ["kia-k4-forte", "Kia", "Forte / K4", 2019, 2026, us, "5x114.3", 67.1, [["16", "LXS 16\"", 205, 55, 16], ["17", "GT-Line 17\"", 225, 45, 17], ["18", "GT 18\"", 235, 40, 18]]],
  ["kia-k5", "Kia", "K5", 2021, 2026, us, "5x114.3", 67.1, [["16", "LXS 16\"", 205, 65, 16], ["18", "GT-Line / EX 18\"", 235, 45, 18], ["19", "GT 19\"", 245, 40, 19]]],
  ["kia-niro", "Kia", "Niro / Niro EV", 2022, 2026, both, "5x114.3", 67.1, [["16", "Hybrid 16\"", 205, 60, 16], ["17", "EV / PHEV 17\"", 215, 55, 17], ["18", "SX Touring 18\"", 225, 45, 18]]],
  ["kia-seltos", "Kia", "Seltos", 2021, 2026, us, "5x114.3", 67.1, [["17", "LX / S / EX 17\"", 215, 55, 17], ["18", "SX Turbo 18\"", 235, 45, 18]]],
  ["kia-sportage-us", "Kia", "Sportage", 2023, 2026, us, "5x114.3", 67.1, [["17", "LX / X-Pro 17\"", 235, 65, 17], ["18", "EX / Hybrid 18\"", 235, 60, 18], ["19", "SX Prestige / X-Line 19\"", 235, 55, 19]]],
  ["kia-sportage-eu", "Kia", "Sportage", 2022, 2026, eu, "5x114.3", 67.1, [["17", "Edition 7 17\"", 215, 65, 17], ["18", "Spirit 18\"", 235, 55, 18], ["19", "GT-Line 19\"", 235, 50, 19]]],
  ["kia-sorento", "Kia", "Sorento", 2021, 2026, both, "5x114.3", 67.1, [["17", "LX / X-Pro 17\"", 235, 65, 17], ["18", "EX 18\"", 235, 60, 18], ["20", "SX / X-Line 20\"", 255, 45, 20]]],
  ["kia-telluride", "Kia", "Telluride", 2020, 2026, us, "5x114.3", 67.1, [["18", "LX / X-Pro 18\"", 245, 60, 18], ["20", "EX / SX / X-Line 20\"", 245, 50, 20]]],
  ["kia-ev6", "Kia", "EV6", 2022, 2026, both, "5x114.3", 67.1, [["19", "Wind / Light 19\"", 235, 55, 19], ["20", "GT-Line 20\"", 255, 45, 20], ["21", "EV6 GT 21\"", 255, 40, 21]]],
  ["kia-ev9", "Kia", "EV9", 2024, 2026, both, "5x114.3", 67.1, [["19", "Light / Wind 19\"", 255, 60, 19], ["20", "Land 20\"", 275, 50, 20], ["21", "GT-Line 21\"", 285, 45, 21]]],

  // Land Rover
  ["land-rover-evoque", "Land Rover", "Range Rover Evoque", 2019, 2026, both, "5x108", 63.4, [["18", "S 18\"", 235, 60, 18], ["19", "Dynamic SE 19\"", 235, 55, 19], ["20", "Autobiography 20\"", 235, 50, 20]]],
  ["land-rover-velar", "Land Rover", "Range Rover Velar", 2018, 2026, both, "5x108", 63.4, [["19", "S 19\"", 255, 55, 19], ["20", "Dynamic SE 20\"", 255, 50, 20], ["21", "HSE 21\"", 265, 45, 21]]],
  ["land-rover-defender", "Land Rover", "Defender 90 / 110 / 130", 2020, 2026, both, "5x120", 72.6, [["19", "S 19\"", 255, 65, 19], ["20", "X-Dynamic / SE 20\"", 255, 60, 20], ["22", "V8 / Carpathian 22\"", 275, 45, 22]]],
  ["land-rover-rr-sport", "Land Rover", "Range Rover Sport", 2019, 2026, both, "5x120", 72.6, [["21", "SE / Dynamic 21\"", 275, 50, 21], ["22", "Autobiography 22\"", 285, 45, 22], ["23", "SV 23\"", 285, 40, 23]]],
  ["land-rover-rr", "Land Rover", "Range Rover", 2022, 2026, both, "5x120", 72.6, [["21", "SE 21\"", 275, 50, 21], ["22", "Autobiography 22\"", 285, 45, 22], ["23", "SV 23\"", 285, 40, 23]]],

  // Lexus
  ["lexus-is", "Lexus", "IS 300 / IS 350 / IS 500", 2021, 2026, us, "5x114.3", 60.1, [["18", "IS 300 18\"", 235, 45, 18], ["19", "F SPORT Front 19\"", 235, 40, 19], ["19-rear", "F SPORT Rear 19\"", 265, 35, 19]]],
  ["lexus-es", "Lexus", "ES 250 / ES 350 / ES 300h", 2019, 2026, both, "5x114.3", 60.1, [["17", "Base 17\"", 215, 55, 17], ["18", "Luxury / Ultra Luxury 18\"", 235, 45, 18], ["19", "F SPORT 19\"", 235, 40, 19]]],
  ["lexus-ux", "Lexus", "UX 250h / UX 300h", 2019, 2026, both, "5x114.3", 60.1, [["17", "Base 17\"", 215, 60, 17], ["18", "F SPORT / Luxury 18\"", 225, 50, 18]]],
  ["lexus-nx", "Lexus", "NX 250 / 350 / 350h / 450h+", 2022, 2026, both, "5x114.3", 60.1, [["18", "Base / Premium 18\"", 235, 60, 18], ["20", "Luxury / F SPORT 20\"", 235, 50, 20]]],
  ["lexus-rx", "Lexus", "RX 350 / 350h / 500h", 2023, 2026, both, "5x114.3", 60.1, [["19", "Base / Premium 19\"", 235, 60, 19], ["21", "Luxury / F SPORT 21\"", 235, 50, 21]]],
  ["lexus-tx", "Lexus", "TX 350 / 500h", 2024, 2026, us, "5x120", 60.1, [["20", "Premium / Luxury 20\"", 255, 55, 20], ["22", "F SPORT Performance 22\"", 255, 45, 22]]],
  ["lexus-gx", "Lexus", "GX 460 / GX 550", 2020, 2026, us, "6x139.7", 95.1, [["18", "Overtrail / Base 18\"", 265, 60, 18], ["20", "Premium 20\"", 265, 55, 20], ["22", "Luxury+ 22\"", 265, 50, 22]]],

  // Lincoln
  ["lincoln-corsair", "Lincoln", "Corsair", 2020, 2026, us, "5x108", 63.4, [["18", "Standard 18\"", 225, 60, 18], ["19", "Reserve 19\"", 225, 55, 19], ["20", "Grand Touring 20\"", 245, 45, 20]]],
  ["lincoln-nautilus", "Lincoln", "Nautilus", 2021, 2026, us, "5x108", 63.4, [["19", "Premiere 19\"", 255, 60, 19], ["21", "Reserve 21\"", 255, 50, 21], ["22", "Black Label 22\"", 255, 45, 22]]],
  ["lincoln-aviator", "Lincoln", "Aviator", 2020, 2026, us, "5x114.3", 70.5, [["20", "Premiere / Reserve 20\"", 255, 55, 20], ["22", "Black Label 22\"", 275, 40, 22]]],
  ["lincoln-navigator", "Lincoln", "Navigator", 2018, 2026, us, "6x135", 87.1, [["20", "Premiere 20\"", 275, 55, 20], ["22", "Reserve / Black Label 22\"", 285, 45, 22]]],

  // Lucid
  ["lucid-air", "Lucid", "Air", 2022, 2026, both, "5x120", 64.1, [["19", "Pure Aero 19\"", 245, 45, 19], ["20", "Touring 20\"", 245, 40, 20], ["21", "Grand Touring 21\"", 245, 35, 21]]],

  // Mazda
  ["mazda-mx5", "Mazda", "MX-5 Miata", 2016, 2026, both, "4x100", 54.1, [["16", "Sport 16\"", 195, 50, 16], ["17", "Club / Grand Touring 17\"", 205, 45, 17]]],
  ["mazda-3", "Mazda", "Mazda3", 2019, 2026, both, "5x114.3", 67.1, [["16", "2.5 S 16\"", 205, 60, 16], ["18", "Preferred / Turbo 18\"", 215, 45, 18]]],
  ["mazda-cx30", "Mazda", "CX-30", 2020, 2026, both, "5x114.3", 67.1, [["16", "Base 16\"", 215, 65, 16], ["18", "Select / Turbo 18\"", 215, 55, 18]]],
  ["mazda-cx5", "Mazda", "CX-5", 2017, 2026, both, "5x114.3", 67.1, [["17", "Select / Preferred 17\"", 225, 65, 17], ["19", "Carbon / Signature / Turbo 19\"", 225, 55, 19]]],
  ["mazda-cx50", "Mazda", "CX-50", 2023, 2026, us, "5x114.3", 67.1, [["17", "Select / Meridian 17\"", 225, 65, 17], ["18", "Hybrid 18\"", 225, 60, 18], ["20", "Premium Plus / Turbo 20\"", 245, 45, 20]]],
  ["mazda-cx70-90", "Mazda", "CX-70 / CX-90", 2024, 2026, both, "5x114.3", 67.1, [["19", "Select / Preferred 19\"", 265, 55, 19], ["21", "Turbo S Premium 21\"", 275, 45, 21]]],

  // Mercedes-Benz
  ["mercedes-a", "Mercedes-Benz", "A-Class / CLA", 2019, 2026, both, "5x112", 66.6, [["16", "Style 16\"", 205, 60, 16], ["17", "Progressive 17\"", 205, 55, 17], ["18", "AMG Line 18\"", 225, 45, 18], ["19", "AMG A35 / CLA45 19\"", 245, 35, 19]]],
  ["mercedes-c", "Mercedes-Benz", "C-Class / AMG C43", 2021, 2026, both, "5x112", 66.6, [["17", "Avantgarde 17\"", 225, 50, 17], ["18", "AMG Line 18\"", 225, 45, 18], ["19", "Sport / AMG C43 19\"", 245, 40, 19]]],
  ["mercedes-cle", "Mercedes-Benz", "CLE Coupe / Cabriolet", 2024, 2026, both, "5x112", 66.6, [["18", "18-inch", 245, 45, 18], ["19", "AMG Line 19\"", 245, 40, 19], ["20", "AMG CLE 53 20\"", 265, 35, 20]]],
  ["mercedes-e", "Mercedes-Benz", "E-Class / AMG E53", 2017, 2026, both, "5x112", 66.6, [["17", "Base 17\"", 225, 55, 17], ["18", "Luxury 18\"", 245, 45, 18], ["19", "AMG Line 19\"", 245, 40, 19], ["20", "AMG E53 20\"", 245, 40, 20]]],
  ["mercedes-s", "Mercedes-Benz", "S-Class", 2021, 2026, both, "5x112", 66.6, [["19", "S 500 19\"", 255, 45, 19], ["20", "AMG Line 20\"", 255, 40, 20], ["21", "Executive 21\"", 255, 35, 21]]],
  ["mercedes-eqe", "Mercedes-Benz", "EQE / EQE SUV", 2023, 2026, both, "5x112", 66.6, [["19", "EQE Sedan 19\"", 255, 45, 19], ["20", "EQE SUV 20\"", 255, 45, 20], ["21", "AMG Line 21\"", 265, 40, 21]]],
  ["mercedes-eqs", "Mercedes-Benz", "EQS / EQS SUV", 2022, 2026, both, "5x112", 66.6, [["20", "EQS 450+ 20\"", 255, 45, 20], ["21", "EQS SUV 21\"", 275, 45, 21]]],
  ["mercedes-gla", "Mercedes-Benz", "GLA / GLB", 2020, 2026, both, "5x112", 66.6, [["17", "Progressive 17\"", 215, 65, 17], ["18", "250 4MATIC 18\"", 235, 55, 18], ["19", "AMG Line 19\"", 235, 50, 19], ["20", "AMG 35 20\"", 255, 40, 20]]],
  ["mercedes-glc", "Mercedes-Benz", "GLC / AMG GLC 43", 2016, 2026, both, "5x112", 66.6, [["18", "GLC 300 18\"", 235, 60, 18], ["19", "AMG Line 19\"", 235, 55, 19], ["20", "AMG GLC 43 20\"", 255, 45, 20]]],
  ["mercedes-gle-us", "Mercedes-Benz", "GLE / GLS", 2020, 2026, both, "5x112", 66.6, [["19", "GLE 350 19\"", 255, 50, 19], ["20", "GLE 450 20\"", 275, 50, 20], ["21", "AMG Line 21\"", 275, 45, 21], ["22", "AMG 53 / 63 22\"", 285, 40, 22]]],
  ["mercedes-g", "Mercedes-Benz", "G-Class (G 550 / G 63)", 2019, 2026, both, "5x130", 84.1, [["19", "G 550 19\"", 275, 55, 19], ["20", "AMG Line 20\"", 275, 50, 20], ["22", "AMG G 63 22\"", 295, 40, 22]]],

  // Mini
  ["mini-cooper", "Mini", "Cooper / Cooper S", 2014, 2026, both, "5x112", 66.6, [["16", "Classic 16\"", 195, 55, 16], ["17", "Cooper S 17\"", 205, 45, 17], ["18", "John Cooper Works 18\"", 205, 40, 18]]],
  ["mini-countryman", "Mini", "Countryman", 2017, 2026, both, "5x112", 66.6, [["17", "Classic 17\"", 225, 55, 17], ["18", "Cooper S / SE 18\"", 225, 50, 18], ["19", "JCW ALL4 19\"", 245, 45, 19]]],

  // Mitsubishi
  ["mitsubishi-outlander", "Mitsubishi", "Outlander / PHEV", 2022, 2026, both, "5x114.3", 66.1, [["18", "ES 18\"", 235, 60, 18], ["20", "SE / SEL 20\"", 255, 45, 20]]],
  ["mitsubishi-eclipse", "Mitsubishi", "Eclipse Cross", 2018, 2026, both, "5x114.3", 67.1, [["16", "ES 16\"", 215, 70, 16], ["18", "SE / SEL 18\"", 225, 55, 18]]],

  // Nissan
  ["nissan-sentra", "Nissan", "Sentra", 2020, 2026, us, "5x114.3", 66.1, [["16", "S / SV 16\"", 205, 60, 16], ["18", "SR 18\"", 215, 45, 18]]],
  ["nissan-altima", "Nissan", "Altima", 2019, 2026, us, "5x114.3", 66.1, [["16", "S 16\"", 215, 60, 16], ["17", "SV / SL 17\"", 215, 55, 17], ["19", "SR 19\"", 235, 40, 19]]],
  ["nissan-z", "Nissan", "Z / 370Z", 2015, 2026, us, "5x114.3", 66.1, [["18", "Sport 18\"", 245, 45, 18], ["19", "Performance Front 19\"", 255, 40, 19], ["19-rear", "Performance Rear 19\"", 275, 35, 19]]],
  ["nissan-juke", "Nissan", "Juke", 2020, 2026, eu, "5x114.3", 66.1, [["17", "Acenta 17\"", 215, 60, 17], ["19", "Tekna / N-Design 19\"", 225, 45, 19]]],
  ["nissan-kicks", "Nissan", "Kicks", 2021, 2026, us, "5x114.3", 66.1, [["16", "S 16\"", 205, 60, 16], ["17", "SV 17\"", 215, 60, 17], ["19", "SR 19\"", 225, 45, 19]]],
  ["nissan-qashqai", "Nissan", "Qashqai", 2021, 2026, eu, "5x114.3", 66.1, [["17", "Acenta 17\"", 215, 65, 17], ["18", "N-Connecta 18\"", 235, 55, 18], ["19", "Tekna 19\"", 235, 50, 19], ["20", "Tekna+ 20\"", 235, 45, 20]]],
  ["nissan-rogue", "Nissan", "Rogue / X-Trail", 2021, 2026, both, "5x114.3", 66.1, [["17", "S / Rock Creek 17\"", 235, 65, 17], ["18", "SV 18\"", 235, 60, 18], ["19", "SL / Platinum 19\"", 235, 55, 19]]],
  ["nissan-ariya", "Nissan", "ARIYA", 2023, 2026, both, "5x114.3", 66.1, [["19", "Engage / Evolve+ 19\"", 235, 55, 19], ["20", "Platinum+ 20\"", 255, 45, 20]]],
  ["nissan-pathfinder", "Nissan", "Pathfinder", 2022, 2026, us, "5x114.3", 66.1, [["18", "S / SV / Rock Creek 18\"", 255, 60, 18], ["20", "SL / Platinum 20\"", 255, 50, 20]]],
  ["nissan-frontier", "Nissan", "Frontier", 2022, 2026, us, "6x114.3", 66.1, [["17", "SV / PRO-4X 17\"", 265, 70, 17], ["18", "SL 18\"", 265, 60, 18]]],

  // Opel
  ["opel-corsa", "Opel", "Corsa / Corsa-e", 2020, 2026, eu, "4x108", 65.1, [["16", "Edition 16\"", 195, 55, 16], ["17", "GS 17\"", 205, 45, 17]]],
  ["opel-astra", "Opel", "Astra", 2022, 2026, eu, "5x108", 65.1, [["16", "Edition 16\"", 205, 55, 16], ["17", "Elegance 17\"", 225, 45, 17], ["18", "GS / GSe 18\"", 225, 40, 18]]],
  ["opel-mokka", "Opel", "Mokka / Mokka-e", 2021, 2026, eu, "4x108", 65.1, [["17", "Elegance 17\"", 215, 60, 17], ["18", "GS / Ultimate 18\"", 215, 55, 18]]],
  ["opel-grandland", "Opel", "Grandland", 2018, 2026, eu, "5x108", 65.1, [["18", "GS 18\"", 225, 55, 18], ["19", "Ultimate 19\"", 235, 50, 19]]],

  // Peugeot
  ["peugeot-208", "Peugeot", "208 / e-208", 2019, 2026, eu, "4x108", 65.1, [["16", "Allure 16\"", 195, 55, 16], ["17", "GT 17\"", 205, 45, 17]]],
  ["peugeot-2008", "Peugeot", "2008 / e-2008", 2020, 2026, eu, "4x108", 65.1, [["16", "Active 16\"", 215, 65, 16], ["17", "Allure 17\"", 215, 60, 17], ["18", "GT 18\"", 215, 55, 18]]],
  ["peugeot-308", "Peugeot", "308 / e-308", 2022, 2026, eu, "5x108", 65.1, [["16", "Active 16\"", 205, 55, 16], ["17", "Allure 17\"", 225, 45, 17], ["18", "GT 18\"", 225, 40, 18]]],
  ["peugeot-3008", "Peugeot", "3008 / e-3008", 2017, 2026, eu, "5x108", 65.1, [["18", "Allure 18\"", 225, 55, 18], ["19", "GT 19\"", 235, 50, 19], ["20", "e-3008 GT 20\"", 235, 50, 20]]],
  ["peugeot-408", "Peugeot", "408", 2023, 2026, eu, "5x108", 65.1, [["19", "Allure / GT 19\"", 205, 50, 19], ["20", "Monolithe 20\"", 245, 40, 20]]],
  ["peugeot-5008", "Peugeot", "5008 / e-5008", 2017, 2026, eu, "5x108", 65.1, [["18", "Allure 18\"", 225, 55, 18], ["19", "GT 19\"", 235, 50, 19]]],

  // Polestar
  ["polestar-2", "Polestar", "Polestar 2", 2021, 2026, both, "5x108", 63.4, [["19", "Standard 19\"", 245, 45, 19], ["20", "Performance Pack 20\"", 245, 40, 20]]],
  ["polestar-3", "Polestar", "Polestar 3", 2024, 2026, both, "5x108", 63.4, [["21", "Plus Pack 21\"", 265, 45, 21], ["22", "Performance Pack 22\"", 265, 40, 22]]],
  ["polestar-4", "Polestar", "Polestar 4", 2024, 2026, both, "5x108", 63.4, [["20", "Aero 20\"", 255, 50, 20], ["21", "Pro 21\"", 255, 45, 21]]],

  // Porsche
  ["porsche-718", "Porsche", "718 Cayman / Boxster", 2017, 2026, both, "5x130", 71.6, [["19", "Front 19\"", 235, 40, 19], ["20", "Carrera S / GTS 20\"", 235, 35, 20], ["20-rear", "Rear 20\"", 265, 35, 20]]],
  ["porsche-911", "Porsche", "911 (992)", 2019, 2026, both, "5x130", 71.6, [["19", "Carrera Front 19\"", 235, 40, 19], ["20", "Carrera S Front 20\"", 245, 35, 20], ["21", "Carrera S Rear 21\"", 305, 30, 21]]],
  ["porsche-taycan", "Porsche", "Taycan", 2020, 2026, both, "5x130", 71.6, [["19", "Aero Front 19\"", 225, 55, 19], ["20", "Turbo Aero 20\"", 245, 45, 20], ["21", "Mission E / RS Spyder 21\"", 265, 35, 21]]],
  ["porsche-panamera", "Porsche", "Panamera", 2017, 2026, both, "5x130", 71.6, [["19", "Front 19\"", 265, 45, 19], ["20", "4S / Turbo 20\"", 275, 40, 20], ["21", "SportDesign 21\"", 275, 35, 21]]],
  ["porsche-macan", "Porsche", "Macan / Macan Electric", 2019, 2026, both, "5x112", 66.6, [["19", "Front 19\"", 235, 55, 19], ["20", "Macan S / GTS 20\"", 265, 45, 20], ["21", "RS Spyder 21\"", 265, 40, 21]]],
  ["porsche-cayenne", "Porsche", "Cayenne / Coupe", 2019, 2026, both, "5x130", 71.6, [["19", "Base 19\"", 255, 55, 19], ["20", "Cayenne S 20\"", 275, 45, 20], ["21", "RS Spyder 21\"", 285, 40, 21], ["22", "Turbo GT / Sport 22\"", 285, 35, 22]]],

  // Ram
  ["ram-1500", "Ram", "1500", 2019, 2026, us, "6x139.7", 77.8, [["18", "Tradesman / Big Horn 18\"", 275, 65, 18], ["18-rebel", "Rebel / RHO 18\"", 285, 70, 18], ["20", "Laramie / Limited 20\"", 275, 55, 20], ["22", "Tungsten / Limited 22\"", 285, 45, 22]]],

  // Renault
  ["renault-clio", "Renault", "Clio / Renault 5 E-Tech", 2019, 2026, eu, "4x100", 60.1, [["15", "Evolution 15\"", 185, 65, 15], ["16", "Techno 16\"", 195, 55, 16], ["17", "Esprit Alpine 17\"", 205, 45, 17], ["18", "Renault 5 18\"", 195, 55, 16]]],
  ["renault-captur", "Renault", "Captur / Symbioz", 2020, 2026, eu, "5x114.3", 66.1, [["17", "Evolution 17\"", 215, 60, 17], ["18", "Techno 18\"", 215, 55, 18], ["19", "Esprit Alpine 19\"", 225, 45, 19]]],
  ["renault-megane", "Renault", "Megane / Megane E-Tech", 2016, 2026, eu, "5x114.3", 66.1, [["16", "16-inch", 205, 55, 16], ["18", "Equilibre 18\"", 195, 60, 17], ["20", "E-Tech Techno 20\"", 215, 45, 20]]],
  ["renault-austral", "Renault", "Austral / Rafale", 2023, 2026, eu, "5x114.3", 66.1, [["17", "Evolution 17\"", 215, 65, 17], ["19", "Techno 19\"", 205, 50, 19], ["20", "Esprit Alpine 20\"", 235, 45, 20]]],

  // Rivian
  ["rivian-r1t-r1s", "Rivian", "R1T / R1S", 2022, 2026, us, "5x139.7", 64.1, [["20", "All-Terrain 20\"", 275, 65, 20], ["21", "Road 21\"", 275, 55, 21], ["22", "Sport 22\"", 275, 50, 22]]],

  // Seat
  ["seat-ibiza", "Seat", "Ibiza", 2017, 2026, eu, "5x100", 57.1, [["15", "Reference 15\"", 185, 65, 15], ["16", "Style 16\"", 195, 55, 16], ["17", "FR 17\"", 215, 45, 17]]],
  ["seat-arona", "Seat", "Arona", 2018, 2026, eu, "5x100", 57.1, [["16", "Style 16\"", 205, 60, 16], ["17", "Xperience 17\"", 205, 55, 17], ["18", "FR 18\"", 215, 45, 18]]],
  ["seat-leon", "Seat", "Leon", 2020, 2026, eu, "5x112", 57.1, [["16", "Style 16\"", 205, 55, 16], ["17", "Xcellence 17\"", 225, 45, 17], ["18", "FR 18\"", 225, 40, 18]]],
  ["seat-ateca", "Seat", "Ateca", 2016, 2026, eu, "5x112", 57.1, [["17", "Style 17\"", 215, 55, 17], ["18", "Xperience 18\"", 215, 50, 18], ["19", "FR 19\"", 235, 40, 19]]],

  // Skoda
  ["skoda-fabia", "Skoda", "Fabia / Scala", 2020, 2026, eu, "5x100", 57.1, [["15", "Essence 15\"", 185, 65, 15], ["16", "Selection 16\"", 195, 55, 16], ["17", "Monte Carlo 17\"", 205, 50, 17]]],
  ["skoda-kamiq", "Skoda", "Kamiq", 2020, 2026, eu, "5x100", 57.1, [["16", "Selection 16\"", 205, 60, 16], ["17", "Monte Carlo 17\"", 205, 55, 17], ["18", "18-inch", 215, 45, 18]]],
  ["skoda-octavia", "Skoda", "Octavia / Octavia RS", 2020, 2026, eu, "5x112", 57.1, [["16", "Essence 16\"", 205, 60, 16], ["17", "Selection 17\"", 205, 55, 17], ["18", "Sportline / RS 18\"", 225, 45, 18], ["19", "RS 19\"", 225, 40, 19]]],
  ["skoda-superb", "Skoda", "Superb", 2015, 2026, eu, "5x112", 57.1, [["17", "Selection 17\"", 215, 55, 17], ["18", "L&K 18\"", 235, 45, 18], ["19", "Sportline 19\"", 235, 40, 19]]],
  ["skoda-karoq", "Skoda", "Karoq", 2018, 2026, eu, "5x112", 57.1, [["17", "Selection 17\"", 215, 55, 17], ["18", "Sportline 18\"", 215, 50, 18], ["19", "19-inch", 225, 45, 19]]],
  ["skoda-kodiaq", "Skoda", "Kodiaq", 2017, 2026, eu, "5x112", 57.1, [["18", "Selection 18\"", 235, 55, 18], ["19", "Sportline 19\"", 235, 50, 19], ["20", "RS 20\"", 235, 45, 20]]],
  ["skoda-enyaq", "Skoda", "Enyaq / Elroq", 2021, 2026, eu, "5x112", 57.1, [["19", "60 / 85 19\"", 235, 55, 19], ["20", "Sportline 20\"", 235, 50, 20], ["21", "RS 21\"", 255, 40, 21]]],

  // Subaru
  ["subaru-impreza", "Subaru", "Impreza", 2017, 2026, us, "5x114.3", 56.1, [["16", "Base 16\"", 205, 55, 16], ["18", "RS 18\"", 225, 40, 18]]],
  ["subaru-wrx", "Subaru", "WRX / BRZ", 2022, 2026, us, "5x114.3", 56.1, [["17", "Base 17\"", 235, 45, 17], ["18", "Premium / Limited 18\"", 245, 40, 18], ["19", "TR / tS 19\"", 245, 35, 19]]],
  ["subaru-crosstrek", "Subaru", "Crosstrek", 2024, 2026, both, "5x114.3", 56.1, [["17", "Base / Premium / Wilderness 17\"", 225, 60, 17], ["18", "Sport / Limited 18\"", 225, 55, 18]]],
  ["subaru-forester", "Subaru", "Forester", 2019, 2026, both, "5x114.3", 56.1, [["17", "Base / Premium / Wilderness 17\"", 225, 60, 17], ["18", "Sport / Limited 18\"", 225, 55, 18], ["19", "Touring 19\"", 235, 50, 19]]],
  ["subaru-outback", "Subaru", "Outback", 2020, 2026, both, "5x114.3", 56.1, [["17", "Base / Wilderness 17\"", 225, 65, 17], ["18", "Limited / Touring XT 18\"", 225, 60, 18]]],
  ["subaru-ascent", "Subaru", "Ascent", 2019, 2026, us, "5x114.3", 56.1, [["18", "Base / Premium 18\"", 245, 60, 18], ["20", "Onyx / Limited / Touring 20\"", 245, 50, 20]]],

  // Suzuki
  ["suzuki-swift", "Suzuki", "Swift", 2017, 2026, eu, "4x100", 54.1, [["16", "Motion 16\"", 185, 55, 16], ["17", "Swift Sport 17\"", 195, 45, 17]]],
  ["suzuki-vitara", "Suzuki", "Vitara / S-Cross", 2016, 2026, eu, "5x114.3", 60.1, [["17", "AllGrip 17\"", 215, 55, 17]]],

  // Tesla
  ["tesla-model3", "Tesla", "Model 3", 2017, 2026, both, "5x114.3", 64.1, [["18", "Photon / Aero 18\"", 235, 45, 18], ["19", "Nova / Sport 19\"", 235, 40, 19], ["20", "Performance Warp 20\"", 235, 35, 20]]],
  ["tesla-modely", "Tesla", "Model Y", 2020, 2026, both, "5x114.3", 64.1, [["19", "Gemini 19\"", 255, 45, 19], ["20", "Induction 20\"", 255, 40, 20], ["21", "Uberturbine Performance 21\"", 255, 35, 21]]],
  ["tesla-models", "Tesla", "Model S", 2021, 2026, both, "5x120", 64.1, [["19", "Tempest 19\"", 255, 45, 19], ["21", "Arachnid Plaid 21\"", 265, 35, 21]]],
  ["tesla-modelx", "Tesla", "Model X", 2021, 2026, both, "5x120", 64.1, [["20", "Cyberstream 20\"", 265, 45, 20], ["22", "Turbine Plaid 22\"", 265, 35, 22]]],
  ["tesla-cybertruck", "Tesla", "Cybertruck", 2024, 2026, us, "6x139.7", 78.1, [["20", "Core / All-Terrain 20\"", 285, 65, 20]]],

  // Toyota
  ["toyota-yaris", "Toyota", "Yaris / Yaris Cross", 2020, 2026, eu, "5x100", 54.1, [["15", "Active 15\"", 185, 65, 15], ["16", "Design 16\"", 195, 55, 16], ["17", "Premiere / Cross 17\"", 215, 55, 17], ["18", "GR Sport 18\"", 215, 50, 18]]],
  ["toyota-corolla-us", "Toyota", "Corolla / GR Corolla", 2020, 2026, us, "5x100", 54.1, [["16", "LE 16\"", 205, 55, 16], ["18", "SE / XSE 18\"", 225, 40, 18], ["18-gr", "GR Corolla 18\"", 235, 40, 18]]],
  ["toyota-corolla-eu", "Toyota", "Corolla / Touring Sports", 2019, 2026, eu, "5x114.3", 60.1, [["16", "Comfort 16\"", 205, 55, 16], ["17", "Team D 17\"", 225, 45, 17], ["18", "GR Sport 18\"", 225, 40, 18]]],
  ["toyota-corolla-cross", "Toyota", "Corolla Cross", 2022, 2026, both, "5x114.3", 60.1, [["17", "L / LE 17\"", 215, 65, 17], ["18", "XLE / Nightshade 18\"", 225, 55, 18]]],
  ["toyota-prius", "Toyota", "Prius / Prius Prime", 2023, 2026, both, "5x114.3", 60.1, [["17", "LE 17\"", 195, 60, 17], ["19", "XLE / Limited 19\"", 195, 50, 19]]],
  ["toyota-camry", "Toyota", "Camry", 2018, 2026, both, "5x114.3", 60.1, [["16", "LE 16\"", 205, 65, 16], ["18", "SE / XLE 18\"", 235, 45, 18], ["19", "XSE 19\"", 235, 40, 19]]],
  ["toyota-crown", "Toyota", "Crown / Crown Signia", 2023, 2026, us, "5x114.3", 60.1, [["19", "XLE 19\"", 225, 55, 19], ["21", "Limited / Platinum 21\"", 225, 45, 21]]],
  ["toyota-supra", "Toyota", "GR Supra", 2020, 2026, both, "5x112", 66.6, [["18", "2.0 18\"", 255, 40, 18], ["19", "3.0 Front 19\"", 255, 35, 19], ["19-rear", "3.0 Rear 19\"", 275, 35, 19]]],
  ["toyota-chr", "Toyota", "C-HR", 2017, 2026, eu, "5x114.3", 60.1, [["17", "Flow 17\"", 215, 60, 17], ["18", "Team D 18\"", 225, 50, 18], ["19", "GR Sport 19\"", 225, 50, 18]]],
  ["toyota-rav4-us", "Toyota", "RAV4 / RAV4 Prime", 2019, 2026, us, "5x114.3", 60.1, [["17", "LE / XLE 17\"", 225, 65, 17], ["18", "SE / Woodland 18\"", 225, 60, 18], ["19", "Limited / XSE Prime 19\"", 235, 55, 19]]],
  ["toyota-rav4-eu", "Toyota", "RAV4", 2019, 2026, eu, "5x114.3", 60.1, [["17", "Comfort 17\"", 225, 65, 17], ["18", "Adventure / Team D 18\"", 225, 60, 18], ["19", "Lounge / GR Sport 19\"", 235, 55, 19]]],
  ["toyota-bz4x", "Toyota", "bZ4X", 2023, 2026, both, "5x114.3", 60.1, [["18", "XLE 18\"", 235, 60, 18], ["20", "Limited 20\"", 235, 50, 20]]],
  ["toyota-highlander", "Toyota", "Highlander / Grand Highlander", 2020, 2026, us, "5x114.3", 60.1, [["18", "LE / XLE 18\"", 235, 65, 18], ["20", "Limited / Platinum 20\"", 235, 55, 20], ["20-gh", "Grand Highlander 20\"", 255, 55, 20]]],
  ["toyota-sienna", "Toyota", "Sienna", 2021, 2026, us, "5x114.3", 60.1, [["17", "LE / XLE AWD 17\"", 235, 65, 17], ["18", "Woodland / Limited 18\"", 235, 60, 18], ["20", "XSE / Platinum 20\"", 235, 50, 20]]],
  ["toyota-4runner", "Toyota", "4Runner (2010–2024)", 2010, 2024, us, "6x139.7", 106.1, [["17", "SR5 / TRD Pro 17\"", 265, 70, 17], ["20", "Limited 20\"", 245, 60, 20]]],
  ["toyota-4runner-25", "Toyota", "4Runner / Land Cruiser (2024–2026)", 2024, 2026, us, "6x139.7", 95.1, [["18", "TRD Off-Road / 1958 18\"", 265, 70, 18], ["20", "Limited / Land Cruiser 20\"", 265, 60, 20]]],
  ["toyota-tacoma", "Toyota", "Tacoma", 2024, 2026, us, "6x139.7", 95.1, [["17", "SR5 / TRD Off-Road 17\"", 265, 70, 17], ["18", "TRD Sport / Limited 18\"", 265, 65, 18], ["18-trail", "Trailhunter / TRD Pro 18\"", 285, 70, 18]]],
  ["toyota-tundra", "Toyota", "Tundra / Sequoia", 2022, 2026, us, "6x139.7", 95.1, [["18", "SR5 / TRD Off-Road 18\"", 265, 70, 18], ["20", "Limited / Platinum 20\"", 265, 60, 20], ["22", "Capstone 22\"", 265, 50, 22]]],

  // Volkswagen
  ["vw-polo", "Volkswagen", "Polo / Taigo", 2018, 2026, eu, "5x100", 57.1, [["15", "Life 15\"", 185, 65, 15], ["16", "Style 16\"", 195, 55, 16], ["17", "R-Line 17\"", 215, 45, 17], ["18", "Polo GTI 18\"", 215, 40, 18]]],
  ["vw-golf", "Volkswagen", "Golf / GTI / Golf R", 2020, 2026, both, "5x112", 57.1, [["16", "Life 16\"", 205, 55, 16], ["17", "R-Line / GTI 17\"", 225, 45, 17], ["18", "GTI Clubsport 18\"", 225, 40, 18], ["19", "Golf R 19\"", 235, 35, 19]]],
  ["vw-jetta", "Volkswagen", "Jetta / Jetta GLI", 2019, 2026, us, "5x112", 57.1, [["16", "S / Sport 16\"", 205, 60, 16], ["17", "SE / SEL 17\"", 205, 55, 17], ["18", "GLI Autobahn 18\"", 225, 45, 18]]],
  ["vw-passat", "Volkswagen", "Passat / Arteon", 2015, 2026, both, "5x112", 57.1, [["16", "Business 16\"", 215, 60, 16], ["17", "Elegance 17\"", 215, 55, 17], ["18", "R-Line 18\"", 235, 45, 18], ["19", "Arteon R-Line 19\"", 245, 40, 19]]],
  ["vw-taos", "Volkswagen", "Taos", 2022, 2026, us, "5x112", 57.1, [["17", "S 17\"", 215, 55, 17], ["18", "SE 18\"", 215, 50, 18], ["19", "SEL 19\"", 235, 45, 19]]],
  ["vw-troc", "Volkswagen", "T-Roc / T-Cross", 2018, 2026, eu, "5x112", 57.1, [["16", "Life 16\"", 215, 60, 16], ["17", "Style 17\"", 215, 55, 17], ["18", "R-Line 18\"", 215, 50, 18], ["19", "T-Roc R 19\"", 235, 40, 19]]],
  ["vw-tiguan-us", "Volkswagen", "Tiguan", 2018, 2026, us, "5x112", 57.1, [["17", "S 17\"", 215, 65, 17], ["18", "SE 18\"", 235, 55, 18], ["19", "SE R-Line Black 19\"", 235, 50, 19], ["20", "SEL R-Line 20\"", 255, 40, 20]]],
  ["vw-tiguan-eu", "Volkswagen", "Tiguan / Tayron", 2016, 2026, eu, "5x112", 57.1, [["17", "Life 17\"", 215, 65, 17], ["18", "Elegance 18\"", 235, 55, 18], ["19", "R-Line 19\"", 255, 45, 19], ["20", "R-Line / R 20\"", 255, 40, 20]]],
  ["vw-atlas", "Volkswagen", "Atlas / Atlas Cross Sport", 2018, 2026, us, "5x112", 57.1, [["18", "SE 18\"", 245, 60, 18], ["20", "SE w/ Tech / Peak 20\"", 255, 50, 20], ["21", "SEL Premium R-Line 21\"", 265, 45, 21]]],
  ["vw-touareg", "Volkswagen", "Touareg", 2018, 2026, eu, "5x112", 66.6, [["19", "Atmosphere 19\"", 255, 55, 19], ["20", "R-Line 20\"", 285, 45, 20], ["21", "Touareg R 21\"", 285, 40, 21]]],
  ["vw-id3", "Volkswagen", "ID.3", 2020, 2026, eu, "5x112", 57.1, [["18", "Pro 18\"", 215, 55, 18], ["19", "Pro S 19\"", 215, 50, 19], ["20", "GTX 20\"", 215, 45, 20]]],
  ["vw-id4", "Volkswagen", "ID.4 / ID.5", 2021, 2026, both, "5x112", 57.1, [["19", "Standard / Pro 19\"", 235, 55, 19], ["20", "Pro S / AWD 20\"", 235, 50, 20], ["21", "GTX / Plus 21\"", 255, 40, 21]]],
  ["vw-id7", "Volkswagen", "ID.7 / ID.Buzz", 2024, 2026, both, "5x112", 57.1, [["19", "Pro 19\"", 235, 50, 19], ["20", "Pro S / ID.Buzz 20\"", 235, 45, 20]]],

  // Volvo
  ["volvo-ex30", "Volvo", "EX30", 2024, 2026, both, "5x108", 63.4, [["18", "Core 18\"", 225, 55, 18], ["19", "Plus 19\"", 245, 45, 19], ["20", "Ultra 20\"", 245, 40, 20]]],
  ["volvo-s60-v60", "Volvo", "S60 / V60 / S90", 2019, 2026, both, "5x108", 63.4, [["18", "Core / Plus 18\"", 235, 45, 18], ["19", "Ultimate / Polestar 19\"", 235, 40, 19]]],
  ["volvo-xc40", "Volvo", "XC40 / EX40 / EC40", 2018, 2026, both, "5x108", 63.4, [["18", "Core 18\"", 235, 55, 18], ["19", "Plus 19\"", 235, 50, 19], ["20", "Ultimate / Black Edition 20\"", 245, 45, 20]]],
  ["volvo-xc60", "Volvo", "XC60", 2018, 2026, both, "5x108", 63.4, [["18", "Core 18\"", 235, 60, 18], ["19", "Plus 19\"", 235, 55, 19], ["20", "Ultimate 20\"", 255, 45, 20], ["21", "Polestar Engineered 21\"", 255, 40, 21]]],
  ["volvo-xc90", "Volvo", "XC90 / EX90", 2016, 2026, both, "5x108", 63.4, [["19", "Core 19\"", 255, 55, 19], ["20", "Plus 20\"", 275, 45, 20], ["21", "Ultimate 21\"", 275, 40, 21], ["22", "EX90 Ultra 22\"", 265, 40, 22]]],
]

export const VEHICLES: VehicleModel[] = SPECS.map(vehicle)

export function vehiclesFor(market: Market): VehicleModel[] {
  return VEHICLES.filter((item) => item.markets.includes(market))
}

export function makesFor(market: Market): string[] {
  return [...new Set(vehiclesFor(market).map((item) => item.make))].sort((a, b) => a.localeCompare(b))
}

export function findVehicleById(id: string | undefined | null): VehicleModel | undefined {
  if (!id) return undefined
  return VEHICLES.find((item) => item.id === id)
}

export function sizeKey(width: number, aspect: number, rim: number): string {
  return `${width}/${aspect}R${rim}`
}
