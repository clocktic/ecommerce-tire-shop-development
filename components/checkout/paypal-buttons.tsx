"use client"

import { useEffect, useRef, useState } from "react"
import { PAYPAL_CLIENT_ID } from "@/lib/payments/paypal-config"

type PayPalActions = {
  restart: () => Promise<void>
}

type PayPalButtonsInstance = {
  render: (container: HTMLElement) => Promise<void>
  close?: () => Promise<void>
  isEligible?: () => boolean
}

type PayPalApplePayConfig = {
  isEligible: boolean
  countryCode?: string
  merchantCapabilities: string[]
  supportedNetworks: string[]
}

type PayPalApplePayApi = {
  config: () => Promise<PayPalApplePayConfig>
  validateMerchant: (params: {
    validationUrl: string
    displayName?: string
  }) => Promise<{ merchantSession: unknown }>
  confirmOrder: (params: {
    orderId: string
    token: unknown
    billingContact?: unknown
  }) => Promise<{ approveApplePayPayment?: { status?: string } }>
}

type ApplePaySessionInstance = {
  onvalidatemerchant: ((event: { validationURL: string }) => void) | null
  onpaymentauthorized:
    | ((event: { payment: { token: unknown; billingContact?: unknown } }) => void)
    | null
  oncancel: (() => void) | null
  completeMerchantValidation: (merchantSession: unknown) => void
  completePayment: (status: number) => void
  abort: () => void
  begin: () => void
}

type ApplePaySessionCtor = {
  new (version: number, paymentRequest: Record<string, unknown>): ApplePaySessionInstance
  supportsVersion: (version: number) => boolean
  canMakePayments: () => boolean
  STATUS_SUCCESS: number
  STATUS_FAILURE: number
}

declare global {
  interface Window {
    ApplePaySession?: ApplePaySessionCtor
    paypal?: {
      Buttons: (options: {
        style?: {
          layout?: "vertical" | "horizontal"
          color?: "gold" | "blue" | "silver" | "white" | "black"
          shape?: "rect" | "pill"
          label?: "paypal" | "checkout" | "buynow" | "pay"
          tagline?: boolean
        }
        appSwitchWhenAvailable?: boolean
        createOrder: () => Promise<string>
        onApprove: (
          data: { orderID: string },
          actions: PayPalActions,
        ) => Promise<void>
        onError?: (err: unknown) => void
      }) => PayPalButtonsInstance
      Applepay?: () => PayPalApplePayApi
    }
  }
}

const sdkPromises = new Map<string, Promise<void>>()
let applePaySdkPromise: Promise<void> | null = null

function loadApplePaySdk(): Promise<void> {
  if (applePaySdkPromise) return applePaySdkPromise
  applePaySdkPromise = new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      resolve()
      return
    }
    const id = "apple-pay-js-sdk"
    if (document.getElementById(id)) {
      resolve()
      return
    }
    const script = document.createElement("script")
    script.id = id
    script.src = "https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => resolve()
    document.head.appendChild(script)
  })
  return applePaySdkPromise
}

