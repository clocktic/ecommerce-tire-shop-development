import type { ContentLang } from "@/lib/i18n/config"

export const SEPA_BANK_DETAILS = {
  iban: "NL39CLRB0035798454",
  ibanFormatted: "NL39 CLRB 0035 7984 54",
  beneficiary: "NOVATECH SYSTEMS SIA",
  bank: "CLEARBANK EUROPE N.V.",
  bic: "CLRBNL2A007",
  currency: "EUR",
} as const

export const SEPA_NOTE_TAG = "sepa_bank_transfer"
export const SEPA_REPORTED_PREFIX = "sepa_transfer_reported:"

export function buildOrderNotes(parts: Array<string | null | undefined>): string | null {
  const cleaned = parts.map((p) => p?.trim()).filter(Boolean) as string[]
  return cleaned.length > 0 ? cleaned.join(";") : null
}

export function hasSepaBankTransfer(notes: string | null | undefined): boolean {
  if (!notes) return false
  return notes.split(";").some((part) => part.trim() === SEPA_NOTE_TAG)
}

export function getSepaReportedAt(notes: string | null | undefined): string | null {
  if (!notes) return null
  for (const part of notes.split(";")) {
    const trimmed = part.trim()
    if (trimmed.startsWith(SEPA_REPORTED_PREFIX)) {
      const value = trimmed.slice(SEPA_REPORTED_PREFIX.length).trim()
      return value || null
    }
  }
  return null
}

export function appendSepaReportedNote(notes: string | null | undefined, isoTimestamp: string): string {
  const existing = (notes ?? "")
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
  if (!existing.includes(SEPA_NOTE_TAG)) {
    existing.push(SEPA_NOTE_TAG)
  }
  const withoutOld = existing.filter((p) => !p.startsWith(SEPA_REPORTED_PREFIX))
  withoutOld.push(`${SEPA_REPORTED_PREFIX}${isoTimestamp}`)
  return withoutOld.join(";")
}

export interface SepaCopy {
  title: string
  subtitle: string
  checkoutCta: string
  checkoutNote: string
  detailsHeading: string
  beneficiaryLabel: string
  ibanLabel: string
  bankLabel: string
  bicLabel: string
  amountLabel: string
  referenceLabel: string
  referenceHint: string
  copyLabel: string
  copiedLabel: string
  iHavePaidButton: string
  iHavePaidSending: string
  iHavePaidHint: string
  senderNotePlaceholder: string
  reportedTitle: string
  reportedBody: string
  errorMessage: string
}

