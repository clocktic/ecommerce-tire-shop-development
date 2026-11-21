import { COMPANY, EU_REPRESENTATIVE, euRepresentativeAddress } from "@/lib/company"
import { POLICIES } from "@/lib/policies"
import type { Lang } from "@/lib/i18n/config"
import type { PolicyDoc, PolicySection } from "@/lib/legal/types"

// EU orders are dispatched free of charge from our EU logistics hub in Poland
// across all 27 EU Member States. All prices in EUR already include applicable
// EU VAT under our EU representative BBC TYRES BV (VAT ID: BE0794.652.803).
// Because goods move strictly within the European Union customs union, there
// are no import duties, no border customs clearance, and no surprise fees on
// delivery.

const s = POLICIES.eu.shipping
const carriers = s.carriers.join(", ")
const vatId = EU_REPRESENTATIVE.vatNumber
const repName = EU_REPRESENTATIVE.legalName
const repFull = `${repName} (${EU_REPRESENTATIVE.legalForm}, KBO/BCE ${EU_REPRESENTATIVE.enterpriseNumber}, VAT ${vatId}, ${euRepresentativeAddress})`

type Snippets = {
  linkLabel: string
  shippingDescription: string
  shippingIntro: string
  paymentsDescription: string
  paymentsIntro: string
  paymentsVat: PolicySection
  pricesText: string
  returnsSection: PolicySection
  termsSection: PolicySection
}

const href = "/policies/customs"

const EN: Snippets = {
  linkLabel: "EU VAT & Intra-EU Shipping",
  shippingDescription: `Free delivery to ${s.area} from our EU logistics hub in Poland. Prices include EU VAT (${vatId}) with no customs duties.`,
  shippingIntro: `This policy applies to orders placed in the ${COMPANY.tradingName} EU store (prices in EUR, including EU VAT — dispatched free of charge from our EU logistics hub in Poland).`,
  paymentsDescription:
    `Pay securely with Visa, Mastercard, American Express, Discover, PayPal, PayPal Pay Later, Apple Pay, Google Pay, Shop Pay, or SEPA bank transfer. All prices in EUR include EU VAT (${vatId}).`,
  paymentsIntro: `All prices in the EU store are in euro (EUR) and already include applicable EU VAT (EU VAT ID: ${vatId} — ${repName}). Delivery across all 27 EU Member States is free.`,
  paymentsVat: {
    heading: "EU VAT & no customs duties",
    blocks: [
      `All prices shown in the EU store are final prices in EUR and already include applicable EU VAT (EU VAT ID: ${vatId}, EU Representative: ${repName}, ${euRepresentativeAddress}). Because orders are dispatched from our European Union logistics hub in Poland, no customs duties, import VAT, or carrier clearance fees apply on delivery.`,
      { link: { href, label: "EU VAT & Intra-EU Shipping" } },
    ],
  },
  pricesText: `All prices are in EUR and already include applicable EU VAT (EU VAT ID: ${vatId} — ${repName}). Delivery across all 27 EU Member States from our Poland hub is free (€0.00). No customs duties or hidden fees apply on delivery.`,
  returnsSection: {
    heading: "VAT refunds on returns",
    blocks: [
      `All EU store prices already include EU VAT (VAT ID: ${vatId} — ${repName}). When you exercise your right of withdrawal or return an eligible item, we refund the full VAT-inclusive purchase price paid to your original payment method. Because shipments move within the EU, no customs re-export formalities are required.`,
      { link: { href, label: "EU VAT & Intra-EU Shipping" } },
    ],
  },
  termsSection: {
    heading: "Intra-EU dispatch, VAT & zero customs duties",
    blocks: [
      `All EU orders are dispatched free of charge from our European Union logistics hub in Poland across all 27 EU Member States. All prices already include applicable EU VAT under our EU Representative ${repName} (EU VAT ID: ${vatId}). No customs duties, import taxes, or carrier clearance fees are payable on delivery. Mandatory consumer rights are not affected.`,
      { link: { href, label: "EU VAT & Intra-EU Shipping" } },
    ],
  },
}

