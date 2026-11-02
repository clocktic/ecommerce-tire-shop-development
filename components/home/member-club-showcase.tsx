"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2, Sparkles, Tag, UserCheck } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import { useSession } from "@/lib/auth-client"
import { fmt } from "@/lib/i18n/fmt"
import { storePath } from "@/lib/i18n/config"
import { MEMBER_DISCOUNT_PERCENT } from "@/lib/member-discount"
import { cn } from "@/lib/utils"

export function MemberClubShowcase() {
  const { store, x } = useI18n()
  const { data: session } = useSession()
  const isMember = Boolean(session?.user)
  const m = x.memberDiscount

  return (
    <section aria-labelledby="member-privilege-title" className="mx-auto max-w-7xl px-4 pt-12 sm:pt-20 md:px-6">
      <div className="relative overflow-hidden border border-border bg-secondary text-secondary-foreground shadow-[0_4px_12px_rgba(0,0,0,0.25),0_20px_50px_-12px_rgba(0,0,0,0.55)]">
        {/* Caliper-red top telemetry stripe */}
        <div aria-hidden="true" className="h-1.5 w-full bg-primary" />

        {/* Subtle technical grid / diagonal accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 size-96 rounded-full bg-primary/15 blur-3xl"
        />

        <div className="relative grid gap-5 p-4 sm:gap-8 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-10 lg:p-10">
          {/* Left: High-impact -7% telemetry badge */}
          <div className="flex flex-col justify-between gap-3 border border-secondary-foreground/15 bg-background/10 p-4 backdrop-blur-sm sm:gap-4 sm:p-6 lg:col-span-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 bg-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground sm:px-2.5 sm:py-1 sm:text-[11px]">
                {isMember ? <UserCheck className="size-3.5" aria-hidden="true" /> : <Tag className="size-3.5" aria-hidden="true" />}
                {isMember ? m.activeBadge : m.badge}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-secondary-foreground/60 sm:text-xs">
                VIP · OEM
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 sm:my-2 sm:justify-start">
              <div className="flex items-baseline gap-2">
                <span className="font-expanded text-4xl font-black leading-none tracking-tight text-primary sm:text-6xl lg:text-7xl">
                  −{MEMBER_DISCOUNT_PERCENT}%
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-secondary-foreground/75">
                  / AUTO
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-secondary-foreground/70 sm:hidden">
                Instant Checkout
              </span>
            </div>

            <p className="hidden border-t border-secondary-foreground/15 pt-3 font-mono text-xs leading-relaxed text-secondary-foreground/80 sm:block">
              {m.eyebrow}
            </p>
          </div>

          {/* Right: Copy, perks & CTA */}
          <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-8">
            <div className="flex flex-col gap-2">
              <p className="label-caps text-primary">{m.eyebrow}</p>
              <h2
                id="member-privilege-title"
                className="text-balance font-expanded text-xl font-black uppercase leading-tight tracking-tight sm:text-3xl md:text-4xl"
              >
                {isMember ? m.activeHeadline : m.headline}
              </h2>
              <p className="max-w-2xl text-pretty text-xs leading-relaxed text-secondary-foreground/80 sm:text-base">
                {isMember ? fmt(m.activeLead, { email: session?.user?.email ?? "" }) : m.lead}
              </p>
            </div>

            <ul className="grid gap-2 sm:grid-cols-3 sm:gap-2.5">
              {m.perks.map((perk) => (
                <li
                  key={perk}
                  className="flex items-start gap-2 border border-secondary-foreground/15 bg-background/5 p-2.5 text-xs leading-snug text-secondary-foreground/90 sm:gap-2.5 sm:p-3"
                >
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary sm:size-4" aria-hidden="true" />
                  <span className="font-medium">{perk}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {isMember ? (
                <Link
                  href={storePath(store, "/tires")}
                  className={cn(buttonVariants({ size: "lg" }), "w-full justify-center gap-2 font-bold uppercase tracking-wide sm:w-auto")}
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  <span>{m.ctaShop}</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href={storePath(store, "/account?mode=sign-up")}
                  className={cn(buttonVariants({ size: "lg" }), "w-full justify-center gap-2 font-bold uppercase tracking-wide sm:w-auto")}
                >
                  <span>{m.ctaRegister}</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
              {!isMember && (
                <Link
                  href={storePath(store, "/tires")}
                  className="py-1 text-center font-mono text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground/80 underline underline-offset-4 transition-colors hover:text-primary sm:px-3 sm:py-2"
                >
                  {m.ctaShop}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
