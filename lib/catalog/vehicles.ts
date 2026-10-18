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

type SizeSpec = [string, string, number, number, number]
type VehicleSpec = [string, string, string, number, number, Market[], SizeSpec[]]

const us: Market[] = ["us"]
const eu: Market[] = ["eu"]
const both: Market[] = ["us", "eu"]

function size([id, label, width, aspect, rim]: SizeSpec): FactorySize {
  return { id, label, width, aspect, rim }
}

function vehicle([id, make, model, yearFrom, yearTo, markets, sizes]: VehicleSpec): VehicleModel {
  return { id, make, model, yearFrom, yearTo, markets, sizes: sizes.map(size) }
}

// Factory sizes for the cars these stores see. Option packages differ —
// the sidewall still wins over this list.
const SPECS: VehicleSpec[] = [
  ["acura-mdx", "Acura", "MDX", 2022, 2026, us, [["20", "20-inch", 255, 50, 20]]],
  ["acura-rdx", "Acura", "RDX", 2019, 2026, us, [["19", "19-inch", 235, 55, 19]]],
  ["audi-a3-eu", "Audi", "A3", 2020, 2026, eu, [["16", "16-inch", 205, 55, 16], ["18", "S line", 225, 40, 18]]],
  ["audi-a4", "Audi", "A4", 2016, 2026, both, [["17", "17-inch", 225, 50, 17], ["18", "18-inch", 245, 40, 18]]],
  ["audi-a6-eu", "Audi", "A6", 2019, 2026, eu, [["18", "18-inch", 225, 55, 18]]],
  ["audi-q3-eu", "Audi", "Q3", 2019, 2026, eu, [["17", "17-inch", 215, 65, 17], ["18", "18-inch", 235, 55, 18]]],
  ["audi-q5", "Audi", "Q5", 2018, 2026, both, [["18", "18-inch", 235, 60, 18], ["20", "20-inch", 255, 45, 20]]],
  ["audi-q7-us", "Audi", "Q7", 2020, 2026, us, [["20", "20-inch", 285, 45, 20]]],
  ["bmw-1-eu", "BMW", "1 Series", 2020, 2026, eu, [["16", "16-inch", 205, 55, 16], ["18", "M Sport", 225, 40, 18]]],
  ["bmw-3", "BMW", "3 Series", 2019, 2026, both, [["17", "17-inch", 225, 50, 17], ["18", "18-inch", 225, 45, 18]]],
  ["bmw-5", "BMW", "5 Series", 2017, 2026, both, [["17", "17-inch", 225, 55, 17], ["18", "18-inch", 245, 45, 18]]],
  ["bmw-x1-eu", "BMW", "X1", 2023, 2026, eu, [["18", "18-inch", 225, 55, 18]]],
  ["bmw-x3", "BMW", "X3", 2018, 2026, both, [["18", "18-inch", 225, 60, 18], ["19", "19-inch", 245, 50, 19]]],
  ["bmw-x5", "BMW", "X5", 2019, 2026, both, [["19", "19-inch", 265, 50, 19], ["21", "21-inch", 275, 40, 21]]],
  ["cadillac-escalade", "Cadillac", "Escalade", 2021, 2026, us, [["22", "22-inch", 275, 50, 22]]],
  ["chevy-camaro", "Chevrolet", "Camaro", 2016, 2024, us, [["18", "18-inch", 245, 50, 18], ["20", "20-inch", 245, 40, 20]]],
  ["chevy-colorado", "Chevrolet", "Colorado", 2023, 2026, us, [["17", "17-inch", 255, 65, 17]]],
  ["chevy-equinox", "Chevrolet", "Equinox", 2018, 2026, us, [["17", "17-inch", 225, 65, 17], ["19", "19-inch", 235, 50, 19]]],
  ["chevy-silverado", "Chevrolet", "Silverado 1500", 2019, 2026, us, [["17", "17-inch", 265, 70, 17], ["20", "20-inch", 275, 60, 20]]],
  ["chevy-tahoe", "Chevrolet", "Tahoe", 2021, 2026, us, [["18", "18-inch", 265, 65, 18], ["22", "22-inch", 275, 50, 22]]],
  ["chevy-traverse", "Chevrolet", "Traverse", 2024, 2026, us, [["18", "18-inch", 255, 65, 18]]],
  ["citroen-c3", "Citroen", "C3", 2017, 2026, eu, [["15", "15-inch", 185, 65, 15]]],
  ["citroen-c4", "Citroen", "C4", 2021, 2026, eu, [["17", "17-inch", 215, 60, 17]]],
  ["citroen-c5", "Citroen", "C5 Aircross", 2019, 2026, eu, [["18", "18-inch", 225, 55, 18]]],
  ["cupra-formentor", "Cupra", "Formentor", 2021, 2026, eu, [["18", "18-inch", 245, 45, 18], ["19", "19-inch", 245, 40, 19]]],
  ["dacia-duster", "Dacia", "Duster", 2018, 2026, eu, [["16", "16-inch", 215, 65, 16]]],
  ["dacia-sandero", "Dacia", "Sandero", 2021, 2026, eu, [["15", "15-inch", 185, 65, 15]]],
  ["dodge-charger", "Dodge", "Charger", 2015, 2023, us, [["18", "18-inch", 235, 55, 18], ["20", "20-inch", 245, 45, 20]]],
  ["dodge-durango", "Dodge", "Durango", 2021, 2026, us, [["18", "18-inch", 265, 60, 18]]],
  ["fiat-500", "Fiat", "500", 2008, 2026, eu, [["15", "15-inch", 185, 55, 15]]],
  ["fiat-panda", "Fiat", "Panda", 2012, 2026, eu, [["14", "14-inch", 175, 65, 14]]],
  ["fiat-tipo", "Fiat", "Tipo", 2016, 2026, eu, [["16", "16-inch", 205, 55, 16]]],
  ["ford-bronco", "Ford", "Bronco", 2021, 2026, us, [["17", "17-inch", 285, 70, 17], ["18", "18-inch", 255, 70, 18]]],
  ["ford-escape", "Ford", "Escape", 2020, 2026, us, [["17", "17-inch", 225, 65, 17], ["19", "19-inch", 225, 55, 19]]],
  ["ford-explorer", "Ford", "Explorer", 2020, 2026, us, [["18", "18-inch", 255, 65, 18], ["20", "20-inch", 255, 55, 20]]],
  ["ford-f150", "Ford", "F-150", 2021, 2026, us, [["18", "18-inch", 275, 65, 18], ["20", "20-inch", 275, 60, 20]]],
  ["ford-focus", "Ford", "Focus", 2018, 2026, eu, [["16", "16-inch", 205, 55, 16], ["17", "ST-Line", 215, 50, 17]]],
  ["ford-kuga", "Ford", "Kuga", 2020, 2026, eu, [["17", "17-inch", 225, 65, 17], ["18", "18-inch", 225, 60, 18]]],
  ["ford-maverick", "Ford", "Maverick", 2022, 2026, us, [["17", "17-inch", 225, 65, 17]]],
  ["ford-mustang", "Ford", "Mustang", 2015, 2026, us, [["18", "18-inch", 235, 50, 18], ["19", "19-inch", 255, 40, 19]]],
  ["ford-puma", "Ford", "Puma", 2020, 2026, eu, [["16", "16-inch", 205, 60, 16], ["17", "ST", 215, 50, 17]]],
  ["ford-ranger-us", "Ford", "Ranger", 2019, 2026, us, [["17", "17-inch", 255, 70, 17]]],
  ["genesis-gv70", "Genesis", "GV70", 2022, 2026, us, [["19", "19-inch", 235, 55, 19]]],
  ["gmc-sierra", "GMC", "Sierra 1500", 2019, 2026, us, [["17", "17-inch", 265, 70, 17], ["20", "20-inch", 275, 60, 20]]],
  ["honda-accord", "Honda", "Accord", 2023, 2026, us, [["17", "17-inch", 225, 50, 17], ["19", "19-inch", 235, 40, 19]]],
  ["honda-civic", "Honda", "Civic", 2022, 2026, us, [["16", "LX", 215, 55, 16], ["18", "Sport / Touring", 235, 40, 18]]],
  ["honda-crv-17", "Honda", "CR-V", 2017, 2022, us, [["17", "LX / EX", 235, 65, 17]]],
  ["honda-crv-23", "Honda", "CR-V", 2023, 2026, us, [["18", "LX / EX", 235, 60, 18]]],
  ["honda-hrv", "Honda", "HR-V", 2023, 2026, us, [["17", "17-inch", 215, 60, 17]]],
  ["honda-pilot", "Honda", "Pilot", 2023, 2026, us, [["18", "18-inch", 255, 60, 18], ["20", "20-inch", 255, 50, 20]]],
  ["hyundai-elantra", "Hyundai", "Elantra", 2021, 2026, us, [["15", "15-inch", 195, 65, 15], ["18", "18-inch", 225, 40, 18]]],
  ["hyundai-i20", "Hyundai", "i20", 2020, 2026, eu, [["15", "15-inch", 185, 65, 15]]],
  ["hyundai-i30", "Hyundai", "i30", 2017, 2026, eu, [["16", "16-inch", 205, 55, 16]]],
  ["hyundai-kona", "Hyundai", "Kona", 2018, 2026, eu, [["17", "17-inch", 215, 55, 17]]],
  ["hyundai-palisade", "Hyundai", "Palisade", 2020, 2026, us, [["18", "18-inch", 245, 60, 18], ["20", "20-inch", 245, 50, 20]]],
  ["hyundai-santafe", "Hyundai", "Santa Fe", 2024, 2026, us, [["18", "18-inch", 235, 60, 18], ["20", "20-inch", 255, 45, 20]]],
  ["hyundai-tucson-us", "Hyundai", "Tucson", 2022, 2026, us, [["17", "17-inch", 235, 65, 17], ["19", "19-inch", 235, 55, 19]]],
  ["hyundai-tucson-eu", "Hyundai", "Tucson", 2021, 2026, eu, [["17", "17-inch", 215, 65, 17], ["19", "19-inch", 235, 50, 19]]],
  ["jeep-gladiator", "Jeep", "Gladiator", 2020, 2026, us, [["17", "17-inch", 245, 75, 17]]],
  ["jeep-grand", "Jeep", "Grand Cherokee", 2022, 2026, us, [["18", "18-inch", 265, 60, 18], ["21", "21-inch", 275, 45, 21]]],
  ["jeep-wrangler", "Jeep", "Wrangler", 2018, 2026, us, [["17", "17-inch", 255, 75, 17], ["18", "18-inch", 255, 70, 18]]],
  ["kia-ceed", "Kia", "Ceed", 2018, 2026, eu, [["16", "16-inch", 205, 55, 16]]],
  ["kia-niro", "Kia", "Niro", 2022, 2026, eu, [["17", "17-inch", 215, 55, 17]]],
  ["kia-sorento", "Kia", "Sorento", 2021, 2026, us, [["17", "17-inch", 235, 65, 17], ["18", "18-inch", 255, 45, 18]]],
  ["kia-sportage-us", "Kia", "Sportage", 2023, 2026, us, [["17", "17-inch", 235, 65, 17], ["19", "19-inch", 235, 55, 19]]],
  ["kia-sportage-eu", "Kia", "Sportage", 2022, 2026, eu, [["17", "17-inch", 215, 65, 17], ["19", "19-inch", 235, 50, 19]]],
  ["kia-telluride", "Kia", "Telluride", 2020, 2026, us, [["18", "18-inch", 245, 60, 18], ["20", "20-inch", 245, 50, 20]]],
  ["land-rover-defender", "Land Rover", "Defender", 2020, 2026, both, [["20", "20-inch", 255, 60, 20]]],
  ["lexus-es", "Lexus", "ES", 2019, 2026, us, [["17", "17-inch", 215, 55, 17], ["18", "18-inch", 235, 45, 18]]],
  ["lexus-nx", "Lexus", "NX", 2022, 2026, us, [["18", "18-inch", 235, 60, 18]]],
  ["lexus-rx", "Lexus", "RX", 2023, 2026, us, [["19", "19-inch", 235, 60, 19]]],
  ["mazda-3", "Mazda", "Mazda3", 2019, 2026, both, [["16", "16-inch", 205, 60, 16], ["18", "18-inch", 215, 45, 18]]],
  ["mazda-cx5", "Mazda", "CX-5", 2017, 2026, both, [["17", "17-inch", 225, 65, 17], ["19", "19-inch", 225, 55, 19]]],
  ["mazda-cx50", "Mazda", "CX-50", 2023, 2026, us, [["17", "17-inch", 225, 65, 17]]],
  ["mercedes-a", "Mercedes-Benz", "A-Class", 2019, 2026, eu, [["16", "16-inch", 205, 60, 16], ["18", "AMG Line", 225, 45, 18]]],
  ["mercedes-c", "Mercedes-Benz", "C-Class", 2021, 2026, both, [["17", "17-inch", 225, 50, 17], ["18", "18-inch", 225, 45, 18]]],
  ["mercedes-e", "Mercedes-Benz", "E-Class", 2017, 2026, both, [["17", "17-inch", 225, 55, 17], ["18", "18-inch", 245, 45, 18]]],
  ["mercedes-gla", "Mercedes-Benz", "GLA", 2020, 2026, eu, [["17", "17-inch", 215, 60, 17]]],
  ["mercedes-glc", "Mercedes-Benz", "GLC", 2016, 2026, both, [["18", "18-inch", 235, 60, 18]]],
  ["mercedes-gle-us", "Mercedes-Benz", "GLE", 2020, 2026, us, [["19", "19-inch", 275, 50, 19]]],
  ["mini-cooper", "Mini", "Cooper", 2014, 2026, both, [["16", "16-inch", 195, 55, 16], ["17", "17-inch", 205, 45, 17]]],
  ["mitsubishi-outlander", "Mitsubishi", "Outlander", 2022, 2026, us, [["18", "18-inch", 235, 60, 18]]],
  ["nissan-altima", "Nissan", "Altima", 2019, 2026, us, [["16", "16-inch", 215, 60, 16], ["19", "19-inch", 235, 40, 19]]],
  ["nissan-frontier", "Nissan", "Frontier", 2022, 2026, us, [["17", "17-inch", 265, 70, 17]]],
  ["nissan-juke", "Nissan", "Juke", 2020, 2026, eu, [["17", "17-inch", 215, 55, 17]]],
  ["nissan-qashqai", "Nissan", "Qashqai", 2021, 2026, eu, [["17", "17-inch", 215, 65, 17], ["19", "19-inch", 235, 50, 19]]],
  ["nissan-rogue", "Nissan", "Rogue", 2021, 2026, us, [["17", "17-inch", 235, 65, 17], ["19", "19-inch", 235, 55, 19]]],
  ["opel-astra", "Opel", "Astra", 2022, 2026, eu, [["16", "16-inch", 205, 55, 16]]],
  ["opel-corsa", "Opel", "Corsa", 2020, 2026, eu, [["16", "16-inch", 195, 55, 16]]],
  ["opel-mokka", "Opel", "Mokka", 2021, 2026, eu, [["17", "17-inch", 215, 60, 17]]],
  ["peugeot-208", "Peugeot", "208", 2019, 2026, eu, [["16", "16-inch", 195, 55, 16]]],
  ["peugeot-2008", "Peugeot", "2008", 2020, 2026, eu, [["17", "17-inch", 215, 60, 17]]],
  ["peugeot-3008", "Peugeot", "3008", 2017, 2026, eu, [["18", "18-inch", 225, 55, 18]]],
  ["peugeot-308", "Peugeot", "308", 2022, 2026, eu, [["16", "16-inch", 205, 55, 16], ["18", "GT", 225, 40, 18]]],
  ["peugeot-5008", "Peugeot", "5008", 2017, 2026, eu, [["18", "18-inch", 225, 55, 18]]],
  ["porsche-911", "Porsche", "911", 2019, 2026, both, [["19", "19-inch", 235, 40, 19], ["20", "20-inch", 245, 35, 20]]],
  ["porsche-cayenne", "Porsche", "Cayenne", 2019, 2026, both, [["19", "19-inch", 275, 50, 19]]],
  ["porsche-macan", "Porsche", "Macan", 2019, 2026, both, [["19", "19-inch", 235, 55, 19], ["20", "20-inch", 265, 45, 20]]],
  ["ram-1500", "Ram", "1500", 2019, 2026, us, [["18", "18-inch", 275, 65, 18], ["20", "20-inch", 275, 55, 20]]],
  ["renault-austral", "Renault", "Austral", 2023, 2026, eu, [["17", "17-inch", 215, 65, 17]]],
  ["renault-captur", "Renault", "Captur", 2020, 2026, eu, [["17", "17-inch", 215, 60, 17]]],
  ["renault-clio", "Renault", "Clio", 2019, 2026, eu, [["16", "16-inch", 195, 55, 16]]],
  ["renault-megane", "Renault", "Megane", 2016, 2026, eu, [["16", "16-inch", 205, 55, 16]]],
  ["seat-ateca", "Seat", "Ateca", 2016, 2026, eu, [["17", "17-inch", 215, 55, 17]]],
  ["seat-ibiza", "Seat", "Ibiza", 2017, 2026, eu, [["15", "15-inch", 185, 65, 15]]],
  ["seat-leon", "Seat", "Leon", 2020, 2026, eu, [["16", "16-inch", 205, 55, 16], ["18", "FR", 225, 40, 18]]],
  ["skoda-fabia", "Skoda", "Fabia", 2022, 2026, eu, [["15", "15-inch", 185, 65, 15]]],
  ["skoda-kamiq", "Skoda", "Kamiq", 2020, 2026, eu, [["16", "16-inch", 205, 60, 16]]],
  ["skoda-kodiaq", "Skoda", "Kodiaq", 2017, 2026, eu, [["18", "18-inch", 235, 55, 18]]],
  ["skoda-octavia", "Skoda", "Octavia", 2020, 2026, eu, [["16", "16-inch", 205, 55, 16], ["17", "17-inch", 225, 45, 17]]],
  ["skoda-superb", "Skoda", "Superb", 2015, 2026, eu, [["17", "17-inch", 215, 55, 17]]],
  ["subaru-crosstrek", "Subaru", "Crosstrek", 2024, 2026, us, [["17", "17-inch", 225, 60, 17], ["18", "18-inch", 225, 55, 18]]],
  ["subaru-forester", "Subaru", "Forester", 2025, 2026, us, [["17", "17-inch", 225, 60, 17], ["18", "18-inch", 225, 55, 18]]],
  ["subaru-outback", "Subaru", "Outback", 2020, 2026, us, [["17", "Base / Premium", 225, 65, 17], ["18", "Limited", 225, 60, 18]]],
  ["subaru-wrx", "Subaru", "WRX", 2022, 2026, us, [["17", "17-inch", 245, 40, 17], ["18", "18-inch", 245, 35, 18]]],
  ["tesla-model3", "Tesla", "Model 3", 2017, 2026, both, [["18", "18-inch", 235, 45, 18], ["19", "19-inch", 235, 40, 19]]],
  ["tesla-models", "Tesla", "Model S", 2021, 2026, both, [["19", "19-inch", 255, 45, 19]]],
  ["tesla-modely", "Tesla", "Model Y", 2020, 2026, both, [["19", "19-inch", 255, 45, 19], ["20", "20-inch", 255, 40, 20]]],
  ["toyota-4runner", "Toyota", "4Runner", 2010, 2024, us, [["17", "17-inch", 265, 70, 17]]],
  ["toyota-4runner-25", "Toyota", "4Runner", 2025, 2026, us, [["18", "18-inch", 265, 70, 18]]],
  ["toyota-camry", "Toyota", "Camry", 2018, 2026, us, [["17", "LE / SE", 215, 55, 17], ["18", "XLE / XSE", 235, 45, 18]]],
  ["toyota-chr", "Toyota", "C-HR", 2017, 2026, eu, [["17", "17-inch", 215, 60, 17]]],
  ["toyota-corolla-us", "Toyota", "Corolla", 2020, 2026, us, [["15", "15-inch", 195, 65, 15], ["18", "18-inch", 225, 40, 18]]],
  ["toyota-corolla-eu", "Toyota", "Corolla", 2019, 2026, eu, [["16", "16-inch", 205, 55, 16]]],
  ["toyota-highlander", "Toyota", "Highlander", 2020, 2026, us, [["18", "18-inch", 235, 65, 18], ["20", "20-inch", 235, 55, 20]]],
  ["toyota-prius", "Toyota", "Prius", 2023, 2026, us, [["17", "17-inch", 195, 60, 17], ["19", "19-inch", 195, 50, 19]]],
  ["toyota-rav4-us", "Toyota", "RAV4", 2019, 2026, us, [["17", "LE / XLE", 225, 65, 17], ["19", "Limited", 235, 55, 19]]],
  ["toyota-rav4-eu", "Toyota", "RAV4", 2019, 2026, eu, [["17", "17-inch", 225, 65, 17], ["18", "18-inch", 225, 60, 18]]],
  ["toyota-tacoma", "Toyota", "Tacoma", 2024, 2026, us, [["17", "17-inch", 265, 70, 17]]],
  ["toyota-tundra", "Toyota", "Tundra", 2022, 2026, us, [["18", "18-inch", 265, 70, 18], ["20", "20-inch", 275, 60, 20]]],
  ["toyota-yaris", "Toyota", "Yaris", 2020, 2026, eu, [["15", "15-inch", 185, 65, 15], ["17", "17-inch", 205, 45, 17]]],
  ["volvo-xc40", "Volvo", "XC40", 2018, 2026, both, [["18", "18-inch", 235, 55, 18]]],
  ["volvo-xc60", "Volvo", "XC60", 2018, 2026, both, [["18", "18-inch", 235, 60, 18], ["19", "19-inch", 235, 55, 19]]],
  ["volvo-xc90", "Volvo", "XC90", 2016, 2026, both, [["19", "19-inch", 275, 45, 19]]],
  ["vw-atlas", "Volkswagen", "Atlas", 2018, 2026, us, [["18", "18-inch", 245, 60, 18]]],
  ["vw-golf", "Volkswagen", "Golf", 2020, 2026, both, [["16", "16-inch", 205, 55, 16], ["17", "GTI / R-Line", 225, 45, 17]]],
  ["vw-id3", "Volkswagen", "ID.3", 2020, 2026, eu, [["18", "18-inch", 215, 55, 18]]],
  ["vw-id4", "Volkswagen", "ID.4", 2021, 2026, both, [["19", "19-inch", 235, 55, 19]]],
  ["vw-jetta", "Volkswagen", "Jetta", 2019, 2026, us, [["16", "16-inch", 205, 60, 16], ["18", "18-inch", 225, 45, 18]]],
  ["vw-passat", "Volkswagen", "Passat", 2015, 2026, eu, [["16", "16-inch", 215, 60, 16], ["18", "18-inch", 235, 45, 18]]],
  ["vw-polo", "Volkswagen", "Polo", 2018, 2026, eu, [["15", "15-inch", 185, 65, 15], ["16", "16-inch", 195, 55, 16]]],
  ["vw-tiguan-us", "Volkswagen", "Tiguan", 2018, 2026, us, [["17", "17-inch", 215, 65, 17], ["19", "19-inch", 235, 50, 19]]],
  ["vw-tiguan-eu", "Volkswagen", "Tiguan", 2016, 2026, eu, [["17", "17-inch", 215, 65, 17], ["18", "18-inch", 235, 55, 18]]],
  ["vw-troc", "Volkswagen", "T-Roc", 2018, 2026, eu, [["16", "16-inch", 215, 60, 16], ["17", "17-inch", 215, 55, 17]]],
]

export const VEHICLES: VehicleModel[] = SPECS.map(vehicle)

export function vehiclesFor(market: Market): VehicleModel[] {
  return VEHICLES.filter((item) => item.markets.includes(market))
}

export function makesFor(market: Market): string[] {
  return [...new Set(vehiclesFor(market).map((item) => item.make))].sort((a, b) => a.localeCompare(b))
}

export function sizeKey(width: number, aspect: number, rim: number): string {
  return `${width}/${aspect}R${rim}`
}
