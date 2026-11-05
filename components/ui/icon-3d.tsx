import Image from "next/image"
import { cn } from "cn"

export type Icon3DName =
  | "shipping"
  | "returns"
  | "warranty"
  | "member"
  | "contact"
  | "address"
  | "payment"
  | "order"
  | "track"
  | "vehicle"
  | "tiresize"

const SIZES = {
  xs: "size-6 rounded-md",
  sm: "size-9",
  md: "size-11",
  lg: "size-14",
} as const

/**
 * Decorative 3D badge. The renders share the well colour, so the tile reads as one moulded piece
 * in both themes. Always pair with a visible text label — the image itself is alt="".
 */
export function Icon3D({
  name,
  size = "md",
  className,
}: {
  name: Icon3DName
  size?: keyof typeof SIZES
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--icon-well)] shadow-chip ring-1 ring-black/5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:-rotate-3",
        SIZES[size],
        className,
      )}
    >
      <Image src={`/images/icons3d/${name}.webp`} alt="" fill sizes="56px" className="scale-[1.18] object-cover" />
    </span>
  )
}
