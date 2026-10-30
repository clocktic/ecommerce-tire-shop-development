import type { SVGProps } from "react"

export function VehicleIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Ground shadow line */}
      <path d="M4 35.5H60" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.5" strokeLinecap="round" />

      {/* Main sportback/coupe body silhouette */}
      <path
        d="M5.5 26.5L7.5 20.5C8.2 18.8 9.8 17.6 11.7 17.3L18.5 16.2L26.2 9.6C27.5 8.5 29.2 7.9 31 7.9H43.8C46.1 7.9 48.3 8.8 49.9 10.4L55.2 15.8L58.4 17.4C59.7 18.1 60.5 19.4 60.5 20.9V26.5C60.5 27.6 59.6 28.5 58.5 28.5H54.2C53.7 23.7 49.6 20 44.7 20C39.8 20 35.7 23.7 35.2 28.5H27.8C27.3 23.7 23.2 20 18.3 20C13.4 20 9.3 23.7 8.8 28.5H7.5C6.4 28.5 5.5 27.6 5.5 26.5Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Cabin glass greenhouse */}
      <path
        d="M20.8 16L27.2 10.6C28.1 9.8 29.3 9.4 30.5 9.4H43.2C45 9.4 46.7 10.1 48 11.4L52.2 16H20.8Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* B-pillar divider */}
      <path d="M35.5 9.5V16" stroke="currentColor" strokeWidth="1.5" />

      {/* Dynamic side character crease + red performance accent */}
      <path d="M10 21.5H33.5M49 18.5H57.5" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5.8 23.5L8.8 23.5" className="stroke-primary" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M57 20.2L60.2 20.2" className="stroke-primary" strokeWidth="2.2" strokeLinecap="round" />

      {/* Front & Rear Wheels */}
      <g>
        <circle cx="18.3" cy="28.5" r="6.8" className="fill-background" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="18.3" cy="28.5" r="4.1" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2" />
        {/* Red brake caliper */}
        <path
          d="M14.7 26.2C15.3 25.1 16.4 24.4 17.7 24.3"
          className="stroke-primary"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="18.3" cy="28.5" r="1.5" className="fill-primary" />
      </g>

      <g>
        <circle cx="44.7" cy="28.5" r="6.8" className="fill-background" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="44.7" cy="28.5" r="4.1" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2" />
        {/* Red brake caliper */}
        <path
          d="M41.1 26.2C41.7 25.1 42.8 24.4 44.1 24.3"
          className="stroke-primary"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="44.7" cy="28.5" r="1.5" className="fill-primary" />
      </g>
    </svg>
  )
}

export function TireSizeIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Outer tire carcass */}
      <circle
        cx="24"
        cy="24"
        r="19.5"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2.4"
      />

      {/* Precision tread lugs around circumference */}
      <circle
        cx="24"
        cy="24"
        r="19.5"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeDasharray="3.2 3.3"
      />

      {/* Sidewall measurement callout arc in primary red */}
      <path
        d="M10.2 14.5C13.3 10 18.3 7.1 24 7.1C29.7 7.1 34.7 10 37.8 14.5"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Alloy rim barrel */}
      <circle
        cx="24"
        cy="24"
        r="12"
        className="fill-background"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Red performance brake caliper visible behind spokes */}
      <path
        d="M15.8 19.5C16.9 16.9 19.3 15 22.2 14.6"
        className="stroke-primary"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* 5 twin-spoke forged wheel geometry */}
      <path
        d="M24 12.2V20.5M24 27.5V35.8M12.5 20.5L20.6 23M27.4 25L35.5 27.5M15.8 33.2L21.5 26.8M26.5 21.2L32.2 14.8M15.8 14.8L21.5 21.2M26.5 26.8L32.2 33.2"
        stroke="currentColor"
        strokeOpacity="0.75"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Center hub & lug ring */}
      <circle cx="24" cy="24" r="3.8" className="fill-background" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="24" cy="24" r="1.6" className="fill-primary" />
    </svg>
  )
}

export function WheelRimIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" />
      <path
        d="M12 2.8V9.2M12 14.8V21.2M3.2 9.2L9.3 11.1M14.7 12.9L20.8 14.8M5.6 19.4L10.1 14.3M13.9 9.7L18.4 4.6M5.6 4.6L10.1 9.7M13.9 14.3L18.4 19.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.2" className="fill-primary" />
    </svg>
  )
}
