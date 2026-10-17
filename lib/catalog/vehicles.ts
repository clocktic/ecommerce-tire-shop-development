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
  sizes: FactorySize[]
}

// Factory sizes for the cars these stores actually see. Option packages differ —
// the sidewall still wins over this list.
export const VEHICLES: VehicleModel[] = [
  { id: "toyota-camry", make: "Toyota", model: "Camry", yearFrom: 2018, yearTo: 2024, markets: ["us"], sizes: [
    { id: "le", label: "LE / SE", width: 215, aspect: 55, rim: 17 },
    { id: "xse", label: "XLE / XSE", width: 235, aspect: 45, rim: 18 },
  ]},
  { id: "toyota-rav4", make: "Toyota", model: "RAV4", yearFrom: 2019, yearTo: 2025, markets: ["us"], sizes: [
    { id: "base", label: "LE / XLE", width: 225, aspect: 65, rim: 17 },
    { id: "limited", label: "Limited / Adventure", width: 235, aspect: 55, rim: 19 },
  ]},
  { id: "honda-crv-17", make: "Honda", model: "CR-V", yearFrom: 2017, yearTo: 2022, markets: ["us"], sizes: [
    { id: "base", label: "LX / EX", width: 235, aspect: 65, rim: 17 },
  ]},
  { id: "honda-crv-23", make: "Honda", model: "CR-V", yearFrom: 2023, yearTo: 2026, markets: ["us"], sizes: [
    { id: "base", label: "LX / EX", width: 235, aspect: 60, rim: 18 },
  ]},
  { id: "honda-civic", make: "Honda", model: "Civic", yearFrom: 2022, yearTo: 2026, markets: ["us"], sizes: [
    { id: "lx", label: "LX", width: 215, aspect: 55, rim: 16 },
    { id: "sport", label: "Sport / Touring", width: 235, aspect: 40, rim: 18 },
  ]},
  { id: "ford-f150", make: "Ford", model: "F-150", yearFrom: 2021, yearTo: 2026, markets: ["us"], sizes: [
    { id: "18", label: "18-inch", width: 275, aspect: 65, rim: 18 },
    { id: "20", label: "20-inch", width: 275, aspect: 60, rim: 20 },
  ]},
  { id: "chevy-silverado", make: "Chevrolet", model: "Silverado 1500", yearFrom: 2019, yearTo: 2026, markets: ["us"], sizes: [
    { id: "17", label: "17-inch", width: 265, aspect: 70, rim: 17 },
    { id: "20", label: "20-inch", width: 275, aspect: 60, rim: 20 },
  ]},
  { id: "tesla-modely", make: "Tesla", model: "Model Y", yearFrom: 2020, yearTo: 2026, markets: ["us"], sizes: [
    { id: "19", label: "19-inch", width: 255, aspect: 45, rim: 19 },
    { id: "20", label: "20-inch", width: 255, aspect: 40, rim: 20 },
  ]},
  { id: "tesla-model3-us", make: "Tesla", model: "Model 3", yearFrom: 2017, yearTo: 2026, markets: ["us"], sizes: [
    { id: "18", label: "18-inch", width: 235, aspect: 45, rim: 18 },
  ]},
  { id: "subaru-outback", make: "Subaru", model: "Outback", yearFrom: 2020, yearTo: 2025, markets: ["us"], sizes: [
    { id: "base", label: "Base / Premium", width: 225, aspect: 65, rim: 17 },
  ]},
  { id: "jeep-wrangler", make: "Jeep", model: "Wrangler", yearFrom: 2018, yearTo: 2026, markets: ["us"], sizes: [
    { id: "18", label: "18-inch", width: 255, aspect: 70, rim: 18 },
  ]},
  { id: "bmw-3-us", make: "BMW", model: "3 Series", yearFrom: 2019, yearTo: 2026, markets: ["us"], sizes: [
    { id: "18", label: "18-inch", width: 225, aspect: 45, rim: 18 },
  ]},
  { id: "hyundai-tucson", make: "Hyundai", model: "Tucson", yearFrom: 2022, yearTo: 2026, markets: ["us"], sizes: [
    { id: "17", label: "17-inch", width: 235, aspect: 65, rim: 17 },
  ]},

  { id: "vw-golf", make: "Volkswagen", model: "Golf", yearFrom: 2020, yearTo: 2026, markets: ["eu"], sizes: [
    { id: "16", label: "16-inch", width: 205, aspect: 55, rim: 16 },
    { id: "17", label: "GTI / R-Line", width: 225, aspect: 45, rim: 17 },
  ]},
  { id: "vw-tiguan", make: "Volkswagen", model: "Tiguan", yearFrom: 2016, yearTo: 2026, markets: ["eu"], sizes: [
    { id: "18", label: "18-inch", width: 235, aspect: 55, rim: 18 },
  ]},
  { id: "bmw-3-eu", make: "BMW", model: "3 Series", yearFrom: 2019, yearTo: 2026, markets: ["eu"], sizes: [
    { id: "17", label: "17-inch", width: 225, aspect: 50, rim: 17 },
    { id: "18", label: "18-inch", width: 225, aspect: 45, rim: 18 },
  ]},
  { id: "mercedes-c", make: "Mercedes-Benz", model: "C-Class", yearFrom: 2021, yearTo: 2026, markets: ["eu"], sizes: [
    { id: "17", label: "17-inch", width: 225, aspect: 50, rim: 17 },
  ]},
  { id: "audi-a4", make: "Audi", model: "A4", yearFrom: 2016, yearTo: 2026, markets: ["eu"], sizes: [
    { id: "17", label: "17-inch", width: 225, aspect: 50, rim: 17 },
  ]},
  { id: "skoda-octavia", make: "Skoda", model: "Octavia", yearFrom: 2020, yearTo: 2026, markets: ["eu"], sizes: [
    { id: "16", label: "16-inch", width: 205, aspect: 55, rim: 16 },
  ]},
  { id: "renault-clio", make: "Renault", model: "Clio", yearFrom: 2019, yearTo: 2026, markets: ["eu"], sizes: [
    { id: "16", label: "16-inch", width: 195, aspect: 55, rim: 16 },
  ]},
  { id: "peugeot-208", make: "Peugeot", model: "208", yearFrom: 2019, yearTo: 2026, markets: ["eu"], sizes: [
    { id: "16", label: "16-inch", width: 195, aspect: 55, rim: 16 },
  ]},
  { id: "toyota-yaris", make: "Toyota", model: "Yaris", yearFrom: 2020, yearTo: 2026, markets: ["eu"], sizes: [
    { id: "15", label: "15-inch", width: 185, aspect: 65, rim: 15 },
  ]},
  { id: "ford-focus", make: "Ford", model: "Focus", yearFrom: 2018, yearTo: 2026, markets: ["eu"], sizes: [
    { id: "16", label: "16-inch", width: 205, aspect: 55, rim: 16 },
  ]},
  { id: "tesla-model3-eu", make: "Tesla", model: "Model 3", yearFrom: 2019, yearTo: 2026, markets: ["eu"], sizes: [
    { id: "18", label: "18-inch", width: 235, aspect: 45, rim: 18 },
  ]},
]

export function vehiclesFor(market: Market): VehicleModel[] {
  return VEHICLES.filter((vehicle) => vehicle.markets.includes(market))
}

export function makesFor(market: Market): string[] {
  return [...new Set(vehiclesFor(market).map((vehicle) => vehicle.make))]
}

export function sizeKey(width: number, aspect: number, rim: number): string {
  return `${width}/${aspect}R${rim}`
}
