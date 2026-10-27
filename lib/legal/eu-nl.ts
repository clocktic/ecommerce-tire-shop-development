import { COMPANY, EU_PRESENCE, companyAddressLine } from "@/lib/company"
import { CONSENT_MAX_AGE_DAYS } from "@/components/legal/consent"
import { POLICIES } from "@/lib/policies"
import { euNl } from "@/lib/i18n/dictionaries/nl"
import type { PolicyDoc } from "@/lib/legal/types"
import { EU_SNIPPETS } from "@/lib/legal/eu-customs"

// Dutch version of lib/legal/eu.ts. Same facts and numbers; update all EU language
// files together. Withdrawal wording follows the official model (Richtlijn 2011/83/EU, bijlage I).
const p = POLICIES.eu
const s = p.shipping
const r = p.returns
const t = euNl.policy
const contactLine = `${COMPANY.email} · ${COMPANY.phoneDisplay} (${euNl.company.hours})`
const seller = `${COMPANY.legalName}, ${companyAddressLine}, e-mail ${COMPANY.email}, telefoon ${COMPANY.phoneDisplay}`
const bulky = "maximaal ongeveer € 25 per band of velg en € 15 per remmenpakket"
const payments = p.paymentMethods.map((m) => (m === "SEPA bank transfer" ? "SEPA-overschrijving" : m))

const SNIP = EU_SNIPPETS.nl

