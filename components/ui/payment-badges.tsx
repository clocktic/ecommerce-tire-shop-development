import { cn } from "@/lib/utils"

type BadgeSize = "sm" | "md"

export function PaymentBadges({
  size = "md",
  includeCarriers = false,
  limit,
  className,
  ariaLabel,
}: {
  size?: BadgeSize
  includeCarriers?: boolean
  limit?: number
  className?: string
  ariaLabel?: string
}) {
  const dim = size === "sm" ? "h-[22px] w-[36px]" : "h-[26px] w-[42px]"

  // Keep badges strictly aligned with accepted payment methods in lib/policies.ts
  // and checkout (Visa, Mastercard, American Express, Discover, SEPA, 3D Secure 2.0)
  // so Google Merchant Center never flags unsupported payment logos.
  const items = [
    {
      id: "visa",
      name: "Visa",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Visa">
          <rect width="42" height="26" rx="2" fill="#141923" stroke="rgba(255,255,255,0.16)" />
          <path
            d="M17.3 17.5h-2.2l1.4-8.8h2.2l-1.4 8.8zm8.1-8.6c-.4-.2-1.1-.4-2-.4-2.2 0-3.7 1.1-3.7 2.8 0 1.2 1.1 1.9 2 2.3.9.4 1.2.7 1.2 1.1 0 .6-.7.9-1.4.9-.9 0-1.4-.1-2.2-.5l-.3-.1-.3 1.9c.5.2 1.5.5 2.6.5 2.3 0 3.8-1.1 3.9-2.9 0-1-.6-1.7-1.9-2.3-.8-.4-1.3-.6-1.3-1.1 0-.4.4-.8 1.3-.8.7 0 1.3.2 1.7.3l.2.1.2-1.8zm5.7-.2h-1.7c-.5 0-.9.1-1.2.7l-3.2 8.1h2.3l.5-1.3h2.8l.3 1.3h2l-1.8-8.8zm-2.7 5.7.9-2.5.3-.9.2.9.5 2.5h-1.9zM13.5 8.7l-2.1 6-.2-1.1-.8-3.9c-.1-.6-.5-.9-1.1-1H5.8l-.1.3c.8.2 1.6.5 2.2.9l1.9 7.6h2.3l3.6-8.8h-2.2z"
            fill="#FFFFFF"
          />
        </svg>
      ),
    },
    {
      id: "mastercard",
      name: "Mastercard",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Mastercard">
          <rect width="42" height="26" rx="2" fill="#141923" stroke="rgba(255,255,255,0.16)" />
          <circle cx="17.2" cy="13" r="6.2" fill="#EB001B" />
          <circle cx="24.8" cy="13" r="6.2" fill="#F79E1B" />
          <path d="M21 8.1a6.2 6.2 0 0 0 0 9.8 6.2 6.2 0 0 0 0-9.8z" fill="#FF5F00" />
        </svg>
      ),
    },
    {
      id: "amex",
      name: "American Express",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="American Express">
          <rect width="42" height="26" rx="2" fill="#016FD0" stroke="rgba(255,255,255,0.2)" />
          <text
            x="21"
            y="15.5"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="900"
            fontSize="8.5"
            letterSpacing="0.6"
          >
            AMEX
          </text>
        </svg>
      ),
    },
    {
      id: "discover",
      name: "Discover",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Discover">
          <rect width="42" height="26" rx="2" fill="#141923" stroke="rgba(255,255,255,0.16)" />
          <text
            x="21"
            y="15"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="800"
            fontSize="6.5"
            letterSpacing="0.5"
          >
            DISCOVER
          </text>
          <circle cx="26.2" cy="19.5" r="2.2" fill="#FF6000" />
        </svg>
      ),
    },
    {
      id: "sepa",
      name: "SEPA",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="SEPA">
          <rect width="42" height="26" rx="2" fill="#003399" stroke="rgba(255,255,255,0.2)" />
          <text
            x="21"
            y="15.8"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="900"
            fontSize="8.5"
            letterSpacing="0.8"
          >
            SEPA
          </text>
        </svg>
      ),
    },
    {
      id: "3ds2",
      name: "3D Secure 2.0",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="3D Secure 2.0">
          <rect width="42" height="26" rx="2" fill="#141923" stroke="rgba(255,255,255,0.16)" />
          <text
            x="21"
            y="15.8"
            textAnchor="middle"
            fill="#10B981"
            fontFamily="ui-monospace, monospace"
            fontWeight="800"
            fontSize="8"
            letterSpacing="0.4"
          >
            3DS 2.0
          </text>
        </svg>
      ),
    },
    ...(includeCarriers
      ? [
          {
            id: "ups",
            name: "UPS",
            svg: (
              <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="UPS">
                <rect width="42" height="26" rx="2" fill="#351C15" stroke="rgba(255,181,0,0.35)" />
                <text
                  x="21"
                  y="16.2"
                  textAnchor="middle"
                  fill="#FFB500"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="10"
                  letterSpacing="0.5"
                >
                  UPS
                </text>
              </svg>
            ),
          },
          {
            id: "dhl",
            name: "DHL",
            svg: (
              <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="DHL">
                <rect width="42" height="26" rx="2" fill="#FFCC00" stroke="rgba(0,0,0,0.15)" />
                <text
                  x="21"
                  y="16.2"
                  textAnchor="middle"
                  fill="#D40511"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontStyle="italic"
                  fontWeight="900"
                  fontSize="10.5"
                  letterSpacing="0.4"
                >
                  DHL
                </text>
              </svg>
            ),
          },
          {
            id: "fedex",
            name: "FedEx",
            svg: (
              <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="FedEx">
                <rect width="42" height="26" rx="2" fill="#141923" stroke="rgba(255,255,255,0.16)" />
                <text
                  x="15.5"
                  y="16"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="9"
                  letterSpacing="-0.3"
                >
                  Fed
                </text>
                <text
                  x="28.5"
                  y="16"
                  textAnchor="middle"
                  fill="#FF6200"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="9"
                  letterSpacing="-0.3"
                >
                  Ex
                </text>
              </svg>
            ),
          },
        ]
      : []),
  ]

  const visible = typeof limit === "number" ? items.slice(0, limit) : items

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} aria-label={ariaLabel}>
      {visible.map((item) => (
        <span
          key={item.id}
          title={item.name}
          className="inline-flex shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          {item.svg}
        </span>
      ))}
    </div>
  )
}
