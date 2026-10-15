"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"
import { sendContactMessage, type ContactState } from "@/lib/actions/contact"

const initial: ContactState = { status: "idle" }

export function ContactForm() {
  const { store, x } = useI18n()
  const c = x.contactForm
  const [state, action, pending] = useActionState(sendContactMessage, initial)

  if (state.status === "sent") {
    return (
      <p role="status" className="border border-border bg-card p-6 leading-relaxed">
        {c.sent}
      </p>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4 border border-border bg-card p-6">
      <h2 className="label-caps">{c.title}</h2>
      <input type="hidden" name="market" value={store.market} />
      <input type="hidden" name="lang" value={store.lang} />
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.name} name="name" autoComplete="name" required maxLength={120} />
        <Field label={c.email} name="email" type="email" autoComplete="email" required maxLength={200} />
        <Field label={c.orderNumber} name="orderNumber" maxLength={40} />
        <Field label={c.subject} name="subject" maxLength={200} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="label-caps text-muted-foreground">
          {c.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={5000}
          className="border border-border bg-background px-3 py-2 text-sm leading-relaxed"
        />
      </div>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-primary">
          {c.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? c.sending : c.send}
      </Button>
    </form>
  )
}

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `contact-${name}`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label-caps text-muted-foreground">
        {label}
      </label>
      <input id={id} name={name} className="h-11 border border-border bg-background px-3 text-sm" {...props} />
    </div>
  )
}
