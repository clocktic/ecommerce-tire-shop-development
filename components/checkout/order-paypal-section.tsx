"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Market } from "@/lib/markets"
import { PayButton } from "@/components/checkout/pay-button"
import {
  getPaymentMethodCopy,
  PaymentMethodSelector,
  type PaymentChoice,
} from "@/components/checkout/payment-method-selector"
import { PayPalOrderButtons } from "@/components/checkout/paypal-buttons"
import { SepaBankDetails } from "@/components/checkout/sepa-bank-details"

export function OrderPayPalSection({
  orderNumber,
  currency,
  payNowLabel,
  lang = "en",
  market = "us",
  defaultChoice,
  totalFormatted,
  sepaReportedAt = null,
}: {
  orderNumber: string
  currency: string
  payNowLabel?: string
  lang?: string
  market?: Market
  defaultChoice?: PaymentChoice
  totalFormatted?: string
  sepaReportedAt?: string | null
}) {
  const router = useRouter()
  const [loadingShopify, setLoadingShopify] = useState(false)
  const [loadingNgenius, setLoadingNgenius] = useState(false)
  const [loadingZen, setLoadingZen] = useState(false)
  const isEu = market === "eu"

  const redirectTo = (url: string) => {
    if (window.self !== window.top) {
      window.open(url, "_blank", "noopener,noreferrer")
    } else {
      window.location.assign(url)
    }
  }

  const handleZenPay = async () => {
    if (loadingZen) return
    setLoadingZen(true)
    try {
      const res = await fetch("/api/payments/zen/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        forwardUrl?: string
      }
      if (res.ok && data.ok && data.forwardUrl) {
        redirectTo(data.forwardUrl)
        return
      }
    } finally {
      setLoadingZen(false)
    }
  }

  const handleNgeniusPay = async () => {
    if (loadingNgenius) return
    setLoadingNgenius(true)
    try {
      const res = await fetch("/api/payments/ngenius/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        forwardUrl?: string
      }
      if (res.ok && data.ok && data.forwardUrl) {
        redirectTo(data.forwardUrl)
        return
      }
    } finally {
      setLoadingNgenius(false)
    }
  }

  const handleShopifyPay = async () => {
    if (loadingShopify) return
    setLoadingShopify(true)
    try {
      const res = await fetch("/api/payments/shopify/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        forwardUrl?: string
      }
      if (res.ok && data.ok && data.forwardUrl) {
        redirectTo(data.forwardUrl)
        return
      }
    } finally {
      setLoadingShopify(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <PaymentMethodSelector
        lang={lang}
        market={market}
        defaultChoice={defaultChoice}
        zenAction={
          !isEu ? (
            <PayButton
              type="button"
              pending={loadingZen}
              onClick={handleZenPay}
            >
              {getPaymentMethodCopy(lang).ngeniusCta}
            </PayButton>
          ) : undefined
        }
        ngeniusAction={
          isEu ? (
            <PayButton
              type="button"
              pending={loadingNgenius}
              onClick={handleNgeniusPay}
            >
              {getPaymentMethodCopy(lang).ngeniusCta}
            </PayButton>
          ) : undefined
        }
        sepaAction={
          isEu ? (
            <SepaBankDetails
              lang={lang}
              orderNumber={orderNumber}
              amountFormatted={totalFormatted}
              initialReportedAt={sepaReportedAt}
              showPaidButton
            />
          ) : undefined
        }
        cardAction={
          <PayButton
            type="button"
            pending={loadingShopify}
            onClick={handleShopifyPay}
          >
            {payNowLabel || getPaymentMethodCopy(lang).cardCta}
          </PayButton>
        }
        paypalAction={
          <PayPalOrderButtons
            currency={currency}
            disabled={loadingShopify || loadingNgenius}
            getOrderNumber={async () => orderNumber}
            onSuccess={() => {
              router.refresh()
            }}
          />
        }
      />
    </div>
  )
}


