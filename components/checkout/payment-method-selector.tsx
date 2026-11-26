"use client"

import { useState } from "react"
import type { ContentLang } from "@/lib/i18n/config"
import type { Market } from "@/lib/markets"
import { PAYPAL_CHECKOUT_ENABLED } from "@/lib/payments/paypal-config"
import { getSepaCopy } from "@/lib/payments/sepa"
import { cn } from "@/lib/utils"

export type PaymentChoice = "ngenius" | "sepa" | "card" | "paypal"

interface Copy {
  heading: string
  ngeniusTitle: string
  ngeniusSub: string
  ngeniusCta: string
  ngeniusRedirectNote: string
  cardTitle: string
  cardOnlyTitle: string
  cardSub: string
  cardCta: string
  cardRedirectNote: string
  paypalTitle: string
  paypalSub: string
}

const COPY: Record<ContentLang, Copy> = {
  en: {
    heading: "Payment method",
    ngeniusTitle: "Credit / Debit Card",
    ngeniusSub: "Pay securely by Visa or Mastercard with 3D Secure protection",
    ngeniusCta: "Pay by card",
    ngeniusRedirectNote: "Redirects to the encrypted 3D Secure card payment page.",
    paypalTitle: "Debit / Credit Card, PayPal, Venmo & Pay Later",
    paypalSub: "Pay with Visa, Mastercard, Amex, Discover, PayPal, Venmo, or Pay in 4",
    cardTitle: "Express Wallets & Alternative Checkout",
    cardOnlyTitle: "Credit / Debit Card & Express Wallets",
    cardSub: "Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay & Shop Pay",
    cardCta: "Proceed to payment",
    cardRedirectNote: "Opens the encrypted payment page to complete your order.",
  },
  de: {
    heading: "Zahlungsart",
    ngeniusTitle: "Kredit- / Debitkarte",
    ngeniusSub: "Sicher mit Visa oder Mastercard und 3D-Secure-Schutz bezahlen",
    ngeniusCta: "Mit Karte bezahlen",
    ngeniusRedirectNote: "Leitet zur verschlüsselten 3D-Secure-Kartenzahlung weiter.",
    paypalTitle: "Kredit-/Debitkarte, PayPal & Später bezahlen",
    paypalSub: "Mit Visa, Mastercard, Amex, PayPal oder Ratenzahlung bezahlen",
    cardTitle: "Express-Wallets & Alternativer Checkout",
    cardOnlyTitle: "Kredit-/Debitkarte & Express-Wallets",
    cardSub: "Visa, Mastercard, Amex, Apple Pay, Google Pay & Shop Pay",
    cardCta: "Weiter zur Zahlung",
    cardRedirectNote: "Öffnet die verschlüsselte Bezahlseite, um Ihre Bestellung abzuschließen.",
  },
  fr: {
    heading: "Mode de paiement",
    ngeniusTitle: "Carte bancaire",
    ngeniusSub: "Payez en toute sécurité par Visa ou Mastercard avec protection 3D Secure",
    ngeniusCta: "Payer par carte",
    ngeniusRedirectNote: "Redirige vers la page sécurisée de paiement par carte 3D Secure.",
    paypalTitle: "Carte bancaire, PayPal & Paiement en 4x",
    paypalSub: "Payez par Visa, Mastercard, Amex ou PayPal",
    cardTitle: "Portefeuilles express & Paiement alternatif",
    cardOnlyTitle: "Carte bancaire & Portefeuilles express",
    cardSub: "Visa, Mastercard, Amex, Apple Pay, Google Pay & Shop Pay",
    cardCta: "Passer au paiement",
    cardRedirectNote: "Ouvre la page de paiement sécurisée pour finaliser votre commande.",
  },
  it: {
    heading: "Metodo di pagamento",
    ngeniusTitle: "Carta di credito / debito",
    ngeniusSub: "Paga in sicurezza con Visa o Mastercard con protezione 3D Secure",
    ngeniusCta: "Paga con carta",
    ngeniusRedirectNote: "Reindirizza alla pagina crittografata di pagamento con carta 3D Secure.",
    paypalTitle: "Carta di credito/debito, PayPal & Paga in 3 rate",
    paypalSub: "Paga con Visa, Mastercard, Amex o PayPal",
    cardTitle: "Wallet rapidi & Checkout alternativo",
    cardOnlyTitle: "Carta di credito/debito & Wallet rapidi",
    cardSub: "Visa, Mastercard, Amex, Apple Pay, Google Pay & Shop Pay",
    cardCta: "Procedi al pagamento",
    cardRedirectNote: "Apre la pagina di pagamento crittografata per completare l'ordine.",
  },
  es: {
    heading: "Método de pago",
    ngeniusTitle: "Tarjeta de crédito / débito",
    ngeniusSub: "Paga de forma segura con Visa o Mastercard con protección 3D Secure",
    ngeniusCta: "Pagar con tarjeta",
    ngeniusRedirectNote: "Redirige a la pasarela cifrada de pago con tarjeta 3D Secure.",
    paypalTitle: "Tarjeta de débito/crédito, PayPal y Paga después",
    paypalSub: "Paga con Visa, Mastercard, Amex o PayPal",
    cardTitle: "Billeteras rápidas y Pago alternativo",
    cardOnlyTitle: "Tarjeta de débito/crédito y Billeteras rápidas",
    cardSub: "Visa, Mastercard, Amex, Apple Pay, Google Pay y Shop Pay",
    cardCta: "Continuar al pago",
    cardRedirectNote: "Abre la pasarela de pago segura para completar tu pedido.",
  },
  "es-419": {
    heading: "Método de pago",
    ngeniusTitle: "Tarjeta de crédito / débito",
    ngeniusSub: "Paga de forma segura con Visa o Mastercard con protección 3D Secure",
    ngeniusCta: "Pagar con tarjeta",
    ngeniusRedirectNote: "Redirige a la pasarela cifrada de pago con tarjeta 3D Secure.",
    paypalTitle: "Tarjeta de débito/crédito, PayPal, Venmo y Paga después",
    paypalSub: "Paga con Visa, Mastercard, Amex, PayPal o Venmo",
    cardTitle: "Billeteras rápidas y Pago alternativo",
    cardOnlyTitle: "Tarjeta de débito/crédito y Billeteras rápidas",
    cardSub: "Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay y Shop Pay",
    cardCta: "Continuar al pago",
    cardRedirectNote: "Abre la pasarela de pago segura para completar tu pedido.",
  },
  nl: {
    heading: "Betaalmethode",
    ngeniusTitle: "Creditcard / Betaalkaart",
    ngeniusSub: "Betaal veilig met Visa of Mastercard met 3D Secure-beveiliging",
    ngeniusCta: "Betalen met kaart",
    ngeniusRedirectNote: "Leidt door naar de versleutelde 3D Secure-kaartbetaalpagina.",
    paypalTitle: "Betaalkaart / Creditcard, PayPal & Betaal later",
    paypalSub: "Betaal met Visa, Mastercard, Amex of PayPal",
    cardTitle: "Express-wallets & Alternatieve checkout",
    cardOnlyTitle: "Betaalkaart / Creditcard & Express-wallets",
    cardSub: "Visa, Mastercard, Amex, Apple Pay, Google Pay & Shop Pay",
    cardCta: "Doorgaan naar betaling",
    cardRedirectNote: "Opent de beveiligde betaalpagina om je bestelling af te ronden.",
  },
}

