"use server"

import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"
import { newId } from "@/lib/ids"
import { parseStore } from "@/lib/i18n/config"

export type ContactState = { status: "idle" | "sent" | "error" }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function field(form: FormData, name: string, max: number): string {
  const value = form.get(name)
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

export async function sendContactMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  // Honeypot: real visitors never see or fill this field.
  if (field(form, "website", 200)) return { status: "sent" }
  const store = parseStore(field(form, "market", 4), field(form, "lang", 4))
  const name = field(form, "name", 120)
  const email = field(form, "email", 200).toLowerCase()
  const message = field(form, "message", 5000)
  if (!store || !name || !EMAIL_RE.test(email) || message.length < 2) return { status: "error" }

  await db.insert(contactMessages).values({
    id: newId("cm"),
    market: store.market,
    lang: store.lang,
    name,
    email,
    orderNumber: field(form, "orderNumber", 40) || null,
    subject: field(form, "subject", 200) || null,
    message,
  })
  return { status: "sent" }
}
