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
          <path
            d="M21 8.1a6.2 6.2 0 0 0 0 9.8 6.2 6.2 0 0 0 0-9.8z"
            fill="#FF5F00"
          />
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
      id: "paypal",
      name: "PayPal",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="PayPal">
          <rect width="42" height="26" rx="2" fill="#141923" stroke="rgba(255,255,255,0.16)" />
          <path
            d="M22.8 6.5h-4.7c-.4 0-.7.3-.8.7l-1.9 11.6c-.1.3.2.5.4.5h2.2c.4 0 .7-.3.8-.7l.5-3.2h2.1c2.7 0 4.3-1.3 4.7-3.9.4-2.3-.9-5-3.3-5z"
            fill="#253B80"
          />
          <path
            d="M25.2 9.6c-.4 2.6-2 3.9-4.7 3.9h-1.4l-.8 5.2c-.1.3.1.5.4.5h1.9c.3 0 .6-.2.7-.6l.4-2.5h1.8c2.3 0 3.7-1.1 4.1-3.4.3-1.6-.2-2.7-2.4-3.1z"
            fill="#179BD7"
          />
          <path
            d="M22.8 6.5h-4.7c-.4 0-.7.3-.8.7l-1.9 11.6c-.1.3.2.5.4.5h2.2c.4 0 .7-.3.8-.7l.5-3.2h2.1c2.7 0 4.3-1.3 4.7-3.9.2-1.3 0-2.4-.7-3.3-.6-.9-1.5-1.7-2.6-1.7z"
            fill="#2997D8"
            fillOpacity="0.85"
          />
        </svg>
      ),
    },
    {
      id: "apple-pay",
      name: "Apple Pay",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Apple Pay">
          <rect width="42" height="26" rx="2" fill="#141923" stroke="rgba(255,255,255,0.16)" />
          <path
            d="M12.9 10.1c.4-.5.7-1.1.6-1.8-.6 0-1.3.4-1.7.9-.4.4-.7 1.1-.6 1.7.7.1 1.3-.3 1.7-.8zm.6.9c-.9-.1-1.7.5-2.2.5-.5 0-1.1-.5-1.9-.5-1 0-1.9.6-2.4 1.5-1 1.8-.3 4.4.7 5.9.5.7 1.1 1.5 1.9 1.5.7 0 1-.5 1.9-.5.9 0 1.1.5 1.9.5.8 0 1.3-.7 1.8-1.4.6-.8.8-1.6.8-1.7-.1 0-1.6-.6-1.6-2.4 0-1.5 1.2-2.2 1.3-2.3-.7-1-1.8-1.1-2.2-1.1z"
            fill="#FFFFFF"
          />
          <text
            x="26.5"
            y="16.2"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="700"
            fontSize="8.5"
          >
            Pay
          </text>
        </svg>
      ),
    },
    {
      id: "klarna",
      name: "Klarna",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Klarna">
          <rect width="42" height="26" rx="2" fill="#FFA8CD" stroke="rgba(255,255,255,0.2)" />
          <path
            d="M14.5 7.5h2.5v11h-2.5v-11zm6.8 0h2.7c0 2.5-1.1 4.8-3 6.2l3.4 4.8h-3l-2.9-4.2v-.2c1.8-1.2 2.8-3.2 2.8-6.6z"
            fill="#0B051D"
          />
          <circle cx="26.8" cy="17.1" r="1.5" fill="#0B051D" />
        </svg>
      ),
    },
    {
      id: "stripe",
      name: "Stripe",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Stripe">
          <rect width="42" height="26" rx="2" fill="#635BFF" stroke="rgba(255,255,255,0.2)" />
          <text
            x="21"
            y="16"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="800"
            fontSize="9.2"
            letterSpacing="-0.2"
          >
            stripe
          </text>
        </svg>
      ),
    },
    ...(includeCarriers
      ? [
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
