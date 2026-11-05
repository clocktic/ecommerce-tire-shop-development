import Image from "next/image"
import Link from "next/link"
import { storePath, type Store } from "@/lib/i18n/config"

export function Logo({ store, label }: { store: Store; label: string }) {
  return (
    <Link
      href={storePath(store)}
      className="group flex shrink-0 items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:gap-3"
      aria-label={label}
    >
      <Image
        src="/images/tiresshop-mark.png"
        alt=""
        width={48}
        height={48}
        sizes="(min-width: 640px) 44px, (min-width: 380px) 36px, 28px"
        className="size-7 shrink-0 min-[380px]:size-9 sm:size-11"
      />
      <span className="flex min-w-0 flex-col gap-1.5 leading-none">
        <span className="whitespace-nowrap font-sans text-[clamp(0.875rem,4vw,1.5rem)] font-black uppercase italic tracking-[-0.06em]">
          Tires<span className="text-primary">Shop</span>
        </span>
        <span className="font-sans text-[7px] font-semibold uppercase tracking-[0.28em] text-muted-foreground sm:text-[8px]">
          tiresshop.net
        </span>
      </span>
    </Link>
  )
}
