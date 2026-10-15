import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { isAdmin } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import { ProductForm } from "@/components/admin/product-form"

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return null
  const { id } = await params
  const [row] = await db.select().from(products).where(eq(products.id, decodeURIComponent(id))).limit(1)
  if (!row) notFound()
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-expanded text-2xl font-extrabold uppercase">{row.data.name}</h1>
      <ProductForm product={row.data} archived={row.archived} isNew={false} />
    </div>
  )
}
