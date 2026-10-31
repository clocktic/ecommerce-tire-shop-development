import Link from "next/link"
import { tireServiceDescription, tireSize, type TireProduct } from "@/lib/catalog/types"
import { storePath, type Store } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function TireVariants({ products, selected, store }: { products: TireProduct[]; selected: string; store: Store }) {
  if (products.length < 2) return null
  const label = { en: "Choose size / variant", de: "Größe / Ausführung wählen", fr: "Choisir la dimension / variante", it: "Scegli misura / variante", es: "Elegir medida / variante", nl: "Kies maat / uitvoering" }[store.lang]
  return (
    <details className="rounded border border-border bg-card shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5">
      <summary className="cursor-pointer p-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring">
        {label} · {products.length}
      </summary>
      <nav aria-label={label} className="flex max-h-64 flex-col overflow-y-auto border-t border-border">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={storePath(store, `/product/${product.slug}`)}
            prefetch={false}
            scroll={false}
            aria-current={product.slug === selected ? "page" : undefined}
            className={cn("flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 text-sm last:border-0 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring", product.slug === selected && "bg-accent font-semibold")}
          >
            <span>{tireSize(product.tire)} {tireServiceDescription(product.tire)}{product.tire.runFlat ? " · Run-flat" : ""}</span>
            <span className="font-mono text-xs text-muted-foreground">{product.mpn ? `MPN ${product.mpn}` : product.gtin ? `EAN ${product.gtin}` : product.supplierSku ?? product.id}</span>
          </Link>
        ))}
      </nav>
    </details>
  )
}
