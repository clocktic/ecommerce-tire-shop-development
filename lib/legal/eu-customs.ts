import { COMPANY } from "@/lib/company"
import { POLICIES } from "@/lib/policies"
import type { Lang } from "@/lib/i18n/config"
import type { PolicyDoc, PolicySection } from "@/lib/legal/types"

// EU orders are shipped from the United States on a DAP basis (Delivered at
// Place): the customer pays import VAT and any customs duty to the carrier or
// customs on delivery, and we refund the import VAT on returns. This file holds
// the full "Duties, Import VAT & Customs" page and the short fragments the other
// EU policy pages reuse, so the wording stays identical everywhere.

const r = POLICIES.eu.returns
const s = POLICIES.eu.shipping
const carriers = s.carriers.join(", ")

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
  linkLabel: "Duties, Import VAT & Customs",
  shippingDescription: `Free delivery to ${s.area} from the United States. Import duties and VAT are paid on delivery.`,
  shippingIntro: `This policy applies to orders placed in the ${COMPANY.tradingName} EU store (prices in EUR, excluding import duties and import VAT).`,
  paymentsDescription: "Pay by card, PayPal or SEPA transfer. Prices in EUR, excluding import duties and import VAT.",
  paymentsIntro: "All prices in the EU store are in euro (EUR). They do not include import VAT or customs duty, which you pay on delivery.",
  paymentsVat: {
    heading: "Import VAT and duties",
    blocks: [
      "We do not charge VAT at checkout. Import VAT and any customs duty are charged by the customs authority of the country of delivery and collected by the carrier. You pay them on delivery, and we refund the import VAT if you return the goods.",
      { link: { href, label: "Duties, Import VAT & Customs" } },
    ],
  },
  pricesText: "All prices are in EUR and exclude import VAT and customs duty, which you pay to the carrier or customs on delivery. Delivery is free. We will not charge you any other amount without telling you first.",
  returnsSection: {
    heading: "Import VAT and customs charges",
    blocks: [
      "If you paid import VAT on the returned goods, we refund it in addition to the price of the goods, on presentation of the customs receipt or carrier invoice. Customs duty is paid to the customs authority, which may refund it when the goods are re-exported; we provide the return documents it asks for.",
      { link: { href, label: "Duties, Import VAT & Customs" } },
    ],
  },
  termsSection: {
    heading: "Customs, import VAT and duties",
    blocks: [
      "Goods are shipped from the United States on a Delivered at Place (DAP) basis. You are the importer of record and pay import VAT, customs duty and any carrier clearance fee on delivery. We refund import VAT on returned goods as described on the Duties, Import VAT & Customs page. Mandatory consumer rights are not affected.",
      { link: { href, label: "Duties, Import VAT & Customs" } },
    ],
  },
}

const DE: Snippets = {
  linkLabel: "Zölle, Einfuhrumsatzsteuer & Zollabwicklung",
  shippingDescription: `Kostenlose Lieferung in ${s.area} aus den USA. Einfuhrzölle und Einfuhrumsatzsteuer zahlen Sie bei Lieferung.`,
  shippingIntro: `Diese Bedingungen gelten für Bestellungen im EU-Shop von ${COMPANY.tradingName} (Preise in EUR, ohne Einfuhrzölle und Einfuhrumsatzsteuer).`,
  paymentsDescription: "Zahlung per Karte, PayPal oder SEPA-Überweisung. Preise in EUR, ohne Einfuhrzölle und Einfuhrumsatzsteuer.",
  paymentsIntro: "Alle Preise im EU-Shop sind in Euro (EUR) angegeben. Sie enthalten weder Einfuhrumsatzsteuer noch Zoll; diese zahlen Sie bei Lieferung.",
  paymentsVat: {
    heading: "Einfuhrumsatzsteuer und Zölle",
    blocks: [
      "Wir berechnen an der Kasse keine Mehrwertsteuer. Einfuhrumsatzsteuer und etwaige Zölle werden von der Zollbehörde des Lieferlandes erhoben und vom Zusteller eingezogen. Sie zahlen sie bei Lieferung; bei einer Rücksendung erstatten wir Ihnen die Einfuhrumsatzsteuer.",
      { link: { href, label: "Zölle, Einfuhrumsatzsteuer & Zollabwicklung" } },
    ],
  },
  pricesText: "Alle Preise sind in EUR angegeben und enthalten weder Einfuhrumsatzsteuer noch Zoll, die Sie bei Lieferung an den Zusteller oder den Zoll zahlen. Die Lieferung ist kostenlos. Weitere Beträge berechnen wir Ihnen nicht, ohne Sie vorher zu informieren.",
  returnsSection: {
    heading: "Einfuhrumsatzsteuer und Zollgebühren",
    blocks: [
      "Haben Sie für die zurückgesandten Waren Einfuhrumsatzsteuer gezahlt, erstatten wir diese zusätzlich zum Kaufpreis gegen Vorlage des Zollbelegs oder der Rechnung des Zustellers. Zoll wird an die Zollbehörde gezahlt, die ihn bei einer Wiederausfuhr der Waren erstatten kann; die dafür verlangten Rücksendeunterlagen stellen wir Ihnen bereit.",
      { link: { href, label: "Zölle, Einfuhrumsatzsteuer & Zollabwicklung" } },
    ],
  },
  termsSection: {
    heading: "Zoll, Einfuhrumsatzsteuer und Abgaben",
    blocks: [
      "Die Ware wird aus den USA „geliefert benannter Ort“ (DAP) versandt. Sie sind Importeur und zahlen Einfuhrumsatzsteuer, Zoll und etwaige Abfertigungsgebühren des Zustellers bei Lieferung. Die Einfuhrumsatzsteuer auf zurückgesandte Ware erstatten wir wie auf der Seite „Zölle, Einfuhrumsatzsteuer & Zollabwicklung“ beschrieben. Zwingende Verbraucherrechte bleiben unberührt.",
      { link: { href, label: "Zölle, Einfuhrumsatzsteuer & Zollabwicklung" } },
    ],
  },
}