const DE: Snippets = {
  linkLabel: "EU-MwSt. & Versand aus Polen",
  shippingDescription: `Kostenlose Lieferung in alle 27 EU-Mitgliedstaaten aus unserem EU-Logistikhub in Polen. Alle Preise inkl. MwSt. (${vatId}), ohne Zollgebühren.`,
  shippingIntro: `Diese Bedingungen gelten für Bestellungen im EU-Shop von ${COMPANY.tradingName} (Preise in EUR inkl. gesetzlicher EU-Mehrwertsteuer, kostenloser Versand aus unserem EU-Logistikhub in Polen).`,
  paymentsDescription:
    `Sichere Zahlung per Visa, Mastercard, American Express, Discover, PayPal, PayPal Später Bezahlen, Apple Pay, Google Pay, Shop Pay oder SEPA-Überweisung. Alle Preise in EUR inkl. EU-MwSt. (${vatId}).`,
  paymentsIntro: `Alle Preise im EU-Shop sind in Euro (EUR) angegeben und enthalten bereits die gesetzliche EU-Mehrwertsteuer (USt-IdNr.: ${vatId} — ${repName}). Die Lieferung in alle 27 EU-Mitgliedstaaten ist kostenlos.`,
  paymentsVat: {
    heading: "EU-Mehrwertsteuer & keine Zollgebühren",
    blocks: [
      `Alle im EU-Shop angezeigten Preise sind Endpreise in EUR und enthalten bereits die geltende EU-Mehrwertsteuer (USt-IdNr.: ${vatId}, EU-Vertreter: ${repName}, ${euRepresentativeAddress}). Da alle Bestellungen aus unserem EU-Logistikhub in Polen versandt werden, fallen bei der Lieferung weder Zölle noch Einfuhrumsatzsteuer oder Abfertigungsgebühren an.`,
      { link: { href, label: "EU-MwSt. & Versand aus Polen" } },
    ],
  },
  pricesText: `Alle Preise sind Endpreise in EUR und enthalten bereits die geltende EU-Mehrwertsteuer (USt-IdNr.: ${vatId} — ${repName}). Die Lieferung aus unserem Logistikhub in Polen in alle 27 EU-Mitgliedstaaten ist kostenlos (0,00 €). Bei Lieferung fallen keine Zoll- oder Importabgaben an.`,
  returnsSection: {
    heading: "Mehrwertsteuer bei Rücksendungen",
    blocks: [
      `Alle Preise im EU-Shop enthalten bereits die gesetzliche EU-Mehrwertsteuer (USt-IdNr.: ${vatId} — ${repName}). Bei einem Widerruf oder einer Rücksendung erstatten wir den vollen gezahlten Bruttopreis inklusive Mehrwertsteuer. Da der Versand innerhalb der EU erfolgt, sind keine Zollformalitäten für eine Wiederausfuhr erforderlich.`,
      { link: { href, label: "EU-MwSt. & Versand aus Polen" } },
    ],
  },
  termsSection: {
    heading: "Inner­gemeinschaftlicher Versand, MwSt. & kein Zoll",
    blocks: [
      `Alle EU-Bestellungen werden kostenlos aus unserem EU-Logistikhub in Polen in alle 27 EU-Mitgliedstaaten geliefert. Alle Preise enthalten bereits die gesetzliche EU-Mehrwertsteuer über unseren EU-Vertreter ${repName} (USt-IdNr.: ${vatId}). Bei Lieferung fallen weder Zölle noch Einfuhrabgaben an. Zwingende Verbraucherrechte bleiben unberührt.`,
      { link: { href, label: "EU-MwSt. & Versand aus Polen" } },
    ],
  },
}

const FR: Snippets = {
  linkLabel: "TVA UE & Livraison depuis la Pologne",
  shippingDescription: `Livraison gratuite dans les 27 États membres de l’UE depuis notre hub logistique en Pologne. Prix TTC incluant la TVA UE (${vatId}), sans droits de douane.`,
  shippingIntro: `Ces conditions s’appliquent aux commandes passées sur la boutique UE de ${COMPANY.tradingName} (prix en EUR TTC incluant la TVA UE, expédition gratuite depuis notre hub logistique en Pologne).`,
  paymentsDescription:
    `Paiement sécurisé par Visa, Mastercard, American Express, Discover, PayPal, PayPal Paiement en 4x, Apple Pay, Google Pay, Shop Pay ou virement SEPA. Tous les prix en EUR incluent la TVA UE (${vatId}).`,
  paymentsIntro: `Tous les prix de la boutique UE sont en euros (EUR) et incluent déjà la TVA UE applicable (n° de TVA intracommunautaire : ${vatId} — ${repName}). La livraison dans les 27 États membres de l’UE est gratuite.`,
  paymentsVat: {
    heading: "TVA UE incluse et aucun droit de douane",
    blocks: [
      `Tous les prix affichés sur la boutique UE sont des prix TTC en EUR incluant déjà la TVA UE applicable (n° de TVA : ${vatId}, représentant UE : ${repName}, ${euRepresentativeAddress}). Les commandes étant expédiées depuis notre hub logistique de l’Union européenne en Pologne, aucun droit de douane, aucune TVA à l’importation ni aucun frais de dédouanement ne vous est demandé à la livraison.`,
      { link: { href, label: "TVA UE & Livraison depuis la Pologne" } },
    ],
  },
  pricesText: `Tous les prix sont en EUR TTC et incluent déjà la TVA UE applicable (n° de TVA : ${vatId} — ${repName}). La livraison depuis notre hub en Pologne vers les 27 États membres de l’UE est gratuite (0,00 €). Aucun droit de douane ni frais cachés ne s’appliquent à la livraison.`,
  returnsSection: {
    heading: "TVA en cas de retour",
    blocks: [
      `Tous les prix de la boutique UE incluent déjà la TVA UE (n° de TVA : ${vatId} — ${repName}). En cas de rétractation ou de retour conforme, nous vous remboursons l’intégralité du prix TTC payé sur votre moyen de paiement initial. Les envois circulant au sein de l’UE, aucune formalité douanière de réexportation n’est nécessaire.`,
      { link: { href, label: "TVA UE & Livraison depuis la Pologne" } },
    ],
  },
  termsSection: {
    heading: "Expédition intra-UE, TVA incluse et zéro douane",
    blocks: [
      `Toutes les commandes UE sont expédiées gratuitement depuis notre hub logistique en Pologne vers les 27 États membres de l’UE. Tous les prix incluent déjà la TVA UE applicable via notre représentant UE ${repName} (n° de TVA : ${vatId}). Aucun droit de douane ni taxe d’importation n’est dû à la livraison. Les droits impératifs des consommateurs ne sont pas affectés.`,
      { link: { href, label: "TVA UE & Livraison depuis la Pologne" } },
    ],
  },
}

