import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

const SIZES = { xs: "size-3", sm: "size-3.5", md: "size-4", lg: "size-5", xl: "size-6" } as const

function Row({ className, size }: { className: string; size: keyof typeof SIZES }) {
  return (
    <span className={cn("flex shrink-0 gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn(SIZES[size], "shrink-0 fill-current")} strokeWidth={0} />
      ))}
    </span>
  )
}

// Gold stars clipped over muted ones, so 4.6 renders as four and a bit stars.
export function StarRating({
  rating,
  label,
  size = "sm",
  className,
}: {
  rating: number
  label?: string
  size?: keyof typeof SIZES
  className?: string
}) {
  const percent = Math.max(0, Math.min(100, (rating / 5) * 100))
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true }
  return (
    <span {...a11y} className={cn("relative inline-flex w-max shrink-0", className)}>
      <Row size={size} className="text-muted-foreground/30" />
      <span aria-hidden="true" className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${percent}%` }}>
        <Row size={size} className="text-rating" />
      </span>
    </span>
  )
}
