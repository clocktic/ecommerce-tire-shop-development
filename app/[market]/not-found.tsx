import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-24 md:px-6">
      <p className="label-caps text-primary">404</p>
      <h1 className="font-expanded text-3xl font-extrabold uppercase">Page not found</h1>
      <p className="leading-relaxed text-muted-foreground">The page you are looking for has moved or never existed.</p>
      <Link href="/" className="underline underline-offset-4">
        Back to the store
      </Link>
    </div>
  )
}
