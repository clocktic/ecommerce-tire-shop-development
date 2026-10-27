import { COMPANY, EU_PRESENCE, companyAddressLine } from "@/lib/company"
import { CONSENT_MAX_AGE_DAYS } from "@/components/legal/consent"
import { POLICIES } from "@/lib/policies"
import { euDe } from "@/lib/i18n/dictionaries/de"
import type { PolicyDoc } from "@/lib/legal/types"
import { EU_SNIPPETS } from "@/lib/legal/eu-customs"

// German version of lib/legal/eu.ts. Same facts and numbers; update all EU
// language files together. Withdrawal wording follows the official model
// instructions (Directive 2011/83/EU, Annex I; Anlage 1 zu Art. 246a EGBGB).
const p = POLICIES.eu
const s = p.shipping
const r = p.returns
const t = euDe.policy
const contactLine = `${COMPANY.email} · ${COMPANY.phoneDisplay} (${euDe.company.hours})`
const seller = `${COMPANY.legalName}, ${companyAddressLine}, E-Mail ${COMPANY.email}, Telefon ${COMPANY.phoneDisplay}`
const bulky = "höchstens etwa 25 € pro Reifen oder Felge und 15 € pro Bremsenpaket"
const payments = p.paymentMethods.map((m) => (m === "SEPA bank transfer" ? "SEPA-Überweisung" : m))

const SNIP = EU_SNIPPETS.de

