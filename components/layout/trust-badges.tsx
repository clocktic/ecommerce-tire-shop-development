import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { COMPANY } from "@/lib/company"

type TrustBadge = {
  name: string
  href: string
  logo: React.ReactNode
  verdict: string
  score: number
  barClass: string
  verdictClass: string
}

/*
 * Scores are copied from each service's public report for the domain and do
 * not update automatically — refresh them when the services re-score the shop.
 */
const BADGES: TrustBadge[] = [
  {
    name: "ScamAdviser",
    href: `https://www.scamadviser.com/check-website/${COMPANY.domain}`,
    logo: (
      <Image
        src="/images/trust/scamadviser.svg"
        alt=""
        width={112}
        height={22}
        className="h-5 w-auto"
      />
    ),
    verdict: "Very likely safe",
    score: 71,
    barClass: "bg-gradient-to-r from-lime-500 to-green-600",
    verdictClass: "text-green-700",
  },
  {
    name: "CheckShop.eu",
    href: `https://checkshop.eu/shop/${COMPANY.domain}`,
    logo: (
      <span className="flex items-center gap-1.5">
        <Image src="/images/trust/checkshop.svg" alt="" width={20} height={20} className="size-5" />
        <span className="font-sans text-[15px] font-bold leading-none tracking-tight text-neutral-900">
          CheckShop<span className="text-emerald-600">.eu</span>
        </span>
      </span>
    ),
    verdict: "Excellent",
    score: 93,
    barClass: "bg-gradient-to-r from-emerald-400 to-emerald-600",
    verdictClass: "text-emerald-700",
  },
]

export function TrustBadges({ ariaLabel }: { ariaLabel: string }) {
  return (
    <ul aria-label={ariaLabel} className="flex flex-wrap gap-3">
      {BADGES.map((badge) => (
        <li key={badge.name}>
          <a
            href={badge.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${badge.name} Trust Score ${badge.score}/100 — ${badge.verdict} (opens in a new tab)`}
            className="group flex w-60 flex-col gap-2.5 rounded-lg bg-white px-3.5 py-3 text-neutral-900 shadow-sm ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="flex h-5 items-center justify-between gap-2">
              {badge.logo}
              <ExternalLink
                aria-hidden="true"
                className="size-3.5 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-700"
              />
            </span>

            <span className="flex items-end justify-between gap-2">
              <span className="flex flex-col">
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Trust Score
                </span>
                <span className={`text-xs font-semibold ${badge.verdictClass}`}>{badge.verdict}</span>
              </span>
              <span className="flex items-baseline font-sans tabular-nums leading-none">
                <span className="text-2xl font-bold">{badge.score}</span>
                <span className="text-xs font-medium text-neutral-500">/100</span>
              </span>
            </span>

            <span aria-hidden="true" className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
              <span
                className={`absolute inset-y-0 left-0 rounded-full ${badge.barClass}`}
                style={{ width: `${badge.score}%` }}
              />
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
