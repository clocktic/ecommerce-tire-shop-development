import Link from "next/link"
import { storePath, type Store } from "@/lib/i18n/config"

export function Logo({ store, label }: { store: Store; label: string }) {
  return (
    <Link href={storePath(store)} className="group flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label={label}>
      <span
        aria-hidden="true"
        className="relative flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-secondary text-secondary-foreground shadow-sm transition-transform duration-300 group-hover:scale-[1.03] sm:size-10"
      >
        <svg viewBox="0 0 40 40" fill="none" className="size-7 sm:size-8">
          {/* Outer tire ring */}
          <circle cx="20" cy="19.5" r="14.5" stroke="currentColor" strokeWidth="3.4" className="opacity-95" />
          {/* Tire tread sipes (top & right arc notches) */}
          <path
            d="M20 3.2V6.2M26.5 4.6L25.2 7.3M31.6 8.6L29.3 10.6M34.8 14.3L31.9 15.2M13.5 4.6L14.8 7.3M8.4 8.6L10.7 10.6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-secondary"
          />
          {/* Inner alloy rim */}
          <circle cx="20" cy="19.5" r="9.8" stroke="currentColor" strokeWidth="1.25" className="opacity-45" />
          {/* Crimson performance brake caliper arc */}
          <path
            d="M12.3 14.2A9.2 9.2 0 0 0 11.8 23.8"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            className="text-primary"
          />
          {/* Forged 5-spoke star geometry */}
          <path
            d="M20 9.8V16.2M29.2 16.5L23.1 18.5M25.7 27.4L21.9 22.2M14.3 27.4L18.1 22.2M10.8 16.5L16.9 18.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="opacity-85"
          />
          {/* Center lock hub */}
          <circle cx="20" cy="19.5" r="3.1" fill="currentColor" />
          <circle cx="20" cy="19.5" r="1.4" fill="currentColor" className="text-primary" />
          {/* Road contact speed bar */}
          <path
            d="M8 36.2H32"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="text-primary transition-all duration-300"
          />
        </svg>
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate font-condensed text-base font-extrabold uppercase tracking-tight sm:font-expanded sm:text-lg">
          Tires<span className="text-primary">Shop</span>
        </span>
        <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          tiresshop.net
        </span>
      </span>
    </Link>
  )
}
