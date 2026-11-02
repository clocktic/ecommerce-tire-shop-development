import type { ContentLang, Store } from "@/lib/i18n/config"
import { localeMeta } from "@/lib/i18n/config"
import {
  tireServiceDescription,
  tireSize,
  type BrakeProduct,
  type Product,
  type Spec,
  type TireProduct,
  type WheelProduct,
} from "@/lib/catalog/types"

type NonEnLang = Exclude<ContentLang, "en">

const TIRE_SEASON_NAME: Record<NonEnLang, Record<TireProduct["tire"]["season"], string>> = {
  de: { summer: "Sommerreifen", winter: "Winterreifen", "all-season": "Ganzjahresreifen" },
  fr: { summer: "Pneu été", winter: "Pneu hiver", "all-season": "Pneu toutes saisons" },
  it: { summer: "Pneumatico estivo", winter: "Pneumatico invernale", "all-season": "Pneumatico 4 stagioni" },
  es: { summer: "Neumático de verano", winter: "Neumático de invierno", "all-season": "Neumático todo tiempo" },
  nl: { summer: "Zomerband", winter: "Winterband", "all-season": "All-seasonband" },
  "es-419": { summer: "Llanta de verano", winter: "Llanta de invierno", "all-season": "Llanta para todo el año" },
}

const TIRE_SEASON_SHORT: Record<NonEnLang, Record<TireProduct["tire"]["season"], string>> = {
  de: { summer: "Sommer", winter: "Winter", "all-season": "Ganzjahr" },
  fr: { summer: "Été", winter: "Hiver", "all-season": "Toutes saisons" },
  it: { summer: "Estate", winter: "Inverno", "all-season": "Quattro stagioni" },
  es: { summer: "Verano", winter: "Invierno", "all-season": "Todo tiempo" },
  nl: { summer: "Zomer", winter: "Winter", "all-season": "All-season" },
  "es-419": { summer: "Verano", winter: "Invierno", "all-season": "Todo el año" },
}

const TIRE_SEGMENT_VALUE: Record<string, Record<NonEnLang, string>> = {
  touring: {
    de: "Touring / Langstrecke",
    fr: "Tourisme / Routier",
    it: "Turismo / Granturismo",
    es: "Turismo / Confort",
    nl: "Touring / Comfort",
    "es-419": "Turismo / Confort",
  },
  "high performance": {
    de: "High Performance (UHP)",
    fr: "Haute Performance (UHP)",
    it: "Alte Prestazioni (UHP)",
    es: "Alto Rendimiento (UHP)",
    nl: "High Performance (UHP)",
    "es-419": "Alto Desempeño (UHP)",
  },
  performance: {
    de: "Performance",
    fr: "Performance",
    it: "Prestazioni",
    es: "Rendimiento",
    nl: "Performance",
    "es-419": "Desempeño",
  },
  "all terrain": {
    de: "All-Terrain (A/T)",
    fr: "Tout-Terrain Mixte (A/T)",
    it: "All-Terrain (A/T)",
    es: "Todoterreno Mixto (A/T)",
    nl: "All-Terrain (A/T)",
    "es-419": "Todo Terreno (A/T)",
  },
  highway: {
    de: "Highway / SUV (H/T)",
    fr: "Autoroute / SUV (H/T)",
    it: "Autostradale / SUV (H/T)",
    es: "Carretera / SUV (H/T)",
    nl: "Snelweg / SUV (H/T)",
    "es-419": "Carretera / SUV (H/T)",
  },
  "mud terrain": {
    de: "Mud-Terrain (M/T)",
    fr: "Terrain Boueux (M/T)",
    it: "Mud-Terrain (M/T)",
    es: "Barro y Terreno Extremo (M/T)",
    nl: "Mud-Terrain (M/T)",
    "es-419": "Lodo y Terreno Extremo (M/T)",
  },
  "extreme terrain": {
    de: "Extreme-Terrain (X/T)",
    fr: "Terrain Extrême (X/T)",
    it: "Extreme-Terrain (X/T)",
    es: "Terreno Extremo (X/T)",
    nl: "Extreme-Terrain (X/T)",
    "es-419": "Terreno Extremo (X/T)",
  },
  "rugged terrain": {
    de: "Rugged-Terrain (R/T)",
    fr: "Terrain Robuste (R/T)",
    it: "Rugged-Terrain (R/T)",
    es: "Terreno Agreste (R/T)",
    nl: "Rugged-Terrain (R/T)",
    "es-419": "Terreno Rudo (R/T)",
  },
}

const VEHICLE_TYPE_VALUE: Record<string, Record<NonEnLang, string>> = {
  "truck/suv": {
    de: "SUV / Geländewagen / Transporter",
    fr: "SUV / 4x4 / Utilitaire",
    it: "SUV / Fuoristrada / Pick-up",
    es: "SUV / 4x4 / Camioneta",
    nl: "SUV / 4x4 / Bestelwagen",
    "es-419": "SUV / Camioneta / Pick-up",
  },
  passenger: {
    de: "Pkw",
    fr: "Tourisme",
    it: "Autovettura",
    es: "Turismo",
    nl: "Personenwagen",
    "es-419": "Auto / Sedán",
  },
  racing: {
    de: "Motorsport / Trackday",
    fr: "Compétition / Circuit",
    it: "Competizione / Pista",
    es: "Competición / Circuito",
    nl: "Autosport / Circuit",
    "es-419": "Pista / Competencia",
  },
}

