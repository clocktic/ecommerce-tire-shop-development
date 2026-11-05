import { cn } from "@/lib/utils"

type IconProps = { className?: string }

function Icon3DImage({ src, className }: IconProps & { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny pre-optimized webp, next/image adds no value here
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={160}
      height={160}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn(
        "inline-block min-h-5 min-w-5 shrink-0 select-none object-contain drop-shadow-[0_2px_2px_rgb(0_0_0/0.18)]",
        className,
      )}
    />
  )
}

export function VehicleIcon({ className }: IconProps) {
  return <Icon3DImage src="/images/icons3d/car-cut.webp" className={className} />
}

export function TireSizeIcon({ className }: IconProps) {
  return <Icon3DImage src="/images/icons3d/tire-cut.webp" className={className} />
}

export function WheelRimIcon({ className }: IconProps) {
  return <Icon3DImage src="/images/icons3d/wheel-cut.webp" className={className} />
}

export function BrakeDiscIcon({ className }: IconProps) {
  return <Icon3DImage src="/images/icons3d/brake-cut.webp" className={className} />
}

export function HomeIcon3D({ className }: IconProps) {
  return <Icon3DImage src="/images/icons3d/home-cut.webp" className={className} />
}

export function BagIcon3D({ className }: IconProps) {
  return <Icon3DImage src="/images/icons3d/bag-cut.webp" className={className} />
}