const SEPA_COPY: Record<ContentLang, SepaCopy> = {
  en: {
    title: "SEPA Bank Transfer",
    subtitle: "Direct EUR bank transfer across Europe — 0% fee",
    checkoutCta: "Place order & pay via SEPA",
    checkoutNote: "Your order is reserved immediately. Transfer details and your payment reference appear on the next screen.",
    detailsHeading: "SEPA transfer details",
    beneficiaryLabel: "Beneficiary",
    ibanLabel: "IBAN",
    bankLabel: "Bank",
    bicLabel: "BIC / SWIFT",
    amountLabel: "Amount",
    referenceLabel: "Payment reference",
    referenceHint: "Include your order number as the transfer reference so we can match your payment immediately.",
    copyLabel: "Copy",
    copiedLabel: "Copied",
    iHavePaidButton: "I have paid",
    iHavePaidSending: "Sending confirmation…",
    iHavePaidHint: "Already sent the transfer from your bank? Click below to notify our team right away.",
    senderNotePlaceholder: "Optional: sender name or transfer reference",
    reportedTitle: "Transfer notification received",
    reportedBody: "Thank you! Our team has been notified that you sent the SEPA transfer. We will verify the incoming payment and confirm your order by email.",
    errorMessage: "Could not send confirmation. Please try again or email info@tiresshop.net.",
  },
  de: {
    title: "SEPA-Überweisung",
    subtitle: "Direkte EUR-Banküberweisung in Europa — 0 % Gebühren",
    checkoutCta: "Bestellung aufgeben & per SEPA zahlen",
    checkoutNote: "Ihre Bestellung wird sofort reserviert. Die Bankdaten und der Verwendungszweck erscheinen im nächsten Schritt.",
    detailsHeading: "SEPA-Bankverbindung",
    beneficiaryLabel: "Empfänger",
    ibanLabel: "IBAN",
    bankLabel: "Bank",
    bicLabel: "BIC / SWIFT",
    amountLabel: "Betrag",
    referenceLabel: "Verwendungszweck",
    referenceHint: "Geben Sie Ihre Bestellnummer im Verwendungszweck an, damit wir Ihre Zahlung sofort zuordnen können.",
    copyLabel: "Kopieren",
    copiedLabel: "Kopiert",
    iHavePaidButton: "Ich habe bezahlt",
    iHavePaidSending: "Bestätigung wird gesendet…",
    iHavePaidHint: "Haben Sie die Überweisung bereits ausgeführt? Klicken Sie unten, um unser Team sofort zu benachrichtigen.",
    senderNotePlaceholder: "Optional: Name des Kontoinhabers oder Hinweis",
    reportedTitle: "Zahlungsmeldung erhalten",
    reportedBody: "Vielen Dank! Unser Team wurde über Ihre SEPA-Überweisung informiert. Wir prüfen den Zahlungseingang und bestätigen Ihre Bestellung per E-Mail.",
    errorMessage: "Bestätigung konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie an info@tiresshop.net.",
  },
  fr: {
    title: "Virement bancaire SEPA",
    subtitle: "Virement direct en EUR en Europe — 0 % de frais",
    checkoutCta: "Commander et payer par SEPA",
    checkoutNote: "Votre commande est réservée immédiatement. Les coordonnées bancaires et votre référence apparaîtront à l'étape suivante.",
    detailsHeading: "Coordonnées bancaires SEPA",
    beneficiaryLabel: "Bénéficiaire",
    ibanLabel: "IBAN",
    bankLabel: "Banque",
    bicLabel: "BIC / SWIFT",
    amountLabel: "Montant",
    referenceLabel: "Référence du virement",
    referenceHint: "Indiquez votre numéro de commande en référence afin que nous puissions identifier votre virement rapidement.",
    copyLabel: "Copier",
    copiedLabel: "Copié",
    iHavePaidButton: "J'ai payé",
    iHavePaidSending: "Envoi en cours…",
    iHavePaidHint: "Vous avez déjà effectué le virement ? Cliquez ci-dessous pour prévenir notre équipe immédiatement.",
    senderNotePlaceholder: "Facultatif : nom de l'émetteur ou référence",
    reportedTitle: "Notification de virement reçue",
    reportedBody: "Merci ! Notre équipe a été informée de votre virement SEPA. Nous vérifierons la réception des fonds et confirmerons votre commande par e-mail.",
    errorMessage: "Impossible d'envoyer la confirmation. Veuillez réessayer ou écrire à info@tiresshop.net.",
  },
  it: {
    title: "Bonifico bancario SEPA",
    subtitle: "Bonifico diretto in EUR in Europa — 0% commissioni",
    checkoutCta: "Ordina e paga con SEPA",
    checkoutNote: "Il tuo ordine viene riservato subito. Le coordinate bancarie e la causale appariranno nella schermata successiva.",
    detailsHeading: "Coordinate bancarie SEPA",
    beneficiaryLabel: "Beneficiario",
    ibanLabel: "IBAN",
    bankLabel: "Banca",
    bicLabel: "BIC / SWIFT",
    amountLabel: "Importo",
    referenceLabel: "Causale di pagamento",
    referenceHint: "Inserisci il numero d'ordine nella causale per consentirci di associare subito il pagamento.",
    copyLabel: "Copia",
    copiedLabel: "Copiato",
    iHavePaidButton: "Ho pagato",
    iHavePaidSending: "Invio conferma…",
    iHavePaidHint: "Hai già effettuato il bonifico? Clicca qui sotto per avvisare subito il nostro team.",
    senderNotePlaceholder: "Facoltativo: nome ordinante o nota bonifico",
    reportedTitle: "Notifica di bonifico ricevuta",
    reportedBody: "Grazie! Il nostro team è stato avvisato del tuo bonifico SEPA. Verificheremo l'accredito e confermeremo l'ordine via e-mail.",
    errorMessage: "Impossibile inviare la conferma. Riprova o scrivi a info@tiresshop.net.",
  },
  es: {
    title: "Transferencia bancaria SEPA",
    subtitle: "Transferencia directa en EUR en Europa — 0 % comisión",
    checkoutCta: "Realizar pedido y pagar por SEPA",
    checkoutNote: "Tu pedido queda reservado al instante. Los datos bancarios y el concepto aparecerán en el siguiente paso.",
    detailsHeading: "Datos bancarios SEPA",
    beneficiaryLabel: "Beneficiario",
    ibanLabel: "IBAN",
    bankLabel: "Banco",
    bicLabel: "BIC / SWIFT",
    amountLabel: "Importe",
    referenceLabel: "Concepto de pago",
    referenceHint: "Incluye tu número de pedido en el concepto para que podamos verificar el pago de inmediato.",
    copyLabel: "Copiar",
    copiedLabel: "Copiado",
    iHavePaidButton: "Ya he pagado",
    iHavePaidSending: "Enviando confirmación…",
    iHavePaidHint: "¿Ya enviaste la transferencia desde tu banco? Haz clic abajo para avisar a nuestro equipo al instante.",
    senderNotePlaceholder: "Opcional: nombre del titular o referencia",
    reportedTitle: "Aviso de transferencia recibido",
    reportedBody: "¡Gracias! Hemos avisado a nuestro equipo de tu transferencia SEPA. Comprobaremos el ingreso y confirmaremos tu pedido por correo.",
    errorMessage: "No se pudo enviar la confirmación. Inténtalo de nuevo o escribe a info@tiresshop.net.",
  },
  "es-419": {
    title: "Transferencia bancaria SEPA",
    subtitle: "Transferencia directa en EUR en Europa — 0 % comisión",
    checkoutCta: "Realizar pedido y pagar por SEPA",
    checkoutNote: "Tu pedido queda reservado al instante. Los datos bancarios y el concepto aparecerán en el siguiente paso.",
    detailsHeading: "Datos bancarios SEPA",
    beneficiaryLabel: "Beneficiario",
    ibanLabel: "IBAN",
    bankLabel: "Banco",
    bicLabel: "BIC / SWIFT",
    amountLabel: "Importe",
    referenceLabel: "Concepto de pago",
    referenceHint: "Incluye tu número de pedido en el concepto para que podamos verificar el pago de inmediato.",
    copyLabel: "Copiar",
    copiedLabel: "Copiado",
    iHavePaidButton: "Ya he pagado",
    iHavePaidSending: "Enviando confirmación…",
    iHavePaidHint: "¿Ya enviaste la transferencia desde tu banco? Haz clic abajo para avisar a nuestro equipo al instante.",
    senderNotePlaceholder: "Opcional: nombre del titular o referencia",
    reportedTitle: "Aviso de transferencia recibido",
    reportedBody: "¡Gracias! Hemos avisado a nuestro equipo de tu transferencia SEPA. Comprobaremos el ingreso y confirmaremos tu pedido por correo.",
    errorMessage: "No se pudo enviar la confirmación. Inténtalo de nuevo o escribe a info@tiresshop.net.",
  },
  nl: {
    title: "SEPA-bankoverschrijving",
    subtitle: "Directe EUR-overschrijving binnen Europa — 0% kosten",
    checkoutCta: "Bestelling plaatsen & betalen via SEPA",
    checkoutNote: "Je bestelling wordt direct gereserveerd. De bankgegevens en betalingskenmerk verschijnen op het volgende scherm.",
    detailsHeading: "SEPA-bankgegevens",
    beneficiaryLabel: "Begunstigde",
    ibanLabel: "IBAN",
    bankLabel: "Bank",
    bicLabel: "BIC / SWIFT",
    amountLabel: "Bedrag",
    referenceLabel: "Betalingskenmerk",
    referenceHint: "Vermeld je bestelnummer als betalingskenmerk zodat we je betaling direct kunnen koppelen.",
    copyLabel: "Kopiëren",
    copiedLabel: "Gekopieerd",
    iHavePaidButton: "Ik heb betaald",
    iHavePaidSending: "Bevestiging verzenden…",
    iHavePaidHint: "Heb je de overschrijving al verzonden? Klik hieronder om ons team direct op de hoogte te brengen.",
    senderNotePlaceholder: "Optioneel: naam afzender of opmerking",
    reportedTitle: "Betalingsmelding ontvangen",
    reportedBody: "Bedankt! Ons team is op de hoogte gebracht van je SEPA-overschrijving. We controleren de ontvangst en bevestigen je bestelling per e-mail.",
    errorMessage: "Kon de bevestiging niet verzenden. Probeer het opnieuw of mail naar info@tiresshop.net.",
  },
}

export function getSepaCopy(lang: string): SepaCopy {
  return SEPA_COPY[lang as ContentLang] ?? SEPA_COPY.en
}