const SPEC_LABEL_MAP: Record<string, Record<NonEnLang, string>> = {
  "vehicle type": {
    de: "Fahrzeugtyp",
    fr: "Type de véhicule",
    it: "Tipo di veicolo",
    es: "Tipo de vehículo",
    nl: "Voertuigtype",
    "es-419": "Tipo de vehículo",
  },
  season: {
    de: "Saison",
    fr: "Saison",
    it: "Stagione",
    es: "Temporada",
    nl: "Seizoen",
    "es-419": "Temporada",
  },
  "tire type": {
    de: "Reifentyp",
    fr: "Catégorie de pneu",
    it: "Categoria pneumatico",
    es: "Categoría de neumático",
    nl: "Bandentype",
    "es-419": "Categoría de llanta",
  },
  "load index": {
    de: "Tragfähigkeitsindex",
    fr: "Indice de charge",
    it: "Indice di carico",
    es: "Índice de carga",
    nl: "Draagvermogen-index",
    "es-419": "Índice de carga",
  },
  "speed rating": {
    de: "Geschwindigkeitsindex",
    fr: "Indice de vitesse",
    it: "Codice di velocità",
    es: "Código de velocidad",
    nl: "Snelheidsindex",
    "es-419": "Índice de velocidad",
  },
  "load range": {
    de: "Lastbereich",
    fr: "Plage de charge",
    it: "Classe di carico",
    es: "Rango de carga",
    nl: "Belastingsklasse",
    "es-419": "Rango de carga",
  },
  "section width": {
    de: "Reifenbreite (mm)",
    fr: "Largeur de section (mm)",
    it: "Larghezza sezione (mm)",
    es: "Ancho de sección (mm)",
    nl: "Bandbreedte (mm)",
    "es-419": "Ancho de sección (mm)",
  },
  "aspect ratio": {
    de: "Querschnittsverhältnis (%)",
    fr: "Rapport d’aspect (%)",
    it: "Rapporto d’aspetto (%)",
    es: "Perfil (%)",
    nl: "Hoogte-breedteverhouding (%)",
    "es-419": "Perfil (%)",
  },
  "rim diameter": {
    de: "Felgendurchmesser (Zoll)",
    fr: "Diamètre de jante (po)",
    it: "Diametro cerchio (pollici)",
    es: "Diámetro de llanta (pulg.)",
    nl: "Velgdiameter (inch)",
    "es-419": "Diámetro de rin (pulg.)",
  },
  "overall diameter": {
    de: "Außendurchmesser (Zoll)",
    fr: "Diamètre extérieur (po)",
    it: "Diametro esterno (pollici)",
    es: "Diámetro total (pulg.)",
    nl: "Buitendiameter (inch)",
    "es-419": "Diámetro total (pulg.)",
  },
  "tread depth": {
    de: "Profiltiefe",
    fr: "Profondeur de sculpture",
    it: "Profondità battistrada",
    es: "Profundidad de dibujo",
    nl: "Profieldiepte",
    "es-419": "Profundidad de dibujo",
  },
  "run flat": {
    de: "Notlaufeigenschaft (Runflat)",
    fr: "Roulage à plat (Runflat)",
    it: "Run-flat",
    es: "Run-flat",
    nl: "Run-flat",
    "es-419": "Run-flat",
  },
  "run-flat": {
    de: "Notlaufeigenschaft (Runflat)",
    fr: "Roulage à plat (Runflat)",
    it: "Run-flat",
    es: "Run-flat",
    nl: "Run-flat",
    "es-419": "Run-flat",
  },
  "approved rim width": {
    de: "Zulässige Maulweite (Zoll)",
    fr: "Largeur de jante homologuée (po)",
    it: "Canale cerchio ammesso (pollici)",
    es: "Ancho de llanta admitido (pulg.)",
    nl: "Goedgekeurde velgbreedte (inch)",
    "es-419": "Ancho de rin admitido (pulg.)",
  },
  size: {
    de: "Größe",
    fr: "Dimension",
    it: "Misura",
    es: "Medida",
    nl: "Maat",
    "es-419": "Medida",
  },
  "bolt pattern": {
    de: "Lochkreis (PCD)",
    fr: "Entraxe (PCD)",
    it: "Foratura (PCD)",
    es: "Distancia entre tornillos (PCD)",
    nl: "Steekcirkel (PCD)",
    "es-419": "Barrenación (PCD)",
  },
  offset: {
    de: "Einpresstiefe (ET)",
    fr: "Déport (ET)",
    it: "Offset (ET)",
    es: "Desplazamiento (ET)",
    nl: "ET-waarde",
    "es-419": "Offset (ET)",
  },
  "center bore": {
    de: "Mittenbohrung",
    fr: "Alésage central",
    it: "Foro centrale",
    es: "Buje central",
    nl: "Naafgat",
    "es-419": "Centro (CB)",
  },
  "centre bore": {
    de: "Mittenbohrung",
    fr: "Alésage central",
    it: "Foro centrale",
    es: "Buje central",
    nl: "Naafgat",
    "es-419": "Centro (CB)",
  },
  finish: {
    de: "Oberfläche",
    fr: "Finition",
    it: "Finitura",
    es: "Acabado",
    nl: "Afwerking",
    "es-419": "Acabado",
  },
  material: {
    de: "Werkstoff",
    fr: "Matériau",
    it: "Materiale",
    es: "Material",
    nl: "Materiaal",
    "es-419": "Material",
  },
  structure: {
    de: "Aufbau",
    fr: "Structure",
    it: "Struttura",
    es: "Estructura",
    nl: "Opbouw",
    "es-419": "Estructura",
  },
  backspacing: {
    de: "Backspacing",
    fr: "Retrait (Backspacing)",
    it: "Backspacing",
    es: "Retroceso (Backspacing)",
    nl: "Backspacing",
    "es-419": "Backspacing",
  },
  "center cap": {
    de: "Nabendeckel",
    fr: "Cache-moyeu central",
    it: "Coprimozzo centrale",
    es: "Tapabuje central",
    nl: "Naafdop",
    "es-419": "Tapón central",
  },
  construction: {
    de: "Bauweise",
    fr: "Fabrication",
    it: "Costruzione",
    es: "Construcción",
    nl: "Constructie",
    "es-419": "Construcción",
  },
  "load rating": {
    de: "Traglast",
    fr: "Charge admissible",
    it: "Carico ammesso",
    es: "Carga admitida",
    nl: "Draagvermogen",
    "es-419": "Capacidad de carga",
  },
  weight: {
    de: "Gewicht",
    fr: "Poids",
    it: "Peso",
    es: "Peso",
    nl: "Gewicht",
    "es-419": "Peso",
  },
  origin: {
    de: "Herkunftsland",
    fr: "Origine",
    it: "Origine",
    es: "Origen",
    nl: "Herkomst",
    "es-419": "Origen",
  },
  "country of origin": {
    de: "Herkunftsland",
    fr: "Pays d’origine",
    it: "Paese di origine",
    es: "País de origen",
    nl: "Land van herkomst",
    "es-419": "País de origen",
  },
  segment: {
    de: "Segment",
    fr: "Segment",
    it: "Segmento",
    es: "Segmento",
    nl: "Segment",
    "es-419": "Segmento",
  },
  brand: {
    de: "Marke",
    fr: "Marque",
    it: "Marca",
    es: "Marca",
    nl: "Merk",
    "es-419": "Marca",
  },
  "product line": {
    de: "Produktlinie",
    fr: "Gamme de produits",
    it: "Linea prodotto",
    es: "Línea de producto",
    nl: "Productlijn",
    "es-419": "Línea de producto",
  },
  "component type": {
    de: "Bauteiltyp",
    fr: "Type de composant",
    it: "Tipo di componente",
    es: "Tipo de componente",
    nl: "Onderdeeltype",
    "es-419": "Tipo de componente",
  },
  "axle position": {
    de: "Einbauposition",
    fr: "Position d’essieu",
    it: "Posizione asse",
    es: "Posición del eje",
    nl: "Aspositie",
    "es-419": "Posición de eje",
  },
  "outer diameter": {
    de: "Außendurchmesser",
    fr: "Diamètre extérieur",
    it: "Diametro esterno",
    es: "Diámetro exterior",
    nl: "Buitendiameter",
    "es-419": "Diámetro exterior",
  },
  "rotor outer diameter": {
    de: "Scheiben-Außendurchmesser",
    fr: "Diamètre extérieur du disque",
    it: "Diametro esterno disco",
    es: "Diámetro exterior del disco",
    nl: "Buitendiameter remschijf",
    "es-419": "Diámetro exterior del disco",
  },
  "disc outer diameter": {
    de: "Scheiben-Außendurchmesser",
    fr: "Diamètre extérieur du disque",
    it: "Diametro esterno disco",
    es: "Diámetro exterior del disco",
    nl: "Buitendiameter remschijf",
    "es-419": "Diámetro exterior del disco",
  },
  "rotor diameter": {
    de: "Scheibendurchmesser",
    fr: "Diamètre du disque",
    it: "Diametro disco",
    es: "Diámetro del disco",
    nl: "Schijfdiameter",
    "es-419": "Diámetro del disco",
  },
  "nominal thickness": {
    de: "Nenndicke",
    fr: "Épaisseur nominale",
    it: "Spessore nominale",
    es: "Espesor nominal",
    nl: "Nominale dikte",
    "es-419": "Espesor nominal",
  },
  "rotor thickness": {
    de: "Scheibendicke",
    fr: "Épaisseur du disque",
    it: "Spessore disco",
    es: "Espesor del disco",
    nl: "Schijfdikte",
    "es-419": "Espesor del disco",
  },
  "rotor width / thickness": {
    de: "Scheibenbreite / Dicke",
    fr: "Épaisseur du disque",
    it: "Spessore disco",
    es: "Espesor del disco",
    nl: "Schijfdikte",
    "es-419": "Espesor del disco",
  },
  "minimum thickness": {
    de: "Mindestdicke",
    fr: "Épaisseur minimale",
    it: "Spessore minimo",
    es: "Espesor mínimo",
    nl: "Minimale dikte",
    "es-419": "Espesor mínimo",
  },
  thickness: {
    de: "Dicke",
    fr: "Épaisseur",
    it: "Spessore",
    es: "Espesor",
    nl: "Dikte",
    "es-419": "Espesor",
  },
  width: {
    de: "Breite",
    fr: "Largeur",
    it: "Larghezza",
    es: "Ancho",
    nl: "Breedte",
    "es-419": "Ancho",
  },
  height: {
    de: "Höhe",
    fr: "Hauteur",
    it: "Altezza",
    es: "Altura",
    nl: "Hoogte",
    "es-419": "Altura",
  },
  "rotor construction": {
    de: "Scheibenaufbau",
    fr: "Construction du disque",
    it: "Costruzione disco",
    es: "Construcción del disco",
    nl: "Schijfconstructie",
    "es-419": "Construcción del disco",
  },
  "disc construction": {
    de: "Scheibenaufbau",
    fr: "Construction du disque",
    it: "Costruzione disco",
    es: "Construcción del disco",
    nl: "Schijfconstructie",
    "es-419": "Construcción del disco",
  },
  "rotor type": {
    de: "Scheibentyp",
    fr: "Type de disque",
    it: "Tipo disco",
    es: "Tipo de disco",
    nl: "Type remschijf",
    "es-419": "Tipo de disco",
  },
  "brake disc type": {
    de: "Bremsscheibenart",
    fr: "Type de disque de frein",
    it: "Tipo disco freno",
    es: "Tipo de disco de freno",
    nl: "Type remschijf",
    "es-419": "Tipo de disco de freno",
  },
  "rotor design": {
    de: "Scheibenausführung",
    fr: "Conception du disque",
    it: "Design disco",
    es: "Diseño del disco",
    nl: "Schijfontwerp",
    "es-419": "Diseño del disco",
  },
  "surface type": {
    de: "Oberflächenausführung",
    fr: "Type de surface",
    it: "Finitura superficie",
    es: "Tipo de superficie",
    nl: "Oppervlaktetype",
    "es-419": "Tipo de superficie",
  },
  surface: {
    de: "Oberfläche",
    fr: "Surface",
    it: "Superficie",
    es: "Superficie",
    nl: "Oppervlak",
    "es-419": "Superficie",
  },
  "surface protection": {
    de: "Korrosionsschutz",
    fr: "Protection de surface",
    it: "Protezione superficiale",
    es: "Protección superficial",
    nl: "Oppervlaktebescherming",
    "es-419": "Protección superficial",
  },
  "anti-corrosion finish": {
    de: "Korrosionsschutzbeschichtung",
    fr: "Traitement anticorrosion",
    it: "Trattamento anticorrosione",
    es: "Recubrimiento anticorrosión",
    nl: "Anticorrosiecoating",
    "es-419": "Recubrimiento anticorrosión",
  },
  "finish coating": {
    de: "Oberflächenbeschichtung",
    fr: "Revêtement de finition",
    it: "Rivestimento superficiale",
    es: "Recubrimiento de acabado",
    nl: "Afwerkingscoating",
    "es-419": "Recubrimiento de acabado",
  },
  "hat / bell material": {
    de: "Bremsscheibentopf-Material",
    fr: "Matériau du bol",
    it: "Materiale campana",
    es: "Material de la campana",
    nl: "Materiaal naafhoed",
    "es-419": "Material del sombrero",
  },
  "vane geometry": {
    de: "Kühlkanal-Geometrie",
    fr: "Géométrie des ailettes",
    it: "Geometria alette di ventilazione",
    es: "Geometría de álabes de ventilación",
    nl: "Koelkanaalgeometrie",
    "es-419": "Geometría de ventilación",
  },
  "caliper architecture": {
    de: "Bremssattel-Bauweise",
    fr: "Architecture de l’étrier",
    it: "Architettura pinza",
    es: "Arquitectura de la pinza",
    nl: "Remklauwconstructie",
    "es-419": "Arquitectura del cáliper",
  },
  caliper: {
    de: "Bremssattel",
    fr: "Étrier",
    it: "Pinza",
    es: "Pinza",
    nl: "Remklauw",
    "es-419": "Cáliper",
  },
  "caliper color": {
    de: "Bremssattelfarbe",
    fr: "Couleur de l’étrier",
    it: "Colore pinza",
    es: "Color de la pinza",
    nl: "Kleur remklauw",
    "es-419": "Color del cáliper",
  },
  "caliper finish": {
    de: "Bremssattel-Oberfläche",
    fr: "Finition de l’étrier",
    it: "Finitura pinza",
    es: "Acabado de la pinza",
    nl: "Afwerking remklauw",
    "es-419": "Acabado del cáliper",
  },
  "caliper model & pistons": {
    de: "Bremssattelmodell & Kolben",
    fr: "Modèle d’étrier et pistons",
    it: "Modello pinza e pistoni",
    es: "Modelo de pinza y pistones",
    nl: "Remklauwmodel & zuigers",
    "es-419": "Modelo de cáliper y pistones",
  },
  "piston count": {
    de: "Kolbenanzahl",
    fr: "Nombre de pistons",
    it: "Numero pistoni",
    es: "Número de pistones",
    nl: "Aantal zuigers",
    "es-419": "Número de pistones",
  },
  "piston bore & area": {
    de: "Kolbendurchmesser & Fläche",
    fr: "Alésage et surface des pistons",
    it: "Alesaggio e area pistoni",
    es: "Diámetro y área de pistones",
    nl: "Zuigerboring & oppervlak",
    "es-419": "Diámetro y área de pistones",
  },
  "piston seals": {
    de: "Kolbendichtungen",
    fr: "Joints de piston",
    it: "Guarnizioni pistoni",
    es: "Sellos de pistón",
    nl: "Zuigerafdichtingen",
    "es-419": "Sellos de pistón",
  },
  "homologation / approval": {
    de: "Zulassung / Prüfzeichen",
    fr: "Homologation",
    it: "Omologazione",
    es: "Homologación",
    nl: "Goedkeuring / keurmerk",
    "es-419": "Certificación",
  },
  approval: {
    de: "Zulassung",
    fr: "Homologation",
    it: "Omologazione",
    es: "Homologación",
    nl: "Goedkeuring",
    "es-419": "Certificación",
  },
  "compatible applications": {
    de: "Passende Fahrzeuge",
    fr: "Véhicules compatibles",
    it: "Veicoli compatibili",
    es: "Vehículos compatibles",
    nl: "Geschikte voertuigen",
    "es-419": "Vehículos compatibles",
  },
  "friction compound": {
    de: "Reibbelagmischung",
    fr: "Composé de friction",
    it: "Mescola d’attrito",
    es: "Compuesto de fricción",
    nl: "Frictiemengsel",
    "es-419": "Compuesto de fricción",
  },
  "brake pad compound": {
    de: "Bremsbelagmischung",
    fr: "Composé de plaquette",
    it: "Mescola pastiglie",
    es: "Compuesto de pastillas",
    nl: "Remblokmengsel",
    "es-419": "Compuesto de balatas",
  },
  "operating temp range": {
    de: "Arbeitstemperaturbereich",
    fr: "Plage de température",
    it: "Temperatura d’esercizio",
    es: "Rango de temperatura",
    nl: "Werktemperatuurbereik",
    "es-419": "Rango de temperatura",
  },
  "backing plate": {
    de: "Trägerplatte",
    fr: "Plaque support",
    it: "Piastra di supporto",
    es: "Placa de respaldo",
    nl: "Draagplaat",
    "es-419": "Placa de respaldo",
  },
  "bed plate material": {
    de: "Trägerplattenmaterial",
    fr: "Matériau de la plaque support",
    it: "Materiale piastra",
    es: "Material de placa soporte",
    nl: "Materiaal draagplaat",
    "es-419": "Material de placa soporte",
  },
  "minimum wheel diameter": {
    de: "Mindest-Felgendurchmesser",
    fr: "Diamètre de jante minimal",
    it: "Diametro minimo cerchio",
    es: "Diámetro mínimo de llanta",
    nl: "Minimale velgdiameter",
    "es-419": "Diámetro mínimo de rin",
  },
  "mount type": {
    de: "Befestigungsart",
    fr: "Type de montage",
    it: "Tipo di montaggio",
    es: "Tipo de montaje",
    nl: "Montagetype",
    "es-419": "Tipo de montaje",
  },
  "hardware material": {
    de: "Befestigungsmaterial",
    fr: "Matériau de la boulonnerie",
    it: "Materiale viteria",
    es: "Material de tornillería",
    nl: "Bevestigingsmateriaal",
    "es-419": "Material de herrajes",
  },
  "drive bobbins": {
    de: "Floater / Befestigungsbuchsen",
    fr: "Bobbins d’entraînement",
    it: "Nottolini flottanti",
    es: "Casquillos flotantes",
    nl: "Drijfbussen",
    "es-419": "Bujes flotantes",
  },
  "included pads / fluid": {
    de: "Enthaltene Beläge / Bremsflüssigkeit",
    fr: "Plaquettes / liquide inclus",
    it: "Pastiglie / liquido inclusi",
    es: "Pastillas / líquido incluidos",
    nl: "Inbegrepen blokken / remvloeistof",
    "es-419": "Balatas / líquido incluidos",
  },
  "average friction coefficient (μ)": {
    de: "Mittlerer Reibwert (μ)",
    fr: "Coefficient de friction moyen (μ)",
    it: "Coefficiente d’attrito medio (μ)",
    es: "Coeficiente de fricción medio (μ)",
    nl: "Gemiddelde wrijvingscoëfficiënt (μ)",
    "es-419": "Coeficiente de fricción promedio (μ)",
  },
  "thermal bedding": {
    de: "Thermisches Einbremsen",
    fr: "Rodage thermique",
    it: "Rodaggio termico",
    es: "Asentamiento térmico",
    nl: "Thermisch inremmen",
    "es-419": "Asentamiento térmico",
  },
  compressibility: {
    de: "Kompressibilität",
    fr: "Compressibilité",
    it: "Compressibilità",
    es: "Compresibilidad",
    nl: "Samendrukbaarheid",
    "es-419": "Compresibilidad",
  },
  "metallurgy / material": {
    de: "Metallurgie / Werkstoff",
    fr: "Métallurgie / matériau",
    it: "Metallurgia / materiale",
    es: "Metalurgia / material",
    nl: "Metallurgie / materiaal",
    "es-419": "Metalurgia / material",
  },
  "runout tolerance": {
    de: "Seitenschlagtoleranz",
    fr: "Tolérance de voile",
    it: "Tolleranza di planarità",
    es: "Tolerancia de alabeo",
    nl: "Slagtolerantie",
    "es-419": "Tolerancia de alabeo",
  },
  "number of holes": {
    de: "Lochanzahl",
    fr: "Nombre de trous",
    it: "Numero di fori",
    es: "Número de orificios",
    nl: "Aantal gaten",
    "es-419": "Número de birlos",
  },
  "lug count": {
    de: "Lochanzahl",
    fr: "Nombre d’écrous",
    it: "Numero fori",
    es: "Número de birlos/tornillos",
    nl: "Aantal wielbouten",
    "es-419": "Número de birlos",
  },
  "wheel lug/bolt pattern": {
    de: "Rad-Lochkreis",
    fr: "Entraxe de roue",
    it: "Foratura ruota",
    es: "Patrón de tornillos",
    nl: "Steekmaat wiel",
    "es-419": "Barrenación",
  },
  "centering diameter": {
    de: "Zentrierdurchmesser",
    fr: "Diamètre de centrage",
    it: "Diametro di centraggio",
    es: "Diámetro de centrado",
    nl: "Centreerdiameter",
    "es-419": "Diámetro de centrado",
  },
  "bolt hole circle ø": {
    de: "Lochkreis-Ø",
    fr: "�� du cercle de perçage",
    it: "Ø cerchio fori",
    es: "Ø círculo de tornillos",
    nl: "Steekcirkel-Ø",
    "es-419": "Ø círculo de birlos",
  },
  "tightening torque": {
    de: "Anzugsdrehmoment",
    fr: "Couple de serrage",
    it: "Coppia di serraggio",
    es: "Par de apriete",
    nl: "Aanhaalmoment",
    "es-419": "Par de apriete",
  },
  "brake system": {
    de: "Bremssystem",
    fr: "Système de freinage",
    it: "Impianto frenante",
    es: "Sistema de frenos",
    nl: "Remsysteem",
    "es-419": "Sistema de frenos",
  },
  "wear warning contact": {
    de: "Verschleißwarnkontakt",
    fr: "Contact d’avertissement d’usure",
    it: "Contatto avviso usura",
    es: "Contacto avisador de desgaste",
    nl: "Slijtage-indicator",
    "es-419": "Sensor de desgaste",
  },
  "supplementary article": {
    de: "Ergänzungsartikel / Zubehör",
    fr: "Article complémentaire",
    it: "Articolo complementare",
    es: "Artículo complementario",
    nl: "Aanvullend artikel",
    "es-419": "Accesorios incluidos",
  },
  "hose material": {
    de: "Schlauchmaterial",
    fr: "Matériau du flexible",
    it: "Materiale tubo",
    es: "Material del latiguillo",
    nl: "Slangmateriaal",
    "es-419": "Material de la manguera",
  },
  "grade type": {
    de: "Qualitätsstufe",
    fr: "Qualité",
    it: "Grado qualità",
    es: "Grado de calidad",
    nl: "Kwaliteitsklasse",
    "es-419": "Grado de calidad",
  },
  "includes park brake": {
    de: "Inkl. Feststellbremse",
    fr: "Frein de stationnement inclus",
    it: "Include freno di stazionamento",
    es: "Incluye freno de estacionamiento",
    nl: "Incl. parkeerrem",
    "es-419": "Incluye freno de estacionamiento",
  },
}