const IT: Snippets = {
  linkLabel: "IVA UE e spedizione dalla Polonia",
  shippingDescription: `Consegna gratuita in tutti i 27 Stati membri dell’UE dal nostro hub logistico in Polonia. Prezzi IVA UE inclusa (${vatId}), senza dazi doganali.`,
  shippingIntro: `Queste condizioni si applicano agli ordini effettuati nel negozio UE di ${COMPANY.tradingName} (prezzi in EUR IVA UE inclusa, spedizione gratuita dal nostro hub logistico in Polonia).`,
  paymentsDescription:
    `Pagamento sicuro con Visa, Mastercard, American Express, Discover, PayPal, PayPal Paga in 3 rate, Apple Pay, Google Pay, Shop Pay o bonifico SEPA. Tutti i prezzi in EUR includono l’IVA UE (${vatId}).`,
  paymentsIntro: `Tutti i prezzi del negozio UE sono in euro (EUR) e includono già l’IVA UE applicabile (Partita IVA UE: ${vatId} — ${repName}). La consegna in tutti i 27 Stati membri dell’UE è gratuita.`,
  paymentsVat: {
    heading: "IVA UE inclusa e nessun dazio doganale",
    blocks: [
      `Tutti i prezzi mostrati nel negozio UE sono prezzi finali in EUR e includono già l’IVA UE applicabile (Partita IVA UE: ${vatId}, rappresentante UE: ${repName}, ${euRepresentativeAddress}). Poiché gli ordini partono dal nostro hub logistico dell’Unione europea in Polonia, alla consegna non si applicano dazi doganali, IVA all’importazione né spese di sdoganamento.`,
      { link: { href, label: "IVA UE e spedizione dalla Polonia" } },
    ],
  },
  pricesText: `Tutti i prezzi sono in EUR e includono già l’IVA UE applicabile (Partita IVA UE: ${vatId} — ${repName}). La consegna dal nostro hub in Polonia in tutti i 27 Stati membri dell’UE è gratuita (0,00 €). Nessun dazio doganale o costo nascosto alla consegna.`,
  returnsSection: {
    heading: "IVA in caso di reso",
    blocks: [
      `Tutti i prezzi del negozio UE includono già l’IVA UE (Partita IVA UE: ${vatId} — ${repName}). In caso di recesso o reso idoneo, rimborsiamo l’intero importo pagato comprensivo di IVA sul metodo di pagamento originale. Trattandosi di spedizioni intra-UE, non è richiesta alcuna pratica doganale di riesportazione.`,
      { link: { href, label: "IVA UE e spedizione dalla Polonia" } },
    ],
  },
  termsSection: {
    heading: "Spedizione intra-UE, IVA inclusa e zero dazi",
    blocks: [
      `Tutti gli ordini UE sono spediti gratuitamente dal nostro hub logistico in Polonia verso tutti i 27 Stati membri dell’UE. Tutti i prezzi includono già l’IVA UE tramite il nostro rappresentante UE ${repName} (Partita IVA UE: ${vatId}). Alla consegna non sono dovuti dazi doganali né imposte di importazione. I diritti inderogabili dei consumatori non sono pregiudicati.`,
      { link: { href, label: "IVA UE e spedizione dalla Polonia" } },
    ],
  },
}

const ES: Snippets = {
  linkLabel: "IVA de la UE y envío desde Polonia",
  shippingDescription: `Entrega gratuita en los 27 Estados miembros de la UE desde nuestro centro logístico en Polonia. Precios con IVA de la UE incluido (${vatId}), sin aranceles.`,
  shippingIntro: `Estas condiciones se aplican a los pedidos realizados en la tienda UE de ${COMPANY.tradingName} (precios en EUR con IVA de la UE incluido y envío gratuito desde nuestro centro logístico en Polonia).`,
  paymentsDescription:
    `Pago seguro con Visa, Mastercard, American Express, Discover, PayPal, PayPal Paga después, Apple Pay, Google Pay, Shop Pay o transferencia SEPA. Todos los precios en EUR incluyen el IVA de la UE (${vatId}).`,
  paymentsIntro: `Todos los precios de la tienda UE están en euros (EUR) y ya incluyen el IVA de la UE aplicable (NIF-IVA UE: ${vatId} — ${repName}). La entrega en los 27 Estados miembros de la UE es gratuita.`,
  paymentsVat: {
    heading: "IVA de la UE incluido y sin aranceles",
    blocks: [
      `Todos los precios mostrados en la tienda UE son precios finales en EUR y ya incluyen el IVA de la UE aplicable (NIF-IVA UE: ${vatId}, representante en la UE: ${repName}, ${euRepresentativeAddress}). Como los pedidos salen desde nuestro centro logístico de la Unión Europea en Polonia, no se aplican aranceles, IVA de importación ni tasas de despacho en la entrega.`,
      { link: { href, label: "IVA de la UE y envío desde Polonia" } },
    ],
  },
  pricesText: `Todos los precios están en EUR y ya incluyen el IVA de la UE aplicable (NIF-IVA UE: ${vatId} — ${repName}). La entrega desde nuestro centro logístico en Polonia a los 27 Estados miembros de la UE es gratuita (0,00 €). Sin aranceles ni costes ocultos en la entrega.`,
  returnsSection: {
    heading: "IVA en devoluciones",
    blocks: [
      `Todos los precios de la tienda UE ya incluyen el IVA de la UE (NIF-IVA UE: ${vatId} — ${repName}). Cuando ejerces tu derecho de desistimiento o devuelves un artículo válido, reembolsamos el precio total pagado con IVA incluido a tu método de pago original. Al tratarse de envíos dentro de la UE, no se requieren trámites aduaneros de reexportación.`,
      { link: { href, label: "IVA de la UE y envío desde Polonia" } },
    ],
  },
  termsSection: {
    heading: "Envío intra-UE, IVA incluido y cero aranceles",
    blocks: [
      `Todos los pedidos de la UE se envían gratuitamente desde nuestro centro logístico en Polonia a los 27 Estados miembros de la UE. Todos los precios ya incluyen el IVA de la UE aplicable a través de nuestro representante en la UE ${repName} (NIF-IVA UE: ${vatId}). No hay aranceles ni impuestos de importación en la entrega. Los derechos imperativos de los consumidores no se ven afectados.`,
      { link: { href, label: "IVA de la UE y envío desde Polonia" } },
    ],
  },
}

