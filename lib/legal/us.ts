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
    description: `Free standard shipping to ${s.area}. Delivered in ${deliveryLabel("us")}.`,
    intro: `This Shipping Policy applies to all orders placed in the ${COMPANY.tradingName} US store (operated by ${COMPANY.legalName}, prices in USD).`,
    sections: [
      {
        heading: "Where we ship",
        blocks: [
          `We ship across ${s.area}. We do not ship to ${s.exclusions} — tires, alloy wheels and brake kits are heavy or oversized parcels that require a physical street address for carrier delivery.`,
          "You may have your order shipped directly to a local tire shop, dealership or independent installer. Enter the shop's name in the company or address field at checkout and let your installer know the shipment is on the way.",
        ],
      },
      {
        heading: "Shipping cost",
        blocks: [
          s.freeShipping
            ? "Standard ground shipping is free ($0.00) on every order across the 48 contiguous United States, with no minimum order value and no hidden handling surcharges."
            : "Shipping is calculated at checkout before you submit payment.",
        ],
      },
      {
        heading: "Processing and delivery times",
        blocks: [
          {
            rows: [
              ["Order cut-off time", `${s.cutoff}, Monday–Friday`],
              ["Handling / warehouse processing time", `${s.handlingDays[0]}–${s.handlingDays[1]} business days`],
              ["Carrier transit time", `${s.transitDays[0]}–${s.transitDays[1]} business days`],
              ["Total estimated delivery time", deliveryLabel("us")],
              ["Carriers", s.carriers.join(", ")],
              ["Dispatched from", "United States (California & contiguous US distribution centers)"],
            ],
          },
          "Business days are Monday through Friday, excluding US federal holidays. Orders placed before the cut-off time on a business day begin processing that same day; orders placed after the cut-off time, on a weekend, or on a federal holiday begin processing the next business day.",
          s.duties,
        ],
      },
      {
        heading: "Shipping delays (FTC Mail Order Rule)",
        blocks: [
          "In accordance with the FTC Mail, Internet, or Telephone Order Merchandise Rule (16 CFR Part 435), if we are unable to ship your order within the stated handling timeframe, we will notify you by email with a revised shipping date and give you the option to either consent to the revised date or cancel your order for a prompt, full refund to your original payment method.",
        ],
      },
      {
        heading: "Tracking and multi-parcel shipments",
        blocks: [
          "As soon as your order leaves our warehouse, you receive a shipping confirmation email with a carrier tracking number for every parcel. You can also check real-time status on our Track Order page.",
          "Tires and wheels are typically banded or boxed individually by the carrier. A set of four tires or wheels usually travels as four separate tracking numbers and may be delivered on consecutive business days depending on local carrier routing.",
        ],
      },
      {
        heading: "Damaged, defective or missing parcels",
        blocks: [
          "Please inspect all parcels upon delivery. If a parcel arrives visibly damaged, note the damage with the carrier driver if possible and email photos of the item and packaging to our support team within 7 calendar days of delivery. If tracking shows delivered but you cannot locate the parcel, contact us within 7 calendar days so we can initiate a carrier trace.",
          "Items damaged in transit, defective upon arrival, or lost by the carrier are replaced or refunded in full at $0 cost to you (including free return shipping where a return is required).",
        ],
      },
      {
        heading: "Sales tax",
        blocks: [
          "Applicable state and local sales tax is calculated and displayed at checkout based on the destination delivery address, where required by state law.",
        ],
      },
      { heading: "Contact", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  returns: {
    title: "Return & Refund Policy",
    description: `${r.windowDays}-day returns on unused, unmounted items. $0 restocking fee.`,
    intro: `You can return eligible items purchased in the ${COMPANY.tradingName} US store within ${r.windowDays} calendar days of delivery for a full refund of the item price.`,
    sections: [
      {
        heading: "Summary of return terms",
        blocks: [
          {
            rows: [
              ["Return window", `${r.windowDays} calendar days from the date of delivery`],
              ["Item condition required", "New, unused, unmounted, in original packaging with all labels and accessories"],
              ["Return method", "By mail / parcel carrier after requesting a Return Merchandise Authorization (RMA)"],
              ["Restocking fee", "$0.00 (0% — we never charge a restocking fee)"],
              ["Return shipping (defective / wrong item)", "Free ($0.00 — we provide a prepaid return label)"],
              ["Return shipping (unwanted / wrong size ordered)", `${r.bulkyReturnCostEstimate} using our prepaid label (deducted from refund)`],
              ["Refund processing time", `Within ${r.refundDays} business days after return inspection (inspected within 2 business days of arrival)`],
              ["Physical return address", US_PRESENCE.returnsAddress],
            ],
          },
        ],
      },
      {
        heading: "Return window",
        blocks: [
          `You have ${r.windowDays} calendar days from the date your order (or the final parcel of a multi-parcel order) is delivered to request a return.`,
        ],
      },
      {
        heading: "Condition of returned items",
        blocks: [
          "To qualify for a refund, returned merchandise must be new, unused and unaltered:",
          {
            list: [
              "Tires: must not have been mounted on a wheel, inflated, balanced or driven on, and must have no mounting-machine marks, bead lubricant residue or removed factory barcode/spec labels.",
              "Wheels: must not have had a tire mounted on them, must not have been bolted to a vehicle with torqued lug nuts/bolts, and must be in their original boxes with center caps and protective rings.",
              "Brake components: must not have been installed, bolted to a hub/caliper, or bedded in, and must be in the original sealed manufacturer packaging.",
              "All items: must include all original manufacturer packaging, documentation and hardware.",
            ],
          },
          "Tip before mounting wheels: you may carefully test-fit a bare wheel against the vehicle hub (before mounting a tire on it and without tightening lug nuts) using a soft cloth to verify brake caliper and fender clearance.",
        ],
      },
      {
        heading: "How to start a return & return address",
        blocks: [
          {
            list: [
              `Email ${COMPANY.email} (or call ${COMPANY.phoneDisplay}) with your order number, the item(s) you wish to return, and the reason for the return.`,
              "Within 1 business day, we issue a Return Merchandise Authorization (RMA) number along with return shipping instructions and, if requested, a prepaid carrier return label.",
              `Ship the authorized return to our returns facility: ${US_PRESENCE.returnsAddress} (or to the regional US distribution warehouse printed on your prepaid RMA label). Clearly write the RMA number on the outside of each parcel—do not write directly on manufacturer wheel or brake boxes.`,
            ],
          },
        ],
      },
      {
        heading: "Return shipping costs & restocking fees",
        blocks: [
          "Damaged, defective or incorrect items: If an item arrived damaged in transit, has a manufacturing defect on arrival, or is not the part number you ordered, we cover 100% of the return shipping cost and provide a prepaid return label at no charge ($0.00).",
          r.returnShippingPaidBy === "merchant"
            ? "Unwanted items: Return shipping is free."
            : `Unwanted items / buyer's remorse / wrong size ordered: You are responsible for return shipping. If you use our discounted prepaid carrier label, the return shipping cost is ${r.bulkyReturnCostEstimate}, which is deducted from your refund. Alternatively, you may ship the item back using your own insured ground carrier with tracking after receiving your RMA number.`,
          r.restockingFeePercent > 0
            ? `A ${r.restockingFeePercent}% restocking fee applies.`
            : "We do not charge any restocking fee ($0.00 / 0%) on eligible returns.",
        ],
      },
      {
        heading: "Refund timeline and method",
        blocks: [
          `Once your return arrives at our facility, our team inspects it within 2 business days. We issue your refund to the original payment method within ${r.refundDays} business days after inspection approval. Depending on your card issuer or bank, it may take an additional 2–5 business days for the credit to post on your statement.`,
          "Your refund includes the full purchase price of the returned item(s) plus any applicable state/local sales tax collected on those items (less the prepaid return label cost only if returning an unwanted item using our label). Original outbound shipping was free, so no outbound shipping deduction applies.",
        ],
      },
      {
        heading: "Items that cannot be returned",
        blocks: [
          {
            list: [
              "Tires that have been mounted on a wheel, balanced, or driven on (except under a verified manufacturer defect warranty claim).",
              "Wheels that have had tires mounted on them or have been fastened/driven on a vehicle.",
              "Brake pads, rotors, calipers or lines that have been installed or exposed to brake fluid.",
              "Items damaged due to improper installation, curb impact, potholes, racing or road hazards.",
            ],
          },
        ],
      },
      {
        heading: "Order cancellations and exchanges",
        blocks: [
          "Cancellations before shipment: You can cancel your order free of charge at any time before it is dispatched by emailing or calling us. We will void the payment authorization or refund 100% of the amount paid immediately.",
          "Exchanges: To exchange an item for a different tire size, wheel specification or brake kit, please initiate a return for the original item and place a new order for the replacement item so your new part ships immediately without waiting for the return transit.",
        ],
      },
      { heading: "Contact", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  warranty: {
    title: "Warranty Policy",
    description: "Manufacturer warranties on tires, wheels and brakes, NHTSA DOT tire registration, and how to submit a claim.",
    intro: `Every tire, wheel and brake component sold in the ${COMPANY.tradingName} US store is brand-new, first-quality merchandise covered by its manufacturer's limited warranty. We assist you directly with manufacturer warranty claims.`,
    sections: [
      {
        heading: "What is covered",
        blocks: [
          "Manufacturer limited warranties cover defects in materials and workmanship from the date of purchase or up to the usable tread life of the tire. Many passenger and light-truck tires also carry a manufacturer treadwear (mileage) warranty and uniformity warranty. Specific warranty terms, durations and pro-rata calculation rules are established by each brand and shown on the product page where applicable.",
        ],
      },
      {
        heading: "What is not covered by warranty",
        blocks: [
          {
            list: [
              "Road hazard damage (nail punctures, cuts, bruises, impact breaks, potholes, or curb damage).",
              "Irregular or premature wear caused by improper inflation pressure, vehicle misalignment, unbalanced wheels, worn suspension components, overloading, or failure to rotate tires.",
              "Normal wear and tear, including normal wear of brake pads and brake rotors.",
              "Damage resulting from improper mounting/installation, chemical contamination, structural modification, or use in racing, track days or off-road competition.",
            ],
          },
        ],
      },
      {
        heading: "DOT tire registration & safety recalls (49 CFR Part 574)",
        blocks: [
          "Under US National Highway Traffic Safety Administration (NHTSA) regulations (49 CFR Part 574), every tire sold in the United States carries a DOT Tire Identification Number (TIN) molded into the sidewall. Registering your tires enables the tire manufacturer to contact you directly in the event of a safety recall.",
          `When you purchase tires from ${COMPANY.tradingName}, we record the tire identification details associated with your order and can submit or provide the NHTSA tire registration information upon dispatch. You may also register your tires directly on the tire manufacturer's website using the DOT code on the sidewall and our dealer details (${COMPANY.legalName}, ${companyAddressLine}).`,
        ],
      },
      {
        heading: "How to make a warranty claim",
        blocks: [
          `Email ${COMPANY.email} with your order number, clear photos of the item (for tires, include the full DOT sidewall code and a tread-depth gauge photo; for treadwear claims, include rotation/maintenance records), and a brief description of the issue. We respond within 1–2 business days with claim instructions and coordinate inspection or replacement with the manufacturer.`,
        ],
      },
      {
        heading: "Your statutory rights (Magnuson-Moss Warranty Act)",
        blocks: [
          "Nothing on this page limits or disclaims any implied warranties of merchantability or fitness for a particular purpose, or any other rights and remedies available to you under the federal Magnuson-Moss Warranty Act (15 U.S.C. § 2301 et seq.) or the consumer protection laws of your state.",
        ],
      },
      { heading: "Contact", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  payments: {
    title: "Payment Methods",
    description: `Secure checkout in USD with ${p.paymentMethods.join(", ")}.`,
    intro: `All prices in the ${COMPANY.tradingName} US store are stated and charged in US Dollars (USD).`,
    sections: [
      {
        heading: "Accepted payment methods",
        blocks: [
          "We accept the following major credit and debit cards at checkout:",
          { list: p.paymentMethods },
        ],
      },
      {
        heading: "How payment processing works",
        blocks: [
          "When you click \"Place order\" at checkout, you are directed to our encrypted 3D Secure 2.0 payment page to complete your card payment. Your payment is authorized when you submit the transaction and captured for order fulfillment. If an order is canceled prior to shipment or cannot be fulfilled from stock, the payment authorization is released or refunded in full immediately.",
        ],
      },
      {
        heading: "Pricing, sales tax & total transparency",
        blocks: [
          "The price shown on each product page is the price per unit in USD. Standard ground shipping is free ($0.00). Applicable state and local sales tax is calculated at checkout based on your delivery ZIP code before you submit payment. We never add hidden handling fees, payment surcharges, or post-checkout charges.",
        ],
      },
      {
        heading: "Payment security & fraud prevention",
        blocks: [
          "All card transactions are processed over TLS-encrypted connections through a PCI-DSS Level 1 compliant payment gateway with 3D Secure 2.0 authentication and Address Verification System (AVS) checks. We never store raw card numbers or CVV security codes on our servers.",
        ],
      },
      { heading: "No payment surcharges", blocks: ["We do not charge any additional fee or surcharge for any accepted payment method."] },
      { heading: "Contact", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  terms: {
    title: "Terms of Service",
    description: `Terms of Service for purchases from the ${COMPANY.tradingName} US store.`,
    intro: `These Terms of Service ("Terms") govern your access to and purchases from the ${COMPANY.tradingName} US store. The store is operated by ${COMPANY.legalName}, ${companyAddressLine} ("we", "us", "our").`,
    sections: [
      {
        heading: "Seller identity & legal registration",
        blocks: [
          {
            rows: [
              ["Trading name", COMPANY.tradingName],
              ["Legal entity", `${COMPANY.legalName}, a ${COMPANY.stateOfFormation} ${COMPANY.entityType.toLowerCase()}`],
              ["Secretary of State file number", `${COMPANY.registrationNumber} (${COMPANY.stateOfFormation})`],
              ["California Seller's Permit", `${COMPANY.sellerPermit} (${COMPANY.sellerPermitAuthority})`],
              ["Managing Member", COMPANY.representative],
              ["Principal business address", companyAddressLine],
              ["Address for legal notices", COMPANY.mailingAddress],
              ["Customer service contact", `${COMPANY.email} · ${COMPANY.phoneDisplay} (${COMPANY.hours})`],
            ],
          },
        ],
      },
      {
        heading: "Eligibility",
        blocks: ["You must be at least 18 years old, able to form legally binding contracts under applicable law, and have a valid physical delivery address within the 48 contiguous United States to place an order."],
      },
      {
        heading: "Orders and contract formation",
        blocks: [
          "Submitting an order at checkout constitutes an offer to purchase the selected products under these Terms. We send an automated email acknowledging receipt of your order details; acceptance of your offer and formation of the contract of sale occur when we dispatch the products and send your shipping confirmation email. We reserve the right to decline or cancel an order before shipment—for example, due to stock unavailability, an inability to verify billing/shipping information, suspected payment fraud, or a manifest pricing or typographical error—in which case we will notify you promptly and refund 100% of any amount paid.",
        ],
      },
      {
        heading: "Prices, sales tax & Member Club discount",
        blocks: [
          "All prices in the US store are shown in US Dollars (USD) per individual item (per tire, per wheel, or per brake component/kit as specified in the product title) and exclude applicable state and local sales tax, which is calculated at checkout.",
          "Member Club (7% Member Discount): Customers who create a free account and sign in prior to checkout receive an automatic 7% Member Club discount applied to the merchandise subtotal in the cart and at checkout. The Member Club discount cannot be applied retroactively to completed guest orders, has no cash value, and if items purchased with the discount are returned, the refund equals the net discounted price actually paid.",
        ],
      },
      {
        heading: "Vehicle fitment, DOT compliance & installation",
        blocks: [
          "All tires offered in our US store carry USDOT compliance markings and applicable UTQG ratings. Before ordering and again before mounting, you (and your installer) are responsible for verifying that the tire size, load index, speed rating, wheel diameter, width, bolt pattern, offset (ET), center bore, and brake component specifications match your vehicle's door-jamb tire placard, owner's manual, and physical caliper/fender clearance.",
          "Tires, wheels, and brake parts are safety-critical automotive components. They must be installed by a certified automotive technician using calibrated mounting and balancing equipment and torqued to the vehicle manufacturer's specifications.",
        ],
      },
      {
        heading: "Shipping, risk of loss and title",
        blocks: ["Delivery timeframes and carrier terms are set out in our Shipping Policy. Title and risk of loss pass to you upon confirmed carrier delivery of the parcel(s) to your designated shipping address. Parcels lost or damaged in transit prior to delivery are replaced or refunded by us at no cost to you."],
      },
      {
        heading: "Returns, cancellations and warranties",
        blocks: ["Returns, refunds and pre-shipment cancellations are governed by our Return & Refund Policy. Manufacturer warranties and statutory warranty rights are detailed on our Warranty Policy page."],
      },
      {
        heading: "Limitation of liability",
        blocks: [
          "To the fullest extent permitted by applicable law, we shall not be liable for indirect, incidental, special or consequential damages (including installation charges, towing, alignment fees or loss of vehicle use) arising out of or related to the purchase or use of any product, and our aggregate liability for any claim relating to an order shall not exceed the total amount paid by you for that order. Nothing in these Terms excludes or limits liability that cannot be excluded under applicable federal or state law, including liability for gross negligence, willful misconduct, or personal injury.",
        ],
      },
      {
        heading: "Governing law and dispute resolution",
        blocks: [
          `These Terms and any purchase from the US store are governed by the laws of the State of ${COMPANY.stateOfFormation}, without regard to conflict-of-law principles. If you have any concern, please contact us first at ${COMPANY.email} or ${COMPANY.phoneDisplay}—most issues are resolved within 1–2 business days. Either party may bring an eligible individual claim in small claims court; otherwise, any legal proceeding shall be brought exclusively in the state or federal courts located in Los Angeles County, ${COMPANY.stateOfFormation}.`,
        ],
      },
      { heading: "Updates to these Terms", blocks: ["We may update these Terms from time to time. The version published on the store at the time you place your order governs that order."] },
      { heading: "Contact", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    description: "How we collect, use, retain and protect personal information in the US store, including CCPA/CPRA and US state privacy rights.",
    intro: `${COMPANY.legalName} ("we", "us", "our") operates the ${COMPANY.tradingName} US store. This Privacy Policy describes what personal information we collect, how we use and share it, and the privacy rights available to residents of the United States, including under the California Consumer Privacy Act as amended by the CPRA (CCPA/CPRA) and other applicable US state privacy laws.`,
    sections: [
      {
        heading: "Notice at Collection: categories of personal information",
        blocks: [
          {
            rows: [
              ["Identifiers & contact information", "Full name, email address, phone number, shipping and billing street address, account ID, IP address"],
              ["Commercial & order information", "Products ordered, order numbers, return/RMA records, warranty claims, and saved garage vehicle/tire size preferences"],
              ["Payment & financial data", "Payment card authorization tokens and last 4 digits processed by our PCI-DSS Level 1 payment processor (we never store full card numbers or CVV codes)"],
              ["Internet & device activity", "Pages and products viewed, cart contents, browser/device type, referring URLs, and interaction data (subject to your cookie/privacy preferences)"],
              ["Customer support communications", "Emails, contact form submissions, live chat messages, and photos submitted for fitment, return, or warranty support"],
            ],
          },
          "We do not collect biometric data, precise geolocation, government ID numbers, or other sensitive personal information, and we do not use sensitive personal information to infer characteristics about consumers.",
        ],
      },
      {
        heading: "Purposes for which we use personal information",
        blocks: [
          {
            list: [
              "Order fulfillment & customer support: processing payments, shipping orders via UPS/FedEx/USPS, providing tracking updates, handling returns/RMAs, and fulfilling NHTSA DOT tire registration and warranty claims.",
              "Account & garage features: maintaining your optional customer account, applying the 7% Member Club discount, and saving your vehicle fitment preferences.",
              "Security & fraud prevention: verifying billing/shipping details, detecting fraudulent transactions, and protecting the integrity of our store.",
              "Legal & tax compliance: maintaining sales tax, accounting, customs, and tire safety recall records required by federal and state law.",
              "Store analytics & advertising (Google Ads / Shopping): measuring site performance and the effectiveness of Google Shopping and search advertisements, strictly subject to your opt-out choices and Global Privacy Control (GPC) signals.",
            ],
          },
        ],
      },
      {
        heading: "How we disclose personal information & Google Consent Mode v2",
        blocks: [
          "Service providers (processors): We share necessary data with contractual service providers who act solely on our behalf—specifically our payment gateway (CGPayTech), shipping carriers (UPS, FedEx, USPS) and US warehouse partners, cloud hosting (Vercel / Neon), and transactional email delivery.",
          "Advertising & analytics partners (Google): When advertising/analytics cookies are active, we use Google Analytics and Google Ads / Google Merchant Center conversion tags to measure ad performance and show relevant product listings. Under the CCPA/CPRA and certain other US state privacy laws, allowing third-party advertising tags to collect device identifiers may constitute \"sharing\" or \"selling\" personal information for cross-context behavioral advertising. We do not sell personal information for monetary consideration.",
          "We implement Google Consent Mode v2. If you opt out on our Your Privacy Choices page or if your browser sends a Global Privacy Control (GPC) signal, ad_storage, ad_user_data, and ad_personalization are automatically set to \"denied\".",
          "Legal obligations: We may disclose information when required by law, subpoena, court order, or NHTSA safety recall regulations.",
        ],
      },
      {
        heading: "Your US state privacy rights (CCPA/CPRA & multi-state laws)",
        blocks: [
          "Depending on your state of residence (including California, Virginia, Colorado, Connecticut, Texas, Oregon, and other states with consumer privacy laws), you have the right to:",
          {
            list: [
              "Right to Know & Access: request confirmation of whether we process your personal information and receive a copy of the specific pieces and categories of personal information we have collected about you.",
              "Right to Correct: request correction of inaccurate personal information we maintain about you.",
              "Right to Delete: request deletion of your personal information, subject to statutory exceptions (such as completing an active order, warranty/DOT recall records, or tax retention requirements).",
              "Right to Opt Out of Sale / Sharing & Targeted Advertising: opt out of the sharing of your personal information for cross-context behavioral or targeted advertising at any time.",
              "Right to Non-Discrimination: we will never deny goods, charge different prices, or provide a different quality of service because you exercised your privacy rights.",
            ],
          },
          `How to submit a request: Email ${COMPANY.privacyEmail} or call ${COMPANY.phoneDisplay}. To protect your account, we verify access, correction, and deletion requests by matching at least two data points (such as your email address and order number) against our records. No verification is required to opt out of sale/sharing. You may designate an authorized agent to make a request on your behalf by providing signed written permission. If we decline a request in whole or in part, we will explain the reason and how you can appeal our decision by replying to ${COMPANY.privacyEmail}.`,
        ],
      },
      {
        heading: "Global Privacy Control (GPC)",
        blocks: [
          "We recognize and honor the Global Privacy Control (GPC) browser signal automatically as a valid, legally binding opt-out of the sale or sharing of personal information and targeted advertising for that browser.",
        ],
      },
      {
        heading: "Data retention",
        blocks: [
          "We retain order, invoice, and tax records for 7 years as required by US federal and California tax and accounting laws, DOT tire registration records as required by NHTSA regulations, customer support correspondence for up to 3 years after resolution, and browser consent preferences for 13 months.",
        ],
      },
      {
        heading: "Children's privacy",
        blocks: ["Our store is intended for adults aged 18 and older. We do not knowingly collect, use, or share personal information from children under 16 years of age."],
      },
      { heading: "Changes to this policy", blocks: ["We will post any updates to this Privacy Policy on this page and update the effective date at the top of the page."] },
      { heading: "Contact", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${COMPANY.privacyEmail} · ${COMPANY.phoneDisplay}`] },
    ],
  },

  "privacy-choices": {
    title: "Your Privacy Choices",
    description: "Opt out of the sale or sharing of personal information and targeted advertising (CCPA/CPRA & US state privacy laws).",
    intro: "Under the California Consumer Privacy Act (CCPA/CPRA) and other US state privacy laws, you have the right to opt out of the \"sale\" or \"sharing\" of your personal information for cross-context behavioral or targeted advertising.",
    sections: [
      {
        heading: "Opt out instantly in this browser",
        blocks: [
          "Click the \"Open privacy settings\" button below (or the \"Do Not Sell or Share My Personal Information\" link in the site footer) and switch off Advertising (and Analytics if desired), then click \"Save choices\". This immediately updates Google Consent Mode v2 in your browser to deny ad_storage, ad_user_data, and ad_personalization.",
          "If your browser or extension sends a Global Privacy Control (GPC) signal, our site detects it automatically and disables advertising cookies and sharing without any action needed from you.",
        ],
      },
      {
        heading: "Opt out across your customer record by email",
        blocks: [
          `You may also email ${COMPANY.privacyEmail} with the subject line "Do Not Sell or Share" and the email address associated with your order or account. We will confirm and apply your opt-out within 15 business days.`,
        ],
      },
      {
        heading: "More information",
        blocks: [
          "For full details on the categories of personal information we collect and all of your privacy rights, please read our Privacy Policy.",
          { link: { href: "/policies/privacy", label: "Read the Privacy Policy" } },
        ],
      },
    ],
  },
}
