import type { Market } from "@/lib/markets"
import { POLICIES, deliveryLabel } from "@/lib/policies"

export type FaqGroup = { title: string; items: { q: string; a: string }[] }

export function getFaq(market: Market): FaqGroup[] {
  const p = POLICIES[market]
  const eu = market === "eu"
  return [
    {
      title: "Orders & delivery",
      items: [
        {
          q: "How long does delivery take?",
          a: `${deliveryLabel(market)} in total: ${p.shipping.handlingDays[0]}–${p.shipping.handlingDays[1]} days to dispatch and ${p.shipping.transitDays[0]}–${p.shipping.transitDays[1]} days in transit with ${p.shipping.carriers.join(", ")}. Orders before ${p.shipping.cutoff} on a working day count from that day.`,
        },
        {
          q: "How much is shipping?",
          a: p.shipping.freeShipping ? "Shipping is free on every order." : "Shipping costs are shown before you order.",
        },
        {
          q: eu ? "Will I pay customs or import VAT?" : "Do you charge sales tax?",
          a: eu ? p.shipping.duties : "Sales tax is calculated at checkout based on your delivery address where state law requires it.",
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
          q: eu ? "Can I withdraw from my purchase?" : "What is your return policy?",
          a: eu
            ? `Yes. You have ${p.returns.windowDays} days from delivery to withdraw without giving a reason. Mounting, driving on or installing items may reduce the refund.`
            : `Return unused, unmounted items within ${p.returns.windowDays} days of delivery for a full refund of the item price. There is no restocking fee.`,
        },
        {
          q: "Who pays for return shipping?",
          a:
            p.returns.returnShippingPaidBy === "merchant"
              ? "We do."
              : `For unwanted items you do — ${p.returns.bulkyReturnCostEstimate} with our label. If the item is faulty or wrong, we pay.`,
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
          a: "Check bolt pattern, centre bore and offset against your vehicle. Wheels with a larger centre bore than your hub need centring rings. Ask us before ordering if you are unsure.",
        },
        eu
          ? {
              q: "Do wheels and brakes need an approval?",
              a: "Replacement brake pads and discs must carry ECE R90 approval; we list it on each product. Some countries require wheel approval documents or a registration entry — check your national rules.",
            }
          : {
              q: "Are your tires DOT approved?",
              a: "Every tire in the US store carries the DOT code required for road use in the United States, and UTQG grades where applicable.",
            },
      ],
    },
    {
      title: "Payment",
      items: [{ q: "Which payment methods do you accept?", a: `${p.paymentMethods.join(", ")}.` }],
    },
  ]
}
