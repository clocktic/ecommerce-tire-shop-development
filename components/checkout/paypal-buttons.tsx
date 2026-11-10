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

declare global {
  interface Window {
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
    }
  }
}

const sdkPromises = new Map<string, Promise<void>>()

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
    )}&components=buttons&enable-funding=venmo,paylater&disable-funding=card`
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
  disabled,
  getOrderNumber,
  onSuccess,
  onErrorMessage,
}: {
  currency: string
  disabled?: boolean
  getOrderNumber: () => Promise<string | null>
  onSuccess: (orderNumber: string) => void
  onErrorMessage?: (msg: string) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const [renderKey, setRenderKey] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const getOrderNumberRef = useRef(getOrderNumber)
  const onSuccessRef = useRef(onSuccess)
  const onErrorMessageRef = useRef(onErrorMessage)
  const activeOrderNumberRef = useRef<string | null>(null)

  useEffect(() => {
    getOrderNumberRef.current = getOrderNumber
    onSuccessRef.current = onSuccess
    onErrorMessageRef.current = onErrorMessage
  })

  useEffect(() => {
    let cancelled = false
    setSdkReady(false)
    loadPayPalSdk(currency)
      .then(() => {
        if (!cancelled) setSdkReady(true)
      })
      .catch(() => {
        if (!cancelled) setError("Could not load PayPal Checkout.")
      })
    return () => {
      cancelled = true
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
      void instance.render(container)
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
        <div
          ref={containerRef}
          className="min-h-[48px] w-full rounded-md bg-white p-2 shadow-sm sm:rounded-lg sm:p-2.5"
        />
      </div>
      {error && (
        <p role="alert" className="text-xs text-primary">
          {error}
        </p>
      )}
    </div>
  )
}
