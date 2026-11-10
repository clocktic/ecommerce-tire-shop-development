"use client"

import { useState } from "react"
import type { ContentLang } from "@/lib/i18n/config"
import type { Market } from "@/lib/markets"
import { cn } from "@/lib/utils"

type PaymentChoice = "card" | "paypal"

interface Copy {
  heading: string
  cardTitle: string
  cardSub: string
  cardCta: string
  cardRedirectNote: string
  paypalTitle: string
  paypalSub: string
}

const COPY: Record<ContentLang, Copy> = {
  en: {
    heading: "Payment method",
    cardTitle: "Card, Apple Pay, Google Pay, Shop Pay",
    cardSub: "Visa, Mastercard, Amex & express wallets on the secure payment page",
    cardCta: "Proceed to payment",
    cardRedirectNote: "You will be redirected to the secure payment page to complete your order.",
    paypalTitle: "PayPal, Venmo & Pay Later",
    paypalSub: "Pay in a pop-up window via PayPal, Venmo, or Pay in 4",
  },
  de: {
    heading: "Zahlungsart",
    cardTitle: "Karte, Apple Pay, Google Pay, Shop Pay",
    cardSub: "Visa, Mastercard, Amex & Express-Wallets auf der sicheren Bezahlseite",
    cardCta: "Weiter zur Zahlung",
    cardRedirectNote: "Sie werden zur sicheren Bezahlseite weitergeleitet, um Ihre Bestellung abzuschließen.",
    paypalTitle: "PayPal & Später bezahlen",
    paypalSub: "Direkt im Pop-up-Fenster mit PayPal oder Ratenzahlung bezahlen",
  },
  fr: {
    heading: "Mode de paiement",
    cardTitle: "Carte, Apple Pay, Google Pay, Shop Pay",
    cardSub: "Visa, Mastercard, Amex et portefeuilles express sur la page de paiement sécurisée",
    cardCta: "Passer au paiement",
    cardRedirectNote: "Vous serez redirigé vers la page de paiement sécurisée pour finaliser votre commande.",
    paypalTitle: "PayPal & Paiement en plusieurs fois",
    paypalSub: "Payez dans une fenêtre pop-up via PayPal",
  },
  it: {
    heading: "Metodo di pagamento",
    cardTitle: "Carta, Apple Pay, Google Pay, Shop Pay",
    cardSub: "Visa, Mastercard, Amex e wallet rapidi nella pagina di pagamento sicura",
    cardCta: "Procedi al pagamento",
    cardRedirectNote: "Verrai reindirizzato alla pagina di pagamento sicura per completare l'ordine.",
    paypalTitle: "PayPal & Paga in 3 rate",
    paypalSub: "Paga in una finestra pop-up tramite PayPal",
  },
  es: {
    heading: "Método de pago",
    cardTitle: "Tarjeta, Apple Pay, Google Pay, Shop Pay",
    cardSub: "Visa, Mastercard, Amex y billeteras rápidas en la pasarela de pago segura",
    cardCta: "Continuar al pago",
    cardRedirectNote: "Serás redirigido a la página de pago segura para completar tu pedido.",
    paypalTitle: "PayPal, Venmo y Paga después",
    paypalSub: "Paga en una ventana emergente con PayPal",
  },
  "es-419": {
    heading: "Método de pago",
    cardTitle: "Tarjeta, Apple Pay, Google Pay, Shop Pay",
    cardSub: "Visa, Mastercard, Amex y billeteras rápidas en la pasarela de pago segura",
    cardCta: "Continuar al pago",
    cardRedirectNote: "Serás redirigido a la página de pago segura para completar tu pedido.",
    paypalTitle: "PayPal, Venmo y Paga después",
    paypalSub: "Paga en una ventana emergente con PayPal o Venmo",
  },
  nl: {
    heading: "Betaalmethode",
    cardTitle: "Kaart, Apple Pay, Google Pay, Shop Pay",
    cardSub: "Visa, Mastercard, Amex en snelle wallets op de beveiligde betaalpagina",
    cardCta: "Doorgaan naar betaling",
    cardRedirectNote: "Je wordt doorgestuurd naar de beveiligde betaalpagina om je bestelling af te ronden.",
    paypalTitle: "PayPal & Betaal later",
    paypalSub: "Betaal direct in een pop-upvenster via PayPal",
  },
}

