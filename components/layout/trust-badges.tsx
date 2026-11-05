import { ExternalLink, ShieldCheck } from "lucide-react"
import { COMPANY } from "@/lib/company"

type TrustBadge = {
  name: string
  href: string
  verdict: string
  /** Filled segments out of SEGMENTS. */
  level: number
  score?: string
}

const SEGMENTS = 5

const BADGES: TrustBadge[] = [
  {
    name: "ScamAdviser",
    href: `https://www.scamadviser.com/check-website/${COMPANY.domain}`,
    verdict: "Very likely safe",
    level: 5,
  },
  {
    name: "CheckShop.eu",
    href: `https://checkshop.eu/shop/${COMPANY.domain}`,
    verdict: "Excellent",
    level: 5,
    score: "93/100",
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
            aria-label={`${badge.name}: ${badge.verdict}${badge.score ? ` ${badge.score}` : ""}`}
            className="group flex w-52 flex-col gap-2 rounded-md border border-secondary-foreground/15 bg-secondary-foreground/5 px-3 py-2.5 transition-colors hover:border-secondary-foreground/35 hover:bg-secondary-foreground/10"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-secondary-foreground">
                <ShieldCheck aria-hidden="true" className="size-4 text-emerald-500" />
                {badge.name}
              </span>
              <ExternalLink
                aria-hidden="true"
                className="size-3.5 text-secondary-foreground/40 transition-colors group-hover:text-secondary-foreground/80"
              />
            </span>
            <span aria-hidden="true" className="flex gap-1">
              {Array.from({ length: SEGMENTS }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i < badge.level ? "bg-emerald-500" : "bg-secondary-foreground/15"
                  }`}
                />
              ))}
            </span>
            <span className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em]">
              <span className="text-emerald-500">{badge.verdict}</span>
              {badge.score ? <span className="text-secondary-foreground/80">{badge.score}</span> : null}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