const SPEC_VALUE_EXACT: Record<string, Record<NonEnLang, string>> = {
  yes: { de: "Ja", fr: "Oui", it: "Sì", es: "Sí", nl: "Ja", "es-419": "Sí" },
  no: { de: "Nein", fr: "Non", it: "No", es: "No", nl: "Nee", "es-419": "No" },
  included: {
    de: "Inklusive",
    fr: "Inclus",
    it: "Incluso",
    es: "Incluido",
    nl: "Inbegrepen",
    "es-419": "Incluido",
  },
  "not included": {
    de: "Nicht enthalten",
    fr: "Non inclus",
    it: "Non incluso",
    es: "No incluido",
    nl: "Niet inbegrepen",
    "es-419": "No incluido",
  },
  aluminum: {
    de: "Aluminium",
    fr: "Aluminium",
    it: "Alluminio",
    es: "Aluminio",
    nl: "Aluminium",
    "es-419": "Aluminio",
  },
  "1-piece": {
    de: "Einteilig",
    fr: "Monobloc (1 pièce)",
    it: "Monoblocco (1 pezzo)",
    es: "Monobloque (1 pieza)",
    nl: "1-delig",
    "es-419": "1 pieza",
  },
  "2-piece": {
    de: "Zweiteilig",
    fr: "2 pièces",
    it: "2 pezzi",
    es: "2 piezas",
    nl: "2-delig",
    "es-419": "2 piezas",
  },
  cast: {
    de: "Gussfelge",
    fr: "Coulée",
    it: "Fuso",
    es: "Fundida",
    nl: "Gegoten",
    "es-419": "Fundido",
  },
  forged: {
    de: "Schmiedefelge",
    fr: "Forgée",
    it: "Forgiato",
    es: "Forjada",
    nl: "Gesmeed",
    "es-419": "Forjado",
  },
  "flow-formed": {
    de: "Flow-Forming",
    fr: "Flow-forming",
    it: "Flow-forming",
    es: "Flow-forming",
    nl: "Flow-forming",
    "es-419": "Flow-formed",
  },
  "all season": {
    de: "Ganzjahr",
    fr: "Toutes saisons",
    it: "Quattro stagioni",
    es: "Todo tiempo",
    nl: "All-season",
    "es-419": "Todo el año",
  },
  summer: {
    de: "Sommer",
    fr: "Été",
    it: "Estate",
    es: "Verano",
    nl: "Zomer",
    "es-419": "Verano",
  },
  winter: {
    de: "Winter",
    fr: "Hiver",
    it: "Inverno",
    es: "Invierno",
    nl: "Winter",
    "es-419": "Invierno",
  },
  "front axle": {
    de: "Vorderachse",
    fr: "Essieu avant",
    it: "Asse anteriore",
    es: "Eje delantero",
    nl: "Vooras",
    "es-419": "Eje delantero",
  },
  "rear axle": {
    de: "Hinterachse",
    fr: "Essieu arrière",
    it: "Asse posteriore",
    es: "Eje trasero",
    nl: "Achteras",
    "es-419": "Eje trasero",
  },
  "frontaxle": {
    de: "Vorderachse",
    fr: "Essieu avant",
    it: "Asse anteriore",
    es: "Eje delantero",
    nl: "Vooras",
    "es-419": "Eje delantero",
  },
  "premium performance (65% tier)": {
    de: "Premium-Performance (65 %)",
    fr: "Haute Performance Premium (65 %)",
    it: "Premium ad Alte Prestazioni (65%)",
    es: "Premium de Alto Rendimiento (65 %)",
    nl: "Premium High-Performance (65%)",
    "es-419": "Premium de Alto Desempeño (65%)",
  },
  "mid-range oe+ (35% tier)": {
    de: "Mittelklasse OE+ (35 %)",
    fr: "Gamme Moyenne OE+ (35 %)",
    it: "Fascia Media OE+ (35%)",
    es: "Gama Media OE+ (35 %)",
    nl: "Middenklasse OE+ (35%)",
    "es-419": "Gama Media OE+ (35%)",
  },
  "big brake system kit": {
    de: "Big-Brake-Komplettanlage",
    fr: "Kit gros freins complet",
    it: "Kit impianto frenante maggiorato",
    es: "Kit de frenos sobredimensionado",
    nl: "Big-brake-systeemkit",
    "es-419": "Kit de frenos de alto desempeño",
  },
  "brake disc set": {
    de: "Bremsscheibensatz",
    fr: "Jeu de disques de frein",
    it: "Set dischi freno",
    es: "Juego de discos de freno",
    nl: "Remschijvenset",
    "es-419": "Juego de discos de freno",
  },
  "brake pad set": {
    de: "Bremsbelagsatz",
    fr: "Jeu de plaquettes de frein",
    it: "Set pastiglie freno",
    es: "Juego de pastillas de freno",
    nl: "Remblokkenset",
    "es-419": "Juego de balatas",
  },
  "pads & rotors kit": {
    de: "Bremsscheiben- & Belagsatz",
    fr: "Kit disques et plaquettes",
    it: "Kit dischi e pastiglie",
    es: "Kit de discos y pastillas",
    nl: "Remschijven- & blokkenset",
    "es-419": "Kit de discos y balatas",
  },
  "brake caliper": {
    de: "Bremssattel",
    fr: "Étrier de frein",
    it: "Pinza freno",
    es: "Pinza de freno",
    nl: "Remklauw",
    "es-419": "Cáliper de freno",
  },
  "italy (bergamo)": {
    de: "Italien (Bergamo)",
    fr: "Italie (Bergame)",
    it: "Italia (Bergamo)",
    es: "Italia (Bérgamo)",
    nl: "Italië (Bergamo)",
    "es-419": "Italia (Bérgamo)",
  },
  "united states": {
    de: "Vereinigte Staaten",
    fr: "États-Unis",
    it: "Stati Uniti",
    es: "Estados Unidos",
    nl: "Verenigde Staten",
    "es-419": "Estados Unidos",
  },
  "united states (california)": {
    de: "Vereinigte Staaten (Kalifornien)",
    fr: "États-Unis (Californie)",
    it: "Stati Uniti (California)",
    es: "Estados Unidos (California)",
    nl: "Verenigde Staten (Californië)",
    "es-419": "Estados Unidos (California)",
  },
  "united states (arizona)": {
    de: "Vereinigte Staaten (Arizona)",
    fr: "États-Unis (Arizona)",
    it: "Stati Uniti (Arizona)",
    es: "Estados Unidos (Arizona)",
    nl: "Verenigde Staten (Arizona)",
    "es-419": "Estados Unidos (Arizona)",
  },
  "united kingdom": {
    de: "Vereinigtes Königreich",
    fr: "Royaume-Uni",
    it: "Regno Unito",
    es: "Reino Unido",
    nl: "Verenigd Koninkrijk",
    "es-419": "Reino Unido",
  },
  germany: {
    de: "Deutschland",
    fr: "Allemagne",
    it: "Germania",
    es: "Alemania",
    nl: "Duitsland",
    "es-419": "Alemania",
  },
  italy: {
    de: "Italien",
    fr: "Italie",
    it: "Italia",
    es: "Italia",
    nl: "Italië",
    "es-419": "Italia",
  },
  japan: {
    de: "Japan",
    fr: "Japon",
    it: "Giappone",
    es: "Japón",
    nl: "Japan",
    "es-419": "Japón",
  },
  vented: {
    de: "Innenbelüftet",
    fr: "Ventilé",
    it: "Ventilato",
    es: "Ventilado",
    nl: "Geventileerd",
    "es-419": "Ventilado",
  },
  solid: {
    de: "Vollscheibe (massiv)",
    fr: "Plein",
    it: "Pieno",
    es: "Macizo",
    nl: "Massief",
    "es-419": "Sólido",
  },
  "high-carbon vented 2-piece": {
    de: "Zweiteilige High-Carbon-Bremsscheibe, innenbelüftet",
    fr: "Disque 2 pièces ventilé à haute teneur en carbone",
    it: "Disco 2 pezzi ventilato ad alto tenore di carbonio",
    es: "Disco de 2 piezas ventilado de alto carbono",
    nl: "2-delige geventileerde high-carbon remschijf",
    "es-419": "Disco de 2 piezas ventilado de alto carbono",
  },
  "high-carbon vented": {
    de: "High-Carbon-Bremsscheibe, innenbelüftet",
    fr: "Disque ventilé à haute teneur en carbone",
    it: "Disco ventilato ad alto tenore di carbonio",
    es: "Disco ventilado de alto carbono",
    nl: "Geventileerde high-carbon remschijf",
    "es-419": "Disco ventilado de alto carbono",
  },
}

