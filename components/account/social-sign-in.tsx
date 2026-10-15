"use client"

import { useState } from "react"
import { useI18n } from "@/components/i18n/i18n-provider"
import { signIn } from "@/lib/auth-client"
import { storePath } from "@/lib/i18n/config"

type Provider = "google" | "apple" | "facebook"

const ORDER: Provider[] = ["google", "apple", "facebook"]

export function SocialSignIn({ enabled }: { enabled: Record<Provider, boolean> }) {
  const { store, x } = useI18n()
  const [busy, setBusy] = useState<Provider | null>(null)
  const [error, setError] = useState(false)
  const anyEnabled = ORDER.some((p) => enabled[p])

  async function start(provider: Provider) {
    setBusy(provider)
    setError(false)
    try {
      const res = await signIn.social({ provider, callbackURL: storePath(store, "/account") })
      if (res?.error) throw new Error(res.error.message)
    } catch (e) {
      console.error("[auth] social sign-in failed", e)
      setError(true)
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {ORDER.map((provider) => (
        <button
          key={provider}
          type="button"
          disabled={!enabled[provider] || busy !== null}
          onClick={() => start(provider)}
          className="flex h-12 items-center justify-between gap-3 border border-border bg-card px-4 text-sm font-semibold transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border"
        >
          <span className="flex items-center gap-3">
            <ProviderMark provider={provider} />
            {x.account[provider]}
          </span>
          {!enabled[provider] && <span className="label-caps text-[10px] text-muted-foreground">{x.account.unavailable}</span>}
        </button>
      ))}
      {!anyEnabled && <p className="text-sm leading-relaxed text-muted-foreground">{x.account.noneConfigured}</p>}
      {error && (
        <p role="alert" className="text-sm text-primary">
          {x.account.error}
        </p>
      )}
    </div>
  )
}

// Official marks from each provider's brand guidelines, single-colour where allowed.
function ProviderMark({ provider }: { provider: Provider }) {
  if (provider === "google") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
      </svg>
    )
  }
  if (provider === "apple") {
    return (
      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
        <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9a4.8 4.8 0 0 0-3.8-2c-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9a5 5 0 0 0-4.2 2.6c-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.6s1.7-.8 3.3-.8 2 .8 3.3.8c1.4 0 2.3-1.3 3.1-2.5a11 11 0 0 0 1.4-2.9 4.5 4.5 0 0 1-2.4-4.1zM13.9 5c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
    </svg>
  )
}
