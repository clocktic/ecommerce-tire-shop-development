import { COMPANY, US_PRESENCE, companyAddressLine } from "@/lib/company"
import { POLICIES, deliveryLabel } from "@/lib/policies"
import type { PolicyDoc } from "@/lib/legal/types"

const p = POLICIES.us
const s = p.shipping
const r = p.returns
const contactLine = `${COMPANY.email} · ${COMPANY.phoneDisplay} (${COMPANY.hours})`

export const US_POLICIES: Record<string, PolicyDoc> = {
  shipping: {
    title: "Shipping Policy",
    description: `Free shipping to ${s.area}. Delivered in ${deliveryLabel("us")}.`,
    intro: `This policy applies to orders placed in the ${COMPANY.tradingName} US store (prices in USD).`,
    sections: [
      {
        heading: "Where we ship",
        blocks: [
          `We ship to ${s.area}. We do not ship to ${s.exclusions}, or to PO boxes — tires and wheels are oversized parcels and require a street address.`,
          "You can ship directly to a tire shop or installer. Enter the shop name in the company field and let them know a delivery is coming.",
        ],
      },
      {
        heading: "Cost",
        blocks: [s.freeShipping ? "Shipping is free on every order, with no minimum order value." : "Shipping is calculated at checkout."],
      },
      {
        heading: "Processing and delivery times",
        blocks: [
          {
            rows: [
              ["Order cut-off", `${s.cutoff}, Monday–Friday`],
              ["Handling time", `${s.handlingDays[0]}–${s.handlingDays[1]} business days`],
              ["Transit time", `${s.transitDays[0]}–${s.transitDays[1]} business days`],
              ["Total delivery time", deliveryLabel("us")],
              ["Carriers", s.carriers.join(", ")],
            ],
          },
          "Business days are Monday to Friday, excluding US federal holidays. Orders placed after the cut-off or on a weekend are processed the next business day.",
          s.duties,
        ],
      },
      {
        heading: "Tracking",
        blocks: ["You receive a shipping confirmation email with a tracking number for each parcel. A set of four tires usually ships as four separate parcels and may arrive on different days."],
      },
      {
        heading: "Damaged or missing parcels",
        blocks: [
          "Inspect parcels on delivery. If a parcel is damaged, note it with the driver if possible and email us photos within 7 days of delivery. If a parcel is marked delivered but has not arrived, contact us within 7 days and we will open a claim with the carrier.",
          "Items damaged in transit or lost by the carrier are replaced or refunded at no cost to you.",
        ],
      },
      { heading: "Sales tax", blocks: ["Sales tax is calculated at checkout based on the delivery address, where required by state law."] },
      { heading: "Contact", blocks: [contactLine] },
    ],
  },

  returns: {
    title: "Return & Refund Policy",
    description: `${r.windowDays}-day returns on unused, unmounted items. No restocking fee.`,
    intro: `You can return items bought in the ${COMPANY.tradingName} US store within ${r.windowDays} days of delivery.`,
    sections: [
      {
        heading: "Return window",
        blocks: [`You have ${r.windowDays} calendar days from the date of delivery to start a return.`],
      },
      {
        heading: "Condition of returned items",
        blocks: [
          "To be accepted for a refund, items must be new and unused:",
          {
            list: [
              "Tires: not mounted on a wheel, not driven on, no mounting-machine or bead-lube marks.",
              "Wheels: not mounted with a tire, not bolted to a vehicle, no lug-seat or hub marks.",
              "Brake parts: not installed, not bedded in, in the original sealed packaging.",
              "All items: with original labels and packaging, and all included parts.",
            ],
          },
          "Test-fitting a wheel against the hub without fastening lug nuts is fine — protect the face with a cloth.",
        ],
      },
      {
        heading: "How to return",
        blocks: [
          {
            list: [
              `Email ${COMPANY.email} with your order number and the items you want to return.`,
              "We reply within 1 business day with a return authorization (RMA) number and the return address.",
              `${r.method}.`,
              `Ship the items to: ${US_PRESENCE.returnsAddress}. Mark the RMA number on each parcel.`,
            ],
          },
        ],
      },
      {
        heading: "Return shipping costs",
        blocks: [
          r.returnShippingPaidBy === "merchant"
            ? "Return shipping is free."
            : `For returns of unwanted items, you pay the return shipping — ${r.bulkyReturnCostEstimate} if you use our prepaid label (deducted from the refund). If an item arrived damaged, defective or was not what you ordered, we pay the return shipping.`,
          r.restockingFeePercent > 0 ? `A ${r.restockingFeePercent}% restocking fee applies.` : "There is no restocking fee.",
        ],
      },
      {
        heading: "Refunds",
        blocks: [
          `We inspect returns within 2 business days of arrival and issue the refund to your original payment method within ${r.refundDays} business days after that. Your bank may need a few additional days to show the credit.`,
          "You are refunded the full item price. Original shipping was free, so no shipping charge applies.",
        ],
      },
      {
        heading: "Items that cannot be returned",
        blocks: [
          {
            list: [
              "Tires that have been mounted or driven on, except under a manufacturer warranty claim.",
              "Wheels that have been mounted with a tire or fitted to a vehicle.",
              "Brake parts that have been installed.",
            ],
          },
        ],
      },
      {
        heading: "Cancellations and exchanges",
        blocks: [
          "You can cancel free of charge until the order ships — email us as soon as possible. Once shipped, use the return process.",
          "For a different size, return the original item and place a new order. This is the fastest way to get the right part.",
        ],
      },
      { heading: "Contact", blocks: [contactLine] },
    ],
  },

  warranty: {
    title: "Warranty",
    description: "Manufacturer warranties on tires, wheels and brakes — how to make a claim.",
    intro: "Every product we sell is new and covered by its manufacturer's warranty. We handle the claim with the manufacturer for you.",
    sections: [
      {
        heading: "What is covered",
        blocks: [
          "Manufacturer warranties typically cover defects in materials and workmanship. Many tires also carry a treadwear (mileage) warranty. The exact terms, duration and exclusions are set by each manufacturer and are linked on the product page where available.",
        ],
      },
      {
        heading: "What is usually not covered",
        blocks: [
          {
            list: [
              "Road hazard damage (punctures, impacts, curb damage) unless a road hazard plan was purchased.",
              "Damage from incorrect inflation, overloading, misalignment or improper installation.",
              "Normal wear, including brake pad and disc wear.",
              "Use in racing or competition.",
            ],
          },
        ],
      },
      {
        heading: "How to make a claim",
        blocks: [
          `Email ${COMPANY.email} with your order number, photos of the item (including the DOT code for tires) and a short description. We forward the claim to the manufacturer and keep you updated. Some manufacturers require an inspection by an authorized dealer.`,
        ],
      },
      {
        heading: "Your rights",
        blocks: [
          "This page does not limit any implied warranties or other rights you have under federal law (including the Magnuson-Moss Warranty Act) or the law of your state.",
        ],
      },
      { heading: "Contact", blocks: [contactLine] },
    ],
  },

  payments: {
    title: "Payment Methods",
    description: `Pay with ${p.paymentMethods.join(", ")}.`,
    intro: "All prices in the US store are in US dollars (USD).",
    sections: [
      { heading: "Accepted methods", blocks: [{ list: p.paymentMethods }] },
      {
        heading: "When you are charged",
        blocks: ["Your payment is authorized when you place the order and captured when the order ships. If an item cannot be shipped, the authorization is released."],
      },
      { heading: "Sales tax", blocks: ["Sales tax is calculated at checkout based on the delivery address, where required by state law."] },
      {
        heading: "Security",
        blocks: ["Card details are processed by our payment provider over an encrypted connection. We do not store full card numbers."],
      },
      { heading: "No surcharges", blocks: ["We do not add a fee for any payment method."] },
    ],
  },

  terms: {
    title: "Terms of Service",
    description: `Terms for purchases from the ${COMPANY.tradingName} US store.`,
    intro: `These Terms of Service govern your use of the ${COMPANY.tradingName} US store and purchases you make there. The store is operated by ${COMPANY.legalName}, ${companyAddressLine} ("we", "us").`,
    sections: [
      {
        heading: "Eligibility",
        blocks: ["You must be at least 18 years old and have a delivery address in the area we serve to place an order."],
      },
      {
        heading: "Orders",
        blocks: [
          "Placing an order is an offer to buy. We accept it when we send the shipping confirmation. We may decline or cancel an order — for example if an item is out of stock, if a pricing error occurred, or if we suspect fraud — and will refund any amount charged.",
        ],
      },
      {
        heading: "Prices and product information",
        blocks: [
          "Prices are in USD and exclude sales tax, which is added at checkout where applicable. We work to keep product information accurate; if a material error is found after you order, we will contact you before shipping and you can cancel at no cost.",
        ],
      },
      {
        heading: "Fitment and installation",
        blocks: [
          "You are responsible for confirming that the size, load index, speed rating, bolt pattern, offset and brake fitment match your vehicle and its placard or owner's manual. Tires, wheels and brake components should be installed by a qualified technician and torqued to the vehicle manufacturer's specification. Contact us before ordering if you are unsure.",
        ],
      },
      {
        heading: "Shipping, risk and title",
        blocks: ["Risk of loss and title pass to you when the item is delivered to your shipping address. See the Shipping Policy for details."],
      },
      { heading: "Returns and warranty", blocks: ["Returns are governed by our Return & Refund Policy; warranty claims by our Warranty page."] },
      {
        heading: "Limitation of liability",
        blocks: [
          "To the extent permitted by law, we are not liable for indirect or consequential damages arising from the use of products bought from us, and our total liability for any order is limited to the amount you paid for it. Nothing in these terms limits liability that cannot be limited by law, including for personal injury caused by negligence.",
        ],
      },
      {
        heading: "Governing law and disputes",
        blocks: [
          `These terms are governed by the laws of the State of ${COMPANY.stateOfFormation}, without regard to conflict-of-law rules. Please contact us first — most issues are solved quickly. Either party may bring a claim in small claims court where eligible; otherwise, disputes are resolved in the state or federal courts located in ${COMPANY.stateOfFormation}.`,
        ],
      },
      { heading: "Changes", blocks: ["We may update these terms. The version in force when you place an order applies to that order."] },
      { heading: "Contact", blocks: [contactLine] },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    description: "How we collect, use and share personal information in the US store, and your US state privacy rights.",
    intro: `${COMPANY.legalName} ("we") operates the ${COMPANY.tradingName} US store. This policy explains what personal information we collect, how we use it, and the rights you have under US state privacy laws, including the California Consumer Privacy Act (CCPA/CPRA).`,
    sections: [
      {
        heading: "Information we collect",
        blocks: [
          {
            rows: [
              ["Identifiers and contact details", "Name, email, phone, delivery and billing address"],
              ["Commercial information", "Orders, returns, vehicle or size details you provide"],
              ["Payment information", "Processed by our payment provider; we receive only a token and the last digits"],
              ["Internet activity", "Pages viewed, device and browser data, approximate location from IP"],
              ["Communications", "Messages you send to customer service"],
            ],
          },
          "We do not knowingly collect sensitive personal information, and we do not use it to infer characteristics about you.",
        ],
      },
      {
        heading: "How we use it",
        blocks: [
          {
            list: [
              "To process, ship and support your orders, returns and warranty claims.",
              "To prevent fraud and secure the store.",
              "To meet tax, accounting and legal obligations.",
              "To measure and improve the store (analytics).",
              "To show and measure advertising, subject to your opt-out choices.",
            ],
          },
        ],
      },
      {
        heading: "Who we share it with",
        blocks: [
          "Service providers that act on our behalf: payment processing, shipping carriers and our warehouse, hosting, email delivery and customer support tools.",
          "Advertising and analytics partners (for example Google), through cookies. Under some state laws this may count as \"selling\" or \"sharing\" personal information for cross-context behavioral advertising. You can opt out at any time on the Your Privacy Choices page.",
          "Authorities, when required by law.",
        ],
      },
      {
        heading: "Your rights",
        blocks: [
          "Depending on your state of residence, you may have the right to:",
          {
            list: [
              "Know and access the personal information we hold about you.",
              "Correct inaccurate information.",
              "Delete your personal information, subject to legal exceptions.",
              "Opt out of the sale or sharing of personal information and of targeted advertising.",
              "Not be discriminated against for exercising these rights.",
            ],
          },
          `Submit requests to ${COMPANY.privacyEmail} or by phone at ${COMPANY.phoneDisplay}. We verify requests by matching details with your order. An authorized agent may submit a request with your written permission. If we deny a request, you can appeal by replying to our decision.`,
        ],
      },
      {
        heading: "Global Privacy Control",
        blocks: ["We treat a Global Privacy Control (GPC) browser signal as a valid request to opt out of sale and sharing for that browser."],
      },
      {
        heading: "Retention",
        blocks: ["We keep order records for as long as required by tax and accounting law (typically 7 years), and other data only as long as needed for the purposes above."],
      },
      { heading: "Children", blocks: ["The store is not directed at children under 13, and we do not knowingly collect their information."] },
      { heading: "Changes", blocks: ["We will post any changes on this page with a new effective date."] },
      { heading: "Contact", blocks: [`${COMPANY.legalName}, ${companyAddressLine}. ${COMPANY.privacyEmail}`] },
    ],
  },

  "privacy-choices": {
    title: "Your Privacy Choices",
    description: "Opt out of the sale or sharing of personal information and targeted advertising.",
    intro: "You can opt out of the sale or sharing of your personal information and of targeted advertising at any time.",
    sections: [
      {
        heading: "Opt out in this browser",
        blocks: [
          "Use the Do Not Sell or Share My Personal Information link in the footer and turn advertising off. Your choice is stored in this browser, so repeat it on each device you use.",
          "If your browser sends a Global Privacy Control (GPC) signal, we apply the opt-out automatically.",
        ],
      },
      {
        heading: "Opt out by email",
        blocks: [`Email ${COMPANY.privacyEmail} with the subject \"Do not sell or share\" and the email address you use with us. We apply it to your customer record within 15 business days.`],
      },
      { heading: "More information", blocks: ["See the Privacy Policy for the full list of your rights."] },
    ],
  },
}
