"use client"

import { useCallback, useEffect, useId, useState } from "react"
import { RefreshCw } from "lucide-react"

export function CaptchaField({
  label,
  refreshLabel,
  errorText,
  resetSignal,
}: {
  label: string
  refreshLabel: string
  errorText?: string
  /** Bump this value (e.g. on a failed submit) to fetch a fresh challenge. */
  resetSignal?: number
}) {
  const id = useId()
  const [svg, setSvg] = useState("")
  const [token, setToken] = useState("")
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/captcha", { cache: "no-store" })
      const data = (await res.json()) as { token: string; svg: string }
      setSvg(data.svg)
      setToken(data.token)
      setValue("")
    } catch {
      setSvg("")
      setToken("")
    } finally {
      setLoading(false)
    }
  }, [])

  // Refetch on mount and whenever the parent signals a failed attempt.
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`${id}-answer`} className="label-caps text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div
          className="flex h-11 w-[140px] shrink-0 items-center justify-center overflow-hidden border border-border bg-muted/40 text-foreground"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label={refreshLabel}
          title={refreshLabel}
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-card hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
        <input
          id={`${id}-answer`}
          name="captchaAnswer"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
          maxLength={8}
          aria-invalid={!!errorText}
          className="h-11 min-w-0 flex-1 border border-border bg-background px-3 text-sm uppercase tracking-widest"
        />
      </div>
      <input type="hidden" name="captchaToken" value={token} />
      {errorText && (
        <p role="alert" className="text-sm text-primary">
          {errorText}
        </p>
      )}
    </div>
  )
}
