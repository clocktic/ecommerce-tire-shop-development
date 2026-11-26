"use client"

import { useState } from "react"
import { Check, CheckCircle2, Copy, Landmark, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSepaCopy, SEPA_BANK_DETAILS } from "@/lib/payments/sepa"

function CopyRow({
  label,
  displayValue,
  copyValue,
  copyLabel,
  copiedLabel,
  highlight = false,
}: {
  label: string
  displayValue: string
  copyValue?: string
  copyLabel: string
  copiedLabel: string
  highlight?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue ?? displayValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API may be unavailable in restricted contexts
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/60 py-2 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div
          className={
            highlight
              ? "break-all font-mono text-xs font-bold text-primary sm:text-sm"
              : "break-all font-mono text-xs font-semibold text-foreground sm:text-sm"
          }
        >
          {displayValue}
        </div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex shrink-0 items-center gap-1 rounded border border-border bg-background/80 px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-foreground/40 hover:bg-secondary"
        aria-label={`${copyLabel} ${label}`}
      >
        {copied ? (
          <>
            <Check className="size-3 text-emerald-500" aria-hidden="true" />
            <span>{copiedLabel}</span>
          </>
        ) : (
          <>
            <Copy className="size-3 text-muted-foreground" aria-hidden="true" />
            <span>{copyLabel}</span>
          </>
        )}
      </button>
    </div>
  )
}

export function SepaBankDetails({
  lang = "en",
  orderNumber,
  amountFormatted,
  initialReportedAt = null,
  showPaidButton = false,
}: {
  lang?: string
  orderNumber?: string
  amountFormatted?: string
  initialReportedAt?: string | null
  showPaidButton?: boolean
}) {
  const c = getSepaCopy(lang)
  const [senderNote, setSenderNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [reportedAt, setReportedAt] = useState<string | null>(initialReportedAt)
  const [error, setError] = useState<string | null>(null)

  const handleConfirmPaid = async () => {
    if (!orderNumber || submitting || reportedAt) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/payments/sepa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          senderNote: senderNote.trim() || undefined,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; reportedAt?: string }
      if (!res.ok || !data.ok) {
        setError(c.errorMessage)
        return
      }
      setReportedAt(data.reportedAt ?? new Date().toISOString())
    } catch {
      setError(c.errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-border/80 bg-background/70 px-3 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Landmark className="size-3.5 text-primary" aria-hidden="true" />
          <span>{c.detailsHeading}</span>
        </div>

        <CopyRow
          label={c.ibanLabel}
          displayValue={SEPA_BANK_DETAILS.ibanFormatted}
          copyValue={SEPA_BANK_DETAILS.iban}
          copyLabel={c.copyLabel}
          copiedLabel={c.copiedLabel}
          highlight
        />
        <CopyRow
          label={c.beneficiaryLabel}
          displayValue={SEPA_BANK_DETAILS.beneficiary}
          copyLabel={c.copyLabel}
          copiedLabel={c.copiedLabel}
        />
        <CopyRow
          label={c.bankLabel}
          displayValue={SEPA_BANK_DETAILS.bank}
          copyLabel={c.copyLabel}
          copiedLabel={c.copiedLabel}
        />
        <CopyRow
          label={c.bicLabel}
          displayValue={SEPA_BANK_DETAILS.bic}
          copyLabel={c.copyLabel}
          copiedLabel={c.copiedLabel}
        />
        {amountFormatted && (
          <CopyRow
            label={c.amountLabel}
            displayValue={amountFormatted}
            copyLabel={c.copyLabel}
            copiedLabel={c.copiedLabel}
          />
        )}
        {orderNumber && (
          <CopyRow
            label={c.referenceLabel}
            displayValue={orderNumber}
            copyLabel={c.copyLabel}
            copiedLabel={c.copiedLabel}
            highlight
          />
        )}
      </div>

      {orderNumber && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">{c.referenceHint}</p>
      )}

      {showPaidButton && orderNumber && (
        <div className="flex flex-col gap-2.5 border-t border-border/60 pt-2.5">
          {reportedAt ? (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs leading-relaxed text-foreground"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden="true" />
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-emerald-400">{c.reportedTitle}</span>
                <span className="text-muted-foreground">{c.reportedBody}</span>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs leading-snug text-muted-foreground">{c.iHavePaidHint}</p>
              <input
                type="text"
                value={senderNote}
                onChange={(e) => setSenderNote(e.target.value)}
                maxLength={120}
                placeholder={c.senderNotePlaceholder}
                className="h-9 rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <Button
                type="button"
                size="lg"
                disabled={submitting}
                onClick={handleConfirmPaid}
                className="w-full font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                    {c.iHavePaidSending}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 size-4" aria-hidden="true" />
                    {c.iHavePaidButton}
                  </>
                )}
              </Button>
              {error && (
                <p role="alert" className="text-xs text-primary">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
