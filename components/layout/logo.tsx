import Link from "next/link"
import { COMPANY } from "@/lib/company"
import type { Market } from "@/lib/markets"

export function Logo({ market }: { market: Market }) {
  return (
    <Link href={`/${market}`} className="group flex items-center gap-3" aria-label={`${COMPANY.tradingName} home`}>
      <span aria-hidden="true" className="relative flex size-8 items-center justify-center rounded-full border-[5px] border-current">
        <span className="absolute -bottom-[5px] h-[5px] w-3 bg-primary transition-[width] duration-300 group-hover:w-5" />
      </span>
      <span className="font-expanded text-base font-extrabold uppercase leading-none tracking-tight">
        Contact<span className="text-primary">/</span>Patch
      </span>
    </Link>
  )
}
