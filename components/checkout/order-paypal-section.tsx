"use client"

import { useRouter } from "next/navigation"
import { PayPalOrderButtons } from "@/components/checkout/paypal-buttons"

export function OrderPayPalSection({
  orderNumber,
  currency,
}: {
  orderNumber: string
  currency: string
}) {
  const router = useRouter()

  return (
    <div className="w-full max-w-sm">
      <PayPalOrderButtons
        currency={currency}
        getOrderNumber={async () => orderNumber}
        onSuccess={() => {
          router.refresh()
        }}
      />
    </div>
  )
}