export function getPaymentMethodCopy(lang: string): Copy {
  return COPY[lang as ContentLang] ?? COPY.en
}

export function PaymentMethodSelector({
  lang = "en",
  market = "us",
  cardAction,
  paypalAction,
}: {
  lang?: string
  market?: Market
  cardAction: React.ReactNode
  paypalAction: React.ReactNode
}) {
  const [choice, setChoice] = useState<PaymentChoice>("card")
  const c = getPaymentMethodCopy(lang)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {c.heading}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Option 1: Card / Apple Pay / Google Pay / Shop Pay */}
        <div
          className={cn(
            "rounded-lg border transition-colors",
            choice === "card"
              ? "border-primary/80 bg-secondary/45 shadow-[0_0_0_1px_rgba(220,38,38,0.25)]"
              : "border-border bg-secondary/20 hover:border-border/80",
          )}
        >
          <button
            type="button"
            onClick={() => setChoice("card")}
            className="flex w-full items-start gap-3 p-3.5 text-left"
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                choice === "card"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/50",
              )}
              aria-hidden="true"
            >
              {choice === "card" && <span className="size-1.5 rounded-full bg-white" />}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{c.cardTitle}</span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-foreground">
                    VISA
                  </span>
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-foreground">
                    MC
                  </span>
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-foreground">
                    AMEX
                  </span>
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-tight text-foreground">
                    Apple Pay
                  </span>
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-tight text-foreground">
                    G Pay
                  </span>
                </div>
              </div>
              <p className="text-xs leading-snug text-muted-foreground">{c.cardSub}</p>
            </div>
          </button>

          {choice === "card" && (
            <div className="flex flex-col gap-2 border-t border-border/60 px-3.5 pt-3 pb-3.5">
              {cardAction}
              <p className="text-center text-[11px] leading-snug text-muted-foreground">
                {c.cardRedirectNote}
              </p>
            </div>
          )}
        </div>

        {/* Option 2: PayPal / Venmo / Pay Later */}
        <div
          className={cn(
            "rounded-lg border transition-colors",
            choice === "paypal"
              ? "border-primary/80 bg-secondary/45 shadow-[0_0_0_1px_rgba(220,38,38,0.25)]"
              : "border-border bg-secondary/20 hover:border-border/80",
          )}
        >
          <button
            type="button"
            onClick={() => setChoice("paypal")}
            className="flex w-full items-start gap-3 p-3.5 text-left"
          >
            <span
              className={cn(
                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                choice === "paypal"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/50",
              )}
              aria-hidden="true"
            >
              {choice === "paypal" && <span className="size-1.5 rounded-full bg-white" />}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{c.paypalTitle}</span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="rounded bg-[#FFC439] px-1.5 py-0.5 font-mono text-[10px] font-extrabold tracking-tight text-[#003087]">
                    PayPal
                  </span>
                  {market === "us" && (
                    <span className="rounded bg-[#008CFF] px-1.5 py-0.5 font-mono text-[10px] font-extrabold tracking-tight text-white">
                      venmo
                    </span>
                  )}
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-tight text-foreground">
                    Pay Later
                  </span>
                </div>
              </div>
              <p className="text-xs leading-snug text-muted-foreground">{c.paypalSub}</p>
            </div>
          </button>

          {choice === "paypal" && (
            <div className="border-t border-border/60 px-3.5 pt-3 pb-3.5">
              {paypalAction}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
