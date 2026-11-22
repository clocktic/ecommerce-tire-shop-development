import Link from "next/link"
import { Truck } from "lucide-react"
import { policyHref } from "@/lib/legal/pages"
import type { ContentLang, Store } from "@/lib/i18n"

const COPY: Record<ContentLang, { text: string; link: string }> = {
  en: {
    text: "Note on older reviews: some earlier customer reviews refer to previous dispatches from our US warehouse. All current EU orders ship free from our European Union logistics hub in Poland in 4–8 business days with EU VAT included and no customs clearance.",
    link: "EU shipping details",
  },
  de: {
    text: "Hinweis zu älteren Bewertungen: Einige frühere Kundenbewertungen beziehen sich auf frühere Lieferungen aus unserem US-Lager. Alle aktuellen EU-Bestellungen werden kostenlos aus unserem EU-Logistikzentrum in Polen in 4–8 Werktagen inkl. MwSt. und ohne Zollabfertigung geliefert.",
    link: "EU-Versanddetails",
  },
  fr: {
    text: "Note sur les anciens avis : certains avis clients antérieurs concernent d’anciennes expéditions depuis notre entrepôt américain. Toutes les commandes UE actuelles sont expédiées gratuitement depuis notre hub logistique européen en Pologne en 4 à 8 jours ouvrés, TVA incluse et sans frais de douane.",
    link: "Détails de livraison UE",
  },
  it: {
    text: "Nota sulle recensioni precedenti: alcune recensioni meno recenti si riferiscono a spedizioni passate dal nostro magazzino USA. Tutti gli ordini UE attuali vengono spediti gratuitamente dal nostro hub logistico europeo in Polonia in 4–8 giorni lavorativi con IVA inclusa e senza dazi doganali.",
    link: "Dettagli spedizione UE",
  },
  es: {
    text: "Nota sobre reseñas anteriores: algunas opiniones antiguas se refieren a envíos previos desde nuestro almacén en EE. UU. Todos los pedidos actuales de la UE se envían gratis desde nuestro centro logístico europeo en Polonia en 4–8 días laborables, con IVA incluido y sin aduanas.",
    link: "Detalles de envío UE",
  },
  "es-419": {
    text: "Nota sobre reseñas anteriores: algunas opiniones antiguas se refieren a envíos previos desde nuestro almacén en EE. UU. Todos los pedidos actuales de la UE se envían gratis desde nuestro centro logístico europeo en Polonia en 4–8 días hábiles, con IVA incluido y sin aduanas.",
    link: "Detalles de envío UE",
  },
  nl: {
    text: "Opmerking bij oudere beoordelingen: sommige eerdere klantbeoordelingen verwijzen naar eerdere zendingen vanuit ons Amerikaanse magazijn. Alle huidige EU-bestellingen worden gratis verzonden vanuit ons EU-logistiekcentrum in Polen binnen 4–8 werkdagen, inclusief btw en zonder douanekosten.",
    link: "EU-verzenddetails",
  },
}

export function EuReviewsLogisticsNote({ store, className = "" }: { store: Store; className?: string }) {
  if (store.market !== "eu") return null
  const copy = COPY[store.lang] ?? COPY.en
  return (
    <div
      role="note"
      className={`flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground ${className}`}
    >
      <Truck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <p>
        {copy.text}{" "}
        <Link href={policyHref(store, "shipping")} className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
          {copy.link}
        </Link>
      </p>
    </div>
  )
}