export const EU_POLICIES_DE: Record<string, PolicyDoc> = {
  shipping: {
    title: "Lieferbedingungen",
    description: SNIP.shippingDescription,
    intro: SNIP.shippingIntro,
    sections: [
      {
        heading: "Liefergebiet",
        blocks: [
          `Wir liefern in ${t.area}. Nicht beliefert werden ${t.exclusions}.`,
          "Reifen und Felgen können direkt an eine Werkstatt geliefert werden. Geben Sie den Namen der Werkstatt im Feld Firma an.",
        ],
      },
      {
        heading: "Kosten, Zölle und Einfuhrumsatzsteuer",
        blocks: [
          s.freeShipping ? "Die Lieferung ist bei jeder Bestellung kostenlos, ohne Mindestbestellwert." : "Die Lieferkosten werden vor Abschluss der Bestellung angezeigt.",
          t.duties,
          SNIP.paymentsVat.blocks[1],
        ],
      },
      {
        heading: "Lieferzeiten",
        blocks: [
          {
            rows: [
              ["Bestellschluss", `${s.cutoff}, Montag–Freitag`],
              ["Bearbeitungszeit", `${s.handlingDays[0]}–${s.handlingDays[1]} Werktage`],
              ["Versandlaufzeit", `${s.transitDays[0]}–${s.transitDays[1]} Werktage`],
              ["Gesamte Lieferzeit", t.days],
              ["Versanddienstleister", s.carriers.join(", ")],
              ["Versand aus", EU_PRESENCE.dispatchCountry],
            ],
          },
          "Können wir nicht innerhalb von 30 Tagen nach Ihrer Bestellung liefern und vereinbaren wir keinen späteren Termin mit Ihnen, können Sie die Bestellung stornieren und erhalten den vollen Betrag zurück.",
        ],
      },
      {
        heading: "Sendungsverfolgung",
        blocks: ["Sie erhalten eine Versandbestätigung mit Tracking-Link. Ein Satz mit vier Reifen wird meist in vier Paketen verschickt, die an unterschiedlichen Tagen ankommen können."],
      },
      {
        heading: "Beschädigte Pakete",
        blocks: [
          "Bitte prüfen Sie die Pakete bei der Lieferung und lassen Sie sichtbare Schäden nach Möglichkeit vom Zusteller vermerken. Senden Sie uns so bald wie möglich Fotos per E-Mail. Ihre gesetzlichen Rechte bleiben unberührt, wenn Sie dies nicht tun — es hilft uns lediglich bei der Reklamation gegenüber dem Versanddienstleister.",
          "Die Gefahr des Verlusts oder der Beschädigung geht erst auf Sie über, wenn Sie oder eine von Ihnen benannte Person die Ware in Besitz genommen haben.",
        ],
      },
      { heading: "Kontakt", blocks: [contactLine] },
    ],
  },

  returns: {
    title: "Widerrufsbelehrung & Rücksendung",
    description: `${r.windowDays} Tage Widerrufsrecht für Verbraucher in der EU.`,
    intro: "Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Die folgende Belehrung entspricht dem EU-Muster (Richtlinie 2011/83/EU, Anhang I).",
    sections: [
      {
        heading: "Widerrufsrecht",
        blocks: [
          `Sie haben das Recht, binnen ${r.windowDays} Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.`,
          `Die Widerrufsfrist beträgt ${r.windowDays} Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat. Haben Sie mehrere Waren bestellt, die getrennt geliefert werden, beträgt die Frist ${r.windowDays} Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter die letzte Ware in Besitz genommen haben bzw. hat.`,
          `Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (${seller}) mittels einer eindeutigen Erklärung (z. B. eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.`,
          { link: { href: "/policies/withdrawal-form", label: "Muster-Widerrufsformular" } },
          "Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.",
        ],
      },
      {
        heading: "Folgen des Widerrufs",
        blocks: [
          `Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen ${r.refundDays} Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.`,
          "Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.",
          `Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen ${r.windowDays} Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an die Adresse, die wir Ihnen mit der Rücksendenummer (RMA) per E-Mail mitteilen, zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von ${r.windowDays} Tagen absenden.`,
          r.returnShippingPaidBy === "merchant"
            ? "Wir tragen die Kosten der Rücksendung der Waren."
            : `Sie tragen die unmittelbaren Kosten der Rücksendung der Waren. Reifen, Felgen und Bremsanlagen können wegen ihrer Beschaffenheit nicht normal mit der Post zurückgesandt werden; die Kosten werden auf ${bulky} geschätzt. Auf Wunsch senden wir Ihnen ein vorfrankiertes Etikett zu diesem Preis.`,
          "Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.",
        ],
      },
      {
        heading: "Was über die Prüfung hinausgeht",
        blocks: [
          "Sie können Artikel auspacken und prüfen, wie Sie es in einem Geschäft tun würden. Folgendes geht darüber hinaus und kann die Erstattung um den Wertverlust mindern:",
          {
            list: [
              "Einen Reifen auf eine Felge montieren, befüllen oder damit fahren.",
              "Eine Felge mit angezogenen Radschrauben oder -muttern an ein Fahrzeug montieren.",
              "Bremsbeläge, Bremsscheiben oder Bremssättel einbauen oder einbremsen.",
            ],
          },
        ],
      },
      {
        heading: "Ausschlüsse",
        blocks: [
          "Das Widerrufsrecht besteht nicht bei Waren, die nach Ihren Spezifikationen angefertigt oder eindeutig auf Ihre persönlichen Bedürfnisse zugeschnitten sind (z. B. eine auf Bestellung gefertigte Felge mit individueller Oberfläche oder Bohrung). Solche Artikel sind vor der Bestellung auf der Produktseite gekennzeichnet.",
        ],
      },
      {
        heading: "So gehen Sie vor",
        blocks: [
          {
            list: [
              `Schreiben Sie an ${COMPANY.email} mit Ihrer Bestellnummer oder senden Sie das Muster-Widerrufsformular.`,
              "Wir bestätigen den Eingang Ihres Widerrufs per E-Mail und senden Ihnen die Rücksendeadresse und auf Wunsch ein vorfrankiertes Etikett.",
              "Verpacken Sie die Artikel sicher, wenn möglich in der Originalverpackung.",
            ],
          },
        ],
      },
      {
        heading: "Stornierung vor dem Versand",
        blocks: ["Bis zum Versand können Sie kostenlos stornieren — schreiben Sie uns, und wir erstatten den vollen Betrag."],
      },
      {
        heading: "Mangelhafte oder falsche Artikel",
        blocks: ["Ist ein Artikel mangelhaft oder nicht der bestellte, gelten Ihre Rechte aus der gesetzlichen Gewährleistung und wir übernehmen alle Rücksendekosten. Siehe Gewährleistung & Garantie."],
      },
      SNIP.returnsSection,
    ],
  },

  "withdrawal-form": {
    title: "Muster-Widerrufsformular",
    description: "EU-Muster-Widerrufsformular (Richtlinie 2011/83/EU, Anhang I Teil B).",
    intro: "Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück. Sie können den Text auch in eine E-Mail kopieren.",
    sections: [
      {
        heading: "Formular",
        blocks: [
          `An: ${seller}`,
          "Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*):",
          {
            rows: [
              ["Bestellt am (*) / erhalten am (*)", "________________"],
              ["Bestellnummer", "________________"],
              ["Name des/der Verbraucher(s)", "________________"],
              ["Anschrift des/der Verbraucher(s)", "________________"],
              ["Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)", "________________"],
              ["Datum", "________________"],
            ],
          },
          { note: "(*) Unzutreffendes streichen." },
        ],
      },
    ],
  },

  warranty: {
    title: "Gewährleistung & Garantie",
    description: "Gesetzliche Gewährleistung von 2 Jahren für Verbraucher in der EU sowie Herstellergarantien.",
    intro: "Als Verbraucher in der EU profitieren Sie von der gesetzlichen Gewährleistung für Waren (Richtlinie (EU) 2019/771), umgesetzt im Recht Ihres Landes.",
    sections: [
      {
        heading: "Gesetzliche Gewährleistung",
        blocks: [
          `Wir haften für jede Vertragswidrigkeit, die bei Lieferung der Waren besteht und innerhalb von ${p.warranty.months! / 12} Jahren nach Lieferung offenbar wird. Die Gewährleistung ist kostenlos.`,
          "Zeigt sich ein Mangel innerhalb des ersten Jahres nach Lieferung (in einigen Mitgliedstaaten innerhalb von zwei Jahren), wird vermutet, dass er bereits bei Lieferung bestand, sofern wir nicht das Gegenteil beweisen.",
        ],
      },
      {
        heading: "Ihre Rechte",
        blocks: [
          {
            list: [
              "Nachbesserung oder Ersatzlieferung nach Ihrer Wahl, sofern die gewählte Abhilfe nicht unmöglich oder unverhältnismäßig ist.",
              "Minderung des Preises oder Rücktritt vom Vertrag mit Erstattung, wenn Nachbesserung oder Ersatzlieferung nicht möglich ist, fehlschlägt oder unangemessen lange dauert.",
            ],
          },
          "Wir tragen alle Kosten der Mängelbeseitigung, einschließlich der Rücksendung.",
        ],
      },
      {
        heading: "Was kein Mangel ist",
        blocks: [
          "Normaler Verschleiß (Profilabrieb, Verschleiß von Belägen und Scheiben) sowie Schäden durch Durchstiche, Bordsteinkontakt, falschen Luftdruck, Überladung, unsachgemäße Montage oder Einsatz im Motorsport sind keine Vertragswidrigkeit.",
        ],
      },
      {
        heading: "Herstellergarantie",
        blocks: [
          "Viele Hersteller bieten zusätzlich eine freiwillige Garantie an. Ihre Bedingungen legt der Hersteller fest; sie sind, soweit verfügbar, auf der Produktseite verlinkt. Eine Herstellergarantie gilt zusätzlich zu Ihren gesetzlichen Gewährleistungsrechten und schränkt diese nicht ein.",
        ],
      },
      {
        heading: "So melden Sie einen Mangel",
        blocks: [`Schreiben Sie an ${COMPANY.email} mit Ihrer Bestellnummer, Fotos und einer kurzen Beschreibung (bei Reifen mit der DOT-Nummer auf der Flanke). Wir antworten innerhalb von 2 Werktagen.`],
      },
    ],
  },

  payments: {
    title: "Zahlungsarten",
    description: SNIP.paymentsDescription,
    intro: SNIP.paymentsIntro,
    sections: [
      { heading: "Akzeptierte Zahlungsarten", blocks: [{ list: payments }] },
      {
        heading: "Wann belastet wird",
        blocks: [
          "Karten- und PayPal-Zahlungen werden bei der Bestellung autorisiert und beim Versand eingezogen. Bei SEPA-Überweisung versenden wir, sobald die Zahlung eingegangen ist; die Bankverbindung finden Sie in Ihrer Bestellbestätigung.",
        ],
      },
      {
        heading: "Sicherheit",
        blocks: ["Kartenzahlungen nutzen die starke Kundenauthentifizierung (3-D Secure) gemäß der EU-Zahlungsdiensterichtlinie. Vollständige Kartennummern speichern wir nicht."],
      },
      { heading: "Keine Zuschläge", blocks: ["Für keine Zahlungsart berechnen wir eine Gebühr."] },
      SNIP.paymentsVat,
    ],
  },

  terms: {
    title: "Allgemeine Geschäftsbedingungen",
    description: `Allgemeine Geschäftsbedingungen für Käufe im EU-Shop von ${COMPANY.tradingName}.`,
    intro: `Diese Bedingungen gelten für Verträge, die über den EU-Shop von ${COMPANY.tradingName} zwischen Ihnen und ${COMPANY.legalName}, ${companyAddressLine} („wir“) geschlossen werden.`,
    sections: [
      { heading: "Verkäufer", blocks: [seller, `${COMPANY.stateOfFormation} Secretary of State: ${COMPANY.registrationNumber}`] },
      {
        heading: "Vertragsschluss",
        blocks: [
          "Die Produktdarstellungen sind eine Aufforderung zur Bestellung. Mit Klick auf „Zahlungspflichtig bestellen“ geben Sie ein verbindliches Angebot ab. Wir bestätigen den Eingang sofort per E-Mail; dies ist noch keine Annahme. Der Vertrag kommt mit unserer Versandbestätigung zustande, spätestens mit Lieferung der Ware.",
          "Vertragssprache ist die Sprache der Shop-Version, in der Sie bestellen (Deutsch, Englisch, Französisch, Italienisch, Spanisch oder Niederländisch). Wir speichern den Vertragstext und senden Ihnen die Bestelldaten und diese Bedingungen per E-Mail.",
        ],
      },
      {
        heading: "Preise",
        blocks: [SNIP.pricesText],
      },
      { heading: "Lieferung", blocks: ["Die Lieferbedingungen sind in den Lieferbedingungen geregelt."] },
      { heading: "Widerrufsrecht", blocks: [`Verbrauchern steht ein ${r.windowDays}-tägiges Widerrufsrecht zu, wie in der Widerrufsbelehrung beschrieben.`] },
      { heading: "Gewährleistung", blocks: ["Es gilt die gesetzliche Gewährleistung, wie unter Gewährleistung & Garantie beschrieben."] },
      {
        heading: "Passform und Montage",
        blocks: [
          "Bitte prüfen Sie, ob Größe, Tragfähigkeits- und Geschwindigkeitsindex, Lochkreis, Einpresstiefe und Bremsenpassung mit den Fahrzeugpapieren oder der Übereinstimmungsbescheinigung Ihres Fahrzeugs übereinstimmen. Manche Felgen und Bremskomponenten erfordern je nach Land eine Genehmigung oder Eintragung. Wir empfehlen die Montage durch eine Fachwerkstatt.",
        ],
      },
      {
        heading: "Haftung",
        blocks: [
          "Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit. Die Haftung nach dem Produkthaftungsgesetz und aus der gesetzlichen Gewährleistung bleibt unberührt. Im Übrigen ist unsere Haftung für leichte Fahrlässigkeit auf den vorhersehbaren, vertragstypischen Schaden begrenzt.",
        ],
      },
      {
        heading: "Anwendbares Recht",
        blocks: [
          `Diese Bedingungen unterliegen dem Recht des Bundesstaates ${COMPANY.stateOfFormation}, Vereinigte Staaten. Sind Sie Verbraucher, wird Ihnen durch diese Rechtswahl nicht der Schutz der zwingenden Bestimmungen des Rechts des Staates entzogen, in dem Sie Ihren gewöhnlichen Aufenthalt haben. Sie können außerdem vor den Gerichten Ihres Wohnsitzstaates klagen.`,
        ],
      },
      {
        heading: "Streitbeilegung",
        blocks: ["Bitte wenden Sie sich zuerst an uns — die meisten Anliegen lösen wir innerhalb weniger Tage. Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."],
      },
      SNIP.termsSection,
    ],
  },

  privacy: {
    title: "Datenschutzerklärung",
    description: "Wie wir personenbezogene Daten von Besuchern und Kunden in der EU verarbeiten (DSGVO).",
    intro: "Diese Erklärung beschreibt, wie wir Ihre personenbezogenen Daten nach der Datenschutz-Grundverordnung (EU) 2016/679 (DSGVO) verarbeiten, wenn Sie den EU-Shop nutzen.",
    sections: [
      {
        heading: "Verantwortlicher und EU-Vertreter",
        blocks: [
          {
            rows: [
              ["Verantwortlicher", `${COMPANY.legalName}, ${companyAddressLine}`],
              ["Kontakt", COMPANY.privacyEmail],
              ["EU-Vertreter (Art. 27 DSGVO)", `${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address}, ${EU_PRESENCE.gdprRepresentative.email}`],
            ],
          },
        ],
      },
      {
        heading: "Verarbeitete Daten, Zwecke und Rechtsgrundlagen",
        blocks: [
          {
            rows: [
              ["Bestell- und Lieferdaten (Name, Adresse, E-Mail, Telefon, Bestellinhalt)", "Vertragserfüllung — Art. 6 Abs. 1 lit. b"],
              ["Rechnungen und Buchhaltungsunterlagen", "Rechtliche Verpflichtung (Steuerrecht) — Art. 6 Abs. 1 lit. c"],
              ["Betrugsprävention und IT-Sicherheit, Server-Logs", "Berechtigte Interessen — Art. 6 Abs. 1 lit. f"],
              ["Nachrichten an den Kundenservice", "Vertrag oder berechtigte Interessen — Art. 6 Abs. 1 lit. b/f"],
              ["Analyse- und Werbe-Cookies", "Einwilligung — Art. 6 Abs. 1 lit. a"],
            ],
          },
        ],
      },
      {
        heading: "Empfänger",
        blocks: [
          "Zahlungsdienstleister, Versanddienstleister und unsere Fulfillment-Partner in den USA, Hosting- und E-Mail-Anbieter sowie — nur mit Ihrer Einwilligung — Google für Analyse und Werbung. Auftragsverarbeiter handeln auf unsere Weisung auf Grundlage von Auftragsverarbeitungsverträgen.",
        ],
      },
      {
        heading: "Übermittlung in Drittländer",
        blocks: [
          "Wir sind ein US-Unternehmen, daher werden Ihre Daten in die Vereinigten Staaten übermittelt. Grundlage ist das EU-US Data Privacy Framework, soweit der Empfänger zertifiziert ist, ansonsten die Standardvertragsklauseln der Europäischen Kommission (Art. 46 Abs. 2 lit. c DSGVO). Eine Kopie der Garantien erhalten Sie auf Anfrage.",
        ],
      },
      {
        heading: "Speicherdauer",
        blocks: [
          "Bestell- und Rechnungsdaten bewahren wir für die nach geltendem Steuer- und Handelsrecht vorgeschriebene Dauer auf (bis zu 10 Jahre). Nachrichten an den Kundenservice werden 3 Jahre nach dem letzten Kontakt gelöscht. Einwilligungsnachweise bewahren wir für die Dauer der Gültigkeit der Einwilligung zuzüglich der Verjährungsfrist auf.",
        ],
      },
      {
        heading: "Ihre Rechte",
        blocks: [
          {
            list: [
              "Auskunft (Art. 15) und Berichtigung (Art. 16)",
              "Löschung (Art. 17) und Einschränkung der Verarbeitung (Art. 18)",
              "Datenübertragbarkeit (Art. 20)",
              "Widerspruch gegen eine Verarbeitung auf Grundlage berechtigter Interessen (Art. 21)",
              "Jederzeitiger Widerruf der Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3) — über die Cookie-Einstellungen im Footer",
            ],
          },
          `Wenden Sie sich an ${COMPANY.privacyEmail} oder an unseren EU-Vertreter. Sie haben außerdem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, insbesondere in dem Mitgliedstaat Ihres Wohnsitzes.`,
        ],
      },
      { heading: "Automatisierte Entscheidungen", blocks: ["Wir treffen keine ausschließlich automatisierten Entscheidungen, die Ihnen gegenüber rechtliche Wirkung entfalten oder Sie in ähnlicher Weise erheblich beeinträchtigen."] },
      { heading: "Änderungen", blocks: ["Änderungen veröffentlichen wir auf dieser Seite mit neuem Stand."] },
    ],
  },

  cookies: {
    title: "Cookie-Richtlinie",
    description: "Welche Cookies und ähnlichen Technologien der EU-Shop verwendet und wie Sie Ihre Einwilligung verwalten.",
    intro: "Bis zu Ihrer Einwilligung setzen wir nur technisch notwendige Cookies. Sie können Ihre Wahl jederzeit über die Cookie-Einstellungen im Footer ändern.",
    sections: [
      {
        heading: "Technisch notwendig (keine Einwilligung erforderlich)",
        blocks: [
          {
            rows: [
              ["cp_market", "Speichert die gewählte Shop-Region — 12 Monate"],
              ["cp_geo", "Aus Ihrem Land abgeleitete Shop-Region — 12 Monate"],
              ["cp_lang", "Speichert die gewählte Sprache — 12 Monate"],
              ["cp-cart-eu-v1 (Local Storage)", "Speichert den Inhalt Ihres Warenkorbs — bis zum Löschen"],
              ["cp-consent-v1 (Local Storage)", `Speichert Ihre Cookie-Auswahl — ${Math.round(CONSENT_MAX_AGE_DAYS / 30.4)} Monate`],
            ],
          },
        ],
      },
      {
        heading: "Analyse (Einwilligung erforderlich)",
        blocks: [{ rows: [["_ga, _ga_<id> (Google Analytics)", "Unterscheidet Besuche für zusammengefasste Statistiken — 14 Monate"]] }],
      },
      {
        heading: "Werbung (Einwilligung erforderlich)",
        blocks: [{ rows: [["_gcl_au, _gcl_aw (Google Ads)", "Misst Conversions von Anzeigen — 90 Tage"]] }],
      },
      {
        heading: "Google Consent Mode",
        blocks: [
          "Wir verwenden Google Consent Mode v2. Bis zu Ihrer Einwilligung sind Analyse- und Werbespeicher abgelehnt und es werden keine Analyse- oder Werbe-Cookies gesetzt. Nach Ablauf wird Ihre Einwilligung erneut abgefragt.",
        ],
      },
    ],
  },

  "legal-notice": {
    title: "Impressum",
    description: "Angaben zum Betreiber des Shops.",
    intro: `Der EU-Shop von ${COMPANY.tradingName} wird betrieben von:`,
    sections: [
      {
        heading: "Betreiber",
        blocks: [
          {
            rows: [
              ["Unternehmen", COMPANY.legalName],
              ["Rechtsform", `Limited Liability Company nach dem Recht von ${COMPANY.stateOfFormation}, USA`],
              ["Registrierung", `${COMPANY.stateOfFormation} Secretary of State, Nr. ${COMPANY.registrationNumber}`],
              ["Anschrift", companyAddressLine],
              ["Vertreten durch", `${COMPANY.representative}, ${COMPANY.representativeRole}`],
              ["E-Mail", COMPANY.email],
              ["Telefon", COMPANY.phoneDisplay],
              ["Seller's permit (CDTFA)", COMPANY.sellerPermit],
            ],
          },
        ],
      },
      {
        heading: "EU-Vertreter",
        blocks: [`${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address}`],
      },
      {
        heading: "Inhaltlich verantwortlich",
        blocks: [`${COMPANY.representative}, Anschrift wie oben.`],
      },
    ],
  },
}
