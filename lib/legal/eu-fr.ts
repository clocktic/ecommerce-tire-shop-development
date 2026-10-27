import { COMPANY, EU_PRESENCE, companyAddressLine } from "@/lib/company"
import { CONSENT_MAX_AGE_DAYS } from "@/components/legal/consent"
import { POLICIES } from "@/lib/policies"
import { euFr } from "@/lib/i18n/dictionaries/fr"
import type { PolicyDoc } from "@/lib/legal/types"
import { EU_SNIPPETS } from "@/lib/legal/eu-customs"

// French version of lib/legal/eu.ts. Same facts and numbers; update all EU
// language files together. Withdrawal wording follows the official model
// (Directive 2011/83/UE, annexe I).
const p = POLICIES.eu
const s = p.shipping
const r = p.returns
const t = euFr.policy
const contactLine = `${COMPANY.email} · ${COMPANY.phoneDisplay} (${euFr.company.hours})`
const seller = `${COMPANY.legalName}, ${companyAddressLine}, e-mail ${COMPANY.email}, téléphone ${COMPANY.phoneDisplay}`
const bulky = "au maximum environ 25 € par pneu ou jante et 15 € par colis de freinage"
const payments = p.paymentMethods.map((m) => (m === "SEPA bank transfer" ? "Virement SEPA" : m))

const SNIP = EU_SNIPPETS.fr

