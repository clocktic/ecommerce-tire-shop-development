import type { Lang } from '@/lib/i18n/config'

const copy: Record<Lang, { link: string; missing: string }> = {
  en: { link: 'Official EPREL record', missing: 'EPREL: no confirmed match for this article.' },
  de: { link: 'Offizieller EPREL-Eintrag', missing: 'EPREL: keine bestätigte Zuordnung für diesen Artikel.' },
  fr: { link: 'Fiche officielle EPREL', missing: 'EPREL : aucune correspondance confirmée pour cette référence.' },
  it: { link: 'Scheda ufficiale EPREL', missing: 'EPREL: nessuna corrispondenza confermata per questo articolo.' },
  es: { link: 'Ficha oficial EPREL', missing: 'EPREL: sin correspondencia confirmada para esta referencia.' },
  nl: { link: 'Officiële EPREL-registratie', missing: 'EPREL: geen bevestigde koppeling voor dit artikel.' },
}

export function EprelReference({ id, lang }: { id?: string; lang: Lang }) {
  const text = copy[lang]
  if (!id || !/^\d+$/.test(id)) return <p className="text-xs leading-relaxed text-muted-foreground">{text.missing}</p>
  return <a href={`https://eprel.ec.europa.eu/screen/product/tyres/${id}`} target="_blank" rel="noopener noreferrer" className="text-xs underline underline-offset-4" aria-label={`${text.link}: ${id}`}>EPREL {id}</a>
}
