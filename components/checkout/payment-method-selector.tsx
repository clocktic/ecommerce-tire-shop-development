"use client"

import { useState } from "react"
import type { ContentLang } from "@/lib/i18n/config"
import type { Market } from "@/lib/markets"
import { PAYPAL_CHECKOUT_ENABLED } from "@/lib/payments/paypal-config"
import { getSepaCopy } from "@/lib/payments/sepa"
import { cn } from "@/lib/utils"

export type PaymentChoice = "zen" | "ngenius" | "sepa" | "card" | "paypal"

export const SHOPIFY_CHECKOUT_ENABLED = false

interface Copy {
  heading: string
  ngeniusTitle: string
  ngeniusSub: string
  ngeniusCta: string
  ngeniusRedirectNote: string
  zenTitle: string
  zenSub: string
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
    zenTitle: "Alternative Card Checkout (3D Secure)",
    zenSub: "Pay via ZEN 3D Secure gateway (Visa, Mastercard, Amex, Discover)",
    paypalTitle: "Debit / Credit Card, PayPal, Venmo & Pay Later",
    paypalSub: "Pay with Visa, Mastercard, Amex, Discover, PayPal, Venmo, or Pay in 4",
    cardTitle: "Credit / Debit Card",
    cardOnlyTitle: "Credit / Debit Card",
    cardSub: "Pay securely by Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay & Shop Pay",
    cardCta: "Pay by card",
    cardRedirectNote: "Opens the encrypted card payment page to complete your order.",
  },
  de: {
    heading: "Zahlungsart",
    ngeniusTitle: "Kredit- / Debitkarte",
    ngeniusSub: "Sicher mit Visa oder Mastercard und 3D-Secure-Schutz bezahlen",
    ngeniusCta: "Mit Karte bezahlen",
    ngeniusRedirectNote: "Leitet zur verschlüsselten 3D-Secure-Kartenzahlung weiter.",
    zenTitle: "Alternative Kartenzahlung (3D Secure)",
    zenSub: "Über ZEN 3D-Secure-Gateway bezahlen (Visa, Mastercard, Amex, Discover)",
    paypalTitle: "Kredit-/Debitkarte, PayPal & Später bezahlen",
    paypalSub: "Mit Visa, Mastercard, Amex, PayPal oder Ratenzahlung bezahlen",
    cardTitle: "Kredit- / Debitkarte",
    cardOnlyTitle: "Kredit- / Debitkarte",
    cardSub: "Sicher mit Visa, Mastercard, Amex, Apple Pay, Google Pay & Shop Pay bezahlen",
    cardCta: "Mit Karte bezahlen",
    cardRedirectNote: "Öffnet die verschlüsselte Karten-Bezahlseite, um Ihre Bestellung abzuschließen.",
  },
  fr: {
    heading: "Mode de paiement",
    ngeniusTitle: "Carte bancaire",
    ngeniusSub: "Payez en toute sécurité par Visa ou Mastercard avec protection 3D Secure",
    ngeniusCta: "Payer par carte",
    ngeniusRedirectNote: "Redirige vers la page sécurisée de paiement par carte 3D Secure.",
    zenTitle: "Paiement par carte alternatif (3D Secure)",
    zenSub: "Payez via la passerelle 3D Secure ZEN (Visa, Mastercard, Amex, Discover)",
    paypalTitle: "Carte bancaire, PayPal & Paiement en 4x",
    paypalSub: "Payez par Visa, Mastercard, Amex ou PayPal",
    cardTitle: "Carte bancaire",
    cardOnlyTitle: "Carte bancaire",
    cardSub: "Payez par Visa, Mastercard, Amex, Apple Pay, Google Pay & Shop Pay",
    cardCta: "Payer par carte",
    cardRedirectNote: "Ouvre la page de paiement par carte sécurisée pour finaliser votre commande.",
  },
  it: {
    heading: "Metodo di pagamento",
    ngeniusTitle: "Carta di credito / debito",
    ngeniusSub: "Paga in sicurezza con Visa o Mastercard con protezione 3D Secure",
    ngeniusCta: "Paga con carta",
    ngeniusRedirectNote: "Reindirizza alla pagina crittografata di pagamento con carta 3D Secure.",
    zenTitle: "Pagamento con carta alternativo (3D Secure)",
    zenSub: "Paga tramite gateway ZEN 3D Secure (Visa, Mastercard, Amex, Discover)",
    paypalTitle: "Carta di credito/debito, PayPal & Paga in 3 rate",
    paypalSub: "Paga con Visa, Mastercard, Amex o PayPal",
    cardTitle: "Carta di credito / debito",
    cardOnlyTitle: "Carta di credito / debito",
    cardSub: "Paga con Visa, Mastercard, Amex, Apple Pay, Google Pay & Shop Pay",
    cardCta: "Paga con carta",
    cardRedirectNote: "Apre la pagina crittografata di pagamento con carta per completare l'ordine.",
  },
  es: {
    heading: "Método de pago",
    ngeniusTitle: "Tarjeta de crédito / débito",
    ngeniusSub: "Paga de forma segura con Visa o Mastercard con protección 3D Secure",
    ngeniusCta: "Pagar con tarjeta",
    ngeniusRedirectNote: "Redirige a la pasarela cifrada de pago con tarjeta 3D Secure.",
    zenTitle: "Pago alternativo con tarjeta (3D Secure)",
    zenSub: "Paga mediante pasarela ZEN 3D Secure (Visa, Mastercard, Amex, Discover)",
    paypalTitle: "Tarjeta de débito/crédito, PayPal y Paga después",
    paypalSub: "Paga con Visa, Mastercard, Amex o PayPal",
    cardTitle: "Tarjeta de crédito / débito",
    cardOnlyTitle: "Tarjeta de crédito / débito",
    cardSub: "Paga con Visa, Mastercard, Amex, Apple Pay, Google Pay y Shop Pay",
    cardCta: "Pagar con tarjeta",
    cardRedirectNote: "Abre la pasarela segura de pago con tarjeta para completar tu pedido.",
  },
  "es-419": {
    heading: "Método de pago",
    ngeniusTitle: "Tarjeta de crédito / débito",
    ngeniusSub: "Paga de forma segura con Visa o Mastercard con protección 3D Secure",
    ngeniusCta: "Pagar con tarjeta",
    ngeniusRedirectNote: "Redirige a la pasarela cifrada de pago con tarjeta 3D Secure.",
    zenTitle: "Pago alternativo con tarjeta (3D Secure)",
    zenSub: "Paga mediante pasarela ZEN 3D Secure (Visa, Mastercard, Amex, Discover)",
    paypalTitle: "Tarjeta de débito/crédito, PayPal, Venmo y Paga después",
    paypalSub: "Paga con Visa, Mastercard, Amex, PayPal o Venmo",
    cardTitle: "Tarjeta de crédito / débito",
    cardOnlyTitle: "Tarjeta de crédito / débito",
    cardSub: "Paga con Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay y Shop Pay",
    cardCta: "Pagar con tarjeta",
    cardRedirectNote: "Abre la pasarela segura de pago con tarjeta para completar tu pedido.",
  },
  nl: {
    heading: "Betaalmethode",
    ngeniusTitle: "Creditcard / Betaalkaart",
    ngeniusSub: "Betaal veilig met Visa of Mastercard met 3D Secure-beveiliging",
    ngeniusCta: "Betalen met kaart",
    ngeniusRedirectNote: "Leidt door naar de versleutelde 3D Secure-kaartbetaalpagina.",
    zenTitle: "Alternatieve kaartbetaling (3D Secure)",
    zenSub: "Betaal via ZEN 3D Secure-gateway (Visa, Mastercard, Amex, Discover)",
    paypalTitle: "Betaalkaart / Creditcard, PayPal & Betaal later",
    paypalSub: "Betaal met Visa, Mastercard, Amex of PayPal",
    cardTitle: "Creditcard / Betaalkaart",
    cardOnlyTitle: "Creditcard / Betaalkaart",
    cardSub: "Betaal met Visa, Mastercard, Amex, Apple Pay, Google Pay & Shop Pay",
    cardCta: "Betalen met kaart",
    cardRedirectNote: "Opent de beveiligde kaartbetaalpagina om je bestelling af te ronden.",
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
  zenAction,
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
  zenAction?: React.ReactNode
  ngeniusAction?: React.ReactNode
  sepaAction?: React.ReactNode
  cardAction: React.ReactNode
  paypalAction: React.ReactNode
}) {
  const showZen = market === "us" && Boolean(zenAction)
  const showNgenius = market === "eu" && Boolean(ngeniusAction)
  const showSepa = market === "eu" && Boolean(sepaAction)
  const showCard = SHOPIFY_CHECKOUT_ENABLED && Boolean(cardAction)
  const isUs = market === "us"
  const fallbackChoice: PaymentChoice =
    isUs && PAYPAL_CHECKOUT_ENABLED
      ? "paypal"
      : showCard && isUs
        ? "card"
        : showZen
          ? "zen"
          : showNgenius
            ? "ngenius"
            : showCard
              ? "card"
              : "paypal"
  const [internalChoice, setInternalChoice] = useState<PaymentChoice>(initialChoice ?? fallbackChoice)
  const rawChoice = controlledChoice ?? internalChoice
  const choice: PaymentChoice =
    rawChoice === "zen" && !showZen
      ? fallbackChoice
      : rawChoice === "ngenius" && !showNgenius
        ? fallbackChoice
        : rawChoice === "sepa" && !showSepa
          ? fallbackChoice
          : rawChoice === "card" && !showCard
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

  const cardBlock = showCard ? (
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
            {showZen || PAYPAL_CHECKOUT_ENABLED ? c.cardTitle : c.cardOnlyTitle}
          </span>
          <div className="flex flex-wrap items-center gap-1">
            <span className="rounded border border-border/80 bg-background/80 px-1 py-0.5 font-mono text-[9.5px] font-bold tracking-tight text-foreground sm:px-1.5 sm:text-[10px]">
              VISA
            </span>
            <span className="rounded border border-border/80 bg-background/80 px-1 py-0.5 font-mono text-[9.5px] font-bold tracking-tight text-foreground sm:px-1.5 sm:text-[10px]">
              MC
            </span>
            <span className="rounded border border-border/80 bg-background/80 px-1 py-0.5 font-mono text-[9.5px] font-bold tracking-tight text-foreground sm:px-1.5 sm:text-[10px]">
              AMEX
            </span>
            <span className="rounded border border-border/80 bg-background/80 px-1 py-0.5 font-mono text-[9.5px] font-semibold tracking-tight text-foreground sm:px-1.5 sm:text-[10px]">
              Apple Pay
            </span>
            <span className="rounded border border-border/80 bg-background/80 px-1 py-0.5 font-mono text-[9.5px] font-semibold tracking-tight text-foreground sm:px-1.5 sm:text-[10px]">
              G Pay
            </span>
            <span className="rounded bg-[#5A31F4] px-1 py-0.5 font-mono text-[9.5px] font-bold tracking-tight text-white sm:px-1.5 sm:text-[10px]">
              Shop Pay
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
  ) : null

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
            <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-tight text-foreground">
              Apple Pay
            </span>
            <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-tight text-foreground">
              G Pay
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
        {isUs && paypalBlock}
        {isUs && cardBlock}
        {showZen && (
          <div
            className={cn(
              "rounded-lg border transition-colors",
              choice === "zen"
                ? "border-primary/80 bg-secondary/45 shadow-[0_0_0_1px_rgba(220,38,38,0.25)]"
                : "border-border bg-secondary/20 hover:border-border/80",
            )}
          >
            <button
              type="button"
              onClick={() => setChoice("zen")}
              className="flex w-full items-start gap-2.5 p-3 text-left sm:gap-3 sm:p-3.5"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                  choice === "zen"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/50",
                )}
                aria-hidden="true"
              >
                {choice === "zen" && <span className="size-1.5 rounded-full bg-white" />}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-sm font-semibold leading-snug text-foreground">
                  {showCard ? c.zenTitle : c.ngeniusTitle}
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-foreground">
                    VISA
                  </span>
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-foreground">
                    Mastercard
                  </span>
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-foreground">
                    AMEX
                  </span>
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight text-foreground">
                    Discover
                  </span>
                  <span className="rounded border border-border/80 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-tight text-muted-foreground">
                    3D Secure
                  </span>
                </div>
                <p className="text-xs leading-snug text-muted-foreground">
                  {c.zenSub}
                </p>
              </div>
            </button>

            {choice === "zen" && (
              <div className="flex flex-col gap-2 border-t border-border/60 px-3 pt-3 pb-3 sm:px-3.5 sm:pb-3.5">
                {zenAction}
                <p className="text-center text-[11px] leading-snug text-muted-foreground">
                  {c.ngeniusRedirectNote}
                </p>
              </div>
            )}
          </div>
        )}
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
        {!isUs && paypalBlock}
        {!isUs && cardBlock}
      </div>
    </div>
  )
}
