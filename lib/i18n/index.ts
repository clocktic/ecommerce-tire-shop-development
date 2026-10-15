import type { Market } from "@/lib/markets"
import type { Lang, Store } from "@/lib/i18n/config"
import { euEn, usEn, type Dictionary } from "@/lib/i18n/dictionaries/en"
import { euDe } from "@/lib/i18n/dictionaries/de"
import { euFr } from "@/lib/i18n/dictionaries/fr"
import { euIt } from "@/lib/i18n/dictionaries/it"
import { euEs } from "@/lib/i18n/dictionaries/es"
import { euNl } from "@/lib/i18n/dictionaries/nl"
import { usEs } from "@/lib/i18n/dictionaries/es-419"

export type { Dictionary }
export * from "@/lib/i18n/config"
export { fmt } from "@/lib/i18n/fmt"

const DICTIONARIES: Record<Market, Partial<Record<Lang, Dictionary>>> = {
  us: { en: usEn, es: usEs },
  eu: { en: euEn, de: euDe, fr: euFr, it: euIt, es: euEs, nl: euNl },
}

export function getDictionary({ market, lang }: Store): Dictionary {
  return DICTIONARIES[market][lang] ?? DICTIONARIES[market].en!
}