export const EU_POLICIES_NL: Record<string, PolicyDoc> = {
  shipping: {
    title: "Leveringsvoorwaarden",
    description: SNIP.shippingDescription,
    intro: SNIP.shippingIntro,
    sections: [
      {
        heading: "Leveringsgebied",
        blocks: [
          `Wij leveren in ${t.area}. Wij leveren niet in ${t.exclusions}.`,
          "Banden en velgen kunt u rechtstreeks bij een montagewerkplaats laten bezorgen. Vul de naam van de werkplaats in het veld Bedrijf in.",
        ],
      },
      {
        heading: "Kosten, invoerrechten en invoer-btw",
        blocks: [
          s.freeShipping ? "Levering is gratis voor alle bestellingen, zonder minimumbedrag." : "Verzendkosten worden getoond voordat u de bestelling bevestigt.",
          t.duties,
          SNIP.paymentsVat.blocks[1],
        ],
      },
      {
        heading: "Levertijden",
        blocks: [
          {
            rows: [
              ["Uiterste besteltijd", `${s.cutoff}, maandag t/m vrijdag`],
              ["Verwerkingstijd", `${s.handlingDays[0]}–${s.handlingDays[1]} werkdagen`],
              ["Transittijd", `${s.transitDays[0]}–${s.transitDays[1]} werkdagen`],
              ["Totale levertijd", t.days],
              ["Vervoerders", s.carriers.join(", ")],
              ["Verzonden vanuit", EU_PRESENCE.dispatchCountry],
            ],
          },
          "Als wij niet binnen 30 dagen na uw bestelling kunnen leveren en geen latere datum met u afspreken, kunt u de bestelling annuleren en krijgt u het volledige bedrag terug.",
        ],
      },
      {
        heading: "Track & trace",
        blocks: ["U ontvangt een verzendbevestiging met een trackinglink. Een set van vier banden wordt meestal in vier pakketten verzonden, die op verschillende dagen kunnen aankomen."],
      },
      {
        heading: "Beschadigde pakketten",
        blocks: [
          "Controleer de pakketten bij levering en laat zichtbare schade zo mogelijk door de bezorger noteren. Stuur ons zo snel mogelijk foto’s per e-mail. Uw wettelijke rechten blijven ook zonder deze melding behouden; het helpt ons alleen bij een claim bij de vervoerder.",
          "Het risico van verlies of beschadiging gaat pas op u over wanneer u, of een door u aangewezen persoon, de goederen fysiek in bezit heeft gekregen.",
        ],
      },
      { heading: "Contact", blocks: [contactLine] },
    ],
  },

  returns: {
    title: "Herroepingsrecht en retourneren",
    description: `${r.windowDays} dagen herroepingsrecht voor consumenten in de EU.`,
    intro: "Als consument heeft u een wettelijk herroepingsrecht. De informatie hieronder volgt het EU-model (Richtlijn 2011/83/EU, bijlage I).",
    sections: [
      {
        heading: "Herroepingsrecht",
        blocks: [
          `U heeft het recht binnen een termijn van ${r.windowDays} dagen zonder opgave van redenen deze overeenkomst te herroepen.`,
          `De herroepingstermijn verstrijkt ${r.windowDays} dagen na de dag waarop u, of een door u aangewezen derde die niet de vervoerder is, het goed fysiek in bezit krijgt. Heeft u meerdere goederen besteld die afzonderlijk worden geleverd, dan verstrijkt de termijn ${r.windowDays} dagen na de dag waarop u, of de aangewezen derde, het laatste goed fysiek in bezit krijgt.`,
          `Om het herroepingsrecht uit te oefenen, moet u ons (${seller}) via een ondubbelzinnige verklaring (bijvoorbeeld een e-mail) op de hoogte stellen van uw beslissing de overeenkomst te herroepen. U kunt hiervoor het modelformulier voor herroeping gebruiken, maar bent hiertoe niet verplicht.`,
          { link: { href: "/policies/withdrawal-form", label: "Modelformulier voor herroeping" } },
          "Om de herroepingstermijn te halen, volstaat het uw mededeling betreffende uw uitoefening van het herroepingsrecht te verzenden voordat de herroepingstermijn is verstreken.",
        ],
      },
      {
        heading: "Gevolgen van de herroeping",
        blocks: [
          `Als u de overeenkomst herroept, ontvangt u alle betalingen die u tot op dat moment heeft gedaan, inclusief leveringskosten (met uitzondering van eventuele extra kosten ten gevolge van uw keuze voor een andere wijze van levering dan de door ons geboden goedkoopste standaardlevering), onverwijld en in ieder geval niet later dan ${r.refundDays} dagen nadat wij op de hoogte zijn gesteld van uw beslissing de overeenkomst te herroepen, van ons terug. Wij betalen u terug met hetzelfde betaalmiddel als waarmee u de oorspronkelijke transactie heeft verricht, tenzij u uitdrukkelijk anderszins heeft ingestemd; in ieder geval zult u voor zulke terugbetaling geen kosten hoeven te betalen.`,
          "Wij mogen wachten met terugbetalen tot wij de goederen hebben teruggekregen, of tot u heeft aangetoond dat u de goederen heeft teruggezonden, al naargelang welk tijdstip eerst valt.",
          `U dient de goederen onverwijld, en in ieder geval niet later dan ${r.windowDays} dagen na de dag waarop u ons uw herroeping heeft meegedeeld, terug te zenden naar het adres dat wij u met het retourautorisatienummer (RMA) per e-mail doorgeven. U bent op tijd als u de goederen terugzendt voordat de termijn van ${r.windowDays} dagen is verstreken.`,
          r.returnShippingPaidBy === "merchant"
            ? "Wij dragen de kosten van het terugzenden van de goederen."
            : `U draagt de rechtstreekse kosten van het terugzenden van de goederen. Banden, velgen en remmensets kunnen vanwege hun aard normaal gesproken niet per post worden teruggezonden; deze kosten worden geschat op ${bulky}. Op verzoek sturen wij u een vooraf betaald retourlabel voor dat bedrag.`,
          "U bent alleen aansprakelijk voor de waardevermindering van de goederen die het gevolg is van het gebruik van de goederen dat verder gaat dan nodig is om de aard, de kenmerken en de werking van de goederen vast te stellen.",
        ],
      },
      {
        heading: "Wat verder gaat dan controleren",
        blocks: [
          "U mag de artikelen uitpakken en bekijken zoals u in een winkel zou doen. Het volgende gaat verder en kan de terugbetaling verminderen met het waardeverlies:",
          {
            list: [
              "Een band op een velg monteren, oppompen of ermee rijden.",
              "Een velg op een voertuig monteren met aangedraaide bouten of moeren.",
              "Remblokken, remschijven of remklauwen inbouwen of inremmen.",
            ],
          },
        ],
      },
      {
        heading: "Uitzonderingen",
        blocks: [
          "Het herroepingsrecht geldt niet voor goederen die volgens uw specificaties zijn vervaardigd of duidelijk voor u persoonlijk bestemd zijn (bijvoorbeeld een op bestelling gemaakte velg met een specifieke afwerking of steek). Deze artikelen staan vóór de bestelling als zodanig op de productpagina vermeld.",
        ],
      },
      {
        heading: "Praktische stappen",
        blocks: [
          {
            list: [
              `Mail naar ${COMPANY.email} met uw bestelnummer of stuur het modelformulier voor herroeping.`,
              "Wij bevestigen de ontvangst van uw herroeping per e-mail en sturen u het retouradres en, op verzoek, een vooraf betaald label.",
              "Verpak de artikelen goed, indien mogelijk in de originele verpakking.",
            ],
          },
        ],
      },
      {
        heading: "Annuleren vóór verzending",
        blocks: ["U kunt kosteloos annuleren totdat de bestelling is verzonden: stuur ons een bericht en u krijgt het volledige bedrag terug."],
      },
      {
        heading: "Defecte of verkeerde artikelen",
        blocks: ["Is een artikel defect of niet wat u heeft besteld, dan gelden uw wettelijke garantierechten en betalen wij alle retourkosten. Zie Wettelijke en commerciële garantie."],
      },
      SNIP.returnsSection,
    ],
  },

  "withdrawal-form": {
    title: "Modelformulier voor herroeping",
    description: "EU-modelformulier voor herroeping (Richtlijn 2011/83/EU, bijlage I, deel B).",
    intro: "Dit formulier alleen invullen en terugzenden als u de overeenkomst wilt herroepen. U kunt de tekst ook in een e-mail kopiëren.",
    sections: [
      {
        heading: "Formulier",
        blocks: [
          `Aan: ${seller}`,
          "Ik/Wij (*) deel/delen (*) u hierbij mede, dat ik/wij (*) onze overeenkomst betreffende de verkoop van de volgende goederen/levering van de volgende dienst (*) herroep/herroepen (*):",
          {
            rows: [
              ["Besteld op (*) / ontvangen op (*)", "________________"],
              ["Bestelnummer", "________________"],
              ["Naam/Namen consument(en)", "________________"],
              ["Adres consument(en)", "________________"],
              ["Handtekening van consument(en) (alleen wanneer dit formulier op papier wordt ingediend)", "________________"],
              ["Datum", "________________"],
            ],
          },
          { note: "(*) Doorhalen wat niet van toepassing is." },
        ],
      },
    ],
  },

  warranty: {
    title: "Wettelijke en commerciële garantie",
    description: "2 jaar wettelijke conformiteitsgarantie voor consumenten in de EU, aanvullend op fabrieksgaranties.",
    intro: "Als consument in de EU geniet u de wettelijke garantie van conformiteit van goederen (Richtlijn (EU) 2019/771), zoals omgezet in het recht van uw land.",
    sections: [
      {
        heading: "Wettelijke conformiteitsgarantie",
        blocks: [
          `Wij zijn aansprakelijk voor elk conformiteitsgebrek dat bestaat op het moment van levering en binnen ${p.warranty.months! / 12} jaar na levering aan het licht komt. Deze garantie is kosteloos.`,
          "Komt een gebrek binnen het eerste jaar na levering aan het licht (in sommige lidstaten twee jaar), dan wordt vermoed dat het al bij levering bestond, tenzij wij het tegendeel bewijzen.",
        ],
      },
      {
        heading: "Uw mogelijkheden",
        blocks: [
          {
            list: [
              "Herstel of vervanging, naar uw keuze, tenzij de gekozen optie onmogelijk of onevenredig is.",
              "Prijsvermindering of ontbinding van de overeenkomst met terugbetaling, als herstel of vervanging niet mogelijk is, mislukt of onredelijk lang duurt.",
            ],
          },
          "Wij dragen alle kosten om het gebrek te verhelpen, inclusief de retourzending.",
        ],
      },
      {
        heading: "Wat geen gebrek is",
        blocks: [
          "Normale slijtage (van loopvlak, remblokken en remschijven) en schade door lekke banden, stoepranden, verkeerde bandenspanning, overbelasting, onjuiste montage of gebruik in wedstrijden vormen geen conformiteitsgebrek.",
        ],
      },
      {
        heading: "Fabrieksgarantie",
        blocks: [
          "Veel fabrikanten bieden daarnaast een commerciële garantie. De voorwaarden worden door de fabrikant bepaald en, indien beschikbaar, op de productpagina gelinkt. De fabrieksgarantie geldt naast uw wettelijke garantierechten en beperkt deze niet.",
        ],
      },
      {
        heading: "Hoe u een klacht indient",
        blocks: [`Mail naar ${COMPANY.email} met uw bestelnummer, foto’s en een korte beschrijving (vermeld bij banden de DOT-code op de zijwand). Wij antwoorden binnen 2 werkdagen.`],
      },
    ],
  },

  payments: {
    title: "Betaalmethoden",
    description: SNIP.paymentsDescription,
    intro: SNIP.paymentsIntro,
    sections: [
      { heading: "Geaccepteerde methoden", blocks: [{ list: payments }] },
      {
        heading: "Wanneer wordt er afgeschreven",
        blocks: [
          "Kaart- en PayPal-betalingen worden bij het bestellen geautoriseerd en bij verzending afgeschreven. Bij een SEPA-overschrijving wordt de bestelling verzonden zodra de betaling is ontvangen; de bankgegevens staan in de orderbevestiging.",
        ],
      },
      {
        heading: "Veiligheid",
        blocks: ["Kaartbetalingen gebruiken sterke klantauthenticatie (3-D Secure) zoals vereist door de EU-betaaldienstenrichtlijn. Wij slaan geen volledige kaartnummers op."],
      },
      { heading: "Geen toeslagen", blocks: ["Wij rekenen voor geen enkele betaalmethode extra kosten."] },
      SNIP.paymentsVat,
    ],
  },

  terms: {
    title: "Algemene voorwaarden",
    description: `Algemene verkoopvoorwaarden van de EU-winkel van ${COMPANY.tradingName}.`,
    intro: `Deze voorwaarden gelden voor overeenkomsten die via de EU-winkel van ${COMPANY.tradingName} worden gesloten tussen u en ${COMPANY.legalName}, ${companyAddressLine} („wij”).`,
    sections: [
      { heading: "Verkoper", blocks: [seller, `${COMPANY.stateOfFormation} Secretary of State: ${COMPANY.registrationNumber}`] },
      {
        heading: "Totstandkoming van de overeenkomst",
        blocks: [
          "Productpagina’s zijn een uitnodiging om te bestellen. Door op „Bestelling met betalingsverplichting” te klikken, doet u een bindend aanbod. Wij bevestigen de ontvangst direct per e-mail; deze bevestiging is nog geen aanvaarding. De overeenkomst komt tot stand wanneer wij de verzendbevestiging sturen of uiterlijk bij levering van de goederen.",
          "De taal van de overeenkomst is de taal van de winkelversie waarin u bestelt (Nederlands, Engels, Duits, Frans, Italiaans of Spaans). Wij bewaren de tekst van de overeenkomst en sturen u de bestelgegevens en deze voorwaarden per e-mail.",
        ],
      },
      { heading: "Prijzen", blocks: [SNIP.pricesText] },
      { heading: "Levering", blocks: ["De leveringsvoorwaarden staan beschreven in Leveringsvoorwaarden."] },
      { heading: "Herroepingsrecht", blocks: [`Consumenten hebben een herroepingsrecht van ${r.windowDays} dagen, beschreven in Herroepingsrecht en retourneren.`] },
      { heading: "Wettelijke garantie", blocks: ["De wettelijke conformiteitsgarantie is van toepassing, beschreven in Wettelijke en commerciële garantie."] },
      {
        heading: "Compatibiliteit en montage",
        blocks: [
          "Controleer of maat, load index, snelheidsindex, steekcirkel, ET-waarde en remmencompatibiliteit overeenkomen met de documenten van uw voertuig of het certificaat van overeenstemming. Afhankelijk van het land vereisen sommige velgen en remonderdelen een goedkeuring of registratie. Wij raden montage door een gekwalificeerde vakman aan.",
        ],
      },
      {
        heading: "Aansprakelijkheid",
        blocks: [
          "Wij zijn onbeperkt aansprakelijk bij opzet en grove nalatigheid en voor letsel aan leven, lichaam of gezondheid. Productaansprakelijkheid en de wettelijke garantie blijven onverlet. Voor het overige is onze aansprakelijkheid bij lichte nalatigheid beperkt tot de voorzienbare, voor de overeenkomst typische schade.",
        ],
      },
      {
        heading: "Toepasselijk recht",
        blocks: [
          `Op deze voorwaarden is het recht van de staat ${COMPANY.stateOfFormation}, Verenigde Staten, van toepassing. Als u consument bent, ontneemt deze rechtskeuze u niet de bescherming van de dwingende bepalingen van het recht van het land waar u uw gewone verblijfplaats heeft. U kunt zich ook tot de rechter in uw woonland wenden.`,
        ],
      },
      {
        heading: "Geschillenbeslechting",
        blocks: ["Neem eerst contact met ons op: de meeste problemen zijn binnen enkele dagen opgelost. Wij zijn niet verplicht en niet bereid deel te nemen aan geschillenbeslechting voor een geschillencommissie voor consumenten."],
      },
      SNIP.termsSection,
    ],
  },

  privacy: {
    title: "Privacybeleid",
    description: "Hoe wij persoonsgegevens van bezoekers en klanten in de EU verwerken (AVG).",
    intro: "Dit beleid legt uit hoe wij uw persoonsgegevens verwerken volgens de Algemene Verordening Gegevensbescherming (EU) 2016/679 (AVG) wanneer u de EU-winkel gebruikt.",
    sections: [
      {
        heading: "Verwerkingsverantwoordelijke en EU-vertegenwoordiger",
        blocks: [
          {
            rows: [
              ["Verwerkingsverantwoordelijke", `${COMPANY.legalName}, ${companyAddressLine}`],
              ["Contact", COMPANY.privacyEmail],
              ["EU-vertegenwoordiger (art. 27 AVG)", `${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address}, ${EU_PRESENCE.gdprRepresentative.email}`],
            ],
          },
        ],
      },
      {
        heading: "Verwerkte gegevens, doeleinden en rechtsgronden",
        blocks: [
          {
            rows: [
              ["Bestel- en leveringsgegevens (naam, adres, e-mail, telefoon, inhoud van de bestelling)", "Uitvoering van de overeenkomst — art. 6, lid 1, onder b)"],
              ["Facturen en boekhouding", "Wettelijke verplichting (belastingrecht) — art. 6, lid 1, onder c)"],
              ["Fraudepreventie en IT-beveiliging, serverlogs", "Gerechtvaardigd belang — art. 6, lid 1, onder f)"],
              ["Berichten aan de klantenservice", "Overeenkomst of gerechtvaardigd belang — art. 6, lid 1, onder b)/f)"],
              ["Analyse- en advertentiecookies", "Toestemming — art. 6, lid 1, onder a)"],
            ],
          },
        ],
      },
      {
        heading: "Ontvangers",
        blocks: [
          "Betaaldienstverleners, vervoerders en onze logistieke partners in de Verenigde Staten, hosting- en e-mailproviders en — alleen met uw toestemming — Google voor analyse en advertenties. Verwerkers handelen volgens onze instructies op grond van verwerkersovereenkomsten.",
        ],
      },
      {
        heading: "Internationale doorgifte",
        blocks: [
          "Wij zijn een Amerikaans bedrijf; uw gegevens worden daarom naar de Verenigde Staten doorgegeven. De doorgifte is gebaseerd op het EU-VS-kader voor gegevensbescherming als de ontvanger gecertificeerd is, en anders op de standaardcontractbepalingen van de Europese Commissie (art. 46, lid 2, onder c), AVG). U kunt bij ons een kopie van de waarborgen opvragen.",
        ],
      },
      {
        heading: "Bewaartermijnen",
        blocks: [
          "Bestel- en factuurgegevens bewaren wij zolang het toepasselijke belasting- en handelsrecht vereist (tot 10 jaar). Berichten aan de klantenservice worden 3 jaar na het laatste contact verwijderd. Toestemmingsregistraties bewaren wij zolang de toestemming geldig is plus de verjaringstermijn.",
        ],
      },
      {
        heading: "Uw rechten",
        blocks: [
          {
            list: [
              "Inzage (art. 15) en rectificatie (art. 16)",
              "Wissing (art. 17) en beperking van de verwerking (art. 18)",
              "Overdraagbaarheid van gegevens (art. 20)",
              "Bezwaar tegen verwerking op basis van gerechtvaardigd belang (art. 21)",
              "Intrekking van toestemming op elk moment, met werking voor de toekomst (art. 7, lid 3) — via Cookie-instellingen onderaan de pagina",
            ],
          },
          `Neem contact op via ${COMPANY.privacyEmail} of met onze EU-vertegenwoordiger. U heeft ook het recht een klacht in te dienen bij een toezichthoudende autoriteit, met name in de lidstaat waar u woont.`,
        ],
      },
      { heading: "Geautomatiseerde besluiten", blocks: ["Wij nemen geen besluiten die uitsluitend op geautomatiseerde verwerking zijn gebaseerd en die rechtsgevolgen voor u hebben of u anderszins in aanmerkelijke mate treffen."] },
      { heading: "Wijzigingen", blocks: ["Wijzigingen publiceren wij op deze pagina met een nieuwe ingangsdatum."] },
    ],
  },

  cookies: {
    title: "Cookiebeleid",
    description: "Welke cookies en vergelijkbare technieken de EU-winkel gebruikt en hoe u uw toestemming beheert.",
    intro: "Zolang u geen toestemming geeft, plaatsen wij alleen strikt noodzakelijke cookies. U kunt uw keuze op elk moment wijzigen via Cookie-instellingen onderaan de pagina.",
    sections: [
      {
        heading: "Strikt noodzakelijk (zonder toestemming)",
        blocks: [
          {
            rows: [
              ["cp_market", "Onthoudt de gekozen winkelregio — 12 maanden"],
              ["cp_geo", "Winkelregio voorgesteld op basis van uw land — 12 maanden"],
              ["cp_lang", "Onthoudt de gekozen taal — 12 maanden"],
              ["cp-cart-eu-v1 (lokale opslag)", "Bewaart de inhoud van uw winkelwagen — tot deze wordt gewist"],
              ["cp-consent-v1 (lokale opslag)", `Slaat uw cookiekeuze op — ${Math.round(CONSENT_MAX_AGE_DAYS / 30.4)} maanden`],
            ],
          },
        ],
      },
      {
        heading: "Analyse (toestemming vereist)",
        blocks: [{ rows: [["_ga, _ga_<id> (Google Analytics)", "Onderscheidt bezoeken voor geaggregeerde statistieken — 14 maanden"]] }],
      },
      {
        heading: "Advertenties (toestemming vereist)",
        blocks: [{ rows: [["_gcl_au, _gcl_aw (Google Ads)", "Meet advertentieconversies — 90 dagen"]] }],
      },
      {
        heading: "Google Consent Mode",
        blocks: [
          "Wij gebruiken Google Consent Mode v2. Zolang u geen toestemming geeft, is opslag voor analyse en advertenties geweigerd en worden geen analyse- of advertentiecookies geplaatst. Wanneer uw toestemming verloopt, vragen wij die opnieuw.",
        ],
      },
    ],
  },

  "legal-notice": {
    title: "Juridische informatie",
    description: "Informatie over de exploitant van de winkel.",
    intro: `De EU-winkel van ${COMPANY.tradingName} wordt geëxploiteerd door:`,
    sections: [
      {
        heading: "Exploitant",
        blocks: [
          {
            rows: [
              ["Bedrijf", COMPANY.legalName],
              ["Rechtsvorm", `Limited liability company naar het recht van ${COMPANY.stateOfFormation}, VS`],
              ["Register", `${COMPANY.stateOfFormation} Secretary of State, nr. ${COMPANY.registrationNumber}`],
              ["Adres", companyAddressLine],
              ["Vertegenwoordigd door", `${COMPANY.representative}, ${COMPANY.representativeRole}`],
              ["E-mail", COMPANY.email],
              ["Telefoon", COMPANY.phoneDisplay],
              ["Seller's permit (CDTFA)", COMPANY.sellerPermit],
            ],
          },
        ],
      },
      {
        heading: "EU-vertegenwoordiger",
        blocks: [`${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address}`],
      },
      {
        heading: "Verantwoordelijk voor de inhoud",
        blocks: [`${COMPANY.representative}, adres zoals hierboven.`],
      },
    ],
  },
}
