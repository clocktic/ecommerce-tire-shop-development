import { COMPANY, EU_PRESENCE, companyAddressLine } from "@/lib/company"
import { CONSENT_MAX_AGE_DAYS } from "@/components/legal/consent"
import { POLICIES, deliveryLabel } from "@/lib/policies"
import type { PolicyDoc } from "@/lib/legal/types"
import { EU_SNIPPETS } from "@/lib/legal/eu-customs"

const p = POLICIES.eu
const s = p.shipping
const r = p.returns
const contactLine = `${COMPANY.email} · ${COMPANY.phoneDisplay} (${COMPANY.hours})`
const seller = `${COMPANY.legalName}, ${companyAddressLine}, email ${COMPANY.email}, phone ${COMPANY.phoneDisplay}`

const SNIP = EU_SNIPPETS.en

export const EU_POLICIES: Record<string, PolicyDoc> = {
  shipping: {
    title: "Delivery Policy",
    description: SNIP.shippingDescription,
    intro: SNIP.shippingIntro,
    sections: [
      {
        heading: "Delivery area",
        blocks: [
          `We deliver to ${s.area}. We do not deliver to ${s.exclusions} — tyres, alloy wheels and brake kits are heavy parcels that require a physical street address for carrier delivery and customs clearance.`,
          "You may have tyres, wheels and brake components delivered directly to a local fitting centre or workshop. Enter the workshop's name in the Company field at checkout and let them know the shipment is arriving.",
        ],
      },
      {
        heading: "Cost, duties and import VAT",
        blocks: [
          s.freeShipping
            ? "Standard international delivery is free (€0.00) on every order across all 27 EU Member States, with no minimum order value."
            : "Delivery costs are shown at checkout before you place the order.",
          s.duties,
          SNIP.paymentsVat.blocks[1],
        ],
      },
      {
        heading: "Delivery times",
        blocks: [
          {
            rows: [
              ["Order cut-off time", `${s.cutoff}, Monday–Friday`],
              ["Handling / warehouse processing time", `${s.handlingDays[0]}–${s.handlingDays[1]} working days`],
              ["International transit time", `${s.transitDays[0]}–${s.transitDays[1]} working days`],
              ["Total estimated delivery time", deliveryLabel("eu").replace("business", "working")],
              ["Carriers", `Own delivery service & courier (TiresShop Courier) where available; otherwise ${s.carriers.join(", ")}`],
              ["Dispatched from", EU_PRESENCE.dispatchCountry],
            ],
          },
          "Whenever it is possible to ship your order using our own delivery service and our own courier, we will deliver it that way. If delivery by our own courier service is not available for your address or route, we ship via other carriers (" + s.carriers.join(", ") + ").",
          "Working days are Monday to Friday, excluding public holidays. Orders placed before the cut-off time on a working day begin processing that same day; orders placed after the cut-off time or on a weekend are processed the next working day.",
          "In accordance with Directive 2011/83/EU (Art. 18), if we cannot deliver within 30 calendar days of your order and do not agree a later delivery date with you, you may cancel the order and receive a full refund.",
        ],
      },
      {
        heading: "Tracking and multi-parcel shipments",
        blocks: [
          "As soon as your order is dispatched, you receive a shipping confirmation email with a carrier tracking link for every parcel. You can also check real-time status on our Track Order page. A set of four tyres or wheels usually ships as four separate parcels and may arrive on consecutive working days.",
        ],
      },
      {
        heading: "Damaged or lost parcels & passing of risk",
        blocks: [
          "Please check parcels on delivery and, if possible, note any visible transit damage with the driver and email photos to us as soon as you can. Your statutory consumer rights are never affected if you do not do this — it simply helps us file a claim with the carrier.",
          "Under EU consumer law (Directive 2011/83/EU, Art. 20), the risk of loss of or damage to the goods passes to you only when you, or a third party indicated by you other than the carrier, acquire physical possession of the goods. Parcels lost or damaged in transit are replaced or refunded in full at no cost to you.",
        ],
      },
      { heading: "Contact", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  returns: {
    title: "Right of Withdrawal & Returns",
    description: `${r.windowDays}-day statutory right of withdrawal for consumers in the EU. €0 restocking fee.`,
    intro: "If you are a consumer resident in the European Union, you have a statutory 14-day right of withdrawal without giving any reason. The instructions below follow the official EU model (Directive 2011/83/EU, Annex I).",
    sections: [
      {
        heading: "Summary of return & withdrawal terms",
        blocks: [
          {
            rows: [
              ["Withdrawal / return window", `${r.windowDays} calendar days from the day you take physical possession of the goods`],
              ["Condition of returned goods", "New, unmounted and unused (you may unpack and inspect items as in a shop)"],
              ["Restocking fee", "€0.00 (0% — we never charge a restocking fee)"],
              ["Return shipping (faulty / wrong item)", "Free (€0.00 — we bear all return shipping costs under the legal guarantee)"],
              ["Return shipping (withdrawal / unwanted item)", `Paid by customer — estimated at ${r.bulkyReturnCostEstimate}`],
              ["Refund timeline", `Within ${r.refundDays} calendar days from receipt of your withdrawal notice`],
              ["Physical return address", EU_PRESENCE.returnsAddress],
            ],
          },
        ],
      },
      {
        heading: "Right of withdrawal",
        blocks: [
          `You have the right to withdraw from this contract within ${r.windowDays} days without giving any reason.`,
          `The withdrawal period will expire after ${r.windowDays} days from the day on which you acquire, or a third party other than the carrier and indicated by you acquires, physical possession of the goods. If you ordered multiple goods in one order that are delivered separately, the period expires ${r.windowDays} days after the day on which you, or your nominated third party, acquire physical possession of the last good.`,
          `To exercise the right of withdrawal, you must inform us (${seller}) of your decision to withdraw from this contract by an unequivocal statement (for example, an email to ${COMPANY.email}). You may use the model withdrawal form linked below, but it is not obligatory.`,
          { link: { href: "/policies/withdrawal-form", label: "Model withdrawal form" } },
          "To meet the withdrawal deadline, it is sufficient for you to send your communication concerning your exercise of the right of withdrawal before the withdrawal period has expired.",
        ],
      },
      {
        heading: "Effects of withdrawal",
        blocks: [
          `If you withdraw from this contract, we shall reimburse to you all payments received from you, including the costs of delivery (with the exception of supplementary costs resulting from your choice of a type of delivery other than the least expensive type of standard delivery offered by us), without undue delay and in any event not later than ${r.refundDays} days from the day on which we are informed about your decision to withdraw from this contract. We will carry out such reimbursement using the same means of payment as you used for the initial transaction, unless you have expressly agreed otherwise; in any event, you will not incur any fees as a result of such reimbursement.`,
          "We may withhold reimbursement until we have received the goods back or you have supplied evidence of having sent back the goods, whichever is the earliest.",
          `You shall send back the goods to our returns facility (${EU_PRESENCE.returnsAddress}, quoting the RMA number provided in your return authorisation email) without undue delay and in any event not later than ${r.windowDays} days from the day on which you communicate your withdrawal from this contract to us. The deadline is met if you send back the goods before the period of ${r.windowDays} days has expired.`,
          r.returnShippingPaidBy === "merchant"
            ? "We will bear the cost of returning the goods."
            : `You will have to bear the direct cost of returning the goods. Tyres, wheels and brake kits cannot normally be returned by ordinary post; the cost is estimated at ${r.bulkyReturnCostEstimate}. We can provide a prepaid carrier return label at that cost on request (deducted from the reimbursement with your agreement). We never charge a restocking fee (€0.00).`,
          "You are only liable for any diminished value of the goods resulting from the handling other than what is necessary to establish the nature, characteristics and functioning of the goods.",
        ],
      },
      {
        heading: "What counts as handling beyond inspection",
        blocks: [
          "You may unpack and visually inspect items as you would in a physical shop. The following actions go beyond normal inspection and may reduce your refund by the resulting loss in commercial value:",
          {
            list: [
              "Mounting a tyre onto a rim, applying bead lubricant, inflating it or driving on it.",
              "Bolting a wheel to a vehicle with wheel bolts or lug nuts tightened (test-fitting a bare rim against the hub using a protective cloth without tightening bolts is permitted).",
              "Installing, bolting or bedding in brake pads, brake discs, calipers or hydraulic lines.",
            ],
          },
        ],
      },
      {
        heading: "Statutory exclusions from the right of withdrawal",
        blocks: [
          "Under Art. 16(c) of Directive 2011/83/EU, the right of withdrawal does not apply to the supply of goods made to the consumer's specifications or clearly personalised (for example, a forged wheel machined to order in a custom offset, bolt pattern or finish). Any such custom-made item is explicitly marked on its product page before you order.",
        ],
      },
      {
        heading: "Practical return steps & physical return address",
        blocks: [
          {
            list: [
              `Email ${COMPANY.email} with your order number (or send the completed Model Withdrawal Form).`,
              "We confirm receipt of your withdrawal by email within 1 working day and issue a Return Merchandise Authorisation (RMA) number along with customs re-export documentation and, on request, a prepaid return label.",
              `Pack the items securely in their original packaging and ship them to: ${EU_PRESENCE.returnsAddress}, marking the RMA number clearly on the outside of each parcel.`,
            ],
          },
        ],
      },
      {
        heading: "Cancellation before dispatch",
        blocks: ["You can cancel your order free of charge at any time before dispatch — email us and we will release the payment authorisation or refund you in full immediately."],
      },
      {
        heading: "Faulty, damaged or wrong items",
        blocks: ["If an item arrives damaged, defective or not what you ordered, your statutory rights under the 2-year EU legal guarantee of conformity apply and we pay 100% of the return shipping and replacement/refund costs (€0.00 cost to you). See Legal Guarantee & Warranty."],
      },
      SNIP.returnsSection,
      { heading: "Contact", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  "withdrawal-form": {
    title: "Model Withdrawal Form",
    description: "Official EU model withdrawal form (Directive 2011/83/EU, Annex I(B)).",
    intro: "Complete and return this form only if you wish to withdraw from the contract. You can copy the text below into an email to info@tiresshop.net.",
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
    description: "Statutory 2-year legal guarantee of conformity for EU consumers (Directive (EU) 2019/771), plus manufacturer warranties.",
    intro: "As a consumer in the European Union, you benefit from the statutory 2-year legal guarantee of conformity for goods under Directive (EU) 2019/771, as implemented in the national law of your Member State of residence.",
    sections: [
      {
        heading: "Statutory 2-year legal guarantee of conformity",
        blocks: [
          `We (${COMPANY.legalName}) are liable for any lack of conformity that exists at the time the goods are delivered and becomes apparent within ${p.warranty.months! / 12} years of delivery (or longer where the national law of your Member State provides a longer period). This statutory legal guarantee applies automatically and is completely free of charge.`,
          "If a lack of conformity becomes apparent within the first year after delivery (or within two years in Member States such as France, Portugal or Spain that have extended this period), it is presumed to have existed at the time of delivery unless we prove otherwise.",
        ],
      },
      {
        heading: "Your statutory remedies",
        blocks: [
          {
            list: [
              "Free repair or free replacement of the non-conforming goods, at your choice, within a reasonable time and without significant inconvenience to you, unless the chosen remedy is impossible or would impose disproportionate costs.",
              "A proportionate price reduction or termination of the contract with a full refund, if repair or replacement is impossible, fails to bring the goods into conformity, or is not completed within a reasonable time.",
            ],
          },
          "We bear all necessary costs of bringing the goods into conformity, including postage, return carriage, labour and materials.",
        ],
      },
      {
        heading: "What is not a lack of conformity",
        blocks: [
          "Normal wear and tear (such as normal tread wear on tyres or normal friction wear on brake pads and discs), road hazard damage (punctures, cuts, potholes, kerb impacts), or damage caused by incorrect inflation pressure, overloading, improper wheel alignment, improper mounting/installation, or use in motorsport/track competition does not constitute a lack of conformity.",
        ],
      },
      {
        heading: "Commercial manufacturer warranty",
        blocks: [
          "Many tyre, wheel and brake manufacturers also provide a voluntary commercial warranty. Its terms and duration are set by the respective manufacturer and linked on the product page where available. Any commercial manufacturer warranty is in addition to, and never limits or replaces, your statutory rights under the EU legal guarantee against us as the seller.",
        ],
      },
      {
        heading: "How to make a guarantee or warranty claim",
        blocks: [
          `Email ${COMPANY.email} with your order number, clear photos of the item (for tyres, include the sidewall markings and DOT/ECE code) and a short description of the issue. We reply within 1–2 working days and arrange free return collection, replacement or refund.`,
        ],
      },
      { heading: "Contact", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  payments: {
    title: "Payment Methods",
    description: SNIP.paymentsDescription,
    intro: SNIP.paymentsIntro,
    sections: [
      {
        heading: "Accepted payment methods",
        blocks: [
          "We accept the following payment methods in the EU store (all charged in EUR):",
          { list: p.paymentMethods },
        ],
      },
      {
        heading: "When you are charged",
        blocks: [
          "Card payments (Visa, Mastercard, American Express) are processed on our encrypted 3D Secure 2.0 payment page when you place the order. If an order is cancelled before dispatch or cannot be fulfilled, any payment or authorisation is released or refunded in full immediately. If you wish to pay by SEPA bank transfer, contact us or follow the payment instructions in your order confirmation email; the order is dispatched as soon as the transfer is received.",
        ],
      },
      {
        heading: "Strong Customer Authentication (3-D Secure 2.0)",
        blocks: [
          "All card payments use TLS encryption and Strong Customer Authentication (3-D Secure 2.0) in accordance with the EU Payment Services Directive (PSD2, Directive (EU) 2015/2366) through a PCI-DSS Level 1 certified payment gateway. We never store full card numbers or CVV security codes on our servers.",
        ],
      },
      {
        heading: "No payment surcharges",
        blocks: ["In accordance with PSD2 (Art. 62(4)), we do not charge any fee or surcharge for any payment method."],
      },
      SNIP.paymentsVat,
      { heading: "Contact", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  terms: {
    title: "Terms & Conditions",
    description: `General terms and conditions of sale for the ${COMPANY.tradingName} EU store.`,
    intro: `These General Terms and Conditions ("Terms") apply to all contracts concluded through the ${COMPANY.tradingName} EU store between you and ${COMPANY.legalName}, ${companyAddressLine} ("we", "us").`,
    sections: [
      {
        heading: "Seller identity",
        blocks: [
          {
            rows: [
              ["Trading name", COMPANY.tradingName],
              ["Company", `${COMPANY.legalName} (${COMPANY.entityType}, ${COMPANY.stateOfFormation}, USA)`],
              ["Registration", `${COMPANY.stateOfFormation} Secretary of State, file no. ${COMPANY.registrationNumber}`],
              ["Seller's permit", `${COMPANY.sellerPermit} (${COMPANY.sellerPermitAuthority})`],
              ["Represented by", `${COMPANY.representative}, ${COMPANY.representativeRole}`],
              ["Principal address", companyAddressLine],
              ["Address for legal notices", COMPANY.mailingAddress],
              ["Contact", `${COMPANY.email} · ${COMPANY.phoneDisplay}`],
            ],
          },
        ],
      },
      {
        heading: "Conclusion of the contract",
        blocks: [
          "Product listings in the store are a non-binding invitation to order. By clicking the checkout button \"Order with obligation to pay\" (Art. 8(2) Directive 2011/83/EU), you submit a binding offer to purchase the goods in your cart. We acknowledge receipt of your order immediately by email; this acknowledgement does not yet constitute acceptance of your offer. The contract is concluded when we send the dispatch confirmation email or, at the latest, when the goods are delivered.",
          "The contract language is the language of the store version in which you place the order (English, German, French, Italian, Spanish or Dutch). Before submitting your order, you can review and correct all input fields in the cart and checkout. We store the contract text and send you the order details and a link to these Terms on a durable medium (by email).",
        ],
      },
      {
        heading: "Prices & Member Club (7% discount)",
        blocks: [
          SNIP.pricesText,
          "Member Club (7% Registered Member Discount): Customers who register a free account and sign in before completing checkout receive an automatic 7% Member Club discount on the merchandise subtotal in the cart and at checkout. The discount cannot be combined with retroactive claims on guest orders, has no cash surrender value, and in the event of a withdrawal or return, the reimbursement equals the actual net price paid.",
        ],
      },
      { heading: "Delivery", blocks: ["Delivery areas, dispatch times and carrier terms are set out in our Delivery Policy."] },
      { heading: "Right of withdrawal", blocks: [`If you are a consumer in the EU, you have a statutory ${r.windowDays}-day right of withdrawal as set out in full on our Right of Withdrawal & Returns page.`] },
      { heading: "Statutory legal guarantee", blocks: ["The statutory 2-year EU legal guarantee of conformity (Directive (EU) 2019/771) applies to all goods, as described on our Legal Guarantee & Warranty page."] },
      {
        heading: "EU tyre labelling (Reg. (EU) 2020/740), homologation & fitment",
        blocks: [
          "Tyres listed in the EU store display the EU tyre label values (fuel efficiency, wet grip, external rolling noise class and dB, and 3PMSF / ice grip symbols where applicable) together with the link to the European Product Registry for Energy Labelling (EPREL) in accordance with Regulation (EU) 2020/740. Replacement brake pads and discs list their UNECE R90 approval where applicable.",
          "Please verify that the tyre size, load index, speed rating, wheel bolt pattern, offset (ET), centre bore and brake fitment match your vehicle's registration certificate or Certificate of Conformity (CoC). Some alloy wheels and brake kits require national type approval (e.g. ECE / ABE / TÜV) or inspection depending on your Member State. All safety-critical components should be fitted by a qualified technician.",
        ],
      },
      {
        heading: "Liability",
        blocks: [
          "We are liable without limitation for intent and gross negligence, as well as for damages resulting from injury to life, body or health. Mandatory statutory liability under EU/national product liability law and under the statutory legal guarantee of conformity remains unaffected. In cases of slight negligence, we are only liable for the breach of essential contractual obligations (cardinal duties), and such liability is limited to the foreseeable damage typical for this type of contract.",
        ],
      },
      {
        heading: "Applicable law and consumer jurisdiction (Rome I Art. 6)",
        blocks: [
          `These Terms are governed by the laws of the State of ${COMPANY.stateOfFormation}, United States. In accordance with Article 6(2) of Regulation (EC) No 593/2008 (Rome I), if you are a consumer resident in the European Union, this choice of law never deprives you of the protection afforded to you by the mandatory consumer protection provisions of the law of the Member State in which you have your habitual residence. You may bring legal proceedings either in the courts of the Member State where you are domiciled or in the courts having jurisdiction over us.`,
        ],
      },
      {
        heading: "Consumer dispute resolution",
        blocks: [
          `If you have a complaint, please contact us first at ${COMPANY.email} — we resolve almost all issues within 1–2 working days. We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board (note: the former EU ODR platform was discontinued on 20 July 2025 pursuant to Regulation (EU) 2024/3228).`,
        ],
      },
      SNIP.termsSection,
    ],
  },

  privacy: {
    title: "Privacy Policy",
    description: "How we process personal data of visitors and customers in the European Union under the GDPR.",
    intro: `This Privacy Policy explains how ${COMPANY.legalName} ("we", "us") processes your personal data under the General Data Protection Regulation (EU) 2016/679 (GDPR) and the ePrivacy rules when you visit or purchase from the ${COMPANY.tradingName} EU store.`,
    sections: [
      {
        heading: "Controller and EU data protection contact",
        blocks: [
          {
            rows: [
              ["Controller (Art. 4(7) GDPR)", `${COMPANY.legalName}, ${companyAddressLine}`],
              ["Represented by", `${COMPANY.representative}, ${COMPANY.representativeRole}`],
              ["Privacy & GDPR contact email", COMPANY.privacyEmail],
              ["Telephone", COMPANY.phoneDisplay],
              ["EU Data Protection & Privacy Desk", `${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address} (${EU_PRESENCE.gdprRepresentative.email})`],
            ],
          },
        ],
      },
      {
        heading: "Categories of data, purposes and legal bases (Art. 6 GDPR)",
        blocks: [
          {
            rows: [
              ["Order, payment & delivery data (name, address, email, phone, items ordered, RMA/warranty claims, import VAT refund receipts)", "Performance of a contract — Art. 6(1)(b) GDPR"],
              ["Customer account & garage fitment data (saved vehicles, tyre sizes, 7% Member Club status)", "Performance of a contract / pre-contractual measures — Art. 6(1)(b) GDPR"],
              ["Sales invoices, customs declarations & accounting records", "Compliance with a legal obligation — Art. 6(1)(c) GDPR"],
              ["IT security, server logs, CAPTCHA verification & payment fraud prevention", "Legitimate interests in store security and fraud prevention — Art. 6(1)(f) GDPR"],
              ["Customer service inquiries (email, contact form, live chat)", "Performance of a contract or legitimate interests in answering inquiries — Art. 6(1)(b)/(f) GDPR"],
              ["Analytics & advertising cookies (Google Analytics, Google Ads / Shopping conversions)", "Your explicit prior consent — Art. 6(1)(a) GDPR & Art. 5(3) ePrivacy Directive"],
            ],
          },
        ],
      },
      {
        heading: "Recipients and processors",
        blocks: [
          "We share personal data only to the extent necessary with: (1) our PCI-DSS Level 1 payment service provider (CGPayTech) to process payments; (2) international shipping carriers (DHL Express, UPS, FedEx) and our US warehouse to fulfil and clear your order through customs; (3) cloud hosting, database and transactional email providers (Vercel, Neon); and (4) — strictly only if you grant prior consent in the cookie banner — Google Ireland Limited / Google LLC for Google Analytics and Google Ads / Google Merchant Center conversion measurement. All processors are bound by data processing agreements under Art. 28 GDPR.",
        ],
      },
      {
        heading: "International data transfers (Chapter V GDPR)",
        blocks: [
          "Because we are established in the United States and dispatch orders from the United States, personal data required to process and ship your order is transferred to the United States (Art. 49(1)(b) GDPR — necessary for the performance of the contract between you and us). Transfers to US service providers and cloud infrastructure are additionally safeguarded by certification under the EU–US Data Privacy Framework (Art. 45 GDPR adequacy decision) where the provider is certified, or by the European Commission's Standard Contractual Clauses (SCCs, Art. 46(2)(c) GDPR). You may request a copy of the applicable safeguards by emailing us.",
        ],
      },
      {
        heading: "Data retention periods",
        blocks: [
          "Order, customs and accounting records are retained for the statutory tax and commercial retention period (up to 10 years). Customer service correspondence is deleted 3 years after the inquiry is resolved. Consent logs are retained for the validity of your consent plus the statutory limitation period.",
        ],
      },
      {
        heading: "Your rights under the GDPR (Arts. 15–22 & 77)",
        blocks: [
          "Under the GDPR, you have the following rights free of charge:",
          {
            list: [
              "Right of access (Art. 15 GDPR) to obtain confirmation and a copy of the personal data we process about you.",
              "Right to rectification (Art. 16 GDPR) of inaccurate or incomplete personal data.",
              "Right to erasure / 'right to be forgotten' (Art. 17 GDPR) and right to restriction of processing (Art. 18 GDPR).",
              "Right to data portability (Art. 20 GDPR) in a structured, commonly used, machine-readable format.",
              "Right to object (Art. 21 GDPR) at any time to processing based on legitimate interests (Art. 6(1)(f) GDPR) or for direct marketing.",
              "Right to withdraw consent at any time with effect for the future (Art. 7(3) GDPR) — for cookies, simply click 'Cookie settings' in the footer.",
            ],
          },
          `To exercise your rights, email ${COMPANY.privacyEmail}. You also have the right to lodge a complaint with a data protection supervisory authority (Art. 77 GDPR), in particular in the EU Member State of your habitual residence, place of work, or place of the alleged infringement.`,
        ],
      },
      {
        heading: "Automated decision-making",
        blocks: ["We do not engage in automated decision-making or profiling within the meaning of Art. 22 GDPR that produces legal or similarly significant effects on you."],
      },
      { heading: "Changes to this policy", blocks: ["We will publish any updates on this page with a revised effective date."] },
    ],
  },

  cookies: {
    title: "Cookie Policy",
    description: "Which cookies and local storage technologies the EU store uses and how we implement Google Consent Mode v2.",
    intro: "In the EU store, we only set strictly necessary cookies and local storage entries until you give explicit prior consent. You can review, grant or withdraw your consent at any time via 'Cookie settings' in the footer.",
    sections: [
      {
        heading: "Strictly necessary cookies & storage (no consent required — Art. 5(3) ePrivacy)",
        blocks: [
          {
            rows: [
              ["ts_market", "Remembers the store region (US / EU) you selected — 12 months"],
              ["ts_geo", "Suggested store region derived from your country — 12 months"],
              ["ts_lang", "Remembers the store language you selected — 12 months"],
              ["ts_garage", "Remembers your selected vehicle or tyre size for fitment filtering — 12 months"],
              ["ts-theme", "Remembers your light or dark display preference — 12 months"],
              ["better-auth.session_token", "Maintains your authenticated session when you sign in to your account — session / 7 days"],
              ["ts-cart-eu-v1 (localStorage)", "Keeps the items in your shopping cart on your device — until cleared"],
              ["ts-consent-v1 (localStorage)", `Stores your cookie consent choice — ${Math.round(CONSENT_MAX_AGE_DAYS / 30.4)} months`],
            ],
          },
        ],
      },
      {
        heading: "Analytics cookies (prior consent required — Art. 6(1)(a) GDPR)",
        blocks: [{ rows: [["_ga, _ga_<id> (Google Analytics 4)", "Distinguishes visits to generate aggregated store usage statistics — 14 months"]] }],
      },
      {
        heading: "Advertising & conversion cookies (prior consent required — Art. 6(1)(a) GDPR)",
        blocks: [{ rows: [["_gcl_au, _gcl_aw (Google Ads / Google Shopping)", "Measures Google Shopping and search ad conversions — 90 days"]] }],
      },
      {
        heading: "Google Consent Mode v2 & Global Privacy Control",
        blocks: [
          "We implement Google Consent Mode v2 across the EU store. By default, analytics_storage, ad_storage, ad_user_data and ad_personalization are all set to 'denied' before any Google tag loads, and ads_data_redaction is enabled. Optional cookies are only set if you click 'Accept all' or enable them under 'Customize'. We also honour the Global Privacy Control (GPC) browser signal.",
        ],
      },
    ],
  },

  "legal-notice": {
    title: "Legal Notice",
    description: "Statutory operator identification (Impressum / Legal Notice) under EU e-Commerce Directive 2000/31/EC and Digital Services Act.",
    intro: `Mandatory statutory disclosures for the ${COMPANY.tradingName} EU store:`,
    sections: [
      {
        heading: "Store operator",
        blocks: [
          {
            rows: [
              ["Company name", COMPANY.legalName],
              ["Trading name", COMPANY.tradingName],
              ["Legal form", `${COMPANY.entityType}, organised under the laws of the State of ${COMPANY.stateOfFormation}, United States`],
              ["Company register & number", `${COMPANY.stateOfFormation} Secretary of State, Entity File No. ${COMPANY.registrationNumber}`],
              ["Seller's permit / Tax ID", `${COMPANY.sellerPermit} (${COMPANY.sellerPermitAuthority})`],
              ["Principal business address", companyAddressLine],
              ["Address for legal notices", COMPANY.mailingAddress],
              ["Physical returns address", EU_PRESENCE.returnsAddress],
              ["Authorized representative", `${COMPANY.representative} (${COMPANY.representativeRole})`],
              ["Email", COMPANY.email],
              ["Telephone", `${COMPANY.phoneDisplay} (${COMPANY.hours})`],
            ],
          },
        ],
      },
      {
        heading: "EU data protection & privacy contact",
        blocks: [`${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address} · Email: ${EU_PRESENCE.gdprRepresentative.email}`],
      },
      {
        heading: "Person responsible for editorial content",
        blocks: [`${COMPANY.representative}, ${companyAddressLine}.`],
      },
      {
        heading: "Consumer dispute resolution",
        blocks: [
          "We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board. For any questions or complaints, please contact our customer service team directly at info@tiresshop.net.",
        ],
      },
    ],
  },
}
