import { cn } from "cn"

function WheelGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.5" />
      <path
        d="M12 6.5v3M17.2 10.3l-2.9.9M15.2 16.5l-1.8-2.4M8.8 16.5l1.8-2.4M6.8 10.3l2.9.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function PayButton({
  pending,
  disabled,
  type = "submit",
  onClick,
  children,
  className,
}: {
  pending: boolean
  disabled?: boolean
  type?: "submit" | "button"
  onClick?: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || pending}
      data-pending={pending ? "" : undefined}
      aria-busy={pending}
      className={cn(
        "pay-button btn-sheen flex h-12 w-full items-center justify-center rounded-lg bg-primary pl-12 pr-4 text-sm font-semibold text-primary-foreground shadow-chip outline-none transition-[translate,background-color] duration-200 hover:not-disabled:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50 active:not-disabled:translate-y-px",
        className,
      )}
    >
      <span className="pay-fill" aria-hidden="true" />
      <span className="pay-wheel">
        <WheelGlyph />
      </span>
      <span className="relative text-pretty text-center">{children}</span>
    </button>
  )
}