function localizeSpec(spec: Spec, lang: NonEnLang): Spec {
  const key = spec.label.trim().toLowerCase()
  const label = SPEC_LABEL_MAP[key]?.[lang] ?? spec.label
  const valKey = spec.value.trim().toLowerCase()
  const value =
    SPEC_VALUE_EXACT[valKey]?.[lang] ??
    TIRE_SEGMENT_VALUE[valKey]?.[lang] ??
    VEHICLE_TYPE_VALUE[valKey]?.[lang] ??
    spec.value
  return { label, value }
}

function localizeHighlight(h: string, lang: NonEnLang): string {
  const trimmed = h.trim()
  const lower = trimmed.toLowerCase()

  if (TIRE_SEGMENT_VALUE[lower]) return TIRE_SEGMENT_VALUE[lower][lang]
  if (SPEC_VALUE_EXACT[lower]) return SPEC_VALUE_EXACT[lower][lang]

  if (lower === "price per wheel") {
    return {
      de: "Preis pro Felge",
      fr: "Prix par jante",
      it: "Prezzo per cerchio",
      es: "Precio por llanta",
      nl: "Prijs per velg",
      "es-419": "Precio por rin",
    }[lang]
  }
  if (lower === "front axle fitment") {
    return {
      de: "Passend für die Vorderachse",
      fr: "Montage essieu avant",
      it: "Montaggio asse anteriore",
      es: "Montaje en eje delantero",
      nl: "Montage vooras",
      "es-419": "Montaje en eje delantero",
    }[lang]
  }
  if (lower === "rear axle fitment") {
    return {
      de: "Passend für die Hinterachse",
      fr: "Montage essieu arrière",
      it: "Montaggio asse posteriore",
      es: "Montaje en eje trasero",
      nl: "Montage achteras",
      "es-419": "Montaje en eje trasero",
    }[lang]
  }
  if (lower === "ece r90 & tüv certified") {
    return {
      de: "ECE R90 & TÜV-zertifiziert",
      fr: "Certifié ECE R90 & TÜV",
      it: "Certificato ECE R90 & TÜV",
      es: "Certificado ECE R90 y TÜV",
      nl: "ECE R90 & TÜV-gecertificeerd",
      "es-419": "Certificación ECE R90 y TÜV",
    }[lang]
  }

  const pistonMatch = trimmed.match(/^(\d+)-Piston Monoblock Caliper$/i)
  if (pistonMatch) {
    const n = pistonMatch[1]
    return {
      de: `${n}-Kolben-Monoblock-Bremssattel`,
      fr: `Étrier monobloc ${n} pistons`,
      it: `Pinza monoblocco a ${n} pistoni`,
      es: `Pinza monobloque de ${n} pistones`,
      nl: `${n}-zuiger monoblock remklauw`,
      "es-419": `Cáliper monobloque de ${n} pistones`,
    }[lang]
  }

  if (trimmed.startsWith("Premium Segment · ")) {
    const rest = trimmed.slice("Premium Segment · ".length)
    const prefix = {
      de: "Premium-Segment",
      fr: "Segment Premium",
      it: "Segmento Premium",
      es: "Segmento Premium",
      nl: "Premium-segment",
      "es-419": "Segmento Premium",
    }[lang]
    return `${prefix} · ${rest}`
  }

  if (trimmed.startsWith("Mid-Range OE+ · ")) {
    const rest = trimmed.slice("Mid-Range OE+ · ".length)
    const prefix = {
      de: "Mittelklasse OE+",
      fr: "Gamme Moyenne OE+",
      it: "Fascia Media OE+",
      es: "Gama Media OE+",
      nl: "Middenklasse OE+",
      "es-419": "Gama Media OE+",
    }[lang]
    return `${prefix} · ${rest}`
  }

  return trimmed
}

