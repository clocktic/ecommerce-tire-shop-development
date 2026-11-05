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

  // Badges match all payment methods enabled in our live Stripe Checkout
  // (Cards, Apple Pay, Google Pay, Link, Klarna, Afterpay, Amazon Pay, Cash App Pay,
  // ACH Direct Debit, SEPA, Bancontact, MB WAY, 3D Secure 2.0).
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
      id: "apple-pay",
      name: "Apple Pay",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Apple Pay">
          <rect width="42" height="26" rx="2" fill="#0B0E14" stroke="rgba(255,255,255,0.22)" />
          <path
            d="M13.2 9.4c.4-.5.7-1.1.6-1.8-.6 0-1.3.4-1.7.9-.4.4-.7 1.1-.6 1.7.7.1 1.3-.3 1.7-.8zm.6 1c-.9-.1-1.7.5-2.2.5-.5 0-1.1-.5-1.9-.5-1 0-1.9.6-2.4 1.5-1 1.8-.3 4.4.7 5.8.5.7 1.1 1.5 1.9 1.4.7 0 1-.5 1.9-.5.9 0 1.1.5 1.9.5.8 0 1.3-.7 1.8-1.4.6-.8.8-1.6.8-1.7-.1 0-1.6-.6-1.6-2.4 0-1.5 1.2-2.2 1.3-2.3-.7-1-1.8-1.1-2.2-1.1z"
            fill="#FFFFFF"
          />
          <text
            x="26.5"
            y="16.2"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="700"
            fontSize="9"
            letterSpacing="-0.2"
          >
            Pay
          </text>
        </svg>
      ),
    },
    {
      id: "google-pay",
      name: "Google Pay",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Google Pay">
          <rect width="42" height="26" rx="2" fill="#141923" stroke="rgba(255,255,255,0.16)" />
          <path
            d="M14.7 13.2c0-.3 0-.6-.1-.9H10v1.7h2.7c-.1.6-.5 1.2-1 1.5v1.3h1.6c1-.9 1.4-2.2 1.4-3.6z"
            fill="#4285F4"
          />
          <path
            d="M10 18c1.3 0 2.4-.4 3.2-1.2l-1.6-1.3c-.4.3-1 .5-1.6.5-1.2 0-2.3-.8-2.7-2H5.7v1.3C6.5 16.9 8.1 18 10 18z"
            fill="#34A853"
          />
          <path
            d="M7.3 14c-.1-.3-.2-.6-.2-1s.1-.7.2-1v-1.3H5.7C5.3 11.4 5 12.2 5 13s.3 1.6.7 2.3L7.3 14z"
            fill="#FBBC05"
          />
          <path
            d="M10 10c.7 0 1.3.2 1.8.7l1.4-1.4C12.4 8.5 11.3 8 10 8 8.1 8 6.5 9.1 5.7 10.7L7.3 12c.4-1.2 1.5-2 2.7-2z"
            fill="#EA4335"
          />
          <text
            x="26.5"
            y="16"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="700"
            fontSize="8.8"
            letterSpacing="-0.1"
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
          <rect width="42" height="26" rx="2" fill="#FFB3C7" stroke="rgba(0,0,0,0.12)" />
          <text
            x="20"
            y="16.2"
            textAnchor="middle"
            fill="#0B051D"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="900"
            fontSize="9.2"
            letterSpacing="-0.2"
          >
            Klarna
          </text>
          <circle cx="36.2" cy="15.2" r="1.3" fill="#0B051D" />
        </svg>
      ),
    },
    {
      id: "afterpay",
      name: "Afterpay",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Afterpay">
          <rect width="42" height="26" rx="2" fill="#B2FCE4" stroke="rgba(0,0,0,0.12)" />
          <text
            x="21"
            y="15.6"
            textAnchor="middle"
            fill="#000000"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="900"
            fontSize="7.4"
            letterSpacing="-0.2"
          >
            afterpay
          </text>
        </svg>
      ),
    },
    {
      id: "amazon-pay",
      name: "Amazon Pay",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Amazon Pay">
          <rect width="42" height="26" rx="2" fill="#141923" stroke="rgba(255,255,255,0.16)" />
          <text
            x="21"
            y="13.2"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="800"
            fontSize="5.9"
            letterSpacing="-0.1"
          >
            amazon pay
          </text>
          <path
            d="M10.5 17.2c4.5 2.6 15.2 2.8 20.2.2"
            fill="none"
            stroke="#FF9900"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M29.4 16.3l2.1.7-.9 2"
            fill="none"
            stroke="#FF9900"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "cashapp",
      name: "Cash App Pay",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Cash App Pay">
          <rect width="42" height="26" rx="2" fill="#00D632" stroke="rgba(0,0,0,0.15)" />
          <text
            x="21"
            y="15.8"
            textAnchor="middle"
            fill="#06180B"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="900"
            fontSize="6.8"
            letterSpacing="-0.2"
          >
            $ Cash App
          </text>
        </svg>
      ),
    },
    {
      id: "ach",
      name: "ACH Direct Debit",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="ACH Direct Debit">
          <rect width="42" height="26" rx="2" fill="#141923" stroke="rgba(255,255,255,0.16)" />
          <path
            d="M11 10.5L6.5 13h9L11 10.5zm-3.5 3.5v3.5h1.4V14H7.5zm2.8 0v3.5h1.4V14h-1.4zm2.8 0v3.5h1.4V14h-1.4zM6.5 18.5h9v1.2h-9v-1.2z"
            fill="#38BDF8"
          />
          <text
            x="27.5"
            y="16.2"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="900"
            fontSize="8.8"
            letterSpacing="0.5"
          >
            ACH
          </text>
        </svg>
      ),
    },
    {
      id: "link",
      name: "Stripe Link",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Stripe Link">
          <rect width="42" height="26" rx="2" fill="#011E0F" stroke="rgba(0,214,111,0.4)" />
          <circle cx="11.5" cy="13" r="4.2" fill="#00D66F" />
          <path
            d="M10.3 11.2l2.4 1.8-2.4 1.8"
            fill="none"
            stroke="#011E0F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="26.5"
            y="16.2"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="800"
            fontSize="9"
            letterSpacing="-0.2"
          >
            link
          </text>
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
      id: "bancontact",
      name: "Bancontact",
      svg: (
        <svg viewBox="0 0 42 26" className={cn(dim, "shrink-0")} role="img" aria-label="Bancontact">
          <rect width="42" height="26" rx="2" fill="#141923" stroke="rgba(255,255,255,0.16)" />
          <path d="M8 10h12c-2.5 0-4.5 3-7 3H8v-3z" fill="#005498" />
          <path d="M22 13h12v3h-5c-2.5 0-4.5-3-7-3z" fill="#FFD800" />
          <text
            x="21"
            y="21"
            textAnchor="middle"
            fill="#FFFFFF"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight="700"
            fontSize="5.4"
            letterSpacing="0.2"
          >
            Bancontact
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
          className="inline-flex shadow-chip transition-transform duration-200 hover:-translate-y-0.5"
        >
          {item.svg}
        </span>
      ))}
    </div>
  )
}
