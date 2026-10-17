import { COMPANY } from "@/lib/company"
import { POLICIES, deliveryDays } from "@/lib/policies"

// Each store (market × language) has one dictionary with wording already
// resolved for its market and policy numbers. Runtime values use {placeholders}
// and go through fmt() in lib/i18n. Keys set to null do not apply to the market.

type Row = { label: string; value: string }
type EuLabelText = {
  title: string
  regulation: string
  fuel: string
  wet: string
  noise: string
  rollingNoise: string
  noiseClass: string
  classAria: string
  snow: string
  ice: string
  eprel: string
}
type UtqgText = { treadwear: string; traction: string; temperature: string }

const us = POLICIES.us
const eu = POLICIES.eu
const [usMin, usMax] = deliveryDays("us")
const [euMin, euMax] = deliveryDays("eu")

const usDays = `${usMin}–${usMax} business days`
const euDays = `${euMin}–${euMax} working days`

const categories = {
  tires: { name: "Tires", blurb: "Summer, winter and all-season. Search by the size on your sidewall." },
  wheels: { name: "Wheels", blurb: "Cast, flow-formed and forged alloys by diameter and bolt pattern." },
  brakes: { name: "Brakes", blurb: "Pads, discs and big brake kits with approval markings listed." },
}

const labels = {
  season: { summer: "Summer", winter: "Winter", "all-season": "All-season" },
  brakeKind: {
    discs: "Brake discs",
    pads: "Brake pads",
    "pads-and-discs": "Pads + discs kit",
    caliper: "Brake caliper",
    kit: "Big brake kit",
    drum: "Brake drum",
    shoes: "Brake shoes",
    hose: "Brake hose",
    sensor: "Wear sensor",
  },
  axle: { front: "Front axle", rear: "Rear axle" },
  axleShort: { front: "Front", rear: "Rear" },
  availability: { in_stock: "In stock", out_of_stock: "Out of stock", preorder: "Pre-order" },
}

const common = {
  skip: "Skip to content",
  home: "Home",
  help: "Help",
  contact: "Contact",
  faq: "FAQ",
  about: "About us",
  cart: "Cart",
  checkout: "Checkout",
  breadcrumb: "Breadcrumb",
  mainNav: "Main",
  mobileNav: "Mobile",
  openMenu: "Open menu",
  logoHome: `${COMPANY.tradingName} home`,
  regionNav: "Choose your store region",
  languageNav: "Choose language",
  storeName: { us: "US store", eu: "EU store" },
  marketName: { us: "United States", eu: "European Union" },
  yes: "Yes",
  no: "No",
  free: "Free",
}

const product = {
  demo: "Demo",
  demoProduct: "Demo product",
  demoNote:
    "Demo listing to preview the layout and cart. It is hidden from search and feeds, and is replaced by real products after the catalog import.",
  each: "/ each",
  was: "Was",
  quantity: "Quantity",
  decrease: "Decrease quantity",
  increase: "Increase quantity",
  add: "Add to cart",
  added: "Added to cart",
  viewCart: "View cart and checkout",
  returnsLink: "Return policy",
  related: "More {category}",
  descSpecs: "Description & specifications",
  fitment: "Fitment",
  fitmentNote:
    "Check the part number against your vehicle before ordering. Brake work should be carried out by a qualified technician.",
  shipping: "Shipping",
  fullShipping: "Full shipping policy",
  returns: "Returns",
  fullReturns: "Full return policy",
  spec: {
    finish: "Finish",
    construction: "Construction",
    loadRating: "Load rating",
    approval: "Approval",
    pistons: "Caliper pistons",
    season: "Season",
    runFlat: "Run-flat",
  },
}

const checkoutFields = {
  title: "Checkout",
  nothing: "Nothing to check out",
  contact: "Contact",
  email: "Email",
  phone: "Phone",
  address: "Delivery address",
  firstName: "First name",
  lastName: "Last name",
  street: "Street address",
  city: "City",
  country: "Country",
  selectCountry: "Select country",
  payment: "Payment",
  yourOrder: "Your order",
  notConnected: "Payments are not connected yet — no order was created.",
}

const consentShared = {
  gpc: "Global Privacy Control detected — advertising cookies stay off.",
  categories: "Categories",
  necessary: "Strictly necessary",
  necessaryText: "Cart, region and language choice, security. Always on.",
  analytics: "Analytics",
  analyticsText: "Aggregated visit statistics.",
  advertising: "Advertising",
  advertisingText: "Ad measurement and personalisation.",
  save: "Save choices",
  customize: "Customize",
  openSettings: "Open privacy settings",
}