function buildTireCopy(product: TireProduct, lang: NonEnLang) {
  const size = tireSize(product.tire)
  const svc = tireServiceDescription(product.tire)
  const seasonName = TIRE_SEASON_NAME[lang][product.tire.season]
  const seasonShort = TIRE_SEASON_SHORT[lang][product.tire.season]
  const modelName = product.tire.model || product.name
  const mpn = product.mpn || product.id

  const rawTypeSpec = product.specs.find((s) => s.label.toLowerCase() === "tire type")?.value
  const rawVehicleSpec = product.specs.find((s) => s.label.toLowerCase() === "vehicle type")?.value
  const segText = rawTypeSpec ? (TIRE_SEGMENT_VALUE[rawTypeSpec.toLowerCase()]?.[lang] ?? rawTypeSpec) : null
  const vehText = rawVehicleSpec ? (VEHICLE_TYPE_VALUE[rawVehicleSpec.toLowerCase()]?.[lang] ?? rawVehicleSpec) : null

  const shortDescription = {
    de: `${product.brand} ${modelName}, ${size} ${svc}. ${seasonName}; Herstellernummer ${mpn}.`,
    fr: `${product.brand} ${modelName}, ${size} ${svc}. ${seasonName} ; référence fabricant ${mpn}.`,
    it: `${product.brand} ${modelName}, ${size} ${svc}. ${seasonName}; codice produttore ${mpn}.`,
    es: `${product.brand} ${modelName}, ${size} ${svc}. ${seasonName}; referencia del fabricante ${mpn}.`,
    nl: `${product.brand} ${modelName}, ${size} ${svc}. ${seasonName}; fabrikantnummer ${mpn}.`,
    "es-419": `${product.brand} ${modelName}, ${size} ${svc}. ${seasonName}; número de parte ${mpn}.`,
  }[lang]

  const rfYesNo = SPEC_VALUE_EXACT[product.tire.runFlat ? "yes" : "no"][lang]
  const utqgPart = product.tire.utqg
    ? ` UTQG: ${product.tire.utqg.treadwear} ${product.tire.utqg.traction} ${product.tire.utqg.temperature}.`
    : ""

  const description = {
    de: `${product.brand} ${modelName} in der Größe ${size} ${svc} (${seasonShort}${segText ? `, ${segText}` : ""}${vehText ? ` für ${vehText}` : ""}).${utqgPart} Runflat: ${rfYesNo}. Herstellernummer: ${mpn}. Prüfen Sie vor der Bestellung Reifengröße, Tragfähigkeits- und Geschwindigkeitsindex anhand Ihrer Fahrzeugpapiere oder der Reifenflanke.`,
    fr: `${product.brand} ${modelName} en dimension ${size} ${svc} (${seasonShort}${segText ? `, ${segText}` : ""}${vehText ? ` pour ${vehText}` : ""}).${utqgPart} Runflat : ${rfYesNo}. Référence fabricant : ${mpn}. Vérifiez la dimension, l’indice de charge et l’indice de vitesse sur le flanc du pneu avant de commander.`,
    it: `${product.brand} ${modelName} nella misura ${size} ${svc} (${seasonShort}${segText ? `, ${segText}` : ""}${vehText ? ` per ${vehText}` : ""}).${utqgPart} Run-flat: ${rfYesNo}. Codice produttore: ${mpn}. Verifica misura, indice di carico e codice di velocità sul fianco del pneumatico o sul libretto prima di ordinare.`,
    es: `${product.brand} ${modelName} en medida ${size} ${svc} (${seasonShort}${segText ? `, ${segText}` : ""}${vehText ? ` para ${vehText}` : ""}).${utqgPart} Run-flat: ${rfYesNo}. Referencia del fabricante: ${mpn}. Comprueba la medida, el índice de carga y el código de velocidad en el flanco del neumático antes de realizar el pedido.`,
    nl: `${product.brand} ${modelName} in de maat ${size} ${svc} (${seasonShort}${segText ? `, ${segText}` : ""}${vehText ? ` voor ${vehText}` : ""}).${utqgPart} Run-flat: ${rfYesNo}. Fabrikantnummer: ${mpn}. Controleer voor het bestellen de bandenmaat, draagvermogen- en snelheidsindex op de zijwand van uw band.`,
    "es-419": `${product.brand} ${modelName} en medida ${size} ${svc} (${seasonShort}${segText ? `, ${segText}` : ""}${vehText ? ` para ${vehText}` : ""}).${utqgPart} Run-flat: ${rfYesNo}. Número de parte: ${mpn}. Confirma la medida, el índice de carga y el de velocidad en el costado de tu llanta antes de comprar.`,
  }[lang]

  return { shortDescription, description }
}

function buildWheelCopy(product: WheelProduct, lang: NonEnLang) {
  const w = product.wheel
  const pcd = w.boltPattern.replace("x", "×")
  const constr = SPEC_VALUE_EXACT[w.construction.toLowerCase()]?.[lang] ?? w.construction
  const mpn = product.mpn || product.id

  const shortDescription = {
    de: `Leichtmetallfelge ${w.diameter}×${w.width} ET${w.offset}, ${pcd}, ${w.finish} (${constr}).`,
    fr: `Jante alliage ${w.diameter}×${w.width} ET${w.offset}, ${pcd}, ${w.finish} (${constr}).`,
    it: `Cerchio in lega ${w.diameter}×${w.width} ET${w.offset}, ${pcd}, ${w.finish} (${constr}).`,
    es: `Llanta de aleación ${w.diameter}×${w.width} ET${w.offset}, ${pcd}, ${w.finish} (${constr}).`,
    nl: `Lichtmetalen velg ${w.diameter}×${w.width} ET${w.offset}, ${pcd}, ${w.finish} (${constr}).`,
    "es-419": `Rin de aleación ${w.diameter}×${w.width} ET${w.offset}, ${pcd}, ${w.finish} (${constr}).`,
  }[lang]

  const description = {
    de: `${product.brand} ${product.name}: ${constr} in ${w.diameter}×${w.width}, Einpresstiefe ET${w.offset}, Lochkreis ${pcd}, Mittenbohrung ${w.centerBore} mm, Oberfläche ${w.finish}. Herstellernummer ${mpn}. Preis pro Felge. Prüfen Sie Lochkreis, Einpresstiefe und Mittenbohrung vor der Bestellung anhand Ihres Fahrzeugs.`,
    fr: `${product.brand} ${product.name} : jante alliage (${constr}) en ${w.diameter}×${w.width}, déport ET${w.offset}, entraxe ${pcd}, alésage central ${w.centerBore} mm, finition ${w.finish}. Référence fabricant ${mpn}. Prix à l’unité. Vérifiez l’entraxe, le déport et l’alésage par rapport à votre véhicule avant de commander.`,
    it: `${product.brand} ${product.name}: cerchio in lega (${constr}) ${w.diameter}×${w.width}, offset ET${w.offset}, foratura ${pcd}, foro centrale ${w.centerBore} mm, finitura ${w.finish}. Codice produttore ${mpn}. Prezzo per singolo cerchio. Verifica foratura, offset e foro centrale sul tuo veicolo prima di ordinare.`,
    es: `${product.brand} ${product.name}: llanta de aleación (${constr}) ${w.diameter}×${w.width}, desplazamiento ET${w.offset}, distancia entre tornillos ${pcd}, buje central ${w.centerBore} mm, acabado ${w.finish}. Referencia ${mpn}. Precio por llanta. Comprueba el anclaje, ET y buje con tu vehículo antes de pedir.`,
    nl: `${product.brand} ${product.name}: lichtmetalen velg (${constr}) in ${w.diameter}×${w.width}, ET${w.offset}, steekcirkel ${pcd}, naafgat ${w.centerBore} mm, afwerking ${w.finish}. Fabrikantnummer ${mpn}. Prijs per velg. Controleer steekcirkel, ET-waarde en naafgat voor uw voertuig voordat u bestelt.`,
    "es-419": `${product.brand} ${product.name}: rin de aleación (${constr}) ${w.diameter}×${w.width}, offset ET${w.offset}, barrenación ${pcd}, centro ${w.centerBore} mm, acabado ${w.finish}. Número de parte ${mpn}. Precio por rin. Confirma barrenación, offset y centro con tu vehículo antes de comprar.`,
  }[lang]

  return { shortDescription, description }
}