function loadPayPalSdk(currency: string): Promise<void> {
  const cur = currency.toUpperCase()
  const existing = sdkPromises.get(cur)
  if (existing) return existing

  const promise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve()
      return
    }
    const scriptId = `paypal-js-sdk-${cur}`
    const currentScript = document.getElementById(scriptId) as HTMLScriptElement | null
    if (currentScript && window.paypal?.Buttons) {
      resolve()
      return
    }
    // Remove any SDK script loaded for a different currency before injecting the new one
    document
      .querySelectorAll('script[data-paypal-sdk="true"]')
      .forEach((node) => {
        if (node.id !== scriptId) node.remove()
      })

    const script = document.createElement("script")
    script.id = scriptId
    script.setAttribute("data-paypal-sdk", "true")
    script.setAttribute("data-sdk-integration-source", "developer-studio")
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      PAYPAL_CLIENT_ID,
    )}&currency=${encodeURIComponent(
      cur,
    )}&components=buttons,applepay&enable-funding=card,venmo,paylater`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      sdkPromises.delete(cur)
      reject(new Error("Failed to load PayPal SDK"))
    }
    document.head.appendChild(script)
  })

  sdkPromises.set(cur, promise)
  return promise
}

export function PayPalOrderButtons({
  currency,
  totalCents,
  disabled,
  getOrderNumber,
  validateBeforeApplePay,
  onSuccess,
  onErrorMessage,
  onFallbackToCard,
}: {
  currency: string
  totalCents?: number
  disabled?: boolean
  getOrderNumber: () => Promise<string | null>
  validateBeforeApplePay?: () => boolean
  onSuccess: (orderNumber: string) => void
  onErrorMessage?: (msg: string) => void
  onFallbackToCard?: () => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [renderKey, setRenderKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [applePayConfig, setApplePayConfig] = useState<PayPalApplePayConfig | null>(null)
  const [applePayBusy, setApplePayBusy] = useState(false)

  const getOrderNumberRef = useRef(getOrderNumber)
  const validateBeforeApplePayRef = useRef(validateBeforeApplePay)
  const onSuccessRef = useRef(onSuccess)
  const onErrorMessageRef = useRef(onErrorMessage)
  const activeOrderNumberRef = useRef<string | null>(null)

  useEffect(() => {
    getOrderNumberRef.current = getOrderNumber
    validateBeforeApplePayRef.current = validateBeforeApplePay
    onSuccessRef.current = onSuccess
    onErrorMessageRef.current = onErrorMessage
  })

  useEffect(() => {
    let cancelled = false
    setSdkReady(false)
    setTimedOut(false)
    const timer = window.setTimeout(() => {
      if (!cancelled) setTimedOut(true)
    }, 8000)
    loadPayPalSdk(currency)
      .then(() => {
        if (!cancelled) {
          window.clearTimeout(timer)
          setSdkReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          window.clearTimeout(timer)
          setError("Could not load PayPal Checkout.")
        }
      })
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [currency])

  useEffect(() => {
    const container = containerRef.current
    if (!sdkReady || !container || !window.paypal?.Buttons) return

    container.innerHTML = ""
    let instance: PayPalButtonsInstance | null = null

    try {
      instance = window.paypal.Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
          tagline: false,
        },
        appSwitchWhenAvailable: true,
        createOrder: async () => {
          setError(null)
          const orderNumber = await getOrderNumberRef.current()
          if (!orderNumber) {
            throw new Error("Order validation failed")
          }
          activeOrderNumberRef.current = orderNumber

          const res = await fetch("/api/payments/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderNumber }),
          })
          const data = (await res.json()) as {
            ok?: boolean
            id?: string
            error?: string
          }
          if (!res.ok || !data.ok || !data.id) {
            throw new Error(data.error || "Could not start PayPal checkout")
          }
          return data.id
        },
        onApprove: async (data, actions) => {
          setError(null)
          const res = await fetch("/api/payments/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paypalOrderId: data.orderID,
              orderNumber: activeOrderNumberRef.current ?? undefined,
            }),
          })
          const result = (await res.json()) as {
            ok?: boolean
            restart?: boolean
            orderNumber?: string
            error?: string
          }
          if (result.restart) {
            await actions.restart()
            return
          }
          if (!res.ok || !result.ok || !result.orderNumber) {
            const msg = result.error || "Payment could not be captured."
            setError(msg)
            onErrorMessageRef.current?.(msg)
            return
          }
          onSuccessRef.current(result.orderNumber)
        },
        onError: () => {
          const msg = "Please fill in all required shipping fields and accept the terms."
          setError(msg)
          onErrorMessageRef.current?.(msg)
        },
      })

      if (instance.isEligible && !instance.isEligible()) return
      void instance.render(container).catch(() => {})
    } catch {
      // Ignore transient unmount render errors
    }

    return () => {
      if (instance?.close) {
        void instance.close().catch(() => {})
      }
    }
  }, [sdkReady, currency, renderKey])

  useEffect(() => {
    let cancelled = false
    setApplePayConfig(null)
    if (!sdkReady || !totalCents || totalCents <= 0) return
    if (typeof window === "undefined") return
    const ApplePaySession = window.ApplePaySession
    if (
      !ApplePaySession ||
      !ApplePaySession.supportsVersion(4) ||
      !ApplePaySession.canMakePayments() ||
      !window.paypal?.Applepay
    ) {
      return
    }

    void (async () => {
      try {
        await loadApplePaySdk()
        const applepay = window.paypal?.Applepay?.()
        if (!applepay) return
        const config = await applepay.config()
        if (!cancelled && config?.isEligible) {
          setApplePayConfig(config)
        }
      } catch {
        // Apple Pay not eligible on this browser/device
      }
    })()

    return () => {
      cancelled = true
    }
  }, [sdkReady, currency, totalCents])

  const handleApplePayClick = () => {
    if (disabled || applePayBusy || !applePayConfig || !totalCents || totalCents <= 0) {
      return
    }
    const ApplePaySession = window.ApplePaySession
    const applepay = window.paypal?.Applepay?.()
    if (!ApplePaySession || !applepay) return

    if (validateBeforeApplePayRef.current && !validateBeforeApplePayRef.current()) {
      return
    }

    setError(null)
    setApplePayBusy(true)

    const paymentRequest = {
      countryCode: applePayConfig.countryCode || (currency.toUpperCase() === "EUR" ? "DE" : "US"),
      currencyCode: currency.toUpperCase(),
      merchantCapabilities: applePayConfig.merchantCapabilities,
      supportedNetworks: applePayConfig.supportedNetworks,
      requiredBillingContactFields: ["name", "postalAddress"],
      total: {
        label: "TiresShop",
        type: "final",
        amount: (totalCents / 100).toFixed(2),
      },
    }

    let session: ApplePaySessionInstance
    try {
      session = new ApplePaySession(4, paymentRequest)
    } catch {
      setApplePayBusy(false)
      setError("Could not start Apple Pay on this device.")
      return
    }

    session.onvalidatemerchant = (event) => {
      applepay
        .validateMerchant({
          validationUrl: event.validationURL,
          displayName: "TiresShop",
        })
        .then((res) => {
          session.completeMerchantValidation(res.merchantSession)
        })
        .catch(() => {
          session.abort()
          setApplePayBusy(false)
          const msg = "Apple Pay merchant validation failed. Please try PayPal or Card."
          setError(msg)
          onErrorMessageRef.current?.(msg)
        })
    }

    session.onpaymentauthorized = (event) => {
      void (async () => {
        try {
          const orderNumber = await getOrderNumberRef.current()
          if (!orderNumber) {
            session.completePayment(ApplePaySession.STATUS_FAILURE)
            setApplePayBusy(false)
            const msg = "Please fill in all required shipping fields and accept the terms."
            setError(msg)
            onErrorMessageRef.current?.(msg)
            return
          }
          activeOrderNumberRef.current = orderNumber

          const createRes = await fetch("/api/payments/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderNumber }),
          })
          const createData = (await createRes.json()) as {
            ok?: boolean
            id?: string
            error?: string
          }
          if (!createRes.ok || !createData.ok || !createData.id) {
            throw new Error(createData.error || "Could not start Apple Pay order")
          }

          await applepay.confirmOrder({
            orderId: createData.id,
            token: event.payment.token,
            billingContact: event.payment.billingContact,
          })

          const captureRes = await fetch("/api/payments/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paypalOrderId: createData.id,
              orderNumber,
            }),
          })
          const captureData = (await captureRes.json()) as {
            ok?: boolean
            orderNumber?: string
            error?: string
          }
          if (!captureRes.ok || !captureData.ok || !captureData.orderNumber) {
            throw new Error(captureData.error || "Apple Pay payment could not be captured.")
          }

          session.completePayment(ApplePaySession.STATUS_SUCCESS)
          setApplePayBusy(false)
          onSuccessRef.current(captureData.orderNumber)
        } catch (err) {
          session.completePayment(ApplePaySession.STATUS_FAILURE)
          setApplePayBusy(false)
          const msg =
            err instanceof Error && err.message
              ? err.message
              : "Apple Pay payment did not complete. Please try again."
          setError(msg)
          onErrorMessageRef.current?.(msg)
        }
      })()
    }

    session.oncancel = () => {
      setApplePayBusy(false)
    }

    session.begin()
  }

  useEffect(() => {
    if (typeof document === "undefined") return

    const closeQrModal = (qrModal: HTMLElement) => {
      const overlay = qrModal.parentElement
      if (overlay && overlay !== document.body) {
        overlay.remove()
      } else {
        qrModal.remove()
      }
      setRenderKey((k) => k + 1)
    }

    const enhanceQrModal = () => {
      const qrModal = document.getElementById("qrModal")
      if (!qrModal) return
      qrModal.style.colorScheme = "light"
      const overlay = qrModal.parentElement
      if (overlay && overlay !== document.body && !overlay.dataset.venmoBackdropBound) {
        overlay.dataset.venmoBackdropBound = "true"
        overlay.style.colorScheme = "light"
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            closeQrModal(qrModal)
          }
        })
      }

      if (!qrModal.querySelector('[data-venmo-qr-close="true"]')) {
        const closeBtn = document.createElement("button")
        closeBtn.type = "button"
        closeBtn.setAttribute("data-venmo-qr-close", "true")
        closeBtn.setAttribute("aria-label", "Close Venmo QR code window")
        closeBtn.innerHTML =
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
        Object.assign(closeBtn.style, {
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: "2147483647",
          width: "36px",
          height: "36px",
          borderRadius: "9999px",
          backgroundColor: "rgba(24, 26, 32, 0.9)",
          color: "#ffffff",
          border: "1px solid rgba(255, 255, 255, 0.28)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
        })
        closeBtn.addEventListener("click", (e) => {
          e.preventDefault()
          e.stopPropagation()
          closeQrModal(qrModal)
        })
        qrModal.appendChild(closeBtn)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const qrModal = document.getElementById("qrModal")
        if (qrModal) closeQrModal(qrModal)
      }
    }

    enhanceQrModal()
    const observer = new MutationObserver(() => enhanceQrModal())
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener("keydown", onKeyDown)

    return () => {
      observer.disconnect()
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  return (
    <div className="relative isolate z-10 flex flex-col gap-2">
      <div
        className={
          disabled
            ? "pointer-events-none opacity-50 transition-opacity"
            : "transition-opacity"
        }
        aria-disabled={disabled}
      >
        {!sdkReady && !error && !timedOut && (
          <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3">
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded bg-muted/70" />
            <p className="text-center text-[11px] text-muted-foreground">
              Loading PayPal, Venmo &amp; Card checkout…
            </p>
          </div>
        )}
        {sdkReady && applePayConfig && (
          <div className="mb-2 w-full rounded-md bg-white p-2 shadow-sm sm:rounded-lg sm:p-2.5">
            <button
              type="button"
              onClick={handleApplePayClick}
              disabled={disabled || applePayBusy}
              aria-label="Pay with Apple Pay"
              className="flex h-[45px] w-full items-center justify-center gap-1.5 rounded-[4px] bg-black text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 18 22"
                className="h-[17px] w-[14px] -translate-y-[1px] fill-current"
              >
                <path d="M14.94 11.66c-.02-2.25 1.84-3.34 1.92-3.39-1.05-1.53-2.68-1.74-3.25-1.76-1.38-.14-2.71.82-3.41.82-.71 0-1.79-.8-2.95-.78-1.51.02-2.91.88-3.69 2.24-1.58 2.74-.4 6.79 1.13 9.01.75 1.09 1.64 2.31 2.82 2.26 1.13-.05 1.56-.73 2.93-.73 1.37 0 1.76.73 2.95.71 1.22-.02 1.99-1.1 2.73-2.19.86-1.26 1.22-2.48 1.24-2.54-.03-.01-2.39-.92-2.42-3.45zM12.69 4.95c.62-.76 1.04-1.81.93-2.86-.9.04-1.99.6-2.63 1.35-.57.66-1.08 1.73-.94 2.76 1 .08 2.02-.5 2.64-1.25z" />
              </svg>
              <span>{applePayBusy ? "Processing Apple Pay…" : "Pay"}</span>
            </button>
          </div>
        )}
        <div
          ref={containerRef}
          className={
            sdkReady
              ? "min-h-[48px] w-full rounded-md bg-white p-2 shadow-sm sm:rounded-lg sm:p-2.5"
              : "hidden"
          }
        />
      </div>
      {(error || (timedOut && !sdkReady)) && (
        <div role="alert" className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="text-primary">
            {error || "PayPal checkout is taking longer than expected or is blocked by your browser."}
          </p>
          {onFallbackToCard && (
            <button
              type="button"
              onClick={onFallbackToCard}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Pay with Credit / Debit Card or Express Wallet
            </button>
          )}
        </div>
      )}
    </div>
  )
}