export function getPaymentMethodCopy(lang: string): Copy {
  return COPY[lang as ContentLang] ?? COPY.en
}

export function PaymentMethodSelector({
  lang = "en",
  market = "us",
  choice: controlledChoice,
  defaultChoice: initialChoice,
  onChoiceChange,
  ngeniusAction,
  sepaAction,
  cardAction,
  paypalAction,
}: {
  lang?: string
  market?: Market
  choice?: PaymentChoice
  defaultChoice?: PaymentChoice
  onChoiceChange?: (choice: PaymentChoice) => void
  ngeniusAction?: React.ReactNode
  sepaAction?: React.ReactNode
  cardAction: React.ReactNode
  paypalAction: React.ReactNode
}) {
  const showNgenius = market === "eu" && Boolean(ngeniusAction)
  const showSepa = market === "eu" && Boolean(sepaAction)
  const isUs = market === "us"
  const fallbackChoice: PaymentChoice = showNgenius ? "ngenius" : "card"
  const [internalChoice, setInternalChoice] = useState<PaymentChoice>(initialChoice ?? fallbackChoice)
  const rawChoice = controlledChoice ?? internalChoice
  const choice: PaymentChoice =
    rawChoice === "ngenius" && !showNgenius
      ? "card"
      : rawChoice === "sepa" && !showSepa
        ? fallbackChoice
        : rawChoice === "paypal" && !PAYPAL_CHECKOUT_ENABLED
          ? fallbackChoice
          : rawChoice
  const setChoice = (next: PaymentChoice) => {
    setInternalChoice(next)
    onChoiceChange?.(next)
  }
  const c = getPaymentMethodCopy(lang)
  const sepaCopy = getSepaCopy(lang)

  const cardBlock = (
    <div
      key="card"
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
        className="flex w-full items-start gap-2.5 p-3 text-left sm:gap-3 sm:p-3.5"
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
          <span className="text-sm font-semibold leading-snug text-foreground">
            {isUs || !PAYPAL_CHECKOUT_ENABLED ? c.cardOnlyTitle : c.cardTitle}
          </span>
          <div className="flex flex-wrap items-center gap-1">
            <span className="rounded border border-border/80 bg-background/80 px-1 py-0.5 font-mono text-[9.5px] font-semibold tracking-tight text-foreground sm:px-1.5 sm:text-[10px]">
              Apple Pay
            </span>
            <span className="rounded border border-border/80 bg-background/80 px-1 py-0.5 font-mono text-[9.5px] font-semibold tracking-tight text-foreground sm:px-1.5 sm:text-[10px]">
              G Pay
            </span>
            <span className="rounded bg-[#5A31F4] px-1 py-0.5 font-mono text-[9.5px] font-bold tracking-tight text-white sm:px-1.5 sm:text-[10px]">
              Shop Pay
            </span>
            <span className="rounded border border-border/80 bg-background/80 px-1 py-0.5 font-mono text-[9.5px] font-bold tracking-tight text-foreground sm:px-1.5 sm:text-[10px]">
              VISA
            </span>
            <span className="rounded border border-border/80 bg-background/80 px-1 py-0.5 font-mono text-[9.5px] font-bold tracking-tight text-foreground sm:px-1.5 sm:text-[10px]">
              MC
            </span>
            <span className="rounded border border-border/80 bg-background/80 px-1 py-0.5 font-mono text-[9.5px] font-bold tracking-tight text-foreground sm:px-1.5 sm:text-[10px]">
              AMEX
            </span>
          </div>
          <p className="text-xs leading-snug text-muted-foreground">{c.cardSub}</p>
        </div>
      </button>

      {choice === "card" && (
        <div className="flex flex-col gap-2 border-t border-border/60 px-3 pt-3 pb-3 sm:px-3.5 sm:pb-3.5">
          {cardAction}
          <p className="text-center text-[11px] leading-snug text-muted-foreground">
            {c.cardRedirectNote}
          </p>
        </div>
      )}
    </div>
  )

  const paypalBlock = PAYPAL_CHECKOUT_ENABLED ? (
    <div
      key="paypal"
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
        className="flex w-full items-start gap-2.5 p-3 text-left sm:gap-3 sm:p-3.5"
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
          <span className="text-sm font-semibold leading-snug text-foreground">
            {c.paypalTitle}
          </span>
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
          <p className="text-xs leading-snug text-muted-foreground">{c.paypalSub}</p>
        </div>
      </button>

      {choice === "paypal" && (
        <div className="border-t border-border/60 px-2.5 pt-2.5 pb-2.5 sm:px-3.5 sm:pt-3 sm:pb-3.5">
          {paypalAction}
        </div>
      )}
    </div>
  ) : null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {c.heading}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {showNgenius && (
          <div
            className={cn(
              "rounded-lg border transition-colors",
              choice === "ngenius"
                ? "border-primary/80 bg-secondary/45 shadow-[0_0_0_1px_rgba(220,38,38,0.25)]"
                : "border-border bg-secondary/20 hover:border-border/80",
            )}
          >
            <button
              type="button"
              onClick={() => setChoice("ngenius")}
              className="flex w-full items-start gap-2.5 p-3 text-left sm:gap-3 sm:p-3.5"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                  choice === "ngenius"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/50",
                )}
                aria-hidden="true"
              >
                {choice === "ngenius" && <span className="size-1.5 rounded-full bg-white" />}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-sm font-semibold leading-snug text-foreground">
                  {c.ngeniusTitle}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-foreground">
                    VISA
                  </span>
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-foreground">
                    Mastercard
                  </span>
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-tight text-muted-foreground">
                    3D Secure
                  </span>
                </div>
                <p className="text-xs leading-snug text-muted-foreground">{c.ngeniusSub}</p>
              </div>
            </button>

            {choice === "ngenius" && (
              <div className="flex flex-col gap-2 border-t border-border/60 px-3 pt-3 pb-3 sm:px-3.5 sm:pb-3.5">
                {ngeniusAction}
                <p className="text-center text-[11px] leading-snug text-muted-foreground">
                  {c.ngeniusRedirectNote}
                </p>
              </div>
            )}
          </div>
        )}
        {showSepa && (
          <div
            className={cn(
              "rounded-lg border transition-colors",
              choice === "sepa"
                ? "border-primary/80 bg-secondary/45 shadow-[0_0_0_1px_rgba(220,38,38,0.25)]"
                : "border-border bg-secondary/20 hover:border-border/80",
            )}
          >
            <button
              type="button"
              onClick={() => setChoice("sepa")}
              className="flex w-full items-start gap-2.5 p-3 text-left sm:gap-3 sm:p-3.5"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                  choice === "sepa"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/50",
                )}
                aria-hidden="true"
              >
                {choice === "sepa" && <span className="size-1.5 rounded-full bg-white" />}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-sm font-semibold leading-snug text-foreground">
                  {sepaCopy.title}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="rounded bg-[#003399] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-white">
                    SEPA
                  </span>
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-tight text-foreground">
                    EUR IBAN
                  </span>
                  <span className="rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-tight text-emerald-400">
                    0% Fee
                  </span>
                </div>
                <p className="text-xs leading-snug text-muted-foreground">{sepaCopy.subtitle}</p>
              </div>
            </button>

            {choice === "sepa" && (
              <div className="flex flex-col gap-3 border-t border-border/60 px-3 pt-3 pb-3 sm:px-3.5 sm:pb-3.5">
                {sepaAction}
              </div>
            )}
          </div>
        )}
        {isUs ? (
          <>
            {cardBlock}
            {paypalBlock}
          </>
        ) : (
          <>
            {paypalBlock}
            {cardBlock}
          </>
        )}
      </div>
    </div>
  )
}