const NL: Snippets = {
  linkLabel: "EU-btw & verzending vanuit Polen",
  shippingDescription: `Gratis levering in alle 27 EU-lidstaten vanuit onze EU-logistieke hub in Polen. Prijzen zijn inclusief EU-btw (${vatId}), zonder douanekosten.`,
  shippingIntro: `Deze voorwaarden gelden voor bestellingen in de EU-winkel van ${COMPANY.tradingName} (prijzen in EUR inclusief EU-btw, gratis verzonden vanuit onze EU-logistieke hub in Polen).`,
  paymentsDescription:
    `Veilig betalen met Visa, Mastercard, American Express, Discover, PayPal, PayPal Betaal later, Apple Pay, Google Pay, Shop Pay of SEPA-overschrijving. Alle prijzen in EUR zijn inclusief EU-btw (${vatId}).`,
  paymentsIntro: `Alle prijzen in de EU-winkel zijn in euro (EUR) en bevatten al de geldende EU-btw (btw-nummer: ${vatId} — ${repName}). Levering in alle 27 EU-lidstaten is gratis.`,
  paymentsVat: {
    heading: "EU-btw inbegrepen & geen invoerrechten",
    blocks: [
      `Alle getoonde prijzen in de EU-winkel zijn totaalprijzen in EUR en zijn al inclusief de geldende EU-btw (btw-nummer: ${vatId}, EU-vertegenwoordiger: ${repName}, ${euRepresentativeAddress}). Omdat bestellingen worden verzonden vanuit onze logistieke hub in de Europese Unie in Polen, betaalt u bij levering geen invoerrechten, invoer-btw of inklaringskosten.`,
      { link: { href, label: "EU-btw & verzending vanuit Polen" } },
    ],
  },
  pricesText: `Alle prijzen zijn in EUR en zijn al inclusief de geldende EU-btw (btw-nummer: ${vatId} — ${repName}). Levering vanuit onze hub in Polen naar alle 27 EU-lidstaten is gratis (€ 0,00). Er gelden geen douanekosten of verborgen toeslagen bij levering.`,
  returnsSection: {
    heading: "Btw bij retourzendingen",
    blocks: [
      `Alle prijzen in de EU-winkel zijn al inclusief EU-btw (btw-nummer: ${vatId} — ${repName}). Wanneer u gebruikmaakt van uw herroepingsrecht of een artikel retourneert, betalen wij het volledige betaalde bedrag inclusief btw terug op uw oorspronkelijke betaalmethode. Omdat zendingen binnen de EU plaatsvinden, zijn er geen douaneformaliteiten voor wederuitvoer nodig.`,
      { link: { href, label: "EU-btw & verzending vanuit Polen" } },
    ],
  },
  termsSection: {
    heading: "Intra-EU verzending, btw inbegrepen & geen douane",
    blocks: [
      `Alle EU-bestellingen worden gratis verzonden vanuit onze EU-logistieke hub in Polen naar alle 27 EU-lidstaten. Alle prijzen zijn al inclusief EU-btw via onze EU-vertegenwoordiger ${repName} (btw-nummer: ${vatId}). Bij levering zijn geen invoerrechten of inklaringskosten verschuldigd. Dwingende consumentenrechten blijven onverlet.`,
      { link: { href, label: "EU-btw & verzending vanuit Polen" } },
    ],
  },
}

export const EU_SNIPPETS: Record<string, Snippets> = { en: EN, de: DE, fr: FR, it: IT, es: ES, nl: NL }

type VatHubCopy = {
  title: string
  description: string
  intro: string
  how: { heading: string; text: string; rows: [string, string][] }
  vatEntity: { heading: string; text: string; rows: [string, string][] }
  benefits: { heading: string; items: string[]; note: string }
  invoices: { heading: string; blocks: string[] }
  returns: { heading: string; text: string }
  contact: string
}

const hours = COMPANY.hours
const contactLine = `${COMPANY.email} · ${COMPANY.phoneDisplay} (${hours})`

