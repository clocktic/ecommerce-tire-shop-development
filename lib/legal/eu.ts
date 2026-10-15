import { COMPANY, EU_PRESENCE, companyAddressLine } from "@/lib/company"
import { CONSENT_MAX_AGE_DAYS } from "@/components/legal/consent"
import { POLICIES, deliveryLabel } from "@/lib/policies"
import type { PolicyDoc } from "@/lib/legal/types"

const p = POLICIES.eu
const s = p.shipping
const r = p.returns
const contactLine = `${COMPANY.email} · ${COMPANY.phoneDisplay} (${COMPANY.hours})`
const seller = `${COMPANY.legalName}, ${companyAddressLine}, email ${COMPANY.email}, phone ${COMPANY.phoneDisplay}`

export const EU_POLICIES: Record<string, PolicyDoc> = {
  shipping: {
    title: "Delivery Policy",
    description: `Free delivery to ${s.area}. VAT included, no customs fees. ${deliveryLabel("eu")}.`,
    intro: `This policy applies to orders placed in the ${COMPANY.tradingName} EU store (prices in EUR, VAT included).`,
    sections: [
      {
        heading: "Delivery area",
        blocks: [
          `We deliver to ${s.area}. We do not deliver to ${s.exclusions}.`,
          "You may have tyres and wheels delivered directly to a fitting centre. Enter the centre's name in the company field.",
        ],
      },
      {
        heading: "Cost, VAT and customs",
        blocks: [
          s.freeShipping ? "Delivery is free on every order, with no minimum order value." : "Delivery costs are shown before you place the order.",
          `${s.duties} Prices include the VAT of your country, collected under the ${EU_PRESENCE.vatScheme}.`,
        ],
      },
      {
        heading: "Delivery times",
        blocks: [
          {
            rows: [
              ["Order cut-off", `${s.cutoff}, Monday–Friday`],
              ["Handling time", `${s.handlingDays[0]}–${s.handlingDays[1]} working days`],
              ["Transit time", `${s.transitDays[0]}–${s.transitDays[1]} working days`],
              ["Total delivery time", deliveryLabel("eu").replace("business", "working")],
              ["Carriers", s.carriers.join(", ")],
              ["Dispatched from", EU_PRESENCE.warehouseCountry],
            ],
          },
          "If we cannot deliver within 30 days of your order and do not agree a later date with you, you may cancel the order and receive a full refund.",
        ],
      },
      {
        heading: "Tracking",
        blocks: ["You receive a dispatch email with a tracking link. A set of four tyres usually ships as four parcels and may arrive on different days."],
      },
      {
        heading: "Damaged parcels",
        blocks: [
          "Please check parcels on delivery and, if possible, note any visible damage with the driver. Email us photos as soon as you can. Your statutory rights are not affected if you do not do this — it simply helps us claim from the carrier.",
          "The risk of loss or damage passes to you only when you, or a person you nominated, take physical possession of the goods.",
        ],
      },
      { heading: "Contact", blocks: [contactLine] },
    ],
  },

  returns: {
    title: "Right of Withdrawal & Returns",
    description: `${r.windowDays}-day right of withdrawal for consumers in the EU.`,
    intro: "If you are a consumer, you have a statutory right of withdrawal. The instructions below follow the EU model (Directive 2011/83/EU, Annex I).",
    sections: [
      {
        heading: "Right of withdrawal",
        blocks: [
          `You have the right to withdraw from this contract within ${r.windowDays} days without giving any reason.`,
          `The withdrawal period will expire after ${r.windowDays} days from the day on which you acquire, or a third party other than the carrier and indicated by you acquires, physical possession of the goods. If you ordered multiple goods delivered separately, the period expires ${r.windowDays} days after you, or your nominated third party, acquire physical possession of the last good.`,
          `To exercise the right of withdrawal, you must inform us (${seller}) of your decision to withdraw from this contract by an unequivocal statement (e.g. an email). You may use the model withdrawal form, but it is not obligatory.`,
          { link: { href: "/eu/policies/withdrawal-form", label: "Model withdrawal form" } },
          "To meet the withdrawal deadline, it is sufficient for you to send your communication concerning your exercise of the right of withdrawal before the withdrawal period has expired.",
        ],
      },
      {
        heading: "Effects of withdrawal",
        blocks: [
          `If you withdraw from this contract, we shall reimburse to you all payments received from you, including the costs of delivery (with the exception of supplementary costs resulting from your choice of a type of delivery other than the least expensive type of standard delivery offered by us), without undue delay and in any event not later than ${r.refundDays} days from the day on which we are informed about your decision to withdraw from this contract. We will carry out such reimbursement using the same means of payment as you used for the initial transaction, unless you have expressly agreed otherwise; in any event, you will not incur any fees as a result of such reimbursement.`,
          "We may withhold reimbursement until we have received the goods back or you have supplied evidence of having sent back the goods, whichever is the earliest.",
          `You shall send back the goods to ${EU_PRESENCE.returnsAddress} without undue delay and in any event not later than ${r.windowDays} days from the day on which you communicate your withdrawal from this contract to us. The deadline is met if you send back the goods before the period of ${r.windowDays} days has expired.`,
          r.returnShippingPaidBy === "merchant"
            ? "We will bear the cost of returning the goods."
            : `You will have to bear the direct cost of returning the goods. Tyres, wheels and brake kits cannot normally be returned by ordinary post; the cost is estimated at ${r.bulkyReturnCostEstimate}. We can send you a prepaid label at that cost on request.`,
          "You are only liable for any diminished value of the goods resulting from handling other than what is necessary to establish the nature, characteristics and functioning of the goods.",
        ],
      },
      {
        heading: "What counts as handling beyond inspection",
        blocks: [
          "You can unpack and inspect items as you would in a shop. The following go beyond that and may reduce the refund by the loss in value:",
          {
            list: [
              "Mounting a tyre on a rim, inflating it or driving on it.",
              "Fitting a wheel to a vehicle with wheel bolts or nuts tightened.",
              "Installing or bedding in brake pads, discs or calipers.",
            ],
          },
        ],
      },
      {
        heading: "Exclusions",
        blocks: [
          "The right of withdrawal does not apply to goods made to your specifications or clearly personalised (for example a wheel produced to order in a custom finish or drilling). Any such item is marked on its product page before you order.",
        ],
      },
      {
        heading: "Practical steps",
        blocks: [
          {
            list: [
              `Email ${COMPANY.email} with your order number, or send the model withdrawal form.`,
              "We confirm receipt of your withdrawal by email and send the return address and, on request, a prepaid label.",
              "Pack the items securely in the original packaging if you still have it.",
            ],
          },
        ],
      },
      {
        heading: "Cancellation before dispatch",
        blocks: ["You can cancel free of charge until the order is dispatched — email us and we refund in full."],
      },
      {
        heading: "Faulty or wrong items",
        blocks: ["If an item is faulty or not what you ordered, your rights under the legal guarantee apply and we cover all return costs. See Legal Guarantee & Warranty."],
      },
    ],
  },

  "withdrawal-form": {
    title: "Model Withdrawal Form",
    description: "EU model withdrawal form (Directive 2011/83/EU, Annex I(B)).",
    intro: "Complete and return this form only if you wish to withdraw from the contract. You can copy the text into an email.",
    sections: [
      {
        heading: "Form",
        blocks: [
          `To: ${seller}`,
          "I/We (*) hereby give notice that I/We (*) withdraw from my/our (*) contract of sale of the following goods (*)/for the provision of the following service (*):",
          {
            rows: [
              ["Ordered on (*) / received on (*)", "________________"],
              ["Order number", "________________"],
              ["Name of consumer(s)", "________________"],
              ["Address of consumer(s)", "________________"],
              ["Signature of consumer(s) (only if this form is notified on paper)", "________________"],
              ["Date", "________________"],
            ],
          },
          { note: "(*) Delete as appropriate." },
        ],
      },
    ],
  },

  warranty: {
    title: "Legal Guarantee & Warranty",
    description: "Statutory 2-year legal guarantee of conformity for EU consumers, plus manufacturer warranties.",
    intro: "As a consumer in the EU you benefit from a legal guarantee of conformity for goods (Directive (EU) 2019/771), implemented in the law of your country.",
    sections: [
      {
        heading: "Legal guarantee of conformity",
        blocks: [
          `We are liable for any lack of conformity that exists when the goods are delivered and becomes apparent within ${p.warranty.months! / 12} years of delivery. This guarantee is free of charge.`,
          "If a defect appears within the first year after delivery (two years in some Member States), it is presumed to have existed at delivery unless we prove otherwise.",
        ],
      },
      {
        heading: "Your remedies",
        blocks: [
          {
            list: [
              "Repair or replacement, at your choice, unless the chosen remedy is impossible or disproportionate.",
              "A price reduction or termination of the contract with a refund, if repair or replacement is not possible, fails or takes an unreasonable time.",
            ],
          },
          "We bear all costs of remedying the defect, including return shipping.",
        ],
      },
      {
        heading: "What is not a defect",
        blocks: [
          "Normal wear (tread wear, pad and disc wear), damage from punctures, kerb impacts, incorrect inflation, overloading, incorrect installation or use in competition is not a lack of conformity.",
        ],
      },
      {
        heading: "Manufacturer warranty",
        blocks: [
          "Many manufacturers additionally offer a commercial warranty. Its terms are set by the manufacturer and linked on the product page where available. A manufacturer warranty is in addition to, and does not limit, your legal guarantee rights.",
        ],
      },
      {
        heading: "How to make a claim",
        blocks: [`Email ${COMPANY.email} with your order number, photos and a short description (for tyres, include the DOT code on the sidewall). We reply within 2 working days.`],
      },
    ],
  },

  payments: {
    title: "Payment Methods",
    description: `Pay with ${p.paymentMethods.join(", ")}. Prices in EUR, VAT included.`,
    intro: "All prices in the EU store are in euro (EUR) and include VAT.",
    sections: [
      { heading: "Accepted methods", blocks: [{ list: p.paymentMethods }] },
      {
        heading: "When you are charged",
        blocks: [
          "Card and PayPal payments are authorised when you place the order and captured on dispatch. For SEPA bank transfer, the order is dispatched once the payment is received; the bank details are in your order confirmation.",
        ],
      },
      {
        heading: "Security",
        blocks: ["Card payments use Strong Customer Authentication (3-D Secure) as required by the EU Payment Services Directive. We do not store full card numbers."],
      },
      { heading: "No surcharges", blocks: ["We do not charge any fee for any payment method."] },
      { heading: "VAT", blocks: [`VAT is included in every price and collected under the ${EU_PRESENCE.vatScheme}, identification number ${EU_PRESENCE.vatNumber}. You receive a VAT invoice by email.`] },
    ],
  },

  terms: {
    title: "Terms & Conditions",
    description: `General terms and conditions for purchases from the ${COMPANY.tradingName} EU store.`,
    intro: `These terms apply to contracts concluded through the ${COMPANY.tradingName} EU store between you and ${COMPANY.legalName}, ${companyAddressLine} ("we").`,
    sections: [
      { heading: "Seller", blocks: [seller, `EU VAT (OSS): ${EU_PRESENCE.vatNumber}`] },
      {
        heading: "Conclusion of the contract",
        blocks: [
          "Product listings are an invitation to order. By clicking \"Order with obligation to pay\" you make a binding offer. We confirm receipt by email immediately; this is not yet an acceptance. The contract is concluded when we send the dispatch confirmation, or at the latest when the goods are delivered.",
          "The contract language is English. We store the contract text and send you the order details and these terms by email.",
        ],
      },
      {
        heading: "Prices",
        blocks: ["All prices are in EUR and include VAT. Delivery costs, if any, are shown before you order."],
      },
      { heading: "Delivery", blocks: ["Delivery terms are set out in the Delivery Policy."] },
      { heading: "Right of withdrawal", blocks: [`Consumers have a ${r.windowDays}-day right of withdrawal as described in Right of Withdrawal & Returns.`] },
      { heading: "Legal guarantee", blocks: ["The statutory legal guarantee of conformity applies, as described in Legal Guarantee & Warranty."] },
      {
        heading: "Fitment and installation",
        blocks: [
          "Please check that size, load index, speed rating, bolt pattern, offset and brake fitment match your vehicle's registration documents or certificate of conformity. Some wheels and brake components require an approval or registration entry depending on your country. We recommend installation by a qualified fitter.",
        ],
      },
      {
        heading: "Liability",
        blocks: [
          "We are liable without limitation for intent and gross negligence, and for injury to life, body or health. Liability under product liability law and the legal guarantee is not affected. Otherwise, our liability for slight negligence is limited to foreseeable damage typical of the contract.",
        ],
      },
      {
        heading: "Applicable law",
        blocks: [
          `These terms are governed by the laws of the State of ${COMPANY.stateOfFormation}, United States. If you are a consumer, this choice of law does not deprive you of the protection of the mandatory provisions of the law of the country where you have your habitual residence. You may also bring proceedings in the courts of your country of residence.`,
        ],
      },
      {
        heading: "Dispute resolution",
        blocks: ["Please contact us first — most issues are solved within a few days. We are not obliged to participate, and do not participate, in dispute resolution proceedings before a consumer arbitration body."],
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    description: "How we process personal data of visitors and customers in the EU (GDPR).",
    intro: "This policy explains how we process your personal data under the General Data Protection Regulation (EU) 2016/679 (GDPR) when you use the EU store.",
    sections: [
      {
        heading: "Controller and EU representative",
        blocks: [
          {
            rows: [
              ["Controller", `${COMPANY.legalName}, ${companyAddressLine}`],
              ["Contact", COMPANY.privacyEmail],
              ["EU representative (Art. 27 GDPR)", `${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address}, ${EU_PRESENCE.gdprRepresentative.email}`],
            ],
          },
        ],
      },
      {
        heading: "Data we process, purposes and legal bases",
        blocks: [
          {
            rows: [
              ["Order and delivery data (name, address, email, phone, order contents)", "Performance of the contract — Art. 6(1)(b)"],
              ["Invoices and accounting records", "Legal obligation (tax law) — Art. 6(1)(c)"],
              ["Fraud prevention and IT security, server logs", "Legitimate interests — Art. 6(1)(f)"],
              ["Customer service messages", "Contract or legitimate interests — Art. 6(1)(b)/(f)"],
              ["Analytics and advertising cookies", "Consent — Art. 6(1)(a)"],
            ],
          },
        ],
      },
      {
        heading: "Recipients",
        blocks: [
          "Payment providers, delivery carriers and our EU warehouse, hosting and email providers, and — only with your consent — Google for analytics and advertising. Processors act on our instructions under data processing agreements.",
        ],
      },
      {
        heading: "International transfers",
        blocks: [
          "We are a US company, so your data is transferred to the United States. Transfers are based on the EU–US Data Privacy Framework where the recipient is certified, and otherwise on the European Commission's Standard Contractual Clauses (Art. 46(2)(c) GDPR). You can request a copy of the safeguards from us.",
        ],
      },
      {
        heading: "Retention",
        blocks: [
          "Order and invoice data are kept for the period required by applicable tax and commercial law (up to 10 years). Customer service messages are deleted 3 years after the last contact. Consent records are kept for as long as the consent is valid plus the limitation period.",
        ],
      },
      {
        heading: "Your rights",
        blocks: [
          {
            list: [
              "Access (Art. 15) and rectification (Art. 16)",
              "Erasure (Art. 17) and restriction of processing (Art. 18)",
              "Data portability (Art. 20)",
              "Objection to processing based on legitimate interests (Art. 21)",
              "Withdrawal of consent at any time, with effect for the future (Art. 7(3)) — via Cookie settings in the footer",
            ],
          },
          `Contact ${COMPANY.privacyEmail} or our EU representative. You also have the right to lodge a complaint with a data protection supervisory authority, in particular in the Member State of your residence.`,
        ],
      },
      { heading: "Automated decisions", blocks: ["We do not make decisions based solely on automated processing that have legal or similarly significant effects on you."] },
      { heading: "Changes", blocks: ["We will post any changes on this page with a new effective date."] },
    ],
  },

  cookies: {
    title: "Cookie Policy",
    description: "Which cookies and similar technologies the EU store uses and how to manage consent.",
    intro: "We only set strictly necessary cookies until you give consent. You can change your choice at any time via Cookie settings in the footer.",
    sections: [
      {
        heading: "Strictly necessary (no consent required)",
        blocks: [
          {
            rows: [
              ["cp_market", "Remembers the store region you chose — 12 months"],
              ["cp_geo", "Store region suggested from your country — 12 months"],
              ["cp-cart-eu-v1 (local storage)", "Keeps the contents of your cart — until cleared"],
              ["cp-consent-v1 (local storage)", `Stores your cookie choice — ${Math.round(CONSENT_MAX_AGE_DAYS / 30.4)} months`],
            ],
          },
        ],
      },
      {
        heading: "Analytics (consent required)",
        blocks: [{ rows: [["_ga, _ga_<id> (Google Analytics)", "Distinguishes visits to produce aggregated statistics — 14 months"]] }],
      },
      {
        heading: "Advertising (consent required)",
        blocks: [{ rows: [["_gcl_au, _gcl_aw (Google Ads)", "Measures ad conversions — 90 days"]] }],
      },
      {
        heading: "Google Consent Mode",
        blocks: [
          "We use Google Consent Mode v2. Until you consent, analytics and advertising storage are denied and no analytics or advertising cookies are set. Your consent is asked again after it expires.",
        ],
      },
    ],
  },

  "legal-notice": {
    title: "Legal Notice",
    description: "Information about the operator of the store.",
    intro: `The ${COMPANY.tradingName} EU store is operated by:`,
    sections: [
      {
        heading: "Operator",
        blocks: [
          {
            rows: [
              ["Company", COMPANY.legalName],
              ["Legal form", `${COMPANY.entityType}, organised under the laws of ${COMPANY.stateOfFormation}, USA`],
              ["Registration", `${COMPANY.stateOfFormation} Secretary of State, file no. ${COMPANY.registrationNumber}`],
              ["Address", companyAddressLine],
              ["Represented by", "[Managing member / manager name]"],
              ["Email", COMPANY.email],
              ["Phone", COMPANY.phoneDisplay],
              ["EU VAT (OSS)", EU_PRESENCE.vatNumber],
              ["US EIN", COMPANY.ein],
            ],
          },
        ],
      },
      {
        heading: "EU representative",
        blocks: [`${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address}`],
      },
      {
        heading: "Responsible for content",
        blocks: ["[Name], address as above."],
      },
    ],
  },
}
