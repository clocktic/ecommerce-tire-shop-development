import { randomBytes } from "crypto"
import { notFound } from "next/navigation"
import { isAdmin } from "@/lib/admin-auth"
import { isCategory, type Product } from "@/lib/catalog"
import { ProductForm } from "@/components/admin/product-form"

const TITLE = { tires: "Новая шина", wheels: "Новый диск", brakes: "Новые тормоза" } as const

// Empty but complete category blocks, so the JSON editor shows every field the storefront reads.
function template(category: Product["category"]): Product {
  const base = {
    id: `${category}-${randomBytes(4).toString("hex")}`,
    slug: "",
    name: "",
    brand: "",
    images: [],
    shortDescription: "",
    description: "",
    highlights: [],
    specs: [],
    offers: {},
  }
  if (category === "tires") {
    return {
      ...base,
      category,
      tire: { width: 225, aspect: 45, rim: 17, loadIndex: 94, speedRating: "W", season: "summer", extraLoad: false, runFlat: false },
    }
  }
  if (category === "wheels") {
    return {
      ...base,
      category,
      wheel: { diameter: 18, width: 8, boltPattern: "5x112", offset: 45, centerBore: 57.1, finish: "", construction: "Cast", loadRatingKg: 690, approvals: {} },
    }
  }
  return { ...base, category, brake: { kind: "pads", axle: "front", fitment: [], approvals: {} } }
}

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  if (!(await isAdmin())) return null
  const { category } = await searchParams
  if (!category || !isCategory(category)) notFound()
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-expanded text-2xl font-extrabold uppercase">{TITLE[category]}</h1>
      <ProductForm product={template(category)} archived={false} isNew />
    </div>
  )
}
