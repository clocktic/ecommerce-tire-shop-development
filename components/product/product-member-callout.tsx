"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2, Tag } from "lucide-react"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useSession } from "@/lib/auth-client"
import { fmt } from "@/lib/i18n/fmt"
import { storePath } from "@/lib/i18n/config"
import { formatPrice } from "@/lib/markets"
import { computePotentialMemberDiscountCents } from "@/lib/member-discount"

export function ProductMemberCallout({ priceCents }: { priceCents: number }) {
  const { store, x, intl } = useI18n()
  const { data: session } = useSession()
  const isMember = Boolean(session?.user)
  const savingsCents = computePotentialMemberDiscountCents(priceCents)
  const memberPriceCents = Math.max(0, priceCents - savingsCents)
  const formattedMemberPrice = formatPrice(memberPriceCents, store.market, intl)
  const formattedSave = formatPrice(savingsCents, store.market, intl)

  if (isMember) {
    return (
      <div className="flex items-center justify-between gap-3 border border-primary/40 bg-primary/10 px-3.5 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="font-medium text-foreground">
            {fmt(x.memberDiscount.productActive, { price: formattedMemberPrice, save: formattedSave })}
          </span>
        </div>
        <span className="rounded-md shrink-0 bg-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          −7%
        </span>
      </div>
    )
  }

  return (
    <Link
      href={storePath(store, "/account?mode=sign-up")}
      className="group flex items-center justify-between gap-3 border border-primary/35 bg-primary/8 px-3.5 py-2.5 text-xs transition-colors hover:border-primary hover:bg-primary/15"
    >
      <div className="flex items-center gap-2">
        <Tag className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="font-medium text-foreground">
          {fmt(x.memberDiscount.productCallout, { price: formattedMemberPrice, save: formattedSave })}
        </span>
      </div>
      <span className="rounded-md inline-flex shrink-0 items-center gap-1 bg-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
        −7%
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  )
}
