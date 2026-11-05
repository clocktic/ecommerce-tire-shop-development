import { Suspense } from "react"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { ScamAdviserLogo } from "@/components/layout/scamadviser-logo"
import { COMPANY } from "@/lib/company"
import { getCheckShopScore, getScamAdviserScore } from "@/lib/trust-scores"

type Score = { score: number; verdict: string } | null

function scoreTone(score: number | null) {
  if (score === null) return { text: "text-secondary-foreground/60", bar: "bg-secondary-foreground/40" }
  if (score >= 80) return { text: "text-emerald-500", bar: "bg-emerald-500" }
  if (score >= 60) return { text: "text-lime-500", bar: "bg-lime-500" }
  if (score >= 40) return { text: "text-amber-500", bar: "bg-amber-500" }
  return { text: "text-red-500", bar: "bg-red-500" }
}

function CheckShopMark() {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <Image src="/images/trust/checkshop.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
      <span className="truncate text-[13px] font-bold leading-none tracking-tight text-secondary-foreground">
        CheckShop<span className="text-emerald-500">.eu</span>
      </span>
    </span>
  )
}

function BadgeCard({
  name,
  href,
  logo,
  result,
}: {
  name: string
  href: string
  logo: React.ReactNode
  result: Score
}) {
  const score = result?.score ?? null
  const tone = scoreTone(score)
  const label = result ? `${name} Trust Score ${result.score}/100, ${result.verdict}` : `${name} trust report`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      className="group flex h-full w-full flex-col justify-between gap-2 rounded-md border border-secondary-foreground/15 bg-secondary-foreground/[0.04] px-3 py-2 transition-colors hover:border-secondary-foreground/35 hover:bg-secondary-foreground/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-48"
    >
      <span className="flex h-4 items-center justify-between gap-2">
        {logo}
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 shrink-0 text-secondary-foreground/40 transition-colors group-hover:text-secondary-foreground"
        />
      </span>
      <span className="flex items-end justify-between gap-2">
        <span
          className={`min-w-0 text-pretty font-mono text-[10px] uppercase leading-tight tracking-[0.04em] sm:tracking-[0.1em] ${tone.text}`}
        >
          {result?.verdict ?? "Trust Score"}
        </span>
        <span className="shrink-0 tabular-nums leading-none text-secondary-foreground">
          <span className="text-lg font-bold">{score ?? "—"}</span>
          <span className="text-[11px] text-secondary-foreground/60">/100</span>
        </span>
      </span>
      <span aria-hidden="true" className="relative h-1 w-full overflow-hidden rounded-full bg-secondary-foreground/15">
        {score !== null ? (
          <span className={`absolute inset-y-0 left-0 rounded-full ${tone.bar}`} style={{ width: `${score}%` }} />
        ) : null}
      </span>
    </a>
  )
}

const scamAdviser = {
  name: "ScamAdviser",
  href: `https://www.scamadviser.com/check-website/${COMPANY.domain}`,
  logo: <ScamAdviserLogo className="h-4 w-auto max-w-[calc(100%-1.25rem)] text-secondary-foreground" />,
}

const checkShop = {
  name: "CheckShop.eu",
  href: `https://checkshop.eu/shop/${COMPANY.domain}`,
  logo: <CheckShopMark />,
}

async function ScamAdviserBadge() {
  return <BadgeCard {...scamAdviser} result={await getScamAdviserScore()} />
}

async function CheckShopBadge() {
  return <BadgeCard {...checkShop} result={await getCheckShopScore()} />
}

export function TrustBadges({ ariaLabel }: { ariaLabel: string }) {
  return (
    <ul aria-label={ariaLabel} className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
      <li className="min-w-0">
        <Suspense fallback={<BadgeCard {...scamAdviser} result={null} />}>
          <ScamAdviserBadge />
        </Suspense>
      </li>
      <li className="min-w-0">
        <Suspense fallback={<BadgeCard {...checkShop} result={null} />}>
          <CheckShopBadge />
        </Suspense>
      </li>
    </ul>
  )
}