const FR: Snippets = {
  linkLabel: "Droits de douane, TVA à l’importation et dédouanement",
  shippingDescription: `Livraison gratuite dans ${s.area} depuis les États-Unis. Droits de douane et TVA à l’importation payés à la livraison.`,
  shippingIntro: `Ces conditions s’appliquent aux commandes passées sur la boutique UE de ${COMPANY.tradingName} (prix en EUR, hors droits de douane et TVA à l’importation).`,
  paymentsDescription: "Paiement par carte, PayPal ou virement SEPA. Prix en EUR, hors droits de douane et TVA à l’importation.",
  paymentsIntro: "Tous les prix de la boutique UE sont en euros (EUR). Ils n’incluent ni la TVA à l’importation ni les droits de douane, que vous réglez à la livraison.",
  paymentsVat: {
    heading: "TVA à l’importation et droits de douane",
    blocks: [
      "Nous ne facturons pas de TVA au paiement. La TVA à l’importation et les éventuels droits de douane sont prélevés par l’administration douanière du pays de livraison et encaissés par le transporteur. Vous les réglez à la livraison ; en cas de retour, nous vous remboursons la TVA à l’importation.",
      { link: { href, label: "Droits de douane, TVA à l’importation et dédouanement" } },
    ],
  },
  pricesText: "Tous les prix sont en EUR et excluent la TVA à l’importation et les droits de douane, que vous réglez au transporteur ou à la douane à la livraison. La livraison est gratuite. Nous ne vous facturerons aucun autre montant sans vous en informer au préalable.",
  returnsSection: {
    heading: "TVA à l’importation et frais de douane",
    blocks: [
      "Si vous avez payé la TVA à l’importation sur les biens retournés, nous la remboursons en plus du prix des biens, sur présentation du reçu de douane ou de la facture du transporteur. Les droits de douane sont versés à l’administration douanière, qui peut les rembourser lors de la réexportation des biens ; nous fournissons les documents de retour qu’elle demande.",
      { link: { href, label: "Droits de douane, TVA à l’importation et dédouanement" } },
    ],
  },
  termsSection: {
    heading: "Douane, TVA à l’importation et droits",
    blocks: [
      "Les biens sont expédiés depuis les États-Unis en « rendu au lieu de destination » (DAP). Vous êtes l’importateur et réglez à la livraison la TVA à l’importation, les droits de douane et les éventuels frais de dédouanement du transporteur. Nous remboursons la TVA à l’importation sur les biens retournés comme décrit sur la page « Droits de douane, TVA à l’importation et dédouanement ». Les droits impératifs des consommateurs ne sont pas affectés.",
      { link: { href, label: "Droits de douane, TVA à l’importation et dédouanement" } },
    ],
  },
}

const IT: Snippets = {
  linkLabel: "Dazi, IVA all’importazione e sdoganamento",
  shippingDescription: `Consegna gratuita in ${s.area} dagli Stati Uniti. Dazi e IVA all’importazione si pagano alla consegna.`,
  shippingIntro: `Queste condizioni si applicano agli ordini effettuati nel negozio UE di ${COMPANY.tradingName} (prezzi in EUR, esclusi dazi e IVA all’importazione).`,
  paymentsDescription: "Paga con carta, PayPal o bonifico SEPA. Prezzi in EUR, esclusi dazi e IVA all’importazione.",
  paymentsIntro: "Tutti i prezzi del negozio UE sono in euro (EUR). Non comprendono l’IVA all’importazione né i dazi, che paghi alla consegna.",
  paymentsVat: {
    heading: "IVA all’importazione e dazi",
    blocks: [
      "Non addebitiamo l’IVA al checkout. L’IVA all’importazione e gli eventuali dazi sono applicati dall’autorità doganale del paese di consegna e riscossi dal corriere. Li paghi alla consegna; in caso di reso ti rimborsiamo l’IVA all’importazione.",
      { link: { href, label: "Dazi, IVA all’importazione e sdoganamento" } },
    ],
  },
  pricesText: "Tutti i prezzi sono in EUR e non comprendono l’IVA all’importazione né i dazi, che paghi al corriere o alla dogana alla consegna. La consegna è gratuita. Non ti addebiteremo altri importi senza avvisarti prima.",
  returnsSection: {
    heading: "IVA all’importazione e oneri doganali",
    blocks: [
      "Se hai pagato l’IVA all’importazione sui beni restituiti, la rimborsiamo in aggiunta al prezzo dei beni, dietro presentazione della bolletta doganale o della fattura del corriere. I dazi sono versati all’autorità doganale, che può rimborsarli in caso di riesportazione dei beni; ti forniamo i documenti di reso che richiede.",
      { link: { href, label: "Dazi, IVA all’importazione e sdoganamento" } },
    ],
  },
  termsSection: {
    heading: "Dogana, IVA all’importazione e dazi",
    blocks: [
      "I beni sono spediti dagli Stati Uniti con resa «reso al luogo di destinazione» (DAP). Sei tu l’importatore e paghi alla consegna IVA all’importazione, dazi ed eventuali spese di sdoganamento del corriere. Rimborsiamo l’IVA all’importazione sui beni restituiti come descritto nella pagina «Dazi, IVA all’importazione e sdoganamento». I diritti inderogabili dei consumatori non sono pregiudicati.",
      { link: { href, label: "Dazi, IVA all’importazione e sdoganamento" } },
    ],
  },
}

const ES: Snippets = {
  linkLabel: "Aranceles, IVA de importación y trámite aduanero",
  shippingDescription: `Entrega gratuita en ${s.area} desde Estados Unidos. Aranceles e IVA de importación se pagan en la entrega.`,
  shippingIntro: `Estas condiciones se aplican a los pedidos realizados en la tienda UE de ${COMPANY.tradingName} (precios en EUR, sin aranceles ni IVA de importación).`,
  paymentsDescription: "Paga con tarjeta, PayPal o transferencia SEPA. Precios en EUR, sin aranceles ni IVA de importación.",
  paymentsIntro: "Todos los precios de la tienda UE están en euros (EUR). No incluyen el IVA de importación ni los aranceles, que pagas en la entrega.",
  paymentsVat: {
    heading: "IVA de importación y aranceles",
    blocks: [
      "No cobramos IVA al pagar. El IVA de importación y los aranceles que correspondan los fija la aduana del país de entrega y los cobra el transportista. Los pagas en la entrega; si devuelves el pedido, te reembolsamos el IVA de importación.",
      { link: { href, label: "Aranceles, IVA de importación y trámite aduanero" } },
    ],
  },
  pricesText: "Todos los precios están en EUR y no incluyen el IVA de importación ni los aranceles, que pagas al transportista o a la aduana en la entrega. La entrega es gratuita. No te cobraremos ningún otro importe sin avisarte antes.",
  returnsSection: {
    heading: "IVA de importación y gastos de aduana",
    blocks: [
      "Si pagaste IVA de importación por los bienes devueltos, te lo reembolsamos además del precio de los bienes, previa presentación del recibo de aduana o de la factura del transportista. Los aranceles se pagan a la aduana, que puede reembolsarlos si los bienes se reexportan; te facilitamos los documentos de devolución que solicita.",
      { link: { href, label: "Aranceles, IVA de importación y trámite aduanero" } },
    ],
  },
  termsSection: {
    heading: "Aduana, IVA de importación y aranceles",
    blocks: [
      "Los bienes se envían desde Estados Unidos en condiciones de «entregado en lugar convenido» (DAP). Tú eres el importador y pagas en la entrega el IVA de importación, los aranceles y las tasas de despacho del transportista. Reembolsamos el IVA de importación de los bienes devueltos según se describe en la página «Aranceles, IVA de importación y trámite aduanero». Los derechos imperativos de los consumidores no se ven afectados.",
      { link: { href, label: "Aranceles, IVA de importación y trámite aduanero" } },
    ],
  },
}