export const EU_POLICIES_FR: Record<string, PolicyDoc> = {
  shipping: {
    title: "Conditions de livraison",
    description: SNIP.shippingDescription,
    intro: SNIP.shippingIntro,
    sections: [
      {
        heading: "Zone de livraison",
        blocks: [
          `Nous livrons ${t.area}. Nous ne livrons pas ${t.exclusions}.`,
          "Vous pouvez faire livrer pneus et jantes directement dans un centre de montage. Indiquez le nom du centre dans le champ Société.",
        ],
      },
      {
        heading: "Coûts, droits de douane et TVA à l’importation",
        blocks: [
          s.freeShipping ? "La livraison est gratuite pour toutes les commandes, sans minimum d’achat." : "Les frais de livraison sont indiqués avant la validation de la commande.",
          t.duties,
          SNIP.paymentsVat.blocks[1],
        ],
      },
      {
        heading: "Délais de livraison",
        blocks: [
          {
            rows: [
              ["Heure limite de commande", `${s.cutoff}, du lundi au vendredi`],
              ["Délai de préparation", `${s.handlingDays[0]} à ${s.handlingDays[1]} jours ouvrés`],
              ["Délai d’acheminement", `${s.transitDays[0]} à ${s.transitDays[1]} jours ouvrés`],
              ["Délai total de livraison", t.days],
              ["Transporteurs", s.carriers.join(", ")],
              ["Expédié depuis", EU_PRESENCE.dispatchCountry],
            ],
          },
          "Si nous ne pouvons pas livrer dans les 30 jours suivant votre commande et qu’aucune date ultérieure n’a été convenue avec vous, vous pouvez annuler la commande et être intégralement remboursé.",
        ],
      },
      {
        heading: "Suivi",
        blocks: ["Vous recevez un e-mail d’expédition avec un lien de suivi. Un jeu de quatre pneus est généralement envoyé en quatre colis, qui peuvent arriver à des jours différents."],
      },
      {
        heading: "Colis endommagés",
        blocks: [
          "Veuillez vérifier les colis à la livraison et, si possible, signaler tout dommage visible au livreur. Envoyez-nous des photos par e-mail dès que possible. Vos droits légaux ne sont pas affectés si vous ne le faites pas — cela nous aide simplement à réclamer auprès du transporteur.",
          "Le risque de perte ou d’endommagement ne vous est transféré qu’au moment où vous, ou une personne désignée par vous, prenez physiquement possession des biens.",
        ],
      },
      { heading: "Contact", blocks: [contactLine] },
    ],
  },

  returns: {
    title: "Droit de rétractation et retours",
    description: `Droit de rétractation de ${r.windowDays} jours pour les consommateurs de l’UE.`,
    intro: "Si vous êtes un consommateur, vous disposez d’un droit légal de rétractation. Les informations ci-dessous suivent le modèle européen (directive 2011/83/UE, annexe I).",
    sections: [
      {
        heading: "Droit de rétractation",
        blocks: [
          `Vous avez le droit de vous rétracter du présent contrat sans donner de motif dans un délai de ${r.windowDays} jours.`,
          `Le délai de rétractation expire ${r.windowDays} jours après le jour où vous-même, ou un tiers autre que le transporteur et désigné par vous, prenez physiquement possession des biens. Si vous avez commandé plusieurs biens livrés séparément, le délai expire ${r.windowDays} jours après le jour où vous-même, ou le tiers désigné, prenez physiquement possession du dernier bien.`,
          `Pour exercer le droit de rétractation, vous devez nous notifier (${seller}) votre décision de rétractation du présent contrat au moyen d’une déclaration dénuée d’ambiguïté (par exemple un e-mail). Vous pouvez utiliser le modèle de formulaire de rétractation, mais ce n’est pas obligatoire.`,
          { link: { href: "/policies/withdrawal-form", label: "Modèle de formulaire de rétractation" } },
          "Pour que le délai de rétractation soit respecté, il suffit que vous transmettiez votre communication relative à l’exercice du droit de rétractation avant l’expiration du délai de rétractation.",
        ],
      },
      {
        heading: "Effets de la rétractation",
        blocks: [
          `En cas de rétractation de votre part du présent contrat, nous vous rembourserons tous les paiements reçus de vous, y compris les frais de livraison (à l’exception des frais supplémentaires découlant du fait que vous avez choisi, le cas échéant, un mode de livraison autre que le mode moins coûteux de livraison standard proposé par nous), sans retard excessif et, en tout état de cause, au plus tard ${r.refundDays} jours à compter du jour où nous sommes informés de votre décision de rétractation du présent contrat. Nous procéderons au remboursement en utilisant le même moyen de paiement que celui que vous aurez utilisé pour la transaction initiale, sauf si vous convenez expressément d’un moyen différent ; en tout état de cause, ce remboursement n’occasionnera pas de frais pour vous.`,
          "Nous pouvons différer le remboursement jusqu’à ce que nous ayons reçu le bien ou jusqu’à ce que vous ayez fourni une preuve d’expédition du bien, la date retenue étant celle du premier de ces faits.",
          `Vous devrez renvoyer le bien à l’adresse indiquée dans l’e-mail d’autorisation de retour (RMA) sans retard excessif et, en tout état de cause, au plus tard ${r.windowDays} jours après que vous nous aurez communiqué votre décision de rétractation du présent contrat. Ce délai est réputé respecté si vous renvoyez le bien avant l’expiration du délai de ${r.windowDays} jours.`,
          r.returnShippingPaidBy === "merchant"
            ? "Nous prendrons en charge les frais de renvoi du bien."
            : `Vous devrez prendre en charge les frais directs de renvoi du bien. Les pneus, jantes et kits de freinage ne peuvent normalement pas être renvoyés par la poste ; ces frais sont estimés à ${bulky}. Sur demande, nous pouvons vous envoyer une étiquette prépayée à ce prix.`,
          "Votre responsabilité est engagée uniquement à l’égard de la dépréciation du bien résultant de manipulations autres que celles nécessaires pour établir la nature, les caractéristiques et le bon fonctionnement de ce bien.",
        ],
      },
      {
        heading: "Ce qui va au-delà d’un simple examen",
        blocks: [
          "Vous pouvez déballer et examiner les articles comme vous le feriez en magasin. Les actions suivantes vont au-delà et peuvent réduire le remboursement à hauteur de la perte de valeur :",
          {
            list: [
              "Monter un pneu sur une jante, le gonfler ou rouler avec.",
              "Fixer une jante sur un véhicule avec les boulons ou écrous serrés.",
              "Installer ou roder des plaquettes, disques ou étriers de frein.",
            ],
          },
        ],
      },
      {
        heading: "Exclusions",
        blocks: [
          "Le droit de rétractation ne s’applique pas aux biens confectionnés selon vos spécifications ou nettement personnalisés (par exemple une jante fabriquée sur commande avec une finition ou un perçage spécifique). Un tel article est signalé sur sa fiche produit avant la commande.",
        ],
      },
      {
        heading: "Démarche pratique",
        blocks: [
          {
            list: [
              `Écrivez à ${COMPANY.email} en indiquant votre numéro de commande, ou envoyez le modèle de formulaire de rétractation.`,
              "Nous accusons réception de votre rétractation par e-mail et vous envoyons l’adresse de retour et, sur demande, une étiquette prépayée.",
              "Emballez soigneusement les articles, si possible dans leur emballage d’origine.",
            ],
          },
        ],
      },
      {
        heading: "Annulation avant expédition",
        blocks: ["Vous pouvez annuler gratuitement tant que la commande n’est pas expédiée — écrivez-nous et nous vous remboursons intégralement."],
      },
      {
        heading: "Articles défectueux ou erronés",
        blocks: ["Si un article est défectueux ou ne correspond pas à votre commande, la garantie légale s’applique et nous prenons en charge tous les frais de retour. Voir Garantie légale et garantie commerciale."],
      },
      SNIP.returnsSection,
    ],
  },

  "withdrawal-form": {
    title: "Modèle de formulaire de rétractation",
    description: "Modèle européen de formulaire de rétractation (directive 2011/83/UE, annexe I, partie B).",
    intro: "Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat. Vous pouvez copier le texte dans un e-mail.",
    sections: [
      {
        heading: "Formulaire",
        blocks: [
          `À l’attention de : ${seller}`,
          "Je/Nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*)/pour la prestation de services (*) ci-dessous :",
          {
            rows: [
              ["Commandé le (*) / reçu le (*)", "________________"],
              ["Numéro de commande", "________________"],
              ["Nom du (des) consommateur(s)", "________________"],
              ["Adresse du (des) consommateur(s)", "________________"],
              ["Signature du (des) consommateur(s) (uniquement en cas de notification sur papier)", "________________"],
              ["Date", "________________"],
            ],
          },
          { note: "(*) Rayez la mention inutile." },
        ],
      },
    ],
  },

  warranty: {
    title: "Garantie légale et garantie commerciale",
    description: "Garantie légale de conformité de 2 ans pour les consommateurs de l’UE, plus les garanties des fabricants.",
    intro: "En tant que consommateur dans l’UE, vous bénéficiez de la garantie légale de conformité des biens (directive (UE) 2019/771), transposée dans le droit de votre pays.",
    sections: [
      {
        heading: "Garantie légale de conformité",
        blocks: [
          `Nous répondons de tout défaut de conformité existant lors de la livraison et apparaissant dans un délai de ${p.warranty.months! / 12} ans à compter de la livraison. Cette garantie est gratuite.`,
          "Si un défaut apparaît au cours de la première année suivant la livraison (deux ans dans certains États membres), il est présumé avoir existé lors de la livraison, sauf preuve contraire de notre part.",
        ],
      },
      {
        heading: "Vos recours",
        blocks: [
          {
            list: [
              "La réparation ou le remplacement, à votre choix, sauf si le recours choisi est impossible ou disproportionné.",
              "Une réduction du prix ou la résolution du contrat avec remboursement, si la réparation ou le remplacement est impossible, échoue ou prend un délai déraisonnable.",
            ],
          },
          "Nous prenons en charge tous les frais de mise en conformité, y compris les frais de retour.",
        ],
      },
      {
        heading: "Ce qui n’est pas un défaut",
        blocks: [
          "L’usure normale (usure de la bande de roulement, des plaquettes et des disques), les dommages dus à des crevaisons, chocs contre un trottoir, une pression incorrecte, une surcharge, un montage incorrect ou une utilisation en compétition ne constituent pas un défaut de conformité.",
        ],
      },
      {
        heading: "Garantie du fabricant",
        blocks: [
          "De nombreux fabricants proposent en outre une garantie commerciale. Ses conditions sont fixées par le fabricant et indiquées sur la fiche produit lorsqu’elles sont disponibles. Une garantie du fabricant s’ajoute à vos droits au titre de la garantie légale et ne les limite pas.",
        ],
      },
      {
        heading: "Comment faire une réclamation",
        blocks: [`Écrivez à ${COMPANY.email} avec votre numéro de commande, des photos et une brève description (pour les pneus, indiquez le code DOT inscrit sur le flanc). Nous répondons sous 2 jours ouvrés.`],
      },
    ],
  },

  payments: {
    title: "Moyens de paiement",
    description: SNIP.paymentsDescription,
    intro: SNIP.paymentsIntro,
    sections: [
      { heading: "Moyens acceptés", blocks: [{ list: payments }] },
      {
        heading: "Quand vous êtes débité",
        blocks: [
          "Les paiements par carte et PayPal sont autorisés lors de la commande et encaissés à l’expédition. Pour un virement SEPA, la commande est expédiée dès réception du paiement ; les coordonnées bancaires figurent dans votre confirmation de commande.",
        ],
      },
      {
        heading: "Sécurité",
        blocks: ["Les paiements par carte utilisent l’authentification forte du client (3-D Secure) exigée par la directive européenne sur les services de paiement. Nous ne conservons pas les numéros de carte complets."],
      },
      { heading: "Aucun supplément", blocks: ["Nous ne facturons aucun frais, quel que soit le moyen de paiement."] },
      SNIP.paymentsVat,
    ],
  },

  terms: {
    title: "Conditions générales de vente",
    description: `Conditions générales de vente de la boutique UE de ${COMPANY.tradingName}.`,
    intro: `Les présentes conditions s’appliquent aux contrats conclus via la boutique UE de ${COMPANY.tradingName} entre vous et ${COMPANY.legalName}, ${companyAddressLine} (« nous »).`,
    sections: [
      { heading: "Vendeur", blocks: [seller, `${COMPANY.stateOfFormation} Secretary of State: ${COMPANY.registrationNumber}`] },
      {
        heading: "Conclusion du contrat",
        blocks: [
          "Les fiches produits constituent une invitation à commander. En cliquant sur « Commander avec obligation de paiement », vous faites une offre ferme. Nous accusons réception immédiatement par e-mail ; cet accusé ne vaut pas encore acceptation. Le contrat est conclu lorsque nous envoyons la confirmation d’expédition, au plus tard à la livraison des biens.",
          "La langue du contrat est celle de la version de la boutique dans laquelle vous passez commande (français, anglais, allemand, italien, espagnol ou néerlandais). Nous conservons le texte du contrat et vous envoyons le détail de la commande et les présentes conditions par e-mail.",
        ],
      },
      {
        heading: "Prix",
        blocks: [SNIP.pricesText],
      },
      { heading: "Livraison", blocks: ["Les modalités de livraison sont décrites dans les Conditions de livraison."] },
      { heading: "Droit de rétractation", blocks: [`Les consommateurs disposent d’un droit de rétractation de ${r.windowDays} jours, décrit dans Droit de rétractation et retours.`] },
      { heading: "Garantie légale", blocks: ["La garantie légale de conformité s’applique, comme décrit dans Garantie légale et garantie commerciale."] },
      {
        heading: "Compatibilité et montage",
        blocks: [
          "Vérifiez que la dimension, l’indice de charge, l’indice de vitesse, l’entraxe, le déport et la compatibilité des freins correspondent au certificat d’immatriculation ou au certificat de conformité de votre véhicule. Selon votre pays, certaines jantes et pièces de freinage nécessitent une homologation ou une inscription. Nous recommandons un montage par un professionnel qualifié.",
        ],
      },
      {
        heading: "Responsabilité",
        blocks: [
          "Notre responsabilité est illimitée en cas de faute intentionnelle ou lourde, ainsi qu’en cas d’atteinte à la vie, à l’intégrité physique ou à la santé. La responsabilité du fait des produits défectueux et la garantie légale ne sont pas affectées. Pour le reste, notre responsabilité en cas de faute légère est limitée au dommage prévisible et typique du contrat.",
        ],
      },
      {
        heading: "Droit applicable",
        blocks: [
          `Les présentes conditions sont régies par le droit de l’État de ${COMPANY.stateOfFormation}, États-Unis. Si vous êtes un consommateur, ce choix de loi ne vous prive pas de la protection des dispositions impératives de la loi du pays de votre résidence habituelle. Vous pouvez également saisir les juridictions de votre pays de résidence.`,
        ],
      },
      {
        heading: "Règlement des litiges",
        blocks: ["Contactez-nous d’abord — la plupart des problèmes sont résolus en quelques jours. Nous ne sommes pas tenus de participer, et ne participons pas, à une procédure de règlement des litiges devant un organisme de médiation de la consommation."],
      },
      SNIP.termsSection,
    ],
  },

  privacy: {
    title: "Politique de confidentialité",
    description: "Comment nous traitons les données personnelles des visiteurs et clients dans l’UE (RGPD).",
    intro: "Cette politique explique comment nous traitons vos données personnelles conformément au règlement général sur la protection des données (UE) 2016/679 (RGPD) lorsque vous utilisez la boutique UE.",
    sections: [
      {
        heading: "Responsable du traitement et représentant dans l’UE",
        blocks: [
          {
            rows: [
              ["Responsable du traitement", `${COMPANY.legalName}, ${companyAddressLine}`],
              ["Contact", COMPANY.privacyEmail],
              ["Représentant dans l’UE (art. 27 RGPD)", `${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address}, ${EU_PRESENCE.gdprRepresentative.email}`],
            ],
          },
        ],
      },
      {
        heading: "Données traitées, finalités et bases légales",
        blocks: [
          {
            rows: [
              ["Données de commande et de livraison (nom, adresse, e-mail, téléphone, contenu de la commande)", "Exécution du contrat — art. 6, par. 1, point b)"],
              ["Factures et pièces comptables", "Obligation légale (droit fiscal) — art. 6, par. 1, point c)"],
              ["Prévention de la fraude et sécurité informatique, journaux serveur", "Intérêts légitimes — art. 6, par. 1, point f)"],
              ["Messages au service client", "Contrat ou intérêts légitimes — art. 6, par. 1, points b)/f)"],
              ["Cookies de mesure d’audience et de publicité", "Consentement — art. 6, par. 1, point a)"],
            ],
          },
        ],
      },
      {
        heading: "Destinataires",
        blocks: [
          "Prestataires de paiement, transporteurs et nos partenaires logistiques aux États-Unis, hébergeurs et fournisseurs d’e-mail et — uniquement avec votre consentement — Google pour la mesure d’audience et la publicité. Les sous-traitants agissent sur nos instructions dans le cadre de contrats de sous-traitance.",
        ],
      },
      {
        heading: "Transferts internationaux",
        blocks: [
          "Nous sommes une société américaine : vos données sont donc transférées aux États-Unis. Ces transferts reposent sur le cadre de protection des données UE–États-Unis (Data Privacy Framework) lorsque le destinataire est certifié, et à défaut sur les clauses contractuelles types de la Commission européenne (art. 46, par. 2, point c) RGPD). Vous pouvez nous demander une copie de ces garanties.",
        ],
      },
      {
        heading: "Durée de conservation",
        blocks: [
          "Les données de commande et de facturation sont conservées pendant la durée imposée par le droit fiscal et commercial applicable (jusqu’à 10 ans). Les messages au service client sont supprimés 3 ans après le dernier contact. Les preuves de consentement sont conservées pendant la validité du consentement, augmentée du délai de prescription.",
        ],
      },
      {
        heading: "Vos droits",
        blocks: [
          {
            list: [
              "Accès (art. 15) et rectification (art. 16)",
              "Effacement (art. 17) et limitation du traitement (art. 18)",
              "Portabilité des données (art. 20)",
              "Opposition à un traitement fondé sur l’intérêt légitime (art. 21)",
              "Retrait du consentement à tout moment, pour l’avenir (art. 7, par. 3) — via Paramètres des cookies en bas de page",
            ],
          },
          `Contactez ${COMPANY.privacyEmail} ou notre représentant dans l’UE. Vous avez également le droit d’introduire une réclamation auprès d’une autorité de contrôle de la protection des données, notamment dans l’État membre de votre résidence.`,
        ],
      },
      { heading: "Décisions automatisées", blocks: ["Nous ne prenons aucune décision fondée exclusivement sur un traitement automatisé produisant des effets juridiques vous concernant ou vous affectant de manière significative de façon similaire."] },
      { heading: "Modifications", blocks: ["Toute modification sera publiée sur cette page avec une nouvelle date d’effet."] },
    ],
  },

  cookies: {
    title: "Politique relative aux cookies",
    description: "Les cookies et technologies similaires utilisés par la boutique UE et la gestion de votre consentement.",
    intro: "Nous ne déposons que des cookies strictement nécessaires tant que vous n’avez pas donné votre consentement. Vous pouvez modifier votre choix à tout moment via Paramètres des cookies en bas de page.",
    sections: [
      {
        heading: "Strictement nécessaires (sans consentement)",
        blocks: [
          {
            rows: [
              ["cp_market", "Mémorise la région de boutique choisie — 12 mois"],
              ["cp_geo", "Région de boutique suggérée selon votre pays — 12 mois"],
              ["cp_lang", "Mémorise la langue choisie — 12 mois"],
              ["cp-cart-eu-v1 (stockage local)", "Conserve le contenu de votre panier — jusqu’à suppression"],
              ["cp-consent-v1 (stockage local)", `Enregistre votre choix en matière de cookies — ${Math.round(CONSENT_MAX_AGE_DAYS / 30.4)} mois`],
            ],
          },
        ],
      },
      {
        heading: "Mesure d’audience (consentement requis)",
        blocks: [{ rows: [["_ga, _ga_<id> (Google Analytics)", "Distingue les visites pour produire des statistiques agrégées — 14 mois"]] }],
      },
      {
        heading: "Publicité (consentement requis)",
        blocks: [{ rows: [["_gcl_au, _gcl_aw (Google Ads)", "Mesure les conversions publicitaires — 90 jours"]] }],
      },
      {
        heading: "Google Consent Mode",
        blocks: [
          "Nous utilisons Google Consent Mode v2. Tant que vous n’avez pas consenti, le stockage à des fins de mesure d’audience et de publicité est refusé et aucun cookie correspondant n’est déposé. Votre consentement vous est redemandé à son expiration.",
        ],
      },
    ],
  },

  "legal-notice": {
    title: "Mentions légales",
    description: "Informations sur l’exploitant de la boutique.",
    intro: `La boutique UE de ${COMPANY.tradingName} est exploitée par :`,
    sections: [
      {
        heading: "Exploitant",
        blocks: [
          {
            rows: [
              ["Société", COMPANY.legalName],
              ["Forme juridique", `Limited liability company de droit de l’État de ${COMPANY.stateOfFormation}, États-Unis`],
              ["Immatriculation", `${COMPANY.stateOfFormation} Secretary of State, n° ${COMPANY.registrationNumber}`],
              ["Adresse", companyAddressLine],
              ["Représentée par", `${COMPANY.representative}, ${COMPANY.representativeRole}`],
              ["E-mail", COMPANY.email],
              ["Téléphone", COMPANY.phoneDisplay],
              ["Seller's permit (CDTFA)", COMPANY.sellerPermit],
            ],
          },
        ],
      },
      {
        heading: "Représentant dans l’UE",
        blocks: [`${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address}`],
      },
      {
        heading: "Directeur de la publication",
        blocks: [`${COMPANY.representative}, adresse ci-dessus.`],
      },
    ],
  },
}