const BRAKE_NAME_PATTERNS: Array<{
  pattern: RegExp
  replace: Record<NonEnLang, string>
}> = [
  {
    pattern: /\bFront Disc Kit Only For\b/gi,
    replace: {
      de: "Bremsscheiben-Kit vorne für",
      fr: "Kit disques avant pour",
      it: "Kit dischi anteriori per",
      es: "Kit de discos delanteros para",
      nl: "Remschijvenkit voor voor",
      "es-419": "Kit de discos delanteros para",
    },
  },
  {
    pattern: /\bRear Disc Kit Only For\b/gi,
    replace: {
      de: "Bremsscheiben-Kit hinten für",
      fr: "Kit disques arrière pour",
      it: "Kit dischi posteriori per",
      es: "Kit de discos traseros para",
      nl: "Remschijvenkit achter voor",
      "es-419": "Kit de discos traseros para",
    },
  },
  {
    pattern: /\bFront Brake Pads For\b/gi,
    replace: {
      de: "Bremsbeläge vorne für",
      fr: "Plaquettes de frein avant pour",
      it: "Pastiglie freno anteriori per",
      es: "Pastillas de freno delanteras para",
      nl: "Remblokken voor voor",
      "es-419": "Balatas delanteras para",
    },
  },
  {
    pattern: /\bRear Brake Pads For\b/gi,
    replace: {
      de: "Bremsbeläge hinten für",
      fr: "Plaquettes de frein arrière pour",
      it: "Pastiglie freno posteriori per",
      es: "Pastillas de freno traseras para",
      nl: "Remblokken achter voor",
      "es-419": "Balatas traseras para",
    },
  },
  {
    pattern: /\bFront Brake Discs For\b/gi,
    replace: {
      de: "Bremsscheiben vorne für",
      fr: "Disques de frein avant pour",
      it: "Dischi freno anteriori per",
      es: "Discos de freno delanteros para",
      nl: "Remschijven voor voor",
      "es-419": "Discos de freno delanteros para",
    },
  },
  {
    pattern: /\bRear Brake Discs For\b/gi,
    replace: {
      de: "Bremsscheiben hinten für",
      fr: "Disques de frein arrière pour",
      it: "Dischi freno posteriori per",
      es: "Discos de freno traseros para",
      nl: "Remschijven achter voor",
      "es-419": "Discos de freno traseros para",
    },
  },
  {
    pattern: /\bFront Brake Rotors For\b/gi,
    replace: {
      de: "Bremsscheiben vorne für",
      fr: "Disques de frein avant pour",
      it: "Dischi freno anteriori per",
      es: "Discos de freno delanteros para",
      nl: "Remschijven voor voor",
      "es-419": "Discos de freno delanteros para",
    },
  },
  {
    pattern: /\bRear Brake Rotors For\b/gi,
    replace: {
      de: "Bremsscheiben hinten für",
      fr: "Disques de frein arrière pour",
      it: "Dischi freno posteriori per",
      es: "Discos de freno traseros para",
      nl: "Remschijven achter voor",
      "es-419": "Discos de freno traseros para",
    },
  },
  {
    pattern: /\bFront Big Brake Kit For\b/gi,
    replace: {
      de: "Big-Brake-Kit vorne für",
      fr: "Kit gros freins avant pour",
      it: "Kit freni maggiorato anteriore per",
      es: "Kit de frenos delantero para",
      nl: "Big-brake-kit voor voor",
      "es-419": "Kit de frenos delantero para",
    },
  },
  {
    pattern: /\bRear Big Brake Kit For\b/gi,
    replace: {
      de: "Big-Brake-Kit hinten für",
      fr: "Kit gros freins arrière pour",
      it: "Kit freni maggiorato posteriore per",
      es: "Kit de frenos trasero para",
      nl: "Big-brake-kit achter voor",
      "es-419": "Kit de frenos trasero para",
    },
  },
  {
    pattern: /\bFront Brake Kit For\b/gi,
    replace: {
      de: "Bremsen-Kit vorne für",
      fr: "Kit de frein avant pour",
      it: "Kit freni anteriore per",
      es: "Kit de frenos delantero para",
      nl: "Remkit voor voor",
      "es-419": "Kit de frenos delantero para",
    },
  },
  {
    pattern: /\bRear Brake Kit For\b/gi,
    replace: {
      de: "Bremsen-Kit hinten für",
      fr: "Kit de frein arrière pour",
      it: "Kit freni posteriore per",
      es: "Kit de frenos trasero para",
      nl: "Remkit achter voor",
      "es-419": "Kit de frenos trasero para",
    },
  },
  {
    pattern: /\bFront Brake Kit\b/gi,
    replace: {
      de: "Bremsen-Kit vorne",
      fr: "Kit de frein avant",
      it: "Kit freni anteriore",
      es: "Kit de frenos delantero",
      nl: "Remkit voor",
      "es-419": "Kit de frenos delantero",
    },
  },
  {
    pattern: /\bRear Brake Kit\b/gi,
    replace: {
      de: "Bremsen-Kit hinten",
      fr: "Kit de frein arrière",
      it: "Kit freni posteriore",
      es: "Kit de frenos trasero",
      nl: "Remkit achter",
      "es-419": "Kit de frenos trasero",
    },
  },
  {
    pattern: /\bBrake Pad & Rotor Kit\b/gi,
    replace: {
      de: "Bremsscheiben- & Belagsatz",
      fr: "Kit disques et plaquettes",
      it: "Kit dischi e pastiglie",
      es: "Kit de discos y pastillas",
      nl: "Remschijven- & blokkenset",
      "es-419": "Kit de discos y balatas",
    },
  },
  {
    pattern: /\bBrake Pads\b/gi,
    replace: {
      de: "Bremsbeläge",
      fr: "Plaquettes de frein",
      it: "Pastiglie freno",
      es: "Pastillas de freno",
      nl: "Remblokken",
      "es-419": "Balatas",
    },
  },
  {
    pattern: /\bBrake Disc\b/gi,
    replace: {
      de: "Bremsscheibe",
      fr: "Disque de frein",
      it: "Disco freno",
      es: "Disco de freno",
      nl: "Remschijf",
      "es-419": "Disco de freno",
    },
  },
  {
    pattern: /\bBrake Rotor\b/gi,
    replace: {
      de: "Bremsscheibe",
      fr: "Disque de frein",
      it: "Disco freno",
      es: "Disco de freno",
      nl: "Remschijf",
      "es-419": "Disco de freno",
    },
  },
]

function localizeBrakeName(name: string, lang: NonEnLang): string {
  let out = name
  for (const { pattern, replace } of BRAKE_NAME_PATTERNS) {
    out = out.replace(pattern, replace[lang])
  }
  return out
}

