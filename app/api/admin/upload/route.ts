import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/admin-auth"

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }
const MAX_BYTES = 8 * 1024 * 1024

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "Нет файла" }, { status: 400 })
  const ext = TYPES[file.type]
  if (!ext) return NextResponse.json({ error: "Только JPG, PNG или WebP" }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Файл больше 8 МБ" }, { status: 400 })

  const slug = String(form.get("slug") ?? "product").replace(/[^a-z0-9-]/g, "").slice(0, 80) || "product"
  // Unique name on every upload: Blob serves files with an immutable cache.
  const blob = await put(`products/${slug}-${Date.now().toString(36)}.${ext}`, file, {
    access: "public",
    contentType: file.type,
  })
  return NextResponse.json({ url: blob.url })
}
