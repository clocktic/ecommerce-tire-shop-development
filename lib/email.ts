import "server-only"

import nodemailer from "nodemailer"
import { COMPANY } from "@/lib/company"

// SMTP is optional until the mailbox is set up: without SMTP_HOST every send is
// skipped (logged) and the order / shipment flow continues unaffected.
function transport() {
  const host = process.env.SMTP_HOST
  if (!host) return null
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

export async function sendMail(input: {
  to: string
  subject: string
  paragraphs: string[]
  cta?: { label: string; href: string }
  signoff: string
}): Promise<boolean> {
  const mailer = transport()
  if (!mailer) {
    console.log("[email] SMTP not configured, skipped:", input.subject)
    return false
  }
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#22252b">
${input.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n")}
${input.cta ? `<p><a href="${escapeHtml(input.cta.href)}" style="display:inline-block;background:#c8312b;color:#fff;padding:10px 18px;text-decoration:none;font-weight:bold">${escapeHtml(input.cta.label)}</a></p>` : ""}
<p>${escapeHtml(input.signoff)}<br>${escapeHtml(COMPANY.legalName)} · ${escapeHtml(COMPANY.email)}</p>
</div>`
  const text = [...input.paragraphs, input.cta ? `${input.cta.label}: ${input.cta.href}` : "", input.signoff]
    .filter(Boolean)
    .join("\n\n")
  try {
    await mailer.sendMail({
      from: process.env.MAIL_FROM ?? `${COMPANY.tradingName} <${COMPANY.email}>`,
      to: input.to,
      subject: input.subject,
      text,
      html,
    })
    return true
  } catch (error) {
    console.error("[email] send failed:", error)
    return false
  }
}