const COPY: Record<string, VatHubCopy> = {
  en: {
    title: EN.linkLabel,
    description: `Free delivery across all 27 EU Member States from our Poland logistics hub. All prices include EU VAT (${vatId} — ${repName}) with zero customs duties.`,
    intro: `All ${COMPANY.tradingName} EU store orders are dispatched free of charge from our European Union logistics hub in Poland. Every price displayed in EUR already includes applicable EU VAT under our EU Representative ${repName} (VAT ID: ${vatId}), so you never pay customs duties or surprise fees on delivery.`,
    how: {
      heading: "Transparent EU pricing — what you see is what you pay",
      text: "Because your order is stocked and dispatched inside the European Union customs union (Poland), there is no border customs clearance and no import duty.",
      rows: [
        ["Product price", "Shown in EUR — EU VAT already included"],
        ["Delivery to all 27 EU countries", "Free (€0.00), no minimum order value"],
        ["Dispatch hub", "European Union logistics hub in Poland"],
        ["Customs duties & import fees", "€0.00 (intra-EU free circulation)"],
        ["EU VAT ID", `${vatId} (${repName})`],
      ],
    },
    vatEntity: {
      heading: "EU VAT & EU Representative details",
      text: `EU VAT is accounted for under our appointed European Union representative:`,
      rows: [
        ["EU Representative", repName],
        ["Legal form", EU_REPRESENTATIVE.legalForm],
        ["EU VAT ID", vatId],
        ["Enterprise number (KBO/BCE)", EU_REPRESENTATIVE.enterpriseNumber],
        ["Registered address", euRepresentativeAddress],
        ["Store operator", `${COMPANY.legalName} (${COMPANY.stateOfFormation}, United States)`],
      ],
    },
    benefits: {
      heading: "What this means for your delivery",
      items: [
        "No customs clearance delays — parcels move directly within the EU single market.",
        "No import VAT or customs duty bills from the carrier at your door.",
        "Free standard delivery (€0.00) across all 27 EU Member States.",
      ],
      note: `Orders ship via our own delivery service where available, or via our EU carrier partners (${carriers}).`,
    },
    invoices: {
      heading: "VAT invoices & EU business customers (B2B)",
      blocks: [
        `You receive an order invoice by email showing the total EUR amount including EU VAT and the EU VAT ID ${vatId} (${repName}).`,
        "If you are ordering as a VAT-registered EU business and require a formal B2B invoice with your company name and valid VIES EU VAT number, email us with your order number and VAT details right after placing your order.",
      ],
    },
    returns: {
      heading: "Returns & refunds",
      text: "If you exercise your 14-day EU right of withdrawal or return a faulty item, we refund the full VAT-inclusive price you paid. Because all EU orders circulate inside the EU, no customs re-export documentation is needed.",
    },
    contact: `${repFull} · ${contactLine}`,
  },
  de: {
    title: DE.linkLabel,
    description: `Kostenlose Lieferung in alle 27 EU-Mitgliedstaaten aus unserem Logistikhub in Polen. Alle Preise inkl. EU-MwSt. (${vatId} — ${repName}), ohne Zollgebühren.`,
    intro: `Alle Bestellungen im EU-Shop von ${COMPANY.tradingName} werden kostenlos aus unserem EU-Logistikhub in Polen versandt. Jeder in EUR angezeigte Preis enthält bereits die geltende EU-Mehrwertsteuer über unseren EU-Vertreter ${repName} (USt-IdNr.: ${vatId}) — Sie zahlen bei Lieferung weder Zoll noch versteckte Gebühren.`,
    how: {
      heading: "Transparente EU-Preise — Endpreis inklusive MwSt.",
      text: "Da Ihre Bestellung innerhalb der Zollunion der Europäischen Union (Polen) lagert und versandt wird, entfällt jede Zollabfertigung und es fallen keine Einfuhrabgaben an.",
      rows: [
        ["Warenpreis", "In EUR angegeben — EU-MwSt. bereits enthalten"],
        ["Lieferung in alle 27 EU-Staaten", "Kostenlos (0,00 €), ohne Mindestbestellwert"],
        ["Versandhub", "EU-Logistikhub in Polen"],
        ["Zoll & Einfuhrabgaben", "0,00 € (innergemeinschaftlicher Warenverkehr)"],
        ["EU-USt-IdNr.", `${vatId} (${repName})`],
      ],
    },
    vatEntity: {
      heading: "Angaben zur EU-Mehrwertsteuer & EU-Vertreter",
      text: "Die EU-Umsatzsteuer wird über unseren benannten EU-Vertreter ausgewiesen:",
      rows: [
        ["EU-Vertreter", repName],
        ["Rechtsform", EU_REPRESENTATIVE.legalForm],
        ["EU-USt-IdNr.", vatId],
        ["Unternehmensnummer (KBO/BCE)", EU_REPRESENTATIVE.enterpriseNumber],
        ["Geschäftsanschrift", euRepresentativeAddress],
        ["Shop-Betreiber", `${COMPANY.legalName} (${COMPANY.stateOfFormation}, USA)`],
      ],
    },
    benefits: {
      heading: "Ihre Vorteile bei der Lieferung",
      items: [
        "Keine Verzögerungen beim Zoll — Pakete werden direkt im EU-Binnenmarkt transportiert.",
        "Keine Nachforderungen für Einfuhrumsatzsteuer oder Zoll durch den Zusteller.",
        "Kostenloser Standardversand (0,00 €) in alle 27 EU-Mitgliedstaaten.",
      ],
      note: `Der Versand erfolgt nach Möglichkeit über unseren eigenen Lieferdienst oder über unsere EU-Versandpartner (${carriers}).`,
    },
    invoices: {
      heading: "Rechnungen mit MwSt. & Geschäftskunden (B2B)",
      blocks: [
        `Sie erhalten per E-Mail eine Rechnung über den Gesamtbetrag in EUR inklusive EU-Mehrwertsteuer mit Angabe der USt-IdNr. ${vatId} (${repName}).`,
        "Wenn Sie als vorsteuerabzugsberechtigtes EU-Unternehmen bestellen und eine B2B-Rechnung mit Firmenname und gültiger USt-IdNr. (VIES) benötigen, senden Sie uns nach der Bestellung einfach Ihre Bestellnummer und Ihre Unternehmensdaten per E-Mail.",
      ],
    },
    returns: {
      heading: "Rücksendungen & Erstattungen",
      text: "Bei Ausübung Ihres 14-tägigen EU-Widerrufsrechts oder bei Reklamation erstatten wir den vollen gezahlten Preis inklusive Mehrwertsteuer. Da alle Sendungen innerhalb der EU erfolgen, sind keine Zollpapiere für die Rücksendung erforderlich.",
    },
    contact: `${repFull} · ${contactLine}`,
  },
  fr: {
    title: FR.linkLabel,
    description: `Livraison gratuite dans les 27 États membres de l’UE depuis notre hub logistique en Pologne. Prix TTC incluant la TVA UE (${vatId} — ${repName}), sans droits de douane.`,
    intro: `Toutes les commandes de la boutique UE de ${COMPANY.tradingName} sont expédiées gratuitement depuis notre hub logistique de l’Union européenne en Pologne. Chaque prix affiché en EUR inclut déjà la TVA UE applicable via notre représentant UE ${repName} (n° de TVA : ${vatId}), sans droits de douane ni frais imprévus à la livraison.`,
    how: {
      heading: "Prix transparents TTC — aucun frais caché",
      text: "Votre commande étant stockée et expédiée au sein de l’union douanière européenne (Pologne), il n’y a ni dédouanement ni droits d’importation.",
      rows: [
        ["Prix des produits", "Affiché en EUR — TVA UE déjà incluse"],
        ["Livraison dans les 27 pays de l’UE", "Gratuite (0,00 €), sans minimum d’achat"],
        ["Hub d’expédition", "Hub logistique UE en Pologne"],
        ["Droits de douane & taxes d’importation", "0,00 € (libre circulation intra-UE)"],
        ["N° de TVA intracommunautaire", `${vatId} (${repName})`],
      ],
    },
    vatEntity: {
      heading: "TVA UE & Représentant dans l’Union européenne",
      text: "La TVA UE est déclarée via notre représentant désigné dans l’Union européenne :",
      rows: [
        ["Représentant UE", repName],
        ["Forme juridique", EU_REPRESENTATIVE.legalForm],
        ["N° de TVA UE", vatId],
        ["Numéro d’entreprise (KBO/BCE)", EU_REPRESENTATIVE.enterpriseNumber],
        ["Adresse enregistrée", euRepresentativeAddress],
        ["Exploitant de la boutique", `${COMPANY.legalName} (${COMPANY.stateOfFormation}, États-Unis)`],
      ],
    },
    benefits: {
      heading: "Ce que cela change pour votre livraison",
      items: [
        "Aucun blocage ni retard en douane : vos colis circulent directement dans le marché unique européen.",
        "Aucune facture de TVA à l’importation ni frais de dédouanement à payer au livreur.",
        "Livraison standard gratuite (0,00 €) dans les 27 États membres de l’UE.",
      ],
      note: `Les commandes sont acheminées par notre propre service de livraison lorsque disponible, ou par nos transporteurs partenaires européens (${carriers}).`,
    },
    invoices: {
      heading: "Factures avec TVA & clients professionnels (B2B)",
      blocks: [
        `Vous recevez par e-mail une facture indiquant le montant total en EUR TTC incluant la TVA UE ainsi que le n° de TVA ${vatId} (${repName}).`,
        "Si vous achetez en tant qu’entreprise assujettie à la TVA dans l’UE et souhaitez une facture B2B mentionnant votre raison sociale et votre numéro de TVA intracommunautaire (VIES), envoyez-nous vos coordonnées par e-mail juste après votre commande.",
      ],
    },
    returns: {
      heading: "Retours & remboursements",
      text: "Si vous exercez votre droit de rétractation de 14 jours ou retournez un article défectueux, nous vous remboursons l’intégralité du prix TTC payé. Les envois restant au sein de l’UE, aucune formalité douanière de réexportation n’est nécessaire.",
    },
    contact: `${repFull} · ${contactLine}`,
  },
  it: {
    title: IT.linkLabel,
    description: `Consegna gratuita in tutti i 27 Stati membri dell’UE dal nostro hub logistico in Polonia. Prezzi IVA UE inclusa (${vatId} — ${repName}), zero dazi doganali.`,
    intro: `Tutti gli ordini del negozio UE di ${COMPANY.tradingName} vengono spediti gratuitamente dal nostro hub logistico dell’Unione europea in Polonia. Ogni prezzo esposto in EUR include già l’IVA UE applicabile tramite il nostro rappresentante UE ${repName} (Partita IVA UE: ${vatId}), senza dazi doganali né spese impreviste alla consegna.`,
    how: {
      heading: "Prezzi trasparenti IVA inclusa",
      text: "Poiché il tuo ordine viene stoccato e spedito all’interno dell’unione doganale europea (Polonia), non vi è alcuno sdoganamento né alcun dazio di importazione.",
      rows: [
        ["Prezzo dei prodotti", "Esposto in EUR — IVA UE già inclusa"],
        ["Consegna nei 27 paesi UE", "Gratuita (0,00 €), senza ordine minimo"],
        ["Hub di spedizione", "Hub logistico UE in Polonia"],
        ["Dazi doganali e oneri di importazione", "0,00 € (libera circolazione intra-UE)"],
        ["Partita IVA UE", `${vatId} (${repName})`],
      ],
    },
    vatEntity: {
      heading: "Dati IVA UE e Rappresentante nell’UE",
      text: "L’IVA UE è gestita tramite il nostro rappresentante designato nell’Unione europea:",
      rows: [
        ["Rappresentante UE", repName],
        ["Forma giuridica", EU_REPRESENTATIVE.legalForm],
        ["Partita IVA UE", vatId],
        ["Numero impresa (KBO/BCE)", EU_REPRESENTATIVE.enterpriseNumber],
        ["Sede legale", euRepresentativeAddress],
        ["Gestore del negozio", `${COMPANY.legalName} (${COMPANY.stateOfFormation}, Stati Uniti)`],
      ],
    },
    benefits: {
      heading: "Vantaggi per la tua consegna",
      items: [
        "Nessun ritardo doganale: i pacchi viaggiano direttamente nel mercato unico europeo.",
        "Nessuna richiesta di IVA all’importazione o commissioni doganali da parte del corriere.",
        "Spedizione standard gratuita (0,00 €) in tutti i 27 Stati membri dell’UE.",
      ],
      note: `Gli ordini vengono spediti tramite il nostro servizio di consegna ove disponibile oppure tramite i nostri corrieri partner europei (${carriers}).`,
    },
    invoices: {
      heading: "Fatture con IVA e clienti aziendali (B2B)",
      blocks: [
        `Ricevi via e-mail una fattura con l’importo totale in EUR comprensivo di IVA UE e l’indicazione della Partita IVA UE ${vatId} (${repName}).`,
        "Se acquisti come azienda UE iscritta al VIES e desideri una fattura B2B intestata alla tua società con Partita IVA, inviaci il numero d’ordine e i dati aziendali via e-mail subito dopo l’acquisto.",
      ],
    },
    returns: {
      heading: "Resi e rimborsi",
      text: "Se eserciti il diritto di recesso entro 14 giorni o restituisci un articolo difettoso, rimborsiamo l’intero importo pagato comprensivo di IVA. Poiché le spedizioni avvengono all’interno dell’UE, non occorrono pratiche doganali di riesportazione.",
    },
    contact: `${repFull} · ${contactLine}`,
  },
  es: {
    title: ES.linkLabel,
    description: `Entrega gratuita en los 27 Estados miembros de la UE desde nuestro centro logístico en Polonia. Precios con IVA de la UE incluido (${vatId} — ${repName}), sin aranceles.`,
    intro: `Todos los pedidos de la tienda UE de ${COMPANY.tradingName} se envían de forma gratuita desde nuestro centro logístico de la Unión Europea en Polonia. Cada precio mostrado en EUR ya incluye el IVA de la UE aplicable a través de nuestro representante en la UE ${repName} (NIF-IVA UE: ${vatId}), sin aranceles ni cargos sorpresa en la entrega.`,
    how: {
      heading: "Precios transparentes con IVA incluido",
      text: "Al almacenarse y expedirse tu pedido dentro de la unión aduanera de la Unión Europea (Polonia), no hay despacho de aduanas ni aranceles de importación.",
      rows: [
        ["Precio de los productos", "Mostrado en EUR — IVA de la UE ya incluido"],
        ["Entrega en los 27 países de la UE", "Gratuita (0,00 €), sin pedido mínimo"],
        ["Centro de envío", "Centro logístico UE en Polonia"],
        ["Aranceles y tasas de importación", "0,00 € (libre circulación intra-UE)"],
        ["NIF-IVA UE", `${vatId} (${repName})`],
      ],
    },
    vatEntity: {
      heading: "Datos de IVA UE y Representante en la UE",
      text: "El IVA de la UE corresponde a nuestro representante designado en la Unión Europea:",
      rows: [
        ["Representante en la UE", repName],
        ["Forma jurídica", EU_REPRESENTATIVE.legalForm],
        ["NIF-IVA UE", vatId],
        ["Número de empresa (KBO/BCE)", EU_REPRESENTATIVE.enterpriseNumber],
        ["Domicilio social", euRepresentativeAddress],
        ["Operador de la tienda", `${COMPANY.legalName} (${COMPANY.stateOfFormation}, Estados Unidos)`],
      ],
    },
    benefits: {
      heading: "Qué significa esto para tu entrega",
      items: [
        "Sin retrasos en aduanas: los paquetes circulan directamente dentro del mercado único europeo.",
        "Sin cobros de IVA de importación ni tasas de despacho por parte del transportista.",
        "Envío estándar gratuito (0,00 €) a los 27 Estados miembros de la UE.",
      ],
      note: `Enviamos con nuestro propio servicio de entrega cuando está disponible o mediante nuestros transportistas europeos asociados (${carriers}).`,
    },
    invoices: {
      heading: "Facturas con IVA y clientes profesionales (B2B)",
      blocks: [
        `Recibes por correo electrónico una factura con el importe total en EUR con IVA de la UE incluido y el NIF-IVA UE ${vatId} (${repName}).`,
        "Si compras como empresa de la UE registrada en el VIES y necesitas una factura B2B con tu razón social y NIF-IVA intracomunitario, escríbenos con tu número de pedido y datos fiscales justo después de comprar.",
      ],
    },
    returns: {
      heading: "Devoluciones y reembolsos",
      text: "Si ejerces tu derecho de desistimiento de 14 días o devuelves un artículo defectuoso, reembolsamos el importe total pagado con IVA incluido. Al ser envíos dentro de la UE, no se necesitan trámites aduaneros de reexportación.",
    },
    contact: `${repFull} · ${contactLine}`,
  },
  nl: {
    title: NL.linkLabel,
    description: `Gratis levering in alle 27 EU-lidstaten vanuit onze logistieke hub in Polen. Alle prijzen zijn inclusief EU-btw (${vatId} — ${repName}), zonder douanekosten.`,
    intro: `Alle bestellingen in de EU-winkel van ${COMPANY.tradingName} worden gratis verzonden vanuit onze logistieke hub in de Europese Unie in Polen. Elke weergegeven prijs in EUR is al inclusief de geldende EU-btw via onze EU-vertegenwoordiger ${repName} (btw-nummer: ${vatId}), zonder invoerrechten of verrassingskosten bij levering.`,
    how: {
      heading: "Transparante EU-prijzen inclusief btw",
      text: "Omdat uw bestelling wordt opgeslagen en verzonden binnen de Europese douane-unie (Polen), is er geen douaneafhandeling en betaalt u geen invoerrechten.",
      rows: [
        ["Productprijs", "Weergegeven in EUR — EU-btw al inbegrepen"],
        ["Levering in alle 27 EU-landen", "Gratis (€ 0,00), geen minimumbestelbedrag"],
        ["Verzendhub", "EU-logistieke hub in Polen"],
        ["Invoerrechten & douanekosten", "€ 0,00 (vrij verkeer binnen de EU)"],
        ["EU-btw-nummer", `${vatId} (${repName})`],
      ],
    },
    vatEntity: {
      heading: "EU-btw-gegevens & EU-vertegenwoordiger",
      text: "De EU-btw wordt vermeld onder onze aangewezen vertegenwoordiger in de Europese Unie:",
      rows: [
        ["EU-vertegenwoordiger", repName],
        ["Rechtsvorm", EU_REPRESENTATIVE.legalForm],
        ["EU-btw-nummer", vatId],
        ["Ondernemingsnummer (KBO/BCE)", EU_REPRESENTATIVE.enterpriseNumber],
        ["Geregistreerd adres", euRepresentativeAddress],
        ["Winkelbeheerder", `${COMPANY.legalName} (${COMPANY.stateOfFormation}, Verenigde Staten)`],
      ],
    },
    benefits: {
      heading: "Wat dit betekent voor uw levering",
      items: [
        "Geen douanevertragingen — pakketten reizen rechtstreeks binnen de Europese interne markt.",
        "Geen rekeningen voor invoer-btw of inklaringskosten van de vervoerder aan uw deur.",
        "Gratis standaardlevering (€ 0,00) naar alle 27 EU-lidstaten.",
      ],
      note: `Bestellingen worden verzonden via onze eigen bezorgdienst waar beschikbaar, of via onze Europese vervoerders (${carriers}).`,
    },
    invoices: {
      heading: "Btw-facturen & zakelijke klanten (B2B)",
      blocks: [
        `U ontvangt per e-mail een factuur met het totaalbedrag in EUR inclusief EU-btw en het EU-btw-nummer ${vatId} (${repName}).`,
        "Bestelt u als btw-geregistreerde EU-onderneming (VIES) en wenst u een zakelijke factuur met uw bedrijfsnaam en btw-nummer, mail ons dan direct na uw bestelling uw ordernummer en bedrijfsgegevens.",
      ],
    },
    returns: {
      heading: "Retouren & terugbetalingen",
      text: "Wanneer u gebruikmaakt van uw 14 dagen EU-herroepingsrecht of een defect artikel retourneert, betalen wij het volledige betaalde bedrag inclusief btw terug. Omdat zendingen binnen de EU blijven, zijn er geen douaneformaliteiten voor wederuitvoer nodig.",
    },
    contact: `${repFull} · ${contactLine}`,
  },
}

const CONTACT_HEADING: Record<string, string> = { en: "Contact", de: "Kontakt", fr: "Contact", it: "Contatti", es: "Contacto", nl: "Contact" }

function build(lang: string, c: VatHubCopy): PolicyDoc {
  return {
    title: c.title,
    description: c.description,
    intro: c.intro,
    sections: [
      { heading: c.how.heading, blocks: [c.how.text, { rows: c.how.rows }] },
      { heading: c.vatEntity.heading, blocks: [c.vatEntity.text, { rows: c.vatEntity.rows }] },
      { heading: c.benefits.heading, blocks: [{ list: c.benefits.items }, c.benefits.note] },
      { heading: c.invoices.heading, blocks: c.invoices.blocks },
      { heading: c.returns.heading, blocks: [c.returns.text] },
      { heading: CONTACT_HEADING[lang], blocks: [c.contact] },
    ],
  }
}

export const EU_CUSTOMS: Partial<Record<Lang, PolicyDoc>> = Object.fromEntries(
  Object.entries(COPY).map(([lang, copy]) => [lang, build(lang, copy)]),
)