function wordCount(text: string): number {
  return text
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

function ensureDetailedDescription(product: Product, baseDescription: string, lang: ContentLang, specs: Spec[]): string {
  const clean = baseDescription.trim()
  if (wordCount(clean) >= 105) return clean

  const mpn = product.mpn || product.supplierSku || product.id
  const gtinText = product.gtin ? ` (${product.gtin.length === 12 ? "UPC" : "EAN/GTIN"}: ${product.gtin})` : ""
  const specSummary = specs
    .slice(0, 8)
    .map((s) => `${s.label}: ${s.value}`)
    .join("; ")

  if (product.category === "tires") {
    const t = product.tire
    const size = tireSize(t)
    const svc = tireServiceDescription(t)
    const model = t.model || product.name
    const euPart = t.euLabel
      ? {
          en: `Under EU Regulation 2020/740, this tyre is rated class ${t.euLabel.fuelEfficiency} for rolling-resistance fuel efficiency, class ${t.euLabel.wetGrip} for wet braking grip, and ${t.euLabel.noiseDb} dB (class ${t.euLabel.noiseClass}) for external pass-by noise${t.euLabel.eprelId ? ` (EPREL registration ${t.euLabel.eprelId})` : ""}.`,
          de: `Gemäß EU-Verordnung 2020/740 erreicht dieser Reifen die Kraftstoffeffizienzklasse ${t.euLabel.fuelEfficiency}, die Nasshaftungsklasse ${t.euLabel.wetGrip} sowie ein externes Rollgeräusch von ${t.euLabel.noiseDb} dB in Klasse ${t.euLabel.noiseClass}${t.euLabel.eprelId ? ` (EPREL-Registrierung ${t.euLabel.eprelId})` : ""}.`,
          fr: `Conformément au règlement UE 2020/740, ce pneumatique obtient la classe ${t.euLabel.fuelEfficiency} en efficacité énergétique, la classe ${t.euLabel.wetGrip} en adhérence sur sol mouillé et un niveau sonore externe de ${t.euLabel.noiseDb} dB en classe ${t.euLabel.noiseClass}${t.euLabel.eprelId ? ` (enregistrement EPREL ${t.euLabel.eprelId})` : ""}.`,
          it: `Secondo il regolamento UE 2020/740, questo pneumatico è classificato in classe ${t.euLabel.fuelEfficiency} per l'efficienza energetica, in classe ${t.euLabel.wetGrip} per l'aderenza sul bagnato e misura ${t.euLabel.noiseDb} dB (classe ${t.euLabel.noiseClass}) di rumorosità esterna${t.euLabel.eprelId ? ` (registrazione EPREL ${t.euLabel.eprelId})` : ""}.`,
          es: `Según el Reglamento UE 2020/740, este neumático obtiene la clase ${t.euLabel.fuelEfficiency} en eficiencia de combustible, la clase ${t.euLabel.wetGrip} en agarre sobre mojado y ${t.euLabel.noiseDb} dB (clase ${t.euLabel.noiseClass}) de ruido de rodadura exterior${t.euLabel.eprelId ? ` (registro EPREL ${t.euLabel.eprelId})` : ""}.`,
          nl: `Volgens EU-verordening 2020/740 behaalt deze band energie-efficiëntieklasse ${t.euLabel.fuelEfficiency}, grip op nat wegdek klasse ${t.euLabel.wetGrip} en een extern rolgeluid van ${t.euLabel.noiseDb} dB in klasse ${t.euLabel.noiseClass}${t.euLabel.eprelId ? ` (EPREL-registratie ${t.euLabel.eprelId})` : ""}.`,
          "es-419": `Conforme a la normativa europea 2020/740, esta llanta registra clase ${t.euLabel.fuelEfficiency} en eficiencia de rodamiento, clase ${t.euLabel.wetGrip} en frenado sobre piso mojado y ${t.euLabel.noiseDb} dB (clase ${t.euLabel.noiseClass}) de ruido exterior.`,
        }[lang]
      : ""
    const extra = {
      en: `Engineered by ${product.brand} for the ${model} product line, this ${size} ${svc} tire (manufacturer reference ${mpn}${gtinText}) features a ${t.width} mm section width, ${t.aspect}% aspect ratio, and ${t.rim}-inch rim diameter with load index ${t.loadIndex} and speed symbol ${t.speedRating}.${t.extraLoad ? " Reinforced Extra Load (XL) casing construction supports higher inflation pressures and axle loads." : " Standard load casing construction delivers balanced ride compliance and predictable handling response."}${t.runFlat ? " Self-supporting run-flat sidewalls allow continued mobility after a pressure loss." : ""} Technical specifications: ${specSummary}. Supplied as a brand-new, factory-first quality tire; always verify the exact sidewall dimension, load index, and speed rating against your vehicle placard before installation.`,
      de: `Gefertigt von ${product.brand} innerhalb der Modellreihe ${model}, verfügt dieser Reifen in der Dimension ${size} ${svc} (Herstellernummer ${mpn}${gtinText}) über ${t.width} mm Reifenbreite, ${t.aspect} % Querschnittsverhältnis und ${t.rim} Zoll Felgendurchmesser bei Tragfähigkeitsindex ${t.loadIndex} und Geschwindigkeitsindex ${t.speedRating}.${t.extraLoad ? " Die verstärkte Extra-Load-Karkasse (XL) ist für höhere Radlasten und Fülldrücke ausgelegt." : " Die präzise abgestimmte Karkassenkonstruktion sorgt für ausgewogenen Fahrkomfort und direktes Lenkverhalten."} Technische Eckdaten: ${specSummary}. Lieferung als fabrikneuer Originalreifen; bitte vergleichen Sie Reifengröße, Last- und Geschwindigkeitsindex vor der Montage mit Ihren Fahrzeugpapieren.`,
      fr: `Conçu par ${product.brand} au sein de la gamme ${model}, ce pneumatique en dimension ${size} ${svc} (référence ${mpn}${gtinText}) présente une largeur de section de ${t.width} mm, un rapport de flanc de ${t.aspect} % et un diamètre de jante de ${t.rim} pouces avec indice de charge ${t.loadIndex} et code de vitesse ${t.speedRating}.${t.extraLoad ? " La carcasse renforcée Extra Load (XL) supporte des charges par essieu supérieures." : " L'architecture radiale assure une empreinte au sol homogène, une usure régulière et une tenue de cap précise."} Caractéristiques techniques : ${specSummary}. Livré neuf d'origine ; vérifiez systématiquement les dimensions homologuées par le constructeur de votre véhicule avant le montage.`,
      it: `Progettato da ${product.brand} nella gamma ${model}, questo pneumatico nella misura ${size} ${svc} (codice ${mpn}${gtinText}) presenta una larghezza di sezione di ${t.width} mm, rapporto d'aspetto del ${t.aspect}% e calettamento da ${t.rim} pollici con indice di carico ${t.loadIndex} e codice di velocità ${t.speedRating}.${t.extraLoad ? " La struttura rinforzata Extra Load (XL) supporta carichi e pressioni di gonfiaggio superiori." : " La carcassa radiale garantisce impronta a terra uniforme, stabilità direzionale e comfort acustico."} Specifiche tecniche: ${specSummary}. Fornito nuovo di fabbrica; controllare sempre misura, indice di carico e codice di velocità riportati sulla carta di circolazione prima del montaggio.`,
      es: `Desarrollado por ${product.brand} dentro de la familia ${model}, este neumático en medida ${size} ${svc} (referencia ${mpn}${gtinText}) cuenta con ${t.width} mm de ancho de sección, perfil del ${t.aspect} % y llanta de ${t.rim} pulgadas con índice de carga ${t.loadIndex} y código de velocidad ${t.speedRating}.${t.extraLoad ? " Su carcasa reforzada Extra Load (XL) admite mayores cargas por eje y presiones de inflado." : " Su estructura radial proporciona un contacto uniforme con el asfalto, desgaste regular y respuesta precisa."} Especificaciones técnicas: ${specSummary}. Se suministra nuevo de fábrica; verifique siempre la medida y los índices homologados en la ficha técnica del vehículo antes del montaje.`,
      nl: `Ontwikkeld door ${product.brand} binnen de ${model}-serie: deze band in de maat ${size} ${svc} (onderdeelnummer ${mpn}${gtinText}) heeft een loopvlakbreedte van ${t.width} mm, een hoogte-breedteverhouding van ${t.aspect}% en een velgdiameter van ${t.rim} inch met draagvermogen-index ${t.loadIndex} en snelheidscodering ${t.speedRating}.${t.extraLoad ? " De versterkte Extra Load (XL) karkasconstructie is berekend op hogere aslasten en bandenspanningen." : " De radiale karkasopbouw biedt een gelijkmatige drukverdeling, koersvastheid en rijcomfort."} Technische gegevens: ${specSummary}. Geleverd als fabrieksnieuwe band; controleer altijd de voorgeschreven bandenmaat en draagvermogen-index van uw voertuig vóór montage.`,
      "es-419": `Fabricada por ${product.brand} dentro de la línea ${model}, esta llanta en medida ${size} ${svc} (número de parte ${mpn}${gtinText}) combina ${t.width} mm de ancho de sección, relación de aspecto de ${t.aspect}% y diámetro de rin de ${t.rim} pulgadas con índice de carga ${t.loadIndex} y rango de velocidad ${t.speedRating}.${t.extraLoad ? " La carcasa reforzada Extra Load (XL) soporta mayor capacidad de carga y presión de inflado." : " Su construcción radial ofrece desgaste uniforme, tracción confiable y estabilidad en carretera."} Especificaciones técnicas: ${specSummary}. Producto nuevo de fábrica; confirme siempre la medida y especificaciones en la etiqueta de la puerta de su vehículo antes de la instalación.`,
    }[lang]
    return `${clean} ${euPart ? `${euPart} ` : ""}${extra}`.replace(/\s+/g, " ").trim()
  }

  if (product.category === "wheels") {
    const w = product.wheel
    const pcd = w.boltPattern.replace("x", "×")
    const extra = {
      en: `Precision-manufactured by ${product.brand}, this ${w.construction.toLowerCase()} alloy wheel in ${w.diameter}×${w.width} inches (reference ${mpn}${gtinText}) is machined for a ${pcd} bolt pattern (PCD), ET${w.offset} mm offset, and ${w.centerBore} mm hub center bore with a durable ${w.finish} finish.${w.loadRatingKg ? ` Certified for a maximum wheel load rating of ${w.loadRatingKg} kg per corner.` : ""} Technical specifications: ${specSummary}. Each wheel is supplied brand-new and inspected for radial and lateral runout; verify brake caliper clearance, lug seat geometry, center bore hub-ring requirements, and fender clearance for your specific vehicle platform prior to mounting tires.`,
      de: `Präzisionsgefertigt von ${product.brand}, bietet diese Leichtmetallfelge in ${w.diameter}×${w.width} Zoll (Referenz ${mpn}${gtinText}) einen Lochkreis von ${pcd}, eine Einpresstiefe von ET${w.offset} mm sowie eine Mittenbohrung von ${w.centerBore} mm in der Ausführung ${w.finish}.${w.loadRatingKg ? ` Geprüfte Radtraglast bis ${w.loadRatingKg} kg pro Rad.` : ""} Technische Daten: ${specSummary}. Jede Felge wird fabrikneu geliefert; bitte prüfen Sie vor der Reifenmontage Freigängigkeit zur Bremsanlage, Zentrierring-Anforderungen, Radschrauben-Sitzform sowie die Fahrzeugzulassung.`,
      fr: `Fabriquée avec précision par ${product.brand}, cette jante en alliage ${w.diameter}×${w.width} pouces (référence ${mpn}${gtinText}) est usinée avec un entraxe ${pcd}, un déport ET${w.offset} mm et un alésage central de ${w.centerBore} mm en finition ${w.finish}.${w.loadRatingKg ? ` Charge maximale homologuée de ${w.loadRatingKg} kg par roue.` : ""} Spécifications techniques : ${specSummary}. Livrée neuve à l'unité ; vérifiez le dégagement des étriers de frein, la boulonnerie adaptée, le besoin éventuel de bagues de centrage et la compatibilité véhicule avant le montage des pneumatiques.`,
      it: `Realizzato con precisione da ${product.brand}, questo cerchio in lega da ${w.diameter}×${w.width} pollici (riferimento ${mpn}${gtinText}) presenta foratura ${pcd}, offset ET${w.offset} mm e foro centrale da ${w.centerBore} mm con finitura ${w.finish}.${w.loadRatingKg ? ` Portata strutturale certificata fino a ${w.loadRatingKg} kg per ruota.` : ""} Dati tecnici: ${specSummary}. Fornito nuovo di fabbrica; verificare sempre ingombro pinze freno, bulloneria, eventuali anelli di centraggio e compatibilità con il proprio veicolo prima del montaggio dello pneumatico.`,
      es: `Fabricada con precisión por ${product.brand}, esta llanta de aleación de ${w.diameter}×${w.width} pulgadas (referencia ${mpn}${gtinText}) presenta anclaje ${pcd}, desplazamiento ET${w.offset} mm y buje central de ${w.centerBore} mm con acabado ${w.finish}.${w.loadRatingKg ? ` Capacidad de carga certificada de ${w.loadRatingKg} kg por rueda.` : ""} Especificaciones técnicas: ${specSummary}. Se entrega nueva por unidad; compruebe siempre la holgura con la pinza de freno, el asiento de la tornillería, los anillos centradores y la compatibilidad con su vehículo antes de montar el neumático.`,
      nl: `Nauwkeurig vervaardigd door ${product.brand}: deze lichtmetalen velg in ${w.diameter}×${w.width} inch (referentie ${mpn}${gtinText}) is uitgevoerd met steekcirkel ${pcd}, ET-waarde ET${w.offset} mm en naafgat ${w.centerBore} mm in de afwerking ${w.finish}.${w.loadRatingKg ? ` Gecertificeerd draagvermogen tot ${w.loadRatingKg} kg per wiel.` : ""} Technische specificaties: ${specSummary}. Nieuw geleverd per stuk; controleer vóór bandenmontage altijd remklauwvrijloop, wielboutzitting, eventuele centreerringen en voertuiggeschiktheid.`,
      "es-419": `Fabricado con precisión por ${product.brand}, este rin de aleación de ${w.diameter}×${w.width} pulgadas (referencia ${mpn}${gtinText}) cuenta con barrenación ${pcd}, offset ET${w.offset} mm y centro de maza de ${w.centerBore} mm en acabado ${w.finish}.${w.loadRatingKg ? ` Capacidad de carga estructural de ${w.loadRatingKg} kg por rin.` : ""} Especificaciones técnicas: ${specSummary}. Se suministra nuevo por pieza; confirme el espacio libre del cáliper de freno, el tipo de tuerca o birlo y los anillos centradores antes de montar la llanta.`,
    }[lang]
    return `${clean} ${extra}`.replace(/\s+/g, " ").trim()
  }

  const b = product.brake
  const fitList = b.fitment.slice(0, 5).join(", ")
  const extra = {
    en: `Manufactured by ${product.brand} (part number ${mpn}${gtinText}) for ${b.axle} axle braking systems${b.discDiameterMm ? ` with ${b.discDiameterMm} mm rotor geometry` : ""}. Engineered to maintain consistent friction stability, thermal capacity, and pedal modulation under repeated stops. Compatible vehicle applications include: ${fitList || "see vehicle fitment table"}. Technical specifications: ${specSummary}. Supplied brand-new in sealed manufacturer packaging; always confirm rotor diameter, caliper code, and axle PR/OE numbers against your vehicle VIN before installation.`,
    de: `Hergestellt von ${product.brand} (Teilenummer ${mpn}${gtinText}) für die Bremsanlage der ${b.axle === "front" ? "Vorderachse" : b.axle === "rear" ? "Hinterachse" : "Vorder- und Hinterachse"}${b.discDiameterMm ? ` mit ${b.discDiameterMm} mm Scheibendurchmesser` : ""}. Ausgelegt für konstante Reibwerte, hohe thermische Belastbarkeit und präzises Pedalgefühl. Passend unter anderem für: ${fitList || "siehe Fahrzeugliste"}. Technische Daten: ${specSummary}. Fabrikneu in Originalverpackung; bitte prüfen Sie vor dem Einbau Scheibendurchmesser, Bremssystem und OE-Referenznummern anhand Ihrer Fahrgestellnummer.`,
    fr: `Fabriqué par ${product.brand} (référence ${mpn}${gtinText}) pour le système de freinage d'essieu ${b.axle === "front" ? "avant" : b.axle === "rear" ? "arrière" : "avant et arrière"}${b.discDiameterMm ? ` avec diamètre de ${b.discDiameterMm} mm` : ""}. Conçu pour offrir une stabilité thermique élevée, un coefficient de friction constant et un freinage progressif. Applications compatibles : ${fitList || "voir tableau de compatibilité"}. Caractéristiques techniques : ${specSummary}. Livré neuf dans son emballage d'origine ; vérifiez le diamètre, le montage d'étrier et les numéros OE de votre véhicule avant l'installation.`,
    it: `Prodotto da ${product.brand} (codice ${mpn}${gtinText}) per l'impianto frenante dell'asse ${b.axle === "front" ? "anteriore" : b.axle === "rear" ? "posteriore" : "anteriore e posteriore"}${b.discDiameterMm ? ` con diametro ${b.discDiameterMm} mm` : ""}. Progettato per garantire stabilità termica, coefficiente d'attrito costante e modulabilità in frenata. Principali applicazioni: ${fitList || "vedi tabella compatibilità"}. Specifiche tecniche: ${specSummary}. Fornito nuovo nella confezione originale; verificare sempre diametro disco, impianto frenante e codici OE tramite telaio prima del montaggio.`,
    es: `Fabricado por ${product.brand} (referencia ${mpn}${gtinText}) para el sistema de frenos del eje ${b.axle === "front" ? "delantero" : b.axle === "rear" ? "trasero" : "delantero y trasero"}${b.discDiameterMm ? ` con diámetro de ${b.discDiameterMm} mm` : ""}. Diseñado para ofrecer estabilidad térmica, fricción uniforme y respuesta precisa del pedal. Aplicaciones compatibles: ${fitList || "consultar tabla de vehículos"}. Especificaciones técnicas: ${specSummary}. Se suministra nuevo en embalaje original; compruebe el diámetro de disco, el código de pinza y las referencias OE de su vehículo antes de la instalación.`,
    nl: `Vervaardigd door ${product.brand} (onderdeelnummer ${mpn}${gtinText}) voor het remsysteem van de ${b.axle === "front" ? "vooras" : b.axle === "rear" ? "achteras" : "voor- en achteras"}${b.discDiameterMm ? ` met een diameter van ${b.discDiameterMm} mm` : ""}. Ontwikkeld voor constante wrijving, hoge thermische stabiliteit en een nauwkeurig pedaalgevoel. Geschikt voor onder meer: ${fitList || "zie voertuiglijst"}. Technische specificaties: ${specSummary}. Nieuw geleverd in originele verpakking; controleer vóór montage altijd schijfdiameter, remsysteemcode en OE-nummers aan de hand van uw chassisnummer.`,
    "es-419": `Fabricado por ${product.brand} (número de parte ${mpn}${gtinText}) para el sistema de frenado del eje ${b.axle === "front" ? "delantero" : b.axle === "rear" ? "trasero" : "delantero y trasero"}${b.discDiameterMm ? ` con diámetro de ${b.discDiameterMm} mm` : ""}. Diseñado para mantener estabilidad térmica, coeficiente de fricción constante y respuesta firme en el pedal. Aplicaciones principales: ${fitList || "consultar tabla de compatibilidad"}. Especificaciones técnicas: ${specSummary}. Producto nuevo en empaque original; verifique siempre el diámetro del rotor, el tipo de cáliper y los números OE de su vehículo antes de instalar.`,
  }[lang]
  return `${clean} ${extra}`.replace(/\s+/g, " ").trim()
}

export function localizeProduct<P extends Product>(product: P, store: Store): P {
  const contentLang = localeMeta(store).content
  if (contentLang === "en") {
    return {
      ...product,
      description: ensureDetailedDescription(product, product.description, "en", product.specs),
    }
  }

  const copy = product.translations?.[contentLang]
  const fallbackCopy =
    !copy?.shortDescription || !copy?.description
      ? product.category === "tires"
        ? buildTireCopy(product, contentLang)
        : product.category === "wheels"
          ? buildWheelCopy(product, contentLang)
          : null
      : null

  const rawName = copy?.name ?? product.name
  const localizedName = product.category === "brakes" ? localizeBrakeName(rawName, contentLang) : rawName
  const rawHighlights = copy?.highlights ?? product.highlights
  const rawSpecs = copy?.specs ?? product.specs
  const localizedSpecs = rawSpecs.map((s) => localizeSpec(s, contentLang))
  const baseDesc = copy?.description ?? fallbackCopy?.description ?? product.description

  return {
    ...product,
    name: localizedName,
    shortDescription: copy?.shortDescription ?? fallbackCopy?.shortDescription ?? product.shortDescription,
    description: ensureDetailedDescription(product, baseDesc, contentLang, localizedSpecs),
    highlights: rawHighlights.map((h) => localizeHighlight(h, contentLang)),
    specs: localizedSpecs,
  }
}
