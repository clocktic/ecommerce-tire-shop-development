"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PayButton } from "@/components/checkout/pay-button"
import { PayPalOrderButtons } from "@/components/checkout/paypal-buttons"

export function OrderPayPalSection({
  orderNumber,
  currency,
  payNowLabel,
}: {
  orderNumber: string
  currency: string
  payNowLabel?: string
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
    <div className="flex w-full max-w-sm flex-col gap-3">
      {payNowLabel && (
        <PayButton
          type="button"
          pending={loadingShopify}
          onClick={handleShopifyPay}
        >
          {payNowLabel}
        </PayButton>
      )}
      <PayPalOrderButtons
        currency={currency}
        disabled={loadingShopify}
        getOrderNumber={async () => orderNumber}
        onSuccess={() => {
          router.refresh()
        }}
      />
    </div>
  )
}

