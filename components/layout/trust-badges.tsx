import { Suspense } from "react"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { ScamAdviserLogo } from "@/components/layout/scamadviser-logo"
import { COMPANY } from "@/lib/company"
import { getCheckShopScore } from "@/lib/trust-scores"

const cardClass =
  "group flex h-full w-48 flex-col justify-between gap-2 rounded-md border border-secondary-foreground/15 bg-secondary-foreground/[0.04] px-3 py-2 transition-colors hover:border-secondary-foreground/35 hover:bg-secondary-foreground/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"

function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-4 items-center justify-between gap-2">
      {children}
      <ArrowUpRight
        aria-hidden="true"
        className="size-3.5 shrink-0 text-secondary-foreground/40 transition-colors group-hover:text-secondary-foreground"
      />
    </span>
  )
}

function CheckShopMark() {
  return (
    <span className="flex items-center gap-1">
      <Image src="/images/trust/checkshop.svg" alt="" width={16} height={16} className="size-4" />
      <span className="text-[13px] font-bold leading-none tracking-tight text-secondary-foreground">
        CheckShop<span className="text-emerald-500">.eu</span>
      </span>
    </span>
  )
}

function ScoreBar({ score }: { score: number | null }) {
  return (
    <span aria-hidden="true" className="relative h-1 w-full overflow-hidden rounded-full bg-secondary-foreground/15">
      {score !== null ? (
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
          style={{ width: `${score}%` }}
        />
      ) : null}
    </span>
  )
}

async function CheckShopBadge() {
  const result = await getCheckShopScore()
  return <CheckShopCard score={result?.score ?? null} verdict={result?.verdict ?? null} />
}

function CheckShopCard({ score, verdict }: { score: number | null; verdict: string | null }) {
  const label =
    score !== null ? `CheckShop.eu Trust Score ${score}/100, ${verdict}` : "CheckShop.eu trust report"
  return (
    <a
      href={`https://checkshop.eu/shop/${COMPANY.domain}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      className={cardClass}
    >
      <CardHeader>
        <CheckShopMark />
      </CardHeader>
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-500">
          {verdict ?? "Trust Score"}
        </span>
        <span className="tabular-nums leading-none text-secondary-foreground">
          <span className="text-lg font-bold">{score ?? "—"}</span>
          <span className="text-[11px] text-secondary-foreground/60">/100</span>
        </span>
      </span>
      <ScoreBar score={score} />
    </a>
  )
}

/*
 * ScamAdviser forbids sites from displaying its score or seal (it flags such
 * badges as fake) and offers no public score API, so this card only links to
 * the live report.
 */
function ScamAdviserCard() {
  return (
    <a
      href={`https://www.scamadviser.com/check-website/${COMPANY.domain}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Check our live rating on ScamAdviser (opens in a new tab)"
      className={cardClass}
    >
      <CardHeader>
        <ScamAdviserLogo className="h-4 w-auto text-secondary-foreground" />
      </CardHeader>
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-secondary-foreground/70 transition-colors group-hover:text-secondary-foreground">
        Check our live rating
      </span>
    </a>
  )
}

export function TrustBadges({ ariaLabel }: { ariaLabel: string }) {
  return (
    <ul aria-label={ariaLabel} className="flex flex-wrap items-stretch gap-2">
      <li>
        <ScamAdviserCard />
      </li>
      <li>
        <Suspense fallback={<CheckShopCard score={null} verdict={null} />}>
          <CheckShopBadge />
        </Suspense>
      </li>
    </ul>
  )
}