const contactShared = {
  title: "Contact",
  lead: "We reply to emails within 1 business day. Include your order number and, for fitment questions, your vehicle and current tire size.",
  email: "Email",
  phone: "Phone",
  hours: "Hours",
  address: "Company address",
  returnsAddress: "Returns address",
  returnsNote: "Please email us before sending a return.",
  quickLinks: "Quick links",
  returns: "Returns",
  privacy: "Privacy Policy",
  terms: "Terms",
}

const aboutShared = {
  title: "About us",
  description: `Who runs ${COMPANY.tradingName}.`,
  lead: `${COMPANY.tradingName} sells tires, wheels and brake systems online from two regional stores: one for the United States, one for the European Union. Each store has its own stock, prices and policies, written for the law that applies where you live.`,
  details: "Company details",
  company: "Company",
  legalForm: "Legal form",
  legalFormValue: `Limited liability company, ${COMPANY.stateOfFormation}, USA`,
  address: "Address",
  email: "Email",
  phone: "Phone",
  hours: "Hours",
}

const proseShared = {
  updated: "Last updated",
  questions: `Questions about this page? Contact ${COMPANY.tradingName} at`,
  or: "or",
  allContact: "see all contact options",
}

export const usEn = {
  meta: {
    title: `${COMPANY.tradingName} — Tires, Wheels & Brakes | US Store`,
    template: `%s | ${COMPANY.tradingName} US`,
    description:
      "Tires, alloy wheels and brake systems shipped across the contiguous United States. Search tires by size, wheels by bolt pattern.",
  },
  common,
  company: { hours: "Mon–Fri, 9:00 AM – 6:00 PM ET" },
  policy: {
    area: us.shipping.area,
    exclusions: us.shipping.exclusions,
    duties: us.shipping.duties,
    days: usDays,
    warranty: us.warranty.summary,
  },
  topbar: {
    shipsTo: "Ships to US",
    shipping: us.shipping.freeShipping ? "Free shipping" : "Shipping from checkout",
    returns: `${us.returns.windowDays}-day returns`,
  },
  geo: {
    region: "Store region suggestion",
    text: "You're viewing the US store. Shopping from Europe?",
    go: "Go to the EU store",
    stay: "Stay in this store",
  },
  footer: {
    about: `${COMPANY.tradingName} is operated by ${COMPANY.legalName}, a limited liability company registered in ${COMPANY.stateOfFormation}, United States.`,
    shop: "Shop",
    help: "Help",
    policies: "US policies",
    store: "Store",
    language: "Language",
    bottom: "Prices in USD · Sales tax calculated at checkout",
    payments: `Accepted payment methods: ${us.paymentMethods.join(", ")}`,
    privacyLink: "Do Not Sell or Share My Personal Information",
    vat: null as string | null,
  },
  categories,
  labels,
  home: {
    eyebrow: "US store · Tires · Wheels · Brakes",
    title: "Everything between your car and the road.",
    lead: "Tires with UTQG grades, wheels by bolt pattern, brakes by axle — shipped from US stock.",
    heroAlt: "Alloy wheel with a performance tire and a red brake caliper",
    finder: {
      title: "Tire size finder",
      hint: "Read it off your sidewall",
      width: "Width",
      profile: "Profile",
      rim: "Rim",
      orType: "Or type it",
      submit: "Find tires",
      error: "Use the format 225/45 R17",
    },
    systems: "Shop by system",
    listed: "{n} listed",
    decoder: {
      eyebrow: "Before you order",
      title: "Read your sidewall",
      lead: "The size code on your current tires is all you need. Match width, profile and rim exactly; load index and speed rating should be equal to or higher than the original fitment.",
      parts: [
        { title: "Width", text: "Section width in millimeters, sidewall to sidewall." },
        { title: "Profile", text: "Sidewall height as a percentage of the width." },
        { title: "Construction", text: "Radial — almost every passenger tire today." },
        { title: "Rim", text: "Wheel diameter in inches. Must match your wheel." },
        { title: "Load index", text: "Max load per tire. 94 = 1,477 lb." },
        { title: "Speed rating", text: "Max sustained speed. W = 168 mph." },
      ],
    },
    featured: "On the rack",
    allTires: "All tires",
    promise: {
      title: "The US store terms",
      lead: "Separate stock, prices and policies for each region.",
      shippingTitle: us.shipping.freeShipping ? "Free shipping" : "Shipping",
      shippingText: `To ${us.shipping.area}. ${us.shipping.duties}`,
      returnsTitle: "Returns",
      returnsValue: `${us.returns.windowDays} days`,
      returnsText: "Unused and unmounted. No restocking fee.",
      warrantyTitle: "Warranty",
      warrantyValue: "Manufacturer",
      warrantyText: us.warranty.summary,
    },
  },
  catalog: {
    eyebrow: "US store",
    metaTitle: "{category} — US store",
    count: "{shown} of {total} products",
    filter: "Filter {category}",
    apply: "Apply",
    clear: "Clear",
    any: "Any",
    width: "Width",
    profile: "Profile",
    rim: "Rim",
    season: "Season",
    diameter: "Diameter",
    bolt: "Bolt pattern",
    type: "Type",
    axle: "Axle",
    emptyTitle: "No exact match",
    emptyText:
      "Nothing in this size or configuration yet. The full catalog is being loaded — contact us and we will check availability for you.",
    showAll: "Show all",
    askSize: "Ask about a size",
  },
  product: {
    ...product,
    priceNote: "Sales tax calculated at checkout · price per unit",
    deliveryTitle: `${us.shipping.freeShipping ? "Free delivery" : "Delivery"} in ${usDays}`,
    deliveryText: `To ${us.shipping.area}. Orders before ${us.shipping.cutoff} leave within ${us.shipping.handlingDays[0]}–${us.shipping.handlingDays[1]} business days.`,
    returnsTitle: `${us.returns.windowDays}-day returns`,
    returnsText: "Unmounted and unused.",
    warrantyTitle: "Manufacturer warranty",
    shippingText: `Free delivery to ${us.shipping.area} in ${usDays} with ${us.shipping.carriers.join(", ")}. ${us.shipping.duties}`,
    returnsDetail: `Return unused, unmounted items within ${us.returns.windowDays} days of delivery for a full refund of the item price. No restocking fee.`,
    notSold: {
      eyebrow: "Not sold in the US store",
      text: "This item is approved and stocked for the European Union only. Tires, wheels and brake parts must carry the markings required where they are fitted, so each store lists only what it can legally sell.",
      back: "Back to the US store",
      view: "View in the EU store",
    },
    euLabel: null as EuLabelText | null,
    utqg: { treadwear: "Treadwear", traction: "Traction", temperature: "Temperature" } as UtqgText | null,
  },
  cart: {
    title: "Cart",
    empty: "Your cart is empty",
    shopTires: "Shop tires",
    summary: "Order summary",
    delivery: `Delivery in ${usDays} to ${us.shipping.area}.`,
    checkout: "Checkout",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    remove: "Remove {name}",
    quantityFor: "Quantity for {name}",
    aria: "Cart, items: {n}",
    tax: { label: "Sales tax", value: "At checkout" } as Row | null,
    priceNote: null as string | null,
  },
  checkout: {
    ...checkoutFields,
    postal: "ZIP code",
    state: "State" as string | null,
    deliverTo: `We deliver to ${us.shipping.area}. Not available: ${us.shipping.exclusions}.`,
    accepted: `Accepted: ${us.paymentMethods.join(", ")}. The payment provider is not connected yet in this preview.`,
    estimated: `Estimated delivery: ${usDays}.`,
    acceptPrefix: "I have read and accept the",
    termsLink: "Terms of Service",
    and: "and the",
    privacyLink: "Privacy Policy",
    returnsPrefix: ", including the",
    returnsLink: "Return Policy",
    end: ".",
    submit: "Place order",
  },
  consent: {
    ...consentShared,
    title: "Your privacy choices",
    text: 'We use cookies for analytics and advertising, which may count as "sharing" personal information under some US state laws. You can opt out at any time. We honor Global Privacy Control signals.',
    policyLink: "Your Privacy Choices",
    primary: "OK",
    secondary: "Opt out of sharing",
  },
  prose: { ...proseShared, nav: "US store policies", store: "United States store" },
  faq: {
    title: "Questions",
    metaTitle: "FAQ",
    description: "Delivery, returns, fitment and payment questions.",
    eyebrow: "United States store",
    groups: [
      {
        title: "Orders & delivery",
        items: [
          {
            q: "How long does delivery take?",
            a: `${usDays} in total: ${us.shipping.handlingDays[0]}–${us.shipping.handlingDays[1]} days to dispatch and ${us.shipping.transitDays[0]}–${us.shipping.transitDays[1]} days in transit with ${us.shipping.carriers.join(", ")}. Orders before ${us.shipping.cutoff} on a business day count from that day.`,
          },
          { q: "How much is shipping?", a: "Shipping is free on every order." },
          {
            q: "Do you charge sales tax?",
            a: "Sales tax is calculated at checkout based on your delivery address where state law requires it.",
          },
          {
            q: "Can you ship to my installer?",
            a: "Yes. Enter the shop's name and address as the delivery address and let them know a delivery is coming.",
          },
        ],
      },
      {
        title: "Returns",
        items: [
          {
            q: "What is your return policy?",
            a: `Return unused, unmounted items within ${us.returns.windowDays} days of delivery for a full refund of the item price. There is no restocking fee.`,
          },
          {
            q: "Who pays for return shipping?",
            a: `For unwanted items you do — ${us.returns.bulkyReturnCostEstimate} with our label. If the item is faulty or wrong, we pay.`,
          },
        ],
      },
      {
        title: "Fitment",
        items: [
          {
            q: "How do I find my tire size?",
            a: "Read the code on the sidewall of your current tires, e.g. 225/45 R17 94W. Match the size exactly; load index and speed rating should be the same or higher.",
          },
          {
            q: "Will these wheels fit my car?",
            a: "Check bolt pattern, center bore and offset against your vehicle. Wheels with a larger center bore than your hub need hub-centric rings. Ask us before ordering if you are unsure.",
          },
          {
            q: "Are your tires DOT approved?",
            a: "Every tire in the US store carries the DOT code required for road use in the United States, and UTQG grades where applicable.",
          },
        ],
      },
      {
        title: "Payment",
        items: [{ q: "Which payment methods do you accept?", a: `${us.paymentMethods.join(", ")}.` }],
      },
    ],
  },
  contact: {
    ...contactShared,
    description: `Contact ${COMPANY.tradingName} customer service.`,
    eyebrow: "United States store",
    euRep: null as string | null,
  },
  about: { ...aboutShared, eyebrow: "United States store", vat: null as string | null },
}