const NL: Snippets = {
  linkLabel: "Invoerrechten, invoer-btw & douane",
  shippingDescription: `Gratis levering in ${s.area} vanuit de Verenigde Staten. Invoerrechten en invoer-btw betaalt u bij levering.`,
  shippingIntro: `Deze voorwaarden gelden voor bestellingen in de EU-winkel van ${COMPANY.tradingName} (prijzen in EUR, exclusief invoerrechten en invoer-btw).`,
  paymentsDescription: "Betaal met kaart, PayPal of SEPA-overschrijving. Prijzen in EUR, exclusief invoerrechten en invoer-btw.",
  paymentsIntro: "Alle prijzen in de EU-winkel zijn in euro (EUR). Ze bevatten geen invoer-btw en geen invoerrechten; die betaalt u bij levering.",
  paymentsVat: {
    heading: "Invoer-btw en invoerrechten",
    blocks: [
      "Wij berekenen bij het afrekenen geen btw. Invoer-btw en eventuele invoerrechten worden geheven door de douane van het land van levering en geïnd door de vervoerder. U betaalt ze bij levering; bij een retour betalen wij u de invoer-btw terug.",
      { link: { href, label: "Invoerrechten, invoer-btw & douane" } },
    ],
  },
  pricesText: "Alle prijzen zijn in EUR en exclusief invoer-btw en invoerrechten, die u bij levering aan de vervoerder of de douane betaalt. Levering is gratis. Wij brengen u geen andere bedragen in rekening zonder u dat vooraf te melden.",
  returnsSection: {
    heading: "Invoer-btw en douanekosten",
    blocks: [
      "Heeft u invoer-btw betaald over de geretourneerde goederen, dan betalen wij die terug bovenop de prijs van de goederen, op vertoon van het douanebewijs of de factuur van de vervoerder. Invoerrechten worden aan de douane betaald, die ze kan terugbetalen bij wederuitvoer van de goederen; wij leveren de retourdocumenten die zij vraagt.",
      { link: { href, label: "Invoerrechten, invoer-btw & douane" } },
    ],
  },
  termsSection: {
    heading: "Douane, invoer-btw en invoerrechten",
    blocks: [
      "De goederen worden vanuit de Verenigde Staten verzonden op basis van «geleverd op bestemming» (DAP). U bent de importeur en betaalt bij levering invoer-btw, invoerrechten en eventuele afhandelingskosten van de vervoerder. Wij betalen de invoer-btw op geretourneerde goederen terug zoals beschreven op de pagina «Invoerrechten, invoer-btw & douane». Dwingende consumentenrechten blijven onverlet.",
      { link: { href, label: "Invoerrechten, invoer-btw & douane" } },
    ],
  },
}

export const EU_SNIPPETS: Record<string, Snippets> = { en: EN, de: DE, fr: FR, it: IT, es: ES, nl: NL }

type CustomsCopy = {
  title: string
  description: string
  intro: string
  how: { heading: string; text: string; rows: [string, string][] }
  pay: { heading: string; items: string[]; note: string }
  declaration: { heading: string; blocks: string[] }
  refund: { heading: string; intro: string; steps: string[]; duty: string }
  refusal: { heading: string; text: string }
  delays: { heading: string; text: string }
  invoices: { heading: string; text: string }
  contact: string
}

const hours = COMPANY.hours
const contactLine = `${COMPANY.email} · ${COMPANY.phoneDisplay} (${hours})`

