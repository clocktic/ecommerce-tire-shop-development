"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Market } from "@/lib/markets"
import { PayButton } from "@/components/checkout/pay-button"
import {
  getPaymentMethodCopy,
  PaymentMethodSelector,
} from "@/components/checkout/payment-method-selector"
import { PayPalOrderButtons } from "@/components/checkout/paypal-buttons"

export function OrderPayPalSection({
  orderNumber,
  currency,
  payNowLabel,
  lang = "en",
  market = "us",
}: {
  orderNumber: string
  currency: string
  payNowLabel?: string
  lang?: string
  market?: Market
}) {
  const router = useRouter()
  const [loadingShopify, setLoadingShopify] = useState(false)

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
        if (window.self !== window.top) {
          window.open(data.forwardUrl, "_blank", "noopener,noreferrer")
        } else {
          window.location.assign(data.forwardUrl)
        }
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
            disabled={loadingShopify}
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