export type Dictionary = typeof usEn

export const euEn: Dictionary = {
  meta: {
    title: `${COMPANY.tradingName} — Tyres, Wheels & Brakes | EU Store`,
    template: `%s | ${COMPANY.tradingName} EU`,
    description:
      "Tyres, alloy wheels and brake systems delivered across the EU with VAT included. EU tyre label on every tyre.",
  },
  common,
  company: { hours: "Mon–Fri, 9:00–18:00 ET (US Eastern Time)" },
  policy: {
    area: eu.shipping.area,
    exclusions: eu.shipping.exclusions,
    duties: eu.shipping.duties,
    days: euDays,
    warranty: eu.warranty.summary,
  },
  topbar: {
    shipsTo: "Ships to EU-27",
    shipping: eu.shipping.freeShipping ? "Free shipping" : "Shipping from checkout",
    returns: `${eu.returns.windowDays}-day returns`,
  },
  geo: {
    region: "Store region suggestion",
    text: "You're viewing the EU store. Shopping from the United States?",
    go: "Go to the US store",
    stay: "Stay in this store",
  },
  footer: {
    about: `${COMPANY.tradingName} is operated by ${COMPANY.legalName}, a limited liability company registered in ${COMPANY.stateOfFormation}, United States.`,
    shop: "Shop",
    help: "Help",
    policies: "EU policies",
    store: "Store",
    language: "Language",
    bottom: "Prices in EUR · VAT included, no import duties",
    payments: `Accepted payment methods: ${eu.paymentMethods.join(", ")}`,
    privacyLink: "Cookie settings",
    vat: "EU VAT One-Stop Shop (OSS)",
  },
  categories: {
    tires: { name: "Tyres", blurb: "Summer, winter and all-season. Search by the size on your sidewall." },
    wheels: categories.wheels,
    brakes: categories.brakes,
  },
  labels,
  home: {
    eyebrow: "EU store · Tyres · Wheels · Brakes",
    title: "Everything between your car and the road.",
    lead: "Tyres with the EU tyre label, ECE-approved wheels and brakes — shipped from EU stock, VAT included.",
    heroAlt: "Alloy wheel with a performance tyre and a red brake caliper",
    finder: {
      title: "Tyre size finder",
      hint: "Read it off your sidewall",
      width: "Width",
      profile: "Profile",
      rim: "Rim",
      orType: "Or type it",
      submit: "Find tyres",
      error: "Use the format 225/45 R17",
    },
    systems: "Shop by system",
    listed: "{n} listed",
    decoder: {
      eyebrow: "Before you order",
      title: "Read your sidewall",
      lead: "The size code on your current tyres is all you need. Match width, profile and rim exactly; load index and speed rating should be equal to or higher than the original fitment.",
      parts: [
        { title: "Width", text: "Section width in millimetres, sidewall to sidewall." },
        { title: "Profile", text: "Sidewall height as a percentage of the width." },
        { title: "Construction", text: "Radial — almost every passenger tyre today." },
        { title: "Rim", text: "Wheel diameter in inches. Must match your wheel." },
        { title: "Load index", text: "Max load per tyre. 94 = 670 kg." },
        { title: "Speed rating", text: "Max sustained speed. W = 270 km/h." },
      ],
    },
    featured: "On the rack",
    allTires: "All tyres",
    promise: {
      title: "The EU store terms",
      lead: "Separate stock, prices and policies for each region.",
      shippingTitle: eu.shipping.freeShipping ? "Free shipping" : "Shipping",
      shippingText: `To ${eu.shipping.area}. ${eu.shipping.duties}`,
      returnsTitle: "Right of withdrawal",
      returnsValue: `${eu.returns.windowDays} days`,
      returnsText: "From delivery, no reason needed. Unmounted items.",
      warrantyTitle: "Legal guarantee",
      warrantyValue: "2 years",
      warrantyText: eu.warranty.summary,
    },
  },
  catalog: {
    eyebrow: "EU store",
    metaTitle: "{category} — EU store",
    count: "{shown} of {total} products",
    filter: "Filter {category}",
    apply: "Apply",
    clear: "Clear",
    any: "Any",
    width: "Width",
    profile: "Profile",
    rim: "Rim",
    season: "Season",
    diameter: "Diameter",
    bolt: "Bolt pattern",
    type: "Type",
    axle: "Axle",
    emptyTitle: "No exact match",
    emptyText:
      "Nothing in this size or configuration yet. The full catalogue is being loaded — contact us and we will check availability for you.",
    showAll: "Show all",
    askSize: "Ask about a size",
  },
  product: {
    ...product,
    priceNote: "VAT included, no import duties · price per unit",
    deliveryTitle: `${eu.shipping.freeShipping ? "Free delivery" : "Delivery"} in ${euDays}`,
    deliveryText: `To ${eu.shipping.area}. Orders before ${eu.shipping.cutoff} leave within ${eu.shipping.handlingDays[0]}–${eu.shipping.handlingDays[1]} working days.`,
    returnsTitle: `${eu.returns.windowDays}-day right of withdrawal`,
    returnsText: "Unmounted and unused.",
    warrantyTitle: "2-year legal guarantee",
    shippingText: `Free delivery to ${eu.shipping.area} in ${euDays} with ${eu.shipping.carriers.join(", ")}. ${eu.shipping.duties}`,
    returnsDetail: `You can withdraw from the purchase within ${eu.returns.windowDays} days of delivery without giving a reason. Tyres and wheels that have been mounted or driven on may lose value, which can reduce the refund.`,
    notSold: {
      eyebrow: "Not sold in the EU store",
      text: "This item is approved and stocked for the United States only. Tyres, wheels and brake parts must carry the markings required where they are fitted, so each store lists only what it can legally sell.",
      back: "Back to the EU store",
      view: "View in the US store",
    },
    euLabel: {
      title: "EU tyre label",
      regulation: "Reg. (EU) 2020/740",
      fuel: "Fuel efficiency",
      wet: "Wet grip",
      noise: "External rolling noise",
      rollingNoise: "Rolling noise",
      noiseClass: "Class {c}",
      classAria: "{title}: class {c}",
      snow: "Severe snow (3PMSF)",
      ice: "Ice grip",
      eprel: "EPREL label & product information sheet",
    },
    utqg: null,
  },
  cart: {
    title: "Cart",
    empty: "Your cart is empty",
    shopTires: "Shop tyres",
    summary: "Order summary",
    delivery: `Delivery in ${euDays} to ${eu.shipping.area}.`,
    checkout: "Checkout",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    remove: "Remove {name}",
    quantityFor: "Quantity for {name}",
    aria: "Cart, items: {n}",
    tax: null,
    priceNote: "VAT included, no import duties.",
  },
  checkout: {
    ...checkoutFields,
    postal: "Postcode",
    state: null,
    deliverTo: `We deliver to ${eu.shipping.area}. Not available: ${eu.shipping.exclusions}.`,
    accepted: `Accepted: ${eu.paymentMethods.join(", ")}. The payment provider is not connected yet in this preview.`,
    estimated: `Estimated delivery: ${euDays}.`,
    acceptPrefix: "I have read and accept the",
    termsLink: "Terms & Conditions",
    and: "and the",
    privacyLink: "Privacy Policy",
    returnsPrefix: ", and I have been informed of my",
    returnsLink: `${eu.returns.windowDays}-day right of withdrawal`,
    end: ".",
    submit: "Order with obligation to pay",
  },
  consent: {
    ...consentShared,
    title: "Cookies & consent",
    text: "We use strictly necessary cookies to run the store. With your consent we also use analytics and advertising cookies (Google). Nothing optional is set until you choose. You can change your choice at any time under Cookie settings in the footer.",
    policyLink: "Cookie Policy",
    primary: "Accept all",
    secondary: "Reject all",
  },
  prose: { ...proseShared, nav: "EU store policies", store: "European Union store" },
  faq: {
    title: "Questions",
    metaTitle: "FAQ",
    description: "Delivery, returns, fitment and payment questions.",
    eyebrow: "European Union store",
    groups: [
      {
        title: "Orders & delivery",
        items: [
          {
            q: "How long does delivery take?",
            a: `${euDays} in total: ${eu.shipping.handlingDays[0]}–${eu.shipping.handlingDays[1]} days to dispatch and ${eu.shipping.transitDays[0]}–${eu.shipping.transitDays[1]} days in transit with ${eu.shipping.carriers.join(", ")}. Orders before ${eu.shipping.cutoff} on a working day count from that day.`,
          },
          { q: "How much is shipping?", a: "Shipping is free on every order." },
          { q: "Will I pay customs or import VAT?", a: eu.shipping.duties },
          {
            q: "Can you ship to my fitter?",
            a: "Yes. Enter the fitting centre's name and address as the delivery address and let them know a delivery is coming.",
          },
        ],
      },
      {
        title: "Returns",
        items: [
          {
            q: "Can I withdraw from my purchase?",
            a: `Yes. You have ${eu.returns.windowDays} days from delivery to withdraw without giving a reason. Mounting, driving on or installing items may reduce the refund.`,
          },
          {
            q: "Who pays for return shipping?",
            a: `For unwanted items you do — ${eu.returns.bulkyReturnCostEstimate} with our label. If the item is faulty or wrong, we pay.`,
          },
        ],
      },
      {
        title: "Fitment",
        items: [
          {
            q: "How do I find my tyre size?",
            a: "Read the code on the sidewall of your current tyres, e.g. 225/45 R17 94W. Match the size exactly; load index and speed rating should be the same or higher.",
          },
          {
            q: "Will these wheels fit my car?",
            a: "Check bolt pattern, centre bore and offset against your vehicle. Wheels with a larger centre bore than your hub need centring rings. Ask us before ordering if you are unsure.",
          },
          {
            q: "Do wheels and brakes need an approval?",
            a: "Replacement brake pads and discs must carry ECE R90 approval; we list it on each product. Some countries require wheel approval documents or a registration entry — check your national rules.",
          },
        ],
      },
      {
        title: "Payment",
        items: [{ q: "Which payment methods do you accept?", a: `${eu.paymentMethods.join(", ")}.` }],
      },
    ],
  },
  contact: {
    ...contactShared,
    lead: "We reply to emails within 1 working day. Include your order number and, for fitment questions, your vehicle and current tyre size.",
    description: `Contact ${COMPANY.tradingName} customer service.`,
    eyebrow: "European Union store",
    euRep: "EU representative (GDPR)",
  },
  about: { ...aboutShared, eyebrow: "European Union store", vat: "EU VAT (OSS)" },
}