const COPY: Record<string, CustomsCopy> = {
  en: {
    title: EN.linkLabel,
    description: "Orders to the EU ship from the United States. You pay import VAT and any duty on delivery, and we refund the import VAT if you return the goods.",
    intro: `${COMPANY.tradingName} EU orders are dispatched from the United States by ${COMPANY.legalName}. Because the goods enter the EU from outside, the customs authority of your country charges import VAT and, where applicable, customs duty. This page explains who pays what and how we refund import VAT.`,
    how: {
      heading: "How it works",
      text: "We sell on a Delivered at Place (DAP) basis. The price you see in EUR is the price of the goods, and delivery is free. It does not include import VAT or customs duty. These charges are set by the authorities of the country of delivery; we do not receive them and cannot change them.",
      rows: [
        ["Price of the goods", "Paid to us at checkout, in EUR"],
        ["Delivery", "Free"],
        ["Import VAT", "Paid by you on delivery, at the rate of your country"],
        ["Customs duty", "Paid by you on delivery, where applicable"],
        ["Carrier fee", "Some carriers charge a small fee for advancing the charges"],
      ],
    },
    pay: {
      heading: "What you pay on delivery",
      items: [
        "Import VAT at the standard rate of the EU country of delivery (between 17% and 27%), calculated on the value of the goods plus delivery and duty.",
        "Customs duty at the rate for the product's tariff classification (for example tyres, wheels or brake parts) and country of origin.",
        "The carrier's disbursement or clearance fee, if any.",
      ],
      note: `The exact amount is calculated by customs and the carrier at clearance, so we cannot quote it in advance. The carrier (${carriers}) contacts you by email, SMS or at the door to collect payment before or at delivery.`,
    },
    declaration: {
      heading: "Customs declaration",
      blocks: [
        "We declare the true value and description of every shipment on the commercial invoice that travels with the parcel, as the law requires. We never mark shipments as gifts or declare a lower value.",
        "Please make sure your name, address, phone number and email are correct and reachable — the carrier needs them to clear the parcel. If you buy as a business, send us your VAT number and EORI number after ordering and before dispatch so they appear on the customs documents.",
      ],
    },
    refund: {
      heading: "Refund of import VAT",
      intro: "We want a return to cost you as little as possible. If you return goods under your right of withdrawal or the legal guarantee, or the order is cancelled after delivery, we refund the import VAT you paid, in addition to the price of the goods. To receive it:",
      steps: [
        "Send us the customs receipt or the carrier invoice showing the import VAT you paid. A clear photo is enough.",
        "The refund covers the import VAT on the returned goods only, up to the amount shown on that document.",
        "You must not have reclaimed or deducted the same VAT elsewhere, for example from customs or as input VAT in a business account.",
        `We refund the VAT to your original payment method within ${r.refundDays} days after we receive the goods and the document.`,
      ],
      duty: "Customs duty is paid to the customs authority, not to us. When returned goods are re-exported, your customs office may refund the duty and VAT it collected. We give you, free of charge, the return documents it asks for: a statement and shipping papers showing that the goods were returned to the United States.",
    },
    refusal: {
      heading: "If you refuse or do not collect the parcel",
      text: "Refusing a parcel, not paying the charges or not collecting it within the carrier's holding period is not a withdrawal. The parcel is sent back to us or treated as abandoned. We then refund the price of the goods, less the return shipping and the charges we incur. To avoid this, tell us that you wish to withdraw instead. Your statutory rights are not affected.",
    },
    delays: {
      heading: "Customs delays",
      text: "Customs clearance can add one to three working days, and the delivery times in our Delivery Policy already allow for normal clearance. A customs inspection is outside our control, but the statutory 30-day delivery limit still applies and you may cancel and be refunded in full if we cannot meet it.",
    },
    invoices: {
      heading: "Invoices and receipts",
      text: "Each parcel carries a commercial invoice for customs, and we email you a sales invoice for the goods. These are not VAT invoices. Proof of the import VAT you paid is the customs receipt or carrier invoice, so please keep it — you need it for a VAT refund and, if you are a business, to deduct the VAT.",
    },
    contact: contactLine,
  },
  de: {
    title: DE.linkLabel,
    description: "Bestellungen in die EU werden aus den USA versandt. Einfuhrumsatzsteuer und Zoll zahlen Sie bei Lieferung; bei einer Rücksendung erstatten wir die Einfuhrumsatzsteuer.",
    intro: `Bestellungen im EU-Shop von ${COMPANY.tradingName} werden von ${COMPANY.legalName} aus den USA versandt. Da die Ware von außerhalb in die EU eingeführt wird, erhebt die Zollbehörde Ihres Landes Einfuhrumsatzsteuer und gegebenenfalls Zoll. Diese Seite erklärt, wer was zahlt und wie wir die Einfuhrumsatzsteuer erstatten.`,
    how: {
      heading: "So funktioniert es",
      text: "Wir verkaufen „geliefert benannter Ort“ (DAP). Der angezeigte Preis in EUR ist der Warenpreis, die Lieferung ist kostenlos. Einfuhrumsatzsteuer und Zoll sind darin nicht enthalten. Diese Abgaben setzen die Behörden des Lieferlandes fest; wir erhalten sie nicht und können sie nicht beeinflussen.",
      rows: [
        ["Warenpreis", "Zahlung an uns an der Kasse, in EUR"],
        ["Lieferung", "Kostenlos"],
        ["Einfuhrumsatzsteuer", "Zahlung durch Sie bei Lieferung, zum Satz Ihres Landes"],
        ["Zoll", "Zahlung durch Sie bei Lieferung, sofern anfallend"],
        ["Gebühr des Zustellers", "Manche Zusteller berechnen eine kleine Gebühr für die Vorauszahlung der Abgaben"],
      ],
    },
    pay: {
      heading: "Was Sie bei Lieferung zahlen",
      items: [
        "Einfuhrumsatzsteuer zum Normalsatz des Lieferlandes (zwischen 17 % und 27 %), berechnet auf Warenwert zuzüglich Lieferkosten und Zoll.",
        "Zoll nach dem Satz für die Zolltarifnummer des Produkts (z. B. Reifen, Felgen oder Bremsteile) und das Ursprungsland.",
        "Gegebenenfalls die Auslage- oder Abfertigungsgebühr des Zustellers.",
      ],
      note: `Den genauen Betrag berechnen Zoll und Zusteller bei der Abfertigung; wir können ihn vorab nicht nennen. Der Zusteller (${carriers}) kontaktiert Sie per E-Mail, SMS oder an der Haustür, um die Zahlung vor oder bei Lieferung einzuziehen.`,
    },
    declaration: {
      heading: "Zollanmeldung",
      blocks: [
        "Wir geben den tatsächlichen Wert und die Beschreibung jeder Sendung in der Handelsrechnung an, die dem Paket beiliegt, wie es das Gesetz verlangt. Wir deklarieren Sendungen nie als Geschenk und geben nie einen niedrigeren Wert an.",
        "Bitte achten Sie darauf, dass Name, Anschrift, Telefonnummer und E-Mail korrekt und erreichbar sind — der Zusteller benötigt sie zur Abfertigung. Bestellen Sie als Unternehmen, senden Sie uns nach der Bestellung und vor dem Versand Ihre USt-IdNr. und EORI-Nummer, damit sie auf den Zollpapieren erscheinen.",
      ],
    },
    refund: {
      heading: "Erstattung der Einfuhrumsatzsteuer",
      intro: "Eine Rücksendung soll Sie so wenig wie möglich kosten. Senden Sie Waren aufgrund Ihres Widerrufsrechts oder der gesetzlichen Gewährleistung zurück oder wird die Bestellung nach Lieferung storniert, erstatten wir die von Ihnen gezahlte Einfuhrumsatzsteuer zusätzlich zum Warenpreis. Dafür gilt:",
      steps: [
        "Senden Sie uns den Zollbeleg oder die Rechnung des Zustellers, aus dem die gezahlte Einfuhrumsatzsteuer hervorgeht. Ein gut lesbares Foto genügt.",
        "Erstattet wird nur die Einfuhrumsatzsteuer auf die zurückgesandten Waren, höchstens bis zu dem auf dem Beleg ausgewiesenen Betrag.",
        "Sie dürfen dieselbe Steuer nicht anderweitig zurückgefordert oder abgezogen haben, etwa beim Zoll oder als Vorsteuer in der Buchhaltung Ihres Unternehmens.",
        `Wir erstatten die Steuer innerhalb von ${r.refundDays} Tagen nach Eingang der Waren und des Belegs auf Ihr ursprüngliches Zahlungsmittel.`,
      ],
      duty: "Zoll wird an die Zollbehörde gezahlt, nicht an uns. Werden zurückgesandte Waren wieder ausgeführt, kann Ihr Zollamt Zoll und Einfuhrumsatzsteuer erstatten. Die dafür verlangten Rücksendeunterlagen stellen wir Ihnen kostenlos bereit: eine Bestätigung und Versandpapiere, die die Rücksendung in die USA belegen.",
    },
    refusal: {
      heading: "Wenn Sie das Paket verweigern oder nicht abholen",
      text: "Die Verweigerung der Annahme, die Nichtzahlung der Abgaben oder die Nichtabholung innerhalb der Lagerfrist des Zustellers ist kein Widerruf. Das Paket geht an uns zurück oder gilt als aufgegeben. Wir erstatten dann den Warenpreis abzüglich der Rücksendekosten und der uns entstandenen Abgaben. Um das zu vermeiden, teilen Sie uns stattdessen Ihren Widerruf mit. Ihre gesetzlichen Rechte bleiben unberührt.",
    },
    delays: {
      heading: "Verzögerungen beim Zoll",
      text: "Die Zollabfertigung kann ein bis drei Werktage zusätzlich dauern; die Lieferzeiten in unseren Lieferbedingungen berücksichtigen eine normale Abfertigung bereits. Eine Zollkontrolle liegt außerhalb unseres Einflusses, doch die gesetzliche Lieferfrist von 30 Tagen gilt weiter, und Sie können bei Überschreitung stornieren und erhalten den vollen Betrag zurück.",
    },
    invoices: {
      heading: "Rechnungen und Belege",
      text: "Jedem Paket liegt eine Handelsrechnung für den Zoll bei, und wir senden Ihnen eine Rechnung über die Ware per E-Mail. Dies sind keine Rechnungen mit ausgewiesener Mehrwertsteuer. Der Nachweis der gezahlten Einfuhrumsatzsteuer ist der Zollbeleg oder die Rechnung des Zustellers; bitte bewahren Sie ihn auf — Sie brauchen ihn für die Erstattung und, als Unternehmen, für den Vorsteuerabzug.",
    },
    contact: contactLine,
  },
  fr: {
    title: FR.linkLabel,
    description: "Les commandes vers l’UE sont expédiées depuis les États-Unis. Vous réglez la TVA à l’importation et les droits à la livraison ; en cas de retour, nous remboursons la TVA à l’importation.",
    intro: `Les commandes de la boutique UE de ${COMPANY.tradingName} sont expédiées depuis les États-Unis par ${COMPANY.legalName}. Les biens entrant dans l’UE depuis l’extérieur, l’administration douanière de votre pays perçoit la TVA à l’importation et, le cas échéant, des droits de douane. Cette page explique qui paie quoi et comment nous remboursons la TVA à l’importation.`,
    how: {
      heading: "Comment ça marche",
      text: "Nous vendons en « rendu au lieu de destination » (DAP). Le prix affiché en EUR est celui des biens, et la livraison est gratuite. Il n’inclut ni la TVA à l’importation ni les droits de douane. Ces montants sont fixés par les autorités du pays de livraison ; nous ne les percevons pas et ne pouvons pas les modifier.",
      rows: [
        ["Prix des biens", "Payé à nous au paiement, en EUR"],
        ["Livraison", "Gratuite"],
        ["TVA à l’importation", "Payée par vous à la livraison, au taux de votre pays"],
        ["Droits de douane", "Payés par vous à la livraison, le cas échéant"],
        ["Frais du transporteur", "Certains transporteurs facturent de petits frais pour avancer les montants"],
      ],
    },
    pay: {
      heading: "Ce que vous payez à la livraison",
      items: [
        "La TVA à l’importation au taux normal du pays de livraison (entre 17 % et 27 %), calculée sur la valeur des biens majorée de la livraison et des droits.",
        "Les droits de douane au taux de la classification tarifaire du produit (par exemple pneus, jantes ou pièces de freinage) et du pays d’origine.",
        "Les frais de débours ou de dédouanement du transporteur, le cas échéant.",
      ],
      note: `Le montant exact est calculé par la douane et le transporteur lors du dédouanement ; nous ne pouvons donc pas l’indiquer à l’avance. Le transporteur (${carriers}) vous contacte par e-mail, SMS ou à la porte pour encaisser le paiement avant ou à la livraison.`,
    },
    declaration: {
      heading: "Déclaration en douane",
      blocks: [
        "Nous déclarons la valeur réelle et la description de chaque envoi sur la facture commerciale qui accompagne le colis, comme la loi l’exige. Nous ne marquons jamais un envoi comme cadeau et ne déclarons jamais une valeur inférieure.",
        "Veillez à ce que vos nom, adresse, téléphone et e-mail soient exacts et joignables : le transporteur en a besoin pour dédouaner le colis. Si vous achetez en tant qu’entreprise, envoyez-nous votre numéro de TVA et votre numéro EORI après la commande et avant l’expédition afin qu’ils figurent sur les documents douaniers.",
      ],
    },
    refund: {
      heading: "Remboursement de la TVA à l’importation",
      intro: "Un retour doit vous coûter le moins possible. Si vous retournez des biens au titre de votre droit de rétractation ou de la garantie légale, ou si la commande est annulée après livraison, nous remboursons la TVA à l’importation que vous avez payée, en plus du prix des biens. Pour la recevoir :",
      steps: [
        "Envoyez-nous le reçu de douane ou la facture du transporteur indiquant la TVA à l’importation payée. Une photo lisible suffit.",
        "Le remboursement porte uniquement sur la TVA à l’importation des biens retournés, dans la limite du montant figurant sur ce document.",
        "Vous ne devez pas avoir réclamé ni déduit la même TVA ailleurs, par exemple auprès de la douane ou comme TVA déductible dans la comptabilité de votre entreprise.",
        `Nous remboursons la TVA sur votre moyen de paiement initial dans un délai de ${r.refundDays} jours après réception des biens et du document.`,
      ],
      duty: "Les droits de douane sont versés à l’administration douanière, pas à nous. Lorsque les biens retournés sont réexportés, votre bureau de douane peut rembourser les droits et la TVA perçus. Nous vous remettons gratuitement les documents de retour qu’il demande : une attestation et les documents d’expédition prouvant le retour des biens aux États-Unis.",
    },
    refusal: {
      heading: "Si vous refusez ou ne retirez pas le colis",
      text: "Refuser un colis, ne pas payer les frais ou ne pas le retirer dans le délai de garde du transporteur ne constitue pas une rétractation. Le colis nous est renvoyé ou considéré comme abandonné. Nous remboursons alors le prix des biens, déduction faite des frais de retour et des frais que nous supportons. Pour l’éviter, informez-nous plutôt de votre rétractation. Vos droits légaux ne sont pas affectés.",
    },
    delays: {
      heading: "Retards en douane",
      text: "Le dédouanement peut ajouter un à trois jours ouvrés, et les délais de notre politique de livraison tiennent déjà compte d’un dédouanement normal. Un contrôle douanier échappe à notre contrôle, mais le délai légal de livraison de 30 jours continue de s’appliquer et vous pouvez annuler et être remboursé intégralement si nous ne le respectons pas.",
    },
    invoices: {
      heading: "Factures et reçus",
      text: "Chaque colis contient une facture commerciale pour la douane, et nous vous envoyons par e-mail une facture de vente des biens. Il ne s’agit pas de factures de TVA. La preuve de la TVA à l’importation payée est le reçu de douane ou la facture du transporteur ; conservez-le, il vous faut pour le remboursement et, si vous êtes une entreprise, pour déduire la TVA.",
    },
    contact: contactLine,
  },
  it: {
    title: IT.linkLabel,
    description: "Gli ordini per l’UE partono dagli Stati Uniti. Paghi IVA all’importazione e dazi alla consegna; in caso di reso rimborsiamo l’IVA all’importazione.",
    intro: `Gli ordini del negozio UE di ${COMPANY.tradingName} sono spediti dagli Stati Uniti da ${COMPANY.legalName}. Poiché i beni entrano nell’UE dall’esterno, l’autorità doganale del tuo paese applica l’IVA all’importazione e, se dovuti, i dazi. Questa pagina spiega chi paga cosa e come rimborsiamo l’IVA all’importazione.`,
    how: {
      heading: "Come funziona",
      text: "Vendiamo con resa «reso al luogo di destinazione» (DAP). Il prezzo mostrato in EUR è quello dei beni e la consegna è gratuita. Non comprende l’IVA all’importazione né i dazi. Questi importi sono stabiliti dalle autorità del paese di consegna; non li riceviamo e non possiamo modificarli.",
      rows: [
        ["Prezzo dei beni", "Pagato a noi al checkout, in EUR"],
        ["Consegna", "Gratuita"],
        ["IVA all’importazione", "Pagata da te alla consegna, con l’aliquota del tuo paese"],
        ["Dazi", "Pagati da te alla consegna, se dovuti"],
        ["Commissione del corriere", "Alcuni corrieri applicano una piccola commissione per anticipare gli importi"],
      ],
    },
    pay: {
      heading: "Cosa paghi alla consegna",
      items: [
        "IVA all’importazione con l’aliquota ordinaria del paese di consegna (tra il 17% e il 27%), calcolata sul valore dei beni più consegna e dazi.",
        "Dazi secondo l’aliquota della classificazione tariffaria del prodotto (ad esempio pneumatici, cerchi o parti dei freni) e del paese di origine.",
        "L’eventuale commissione di anticipo o sdoganamento del corriere.",
      ],
      note: `L’importo esatto è calcolato da dogana e corriere allo sdoganamento, quindi non possiamo indicarlo in anticipo. Il corriere (${carriers}) ti contatta via e-mail, SMS o alla porta per incassare il pagamento prima o alla consegna.`,
    },
    declaration: {
      heading: "Dichiarazione doganale",
      blocks: [
        "Dichiariamo il valore reale e la descrizione di ogni spedizione nella fattura commerciale che accompagna il pacco, come richiede la legge. Non contrassegniamo mai le spedizioni come regalo né dichiariamo un valore inferiore.",
        "Assicurati che nome, indirizzo, telefono ed e-mail siano corretti e raggiungibili: il corriere ne ha bisogno per sdoganare il pacco. Se acquisti come azienda, inviaci partita IVA e numero EORI dopo l’ordine e prima della spedizione, così compaiono nei documenti doganali.",
      ],
    },
    refund: {
      heading: "Rimborso dell’IVA all’importazione",
      intro: "Un reso deve costarti il meno possibile. Se restituisci beni in base al diritto di recesso o alla garanzia legale, o se l’ordine è annullato dopo la consegna, rimborsiamo l’IVA all’importazione che hai pagato, oltre al prezzo dei beni. Per riceverla:",
      steps: [
        "Inviaci la bolletta doganale o la fattura del corriere che indica l’IVA all’importazione pagata. Basta una foto leggibile.",
        "Il rimborso copre solo l’IVA all’importazione sui beni restituiti, fino all’importo indicato su quel documento.",
        "Non devi aver richiesto o dedotto la stessa IVA altrove, ad esempio presso la dogana o come IVA a credito nella contabilità della tua azienda.",
        `Rimborsiamo l’IVA sul metodo di pagamento originale entro ${r.refundDays} giorni dal ricevimento dei beni e del documento.`,
      ],
      duty: "I dazi sono versati all’autorità doganale, non a noi. Quando i beni restituiti vengono riesportati, il tuo ufficio doganale può rimborsare dazi e IVA riscossi. Ti forniamo gratuitamente i documenti di reso che richiede: una dichiarazione e i documenti di spedizione che provano il ritorno dei beni negli Stati Uniti.",
    },
    refusal: {
      heading: "Se rifiuti o non ritiri il pacco",
      text: "Rifiutare un pacco, non pagare gli oneri o non ritirarlo entro il periodo di giacenza del corriere non è un recesso. Il pacco ci viene rispedito o considerato abbandonato. Rimborsiamo allora il prezzo dei beni, meno le spese di rispedizione e gli oneri che sosteniamo. Per evitarlo, comunicaci invece il tuo recesso. I tuoi diritti legali non sono pregiudicati.",
    },
    delays: {
      heading: "Ritardi doganali",
      text: "Lo sdoganamento può aggiungere da uno a tre giorni lavorativi e i tempi della nostra politica di consegna considerano già uno sdoganamento normale. Un controllo doganale è fuori dal nostro controllo, ma il termine legale di consegna di 30 giorni continua ad applicarsi e, se non lo rispettiamo, puoi annullare e ottenere il rimborso integrale.",
    },
    invoices: {
      heading: "Fatture e ricevute",
      text: "Ogni pacco contiene una fattura commerciale per la dogana e ti inviamo via e-mail una fattura di vendita dei beni. Non sono fatture con IVA. La prova dell’IVA all’importazione pagata è la bolletta doganale o la fattura del corriere: conservala, serve per il rimborso e, se sei un’azienda, per detrarre l’IVA.",
    },
    contact: contactLine,
  },
  es: {
    title: ES.linkLabel,
    description: "Los pedidos a la UE salen de Estados Unidos. Pagas el IVA de importación y los aranceles en la entrega; si devuelves el pedido, te reembolsamos el IVA de importación.",
    intro: `Los pedidos de la tienda UE de ${COMPANY.tradingName} se envían desde Estados Unidos por ${COMPANY.legalName}. Como los bienes entran en la UE desde fuera, la aduana de tu país cobra el IVA de importación y, en su caso, aranceles. Esta página explica quién paga qué y cómo reembolsamos el IVA de importación.`,
    how: {
      heading: "Cómo funciona",
      text: "Vendemos en condiciones de «entregado en lugar convenido» (DAP). El precio que ves en EUR es el de los bienes y la entrega es gratuita. No incluye el IVA de importación ni los aranceles. Estos importes los fijan las autoridades del país de entrega; no los recibimos y no podemos modificarlos.",
      rows: [
        ["Precio de los bienes", "Pagado a nosotros al finalizar la compra, en EUR"],
        ["Entrega", "Gratuita"],
        ["IVA de importación", "Lo pagas tú en la entrega, al tipo de tu país"],
        ["Aranceles", "Los pagas tú en la entrega, si corresponden"],
        ["Tarifa del transportista", "Algunos transportistas cobran una pequeña tarifa por adelantar los importes"],
      ],
    },
    pay: {
      heading: "Qué pagas en la entrega",
      items: [
        "IVA de importación al tipo general del país de entrega (entre el 17 % y el 27 %), calculado sobre el valor de los bienes más la entrega y los aranceles.",
        "Aranceles según el tipo de la clasificación arancelaria del producto (por ejemplo neumáticos, llantas o piezas de freno) y del país de origen.",
        "La tarifa de desembolso o despacho del transportista, si la hay.",
      ],
      note: `El importe exacto lo calculan la aduana y el transportista en el despacho, por lo que no podemos indicarlo de antemano. El transportista (${carriers}) te contacta por correo, SMS o en la puerta para cobrar antes o en la entrega.`,
    },
    declaration: {
      heading: "Declaración aduanera",
      blocks: [
        "Declaramos el valor real y la descripción de cada envío en la factura comercial que acompaña al paquete, como exige la ley. Nunca marcamos los envíos como regalo ni declaramos un valor inferior.",
        "Comprueba que tu nombre, dirección, teléfono y correo sean correctos y estén disponibles: el transportista los necesita para despachar el paquete. Si compras como empresa, envíanos tu número de IVA y tu número EORI tras el pedido y antes del envío para que figuren en los documentos aduaneros.",
      ],
    },
    refund: {
      heading: "Reembolso del IVA de importación",
      intro: "Queremos que una devolución te cueste lo mínimo. Si devuelves bienes por tu derecho de desistimiento o por la garantía legal, o si el pedido se cancela tras la entrega, te reembolsamos el IVA de importación que pagaste, además del precio de los bienes. Para recibirlo:",
      steps: [
        "Envíanos el recibo de aduana o la factura del transportista donde figure el IVA de importación pagado. Basta una foto legible.",
        "El reembolso cubre solo el IVA de importación de los bienes devueltos, hasta el importe que figura en ese documento.",
        "No debes haber reclamado ni deducido el mismo IVA en otro lugar, por ejemplo ante la aduana o como IVA soportado en la contabilidad de tu empresa.",
        `Reembolsamos el IVA en tu medio de pago original en un plazo de ${r.refundDays} días desde que recibimos los bienes y el documento.`,
      ],
      duty: "Los aranceles se pagan a la aduana, no a nosotros. Cuando los bienes devueltos se reexportan, tu oficina de aduanas puede reembolsar los aranceles y el IVA cobrados. Te facilitamos gratis los documentos de devolución que solicita: una declaración y los documentos de envío que acreditan que los bienes volvieron a Estados Unidos.",
    },
    refusal: {
      heading: "Si rechazas o no recoges el paquete",
      text: "Rechazar un paquete, no pagar los cargos o no recogerlo en el plazo de custodia del transportista no es un desistimiento. El paquete se nos devuelve o se considera abandonado. Entonces reembolsamos el precio de los bienes, menos los gastos de devolución y los cargos que asumamos. Para evitarlo, comunícanos tu desistimiento. Tus derechos legales no se ven afectados.",
    },
    delays: {
      heading: "Retrasos en aduana",
      text: "El despacho aduanero puede añadir de uno a tres días laborables, y los plazos de nuestra política de entrega ya contemplan un despacho normal. Una inspección aduanera escapa a nuestro control, pero el plazo legal de entrega de 30 días sigue vigente y, si no lo cumplimos, puedes cancelar y recibir el reembolso íntegro.",
    },
    invoices: {
      heading: "Facturas y recibos",
      text: "Cada paquete lleva una factura comercial para la aduana y te enviamos por correo una factura de venta de los bienes. No son facturas con IVA. La prueba del IVA de importación pagado es el recibo de aduana o la factura del transportista; consérvalo, lo necesitas para el reembolso y, si eres empresa, para deducir el IVA.",
    },
    contact: contactLine,
  },
  nl: {
    title: NL.linkLabel,
    description: "Bestellingen naar de EU worden vanuit de Verenigde Staten verzonden. U betaalt invoer-btw en invoerrechten bij levering; bij een retour betalen wij de invoer-btw terug.",
    intro: `Bestellingen in de EU-winkel van ${COMPANY.tradingName} worden door ${COMPANY.legalName} vanuit de Verenigde Staten verzonden. Omdat de goederen van buiten de EU binnenkomen, heft de douane van uw land invoer-btw en, indien van toepassing, invoerrechten. Deze pagina legt uit wie wat betaalt en hoe wij de invoer-btw terugbetalen.`,
    how: {
      heading: "Zo werkt het",
      text: "Wij verkopen op basis van «geleverd op bestemming» (DAP). De getoonde prijs in EUR is de prijs van de goederen en levering is gratis. Invoer-btw en invoerrechten zijn niet inbegrepen. Deze bedragen worden vastgesteld door de autoriteiten van het land van levering; wij ontvangen ze niet en kunnen ze niet wijzigen.",
      rows: [
        ["Prijs van de goederen", "Aan ons betaald bij het afrekenen, in EUR"],
        ["Levering", "Gratis"],
        ["Invoer-btw", "Door u betaald bij levering, tegen het tarief van uw land"],
        ["Invoerrechten", "Door u betaald bij levering, indien van toepassing"],
        ["Kosten van de vervoerder", "Sommige vervoerders rekenen een kleine vergoeding voor het voorschieten van de bedragen"],
      ],
    },
    pay: {
      heading: "Wat u bij levering betaalt",
      items: [
        "Invoer-btw tegen het algemene tarief van het land van levering (tussen 17% en 27%), berekend over de waarde van de goederen plus levering en invoerrechten.",
        "Invoerrechten volgens het tarief van de tariefindeling van het product (bijvoorbeeld banden, velgen of remonderdelen) en het land van oorsprong.",
        "Eventuele voorschot- of afhandelingskosten van de vervoerder.",
      ],
      note: `Het exacte bedrag wordt bij de afhandeling berekend door de douane en de vervoerder, dus wij kunnen het vooraf niet noemen. De vervoerder (${carriers}) neemt per e-mail, sms of aan de deur contact met u op om de betaling vóór of bij levering te innen.`,
    },
    declaration: {
      heading: "Douaneaangifte",
      blocks: [
        "Wij vermelden de werkelijke waarde en omschrijving van elke zending op de handelsfactuur die bij het pakket zit, zoals de wet vereist. Wij markeren zendingen nooit als cadeau en geven nooit een lagere waarde aan.",
        "Zorg dat uw naam, adres, telefoonnummer en e-mailadres juist en bereikbaar zijn — de vervoerder heeft ze nodig om het pakket te verwerken. Koopt u als bedrijf, stuur ons dan na de bestelling en vóór verzending uw btw-nummer en EORI-nummer, zodat ze op de douanedocumenten komen.",
      ],
    },
    refund: {
      heading: "Terugbetaling van invoer-btw",
      intro: "Een retour mag u zo min mogelijk kosten. Stuurt u goederen terug op grond van uw herroepingsrecht of de wettelijke garantie, of wordt de bestelling na levering geannuleerd, dan betalen wij de door u betaalde invoer-btw terug, bovenop de prijs van de goederen. Om die te ontvangen:",
      steps: [
        "Stuur ons het douanebewijs of de factuur van de vervoerder waarop de betaalde invoer-btw staat. Een duidelijke foto volstaat.",
        "De terugbetaling betreft alleen de invoer-btw over de geretourneerde goederen, tot het bedrag op dat document.",
        "U mag dezelfde btw niet elders hebben teruggevraagd of afgetrokken, bijvoorbeeld bij de douane of als voorbelasting in de boekhouding van uw bedrijf.",
        `Wij betalen de btw binnen ${r.refundDays} dagen na ontvangst van de goederen en het document terug via uw oorspronkelijke betaalmethode.`,
      ],
      duty: "Invoerrechten worden aan de douane betaald, niet aan ons. Worden geretourneerde goederen opnieuw uitgevoerd, dan kan uw douanekantoor de geheven rechten en btw terugbetalen. De retourdocumenten die het daarvoor vraagt leveren wij gratis: een verklaring en verzenddocumenten die aantonen dat de goederen naar de Verenigde Staten zijn teruggestuurd.",
    },
    refusal: {
      heading: "Als u het pakket weigert of niet ophaalt",
      text: "Het weigeren van een pakket, het niet betalen van de kosten of het niet ophalen binnen de bewaartermijn van de vervoerder is geen herroeping. Het pakket gaat terug naar ons of geldt als achtergelaten. Wij betalen dan de prijs van de goederen terug, min de retourkosten en de kosten die wij maken. Om dit te voorkomen, meldt u ons liever uw herroeping. Uw wettelijke rechten blijven onverlet.",
    },
    delays: {
      heading: "Vertraging bij de douane",
      text: "Douaneafhandeling kan één tot drie werkdagen extra duren; de levertijden in ons leveringsbeleid houden al rekening met een normale afhandeling. Een douanecontrole valt buiten onze invloed, maar de wettelijke leveringstermijn van 30 dagen blijft gelden en u kunt annuleren en het volledige bedrag terugkrijgen als wij die niet halen.",
    },
    invoices: {
      heading: "Facturen en bewijzen",
      text: "Elk pakket bevat een handelsfactuur voor de douane en wij mailen u een verkoopfactuur voor de goederen. Dit zijn geen btw-facturen. Het bewijs van de betaalde invoer-btw is het douanebewijs of de factuur van de vervoerder; bewaar het goed — u hebt het nodig voor de terugbetaling en, als bedrijf, om de btw af te trekken.",
    },
    contact: contactLine,
  },
}

const CONTACT_HEADING: Record<string, string> = { en: "Contact", de: "Kontakt", fr: "Contact", it: "Contatti", es: "Contacto", nl: "Contact" }

function build(lang: string, c: CustomsCopy): PolicyDoc {
  return {
    title: c.title,
    description: c.description,
    intro: c.intro,
    sections: [
      { heading: c.how.heading, blocks: [c.how.text, { rows: c.how.rows }] },
      { heading: c.pay.heading, blocks: [{ list: c.pay.items }, c.pay.note] },
      { heading: c.declaration.heading, blocks: c.declaration.blocks },
      { heading: c.refund.heading, blocks: [c.refund.intro, { list: c.refund.steps }, c.refund.duty] },
      { heading: c.refusal.heading, blocks: [c.refusal.text] },
      { heading: c.delays.heading, blocks: [c.delays.text] },
      { heading: c.invoices.heading, blocks: [c.invoices.text] },
      { heading: CONTACT_HEADING[lang], blocks: [c.contact] },
    ],
  }
}

export const EU_CUSTOMS: Partial<Record<Lang, PolicyDoc>> = Object.fromEntries(
  Object.entries(COPY).map(([lang, copy]) => [lang, build(lang, copy)]),
)
