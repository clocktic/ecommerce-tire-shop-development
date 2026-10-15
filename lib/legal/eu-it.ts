import { COMPANY, EU_PRESENCE, companyAddressLine } from "@/lib/company"
import { CONSENT_MAX_AGE_DAYS } from "@/components/legal/consent"
import { POLICIES } from "@/lib/policies"
import { euIt } from "@/lib/i18n/dictionaries/it"
import type { PolicyDoc } from "@/lib/legal/types"

// Italian version of lib/legal/eu.ts. Same facts and numbers; update all EU
// language files together. Withdrawal wording follows the official model
// (Direttiva 2011/83/UE, allegato I).
const p = POLICIES.eu
const s = p.shipping
const r = p.returns
const t = euIt.policy
const contactLine = `${COMPANY.email} · ${COMPANY.phoneDisplay} (${euIt.company.hours})`
const seller = `${COMPANY.legalName}, ${companyAddressLine}, e-mail ${COMPANY.email}, telefono ${COMPANY.phoneDisplay}`
const bulky = "al massimo circa 25 € per pneumatico o cerchio e 15 € per collo di freni"
const payments = p.paymentMethods.map((m) => (m === "SEPA bank transfer" ? "Bonifico SEPA" : m))

export const EU_POLICIES_IT: Record<string, PolicyDoc> = {
  shipping: {
    title: "Condizioni di consegna",
    description: `Consegna gratuita in ${t.area}. IVA inclusa, nessun dazio. ${t.days}.`,
    intro: `Queste condizioni si applicano agli ordini effettuati nel negozio UE di ${COMPANY.tradingName} (prezzi in EUR, IVA inclusa).`,
    sections: [
      {
        heading: "Area di consegna",
        blocks: [
          `Consegniamo in ${t.area}. Non consegniamo in ${t.exclusions}.`,
          "Puoi far consegnare pneumatici e cerchi direttamente a un centro di montaggio. Inserisci il nome del centro nel campo Azienda.",
        ],
      },
      {
        heading: "Costi, IVA e dogana",
        blocks: [
          s.freeShipping ? "La consegna è gratuita per ogni ordine, senza importo minimo." : "I costi di consegna vengono mostrati prima della conferma dell’ordine.",
          `${t.duties} I prezzi includono l’IVA del tuo paese, riscossa tramite lo sportello unico dell’UE (OSS).`,
        ],
      },
      {
        heading: "Tempi di consegna",
        blocks: [
          {
            rows: [
              ["Orario limite per l’ordine", `${s.cutoff}, dal lunedì al venerdì`],
              ["Tempo di preparazione", `${s.handlingDays[0]}–${s.handlingDays[1]} giorni lavorativi`],
              ["Tempo di trasporto", `${s.transitDays[0]}–${s.transitDays[1]} giorni lavorativi`],
              ["Tempo totale di consegna", t.days],
              ["Corrieri", s.carriers.join(", ")],
              ["Spedito da", EU_PRESENCE.warehouseCountry],
            ],
          },
          "Se non possiamo consegnare entro 30 giorni dall’ordine e non concordiamo con te una data successiva, puoi annullare l’ordine e ricevere il rimborso completo.",
        ],
      },
      {
        heading: "Tracciamento",
        blocks: ["Riceverai un’e-mail di spedizione con il link di tracciamento. Un treno di quattro pneumatici viene di solito spedito in quattro colli, che possono arrivare in giorni diversi."],
      },
      {
        heading: "Colli danneggiati",
        blocks: [
          "Controlla i colli alla consegna e, se possibile, fai annotare al corriere eventuali danni visibili. Inviaci delle foto via e-mail il prima possibile. I tuoi diritti di legge non sono pregiudicati se non lo fai: ci aiuta solo a presentare reclamo al corriere.",
          "Il rischio di perdita o danneggiamento passa a te solo nel momento in cui tu, o una persona da te indicata, entri in possesso materiale dei beni.",
        ],
      },
      { heading: "Contatti", blocks: [contactLine] },
    ],
  },

  returns: {
    title: "Diritto di recesso e resi",
    description: `Diritto di recesso di ${r.windowDays} giorni per i consumatori nell’UE.`,
    intro: "Se sei un consumatore, hai un diritto di recesso previsto dalla legge. Le informazioni seguenti seguono il modello UE (Direttiva 2011/83/UE, allegato I).",
    sections: [
      {
        heading: "Diritto di recesso",
        blocks: [
          `Hai il diritto di recedere dal contratto, senza indicarne le ragioni, entro ${r.windowDays} giorni.`,
          `Il periodo di recesso scade dopo ${r.windowDays} giorni dal giorno in cui tu o un terzo, diverso dal vettore e da te designato, acquisisci il possesso fisico dei beni. Se hai ordinato più beni consegnati separatamente, il periodo scade dopo ${r.windowDays} giorni dal giorno in cui tu o il terzo designato acquisisci il possesso fisico dell’ultimo bene.`,
          `Per esercitare il diritto di recesso, sei tenuto a informarci (${seller}) della tua decisione di recedere dal presente contratto tramite una dichiarazione esplicita (ad esempio un’e-mail). A tal fine puoi utilizzare il modulo tipo di recesso, ma non è obbligatorio.`,
          { link: { href: "/policies/withdrawal-form", label: "Modulo tipo di recesso" } },
          "Per rispettare il termine di recesso, è sufficiente che tu invii la comunicazione relativa all’esercizio del diritto di recesso prima della scadenza del periodo di recesso.",
        ],
      },
      {
        heading: "Effetti del recesso",
        blocks: [
          `Se recedi dal presente contratto, ti saranno rimborsati tutti i pagamenti che hai effettuato a nostro favore, compresi i costi di consegna (ad eccezione dei costi supplementari derivanti dalla tua eventuale scelta di un tipo di consegna diverso dal tipo meno costoso di consegna standard da noi offerto), senza indebito ritardo e in ogni caso non oltre ${r.refundDays} giorni dal giorno in cui siamo informati della tua decisione di recedere dal presente contratto. Detti rimborsi saranno effettuati utilizzando lo stesso mezzo di pagamento da te usato per la transazione iniziale, salvo che tu non abbia espressamente convenuto altrimenti; in ogni caso, non dovrai sostenere alcun costo quale conseguenza di tale rimborso.`,
          "Il rimborso può essere sospeso fino al ricevimento dei beni oppure fino all’avvenuta dimostrazione da parte tua di aver rispedito i beni, se precedente.",
          `Sei pregato di rispedire i beni a ${EU_PRESENCE.returnsAddress} senza indebiti ritardi e in ogni caso entro ${r.windowDays} giorni dal giorno in cui ci hai comunicato il recesso dal presente contratto. Il termine è rispettato se rispedisci i beni prima della scadenza del periodo di ${r.windowDays} giorni.`,
          r.returnShippingPaidBy === "merchant"
            ? "I costi della restituzione dei beni saranno a nostro carico."
            : `I costi diretti della restituzione dei beni saranno a tuo carico. Pneumatici, cerchi e kit freni, per loro natura, non possono essere normalmente restituiti a mezzo posta; il costo è stimato in ${bulky}. Su richiesta possiamo inviarti un’etichetta prepagata a tale costo.`,
          "Sei responsabile unicamente della diminuzione del valore dei beni risultante da una manipolazione dei beni diversa da quella necessaria per stabilire la natura, le caratteristiche e il funzionamento dei beni.",
        ],
      },
      {
        heading: "Cosa va oltre la semplice verifica",
        blocks: [
          "Puoi disimballare ed esaminare gli articoli come faresti in negozio. Le azioni seguenti vanno oltre e possono ridurre il rimborso in misura della perdita di valore:",
          {
            list: [
              "Montare un pneumatico su un cerchio, gonfiarlo o utilizzarlo su strada.",
              "Montare un cerchio su un veicolo con bulloni o dadi serrati.",
              "Installare o rodare pastiglie, dischi o pinze freno.",
            ],
          },
        ],
      },
      {
        heading: "Esclusioni",
        blocks: [
          "Il diritto di recesso non si applica ai beni confezionati su misura o chiaramente personalizzati (ad esempio un cerchio prodotto su ordinazione con finitura o foratura specifica). Tali articoli sono indicati nella scheda prodotto prima dell’ordine.",
        ],
      },
      {
        heading: "Come procedere",
        blocks: [
          {
            list: [
              `Scrivi a ${COMPANY.email} indicando il numero d’ordine, oppure invia il modulo tipo di recesso.`,
              "Confermiamo via e-mail la ricezione del recesso e ti inviamo l’indirizzo per il reso e, su richiesta, un’etichetta prepagata.",
              "Imballa gli articoli con cura, se possibile nella confezione originale.",
            ],
          },
        ],
      },
      {
        heading: "Annullamento prima della spedizione",
        blocks: ["Puoi annullare gratuitamente fino alla spedizione dell’ordine: scrivici e ti rimborsiamo per intero."],
      },
      {
        heading: "Articoli difettosi o errati",
        blocks: ["Se un articolo è difettoso o non è quello ordinato, si applicano i tuoi diritti di garanzia legale e copriamo tutti i costi di reso. Vedi Garanzia legale e garanzia commerciale."],
      },
    ],
  },

  "withdrawal-form": {
    title: "Modulo tipo di recesso",
    description: "Modulo tipo di recesso UE (Direttiva 2011/83/UE, allegato I, parte B).",
    intro: "Compila e restituisci il presente modulo solo se desideri recedere dal contratto. Puoi copiare il testo in un’e-mail.",
    sections: [
      {
        heading: "Modulo",
        blocks: [
          `Destinatario: ${seller}`,
          "Con la presente io/noi (*) notifichiamo il recesso dal mio/nostro (*) contratto di vendita dei seguenti beni (*)/di prestazione dei seguenti servizi (*):",
          {
            rows: [
              ["Ordinato il (*) / ricevuto il (*)", "________________"],
              ["Numero d’ordine", "________________"],
              ["Nome del/dei consumatore/i", "________________"],
              ["Indirizzo del/dei consumatore/i", "________________"],
              ["Firma del/dei consumatore/i (solo se il presente modulo è notificato in versione cartacea)", "________________"],
              ["Data", "________________"],
            ],
          },
          { note: "(*) Cancellare la dicitura inutile." },
        ],
      },
    ],
  },

  warranty: {
    title: "Garanzia legale e garanzia commerciale",
    description: "Garanzia legale di conformità di 2 anni per i consumatori nell’UE, oltre alle garanzie dei produttori.",
    intro: "Come consumatore nell’UE benefici della garanzia legale di conformità dei beni (Direttiva (UE) 2019/771), recepita nella legge del tuo paese.",
    sections: [
      {
        heading: "Garanzia legale di conformità",
        blocks: [
          `Siamo responsabili per qualsiasi difetto di conformità esistente al momento della consegna che si manifesti entro ${p.warranty.months! / 12} anni dalla consegna. La garanzia è gratuita.`,
          "Se un difetto si manifesta entro il primo anno dalla consegna (due anni in alcuni Stati membri), si presume che esistesse già al momento della consegna, salvo prova contraria da parte nostra.",
        ],
      },
      {
        heading: "I tuoi rimedi",
        blocks: [
          {
            list: [
              "Riparazione o sostituzione, a tua scelta, salvo che il rimedio scelto sia impossibile o sproporzionato.",
              "Riduzione del prezzo o risoluzione del contratto con rimborso, se la riparazione o la sostituzione non è possibile, non riesce o richiede un tempo irragionevole.",
            ],
          },
          "Sosteniamo tutti i costi per eliminare il difetto, compresa la spedizione di reso.",
        ],
      },
      {
        heading: "Cosa non è un difetto",
        blocks: [
          "L’usura normale (del battistrada, delle pastiglie e dei dischi), i danni da forature, urti contro marciapiedi, pressione errata, sovraccarico, montaggio non corretto o uso in competizione non costituiscono difetto di conformità.",
        ],
      },
      {
        heading: "Garanzia del produttore",
        blocks: [
          "Molti produttori offrono inoltre una garanzia commerciale. Le sue condizioni sono stabilite dal produttore e, se disponibili, collegate nella scheda prodotto. La garanzia del produttore si aggiunge ai tuoi diritti di garanzia legale e non li limita.",
        ],
      },
      {
        heading: "Come presentare un reclamo",
        blocks: [`Scrivi a ${COMPANY.email} indicando il numero d’ordine, con foto e una breve descrizione (per i pneumatici, indica il codice DOT sul fianco). Rispondiamo entro 2 giorni lavorativi.`],
      },
    ],
  },

  payments: {
    title: "Metodi di pagamento",
    description: `Paga con ${payments.join(", ")}. Prezzi in EUR, IVA inclusa.`,
    intro: "Tutti i prezzi del negozio UE sono in euro (EUR) e includono l’IVA.",
    sections: [
      { heading: "Metodi accettati", blocks: [{ list: payments }] },
      {
        heading: "Quando avviene l’addebito",
        blocks: [
          "I pagamenti con carta e PayPal vengono autorizzati al momento dell’ordine e addebitati alla spedizione. Con il bonifico SEPA l’ordine viene spedito una volta ricevuto il pagamento; le coordinate bancarie sono nella conferma d’ordine.",
        ],
      },
      {
        heading: "Sicurezza",
        blocks: ["I pagamenti con carta utilizzano l’autenticazione forte del cliente (3-D Secure) prevista dalla direttiva UE sui servizi di pagamento. Non conserviamo i numeri di carta completi."],
      },
      { heading: "Nessun sovrapprezzo", blocks: ["Non applichiamo commissioni su alcun metodo di pagamento."] },
      { heading: "IVA", blocks: [`L’IVA è inclusa in ogni prezzo ed è riscossa tramite lo sportello unico dell’UE (OSS), numero identificativo ${EU_PRESENCE.vatNumber}. Ricevi una fattura con IVA via e-mail.`] },
    ],
  },

  terms: {
    title: "Condizioni generali di vendita",
    description: `Condizioni generali per gli acquisti nel negozio UE di ${COMPANY.tradingName}.`,
    intro: `Le presenti condizioni si applicano ai contratti conclusi tramite il negozio UE di ${COMPANY.tradingName} tra te e ${COMPANY.legalName}, ${companyAddressLine} («noi»).`,
    sections: [
      { heading: "Venditore", blocks: [seller, `IVA UE (OSS): ${EU_PRESENCE.vatNumber}`] },
      {
        heading: "Conclusione del contratto",
        blocks: [
          "Le schede prodotto costituiscono un invito a ordinare. Facendo clic su «Ordine con obbligo di pagamento» presenti un’offerta vincolante. Confermiamo subito la ricezione via e-mail; questa conferma non costituisce ancora accettazione. Il contratto è concluso quando inviamo la conferma di spedizione, al più tardi alla consegna dei beni.",
          "La lingua del contratto è quella della versione del negozio in cui effettui l’ordine (italiano, inglese, tedesco, francese, spagnolo o olandese). Conserviamo il testo del contratto e ti inviamo via e-mail i dettagli dell’ordine e le presenti condizioni.",
        ],
      },
      {
        heading: "Prezzi",
        blocks: ["Tutti i prezzi sono in EUR e includono l’IVA. Eventuali costi di consegna sono indicati prima dell’ordine."],
      },
      { heading: "Consegna", blocks: ["Le modalità di consegna sono descritte nelle Condizioni di consegna."] },
      { heading: "Diritto di recesso", blocks: [`I consumatori hanno un diritto di recesso di ${r.windowDays} giorni, come descritto in Diritto di recesso e resi.`] },
      { heading: "Garanzia legale", blocks: ["Si applica la garanzia legale di conformità, come descritto in Garanzia legale e garanzia commerciale."] },
      {
        heading: "Compatibilità e montaggio",
        blocks: [
          "Verifica che misura, indice di carico, codice di velocità, foratura, offset e compatibilità dei freni corrispondano alla carta di circolazione o al certificato di conformità del tuo veicolo. A seconda del paese, alcuni cerchi e componenti dei freni richiedono un’omologazione o un aggiornamento dei documenti. Consigliamo il montaggio da parte di un professionista qualificato.",
        ],
      },
      {
        heading: "Responsabilità",
        blocks: [
          "Rispondiamo senza limiti in caso di dolo e colpa grave, nonché per danni alla vita, all’integrità fisica o alla salute. La responsabilità per danno da prodotti difettosi e la garanzia legale non sono pregiudicate. Per il resto, la nostra responsabilità per colpa lieve è limitata al danno prevedibile e tipico del contratto.",
        ],
      },
      {
        heading: "Legge applicabile",
        blocks: [
          `Le presenti condizioni sono regolate dalla legge dello Stato di ${COMPANY.stateOfFormation}, Stati Uniti. Se sei un consumatore, tale scelta di legge non ti priva della tutela delle disposizioni inderogabili della legge del paese in cui hai la residenza abituale. Puoi inoltre agire dinanzi ai giudici del tuo paese di residenza.`,
        ],
      },
      {
        heading: "Risoluzione delle controversie",
        blocks: ["Contattaci prima di tutto: la maggior parte dei problemi si risolve in pochi giorni. Non siamo obbligati a partecipare, e non partecipiamo, a procedure di risoluzione delle controversie dinanzi a un organismo di conciliazione per i consumatori."],
      },
    ],
  },

  privacy: {
    title: "Informativa sulla privacy",
    description: "Come trattiamo i dati personali di visitatori e clienti nell’UE (GDPR).",
    intro: "La presente informativa spiega come trattiamo i tuoi dati personali ai sensi del Regolamento generale sulla protezione dei dati (UE) 2016/679 (GDPR) quando utilizzi il negozio UE.",
    sections: [
      {
        heading: "Titolare del trattamento e rappresentante nell’UE",
        blocks: [
          {
            rows: [
              ["Titolare del trattamento", `${COMPANY.legalName}, ${companyAddressLine}`],
              ["Contatto", COMPANY.privacyEmail],
              ["Rappresentante nell’UE (art. 27 GDPR)", `${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address}, ${EU_PRESENCE.gdprRepresentative.email}`],
            ],
          },
        ],
      },
      {
        heading: "Dati trattati, finalità e basi giuridiche",
        blocks: [
          {
            rows: [
              ["Dati di ordine e consegna (nome, indirizzo, e-mail, telefono, contenuto dell’ordine)", "Esecuzione del contratto — art. 6, par. 1, lett. b)"],
              ["Fatture e documenti contabili", "Obbligo legale (normativa fiscale) — art. 6, par. 1, lett. c)"],
              ["Prevenzione delle frodi e sicurezza informatica, log del server", "Legittimo interesse — art. 6, par. 1, lett. f)"],
              ["Messaggi al servizio clienti", "Contratto o legittimo interesse — art. 6, par. 1, lett. b)/f)"],
              ["Cookie di analisi e pubblicità", "Consenso — art. 6, par. 1, lett. a)"],
            ],
          },
        ],
      },
      {
        heading: "Destinatari",
        blocks: [
          "Fornitori di servizi di pagamento, corrieri e il nostro magazzino nell’UE, fornitori di hosting ed e-mail e — solo con il tuo consenso — Google per analisi e pubblicità. I responsabili del trattamento agiscono su nostre istruzioni in base ad accordi sul trattamento dei dati.",
        ],
      },
      {
        heading: "Trasferimenti internazionali",
        blocks: [
          "Siamo una società statunitense, quindi i tuoi dati vengono trasferiti negli Stati Uniti. I trasferimenti si basano sul quadro UE-USA per la protezione dei dati personali (Data Privacy Framework) quando il destinatario è certificato e, in caso contrario, sulle clausole contrattuali tipo della Commissione europea (art. 46, par. 2, lett. c) GDPR). Puoi richiederci una copia delle garanzie.",
        ],
      },
      {
        heading: "Conservazione",
        blocks: [
          "I dati di ordini e fatture sono conservati per il periodo previsto dalla normativa fiscale e commerciale applicabile (fino a 10 anni). I messaggi al servizio clienti vengono cancellati 3 anni dopo l’ultimo contatto. Le prove del consenso sono conservate per la durata di validità del consenso più il termine di prescrizione.",
        ],
      },
      {
        heading: "I tuoi diritti",
        blocks: [
          {
            list: [
              "Accesso (art. 15) e rettifica (art. 16)",
              "Cancellazione (art. 17) e limitazione del trattamento (art. 18)",
              "Portabilità dei dati (art. 20)",
              "Opposizione al trattamento basato sul legittimo interesse (art. 21)",
              "Revoca del consenso in qualsiasi momento, con effetto per il futuro (art. 7, par. 3) — tramite Impostazioni cookie nel piè di pagina",
            ],
          },
          `Contatta ${COMPANY.privacyEmail} o il nostro rappresentante nell’UE. Hai inoltre il diritto di proporre reclamo a un’autorità di controllo per la protezione dei dati, in particolare nello Stato membro in cui risiedi.`,
        ],
      },
      { heading: "Decisioni automatizzate", blocks: ["Non adottiamo decisioni basate unicamente su un trattamento automatizzato che producano effetti giuridici o incidano in modo analogo significativamente su di te."] },
      { heading: "Modifiche", blocks: ["Eventuali modifiche saranno pubblicate in questa pagina con una nuova data di efficacia."] },
    ],
  },

  cookies: {
    title: "Cookie policy",
    description: "Quali cookie e tecnologie simili utilizza il negozio UE e come gestire il consenso.",
    intro: "Fino al tuo consenso impostiamo solo cookie strettamente necessari. Puoi modificare la tua scelta in qualsiasi momento da Impostazioni cookie nel piè di pagina.",
    sections: [
      {
        heading: "Strettamente necessari (nessun consenso richiesto)",
        blocks: [
          {
            rows: [
              ["cp_market", "Ricorda la regione del negozio scelta — 12 mesi"],
              ["cp_geo", "Regione del negozio suggerita in base al tuo paese — 12 mesi"],
              ["cp_lang", "Ricorda la lingua scelta — 12 mesi"],
              ["cp-cart-eu-v1 (archiviazione locale)", "Conserva il contenuto del carrello — fino alla cancellazione"],
              ["cp-consent-v1 (archiviazione locale)", `Memorizza la tua scelta sui cookie — ${Math.round(CONSENT_MAX_AGE_DAYS / 30.4)} mesi`],
            ],
          },
        ],
      },
      {
        heading: "Analisi (consenso richiesto)",
        blocks: [{ rows: [["_ga, _ga_<id> (Google Analytics)", "Distingue le visite per produrre statistiche aggregate — 14 mesi"]] }],
      },
      {
        heading: "Pubblicità (consenso richiesto)",
        blocks: [{ rows: [["_gcl_au, _gcl_aw (Google Ads)", "Misura le conversioni degli annunci — 90 giorni"]] }],
      },
      {
        heading: "Google Consent Mode",
        blocks: [
          "Utilizziamo Google Consent Mode v2. Fino al tuo consenso, l’archiviazione per analisi e pubblicità è negata e non vengono impostati cookie di analisi o pubblicitari. Il consenso ti viene richiesto di nuovo alla scadenza.",
        ],
      },
    ],
  },

  "legal-notice": {
    title: "Note legali",
    description: "Informazioni sul gestore del negozio.",
    intro: `Il negozio UE di ${COMPANY.tradingName} è gestito da:`,
    sections: [
      {
        heading: "Gestore",
        blocks: [
          {
            rows: [
              ["Società", COMPANY.legalName],
              ["Forma giuridica", `Limited liability company costituita secondo le leggi di ${COMPANY.stateOfFormation}, USA`],
              ["Registrazione", `${COMPANY.stateOfFormation} Secretary of State, n. ${COMPANY.registrationNumber}`],
              ["Indirizzo", companyAddressLine],
              ["Rappresentata da", "[Nome del managing member / manager]"],
              ["E-mail", COMPANY.email],
              ["Telefono", COMPANY.phoneDisplay],
              ["IVA UE (OSS)", EU_PRESENCE.vatNumber],
              ["EIN (USA)", COMPANY.ein],
            ],
          },
        ],
      },
      {
        heading: "Rappresentante nell’UE",
        blocks: [`${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address}`],
      },
      {
        heading: "Responsabile dei contenuti",
        blocks: ["[Nome], indirizzo come sopra."],
      },
    ],
  },
}
