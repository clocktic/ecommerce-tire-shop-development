import { COMPANY, companyAddressLine } from "@/lib/company"
import { localeMeta, parseStore, type Store } from "@/lib/i18n/config"
import copy from "@/lib/email-copy.json"
import assets from "@/lib/email-assets.json"

export const EMAIL_TEMPLATE_IDS = [
  "order", "shipped", "season", "loyalty", "welcome", "paid", "processing", "label",
  "courier", "pickup", "delivered", "issue", "return", "cancelled", "refunded", "contact", "reply", "chat",
] as const
export type EmailTemplateId = (typeof EMAIL_TEMPLATE_IDS)[number]
export type ServiceEmailTemplateId = Exclude<EmailTemplateId, "season" | "loyalty">

type EmailItem = { productName: string; brandName?: string | null; quantity: number; lineTotalCents: number }
export type EmailDetails = {
  orderNumber?: string
  trackingNumber?: string | null
  status?: string
  location?: string | null
  totalCents?: number
  subtotalCents?: number
  shippingCents?: number
  discountCents?: number
  items?: EmailItem[]
}
export type EmailContent = {
  template?: EmailTemplateId
  store?: Store
  subject?: string
  paragraphs?: string[]
  signoff?: string
  cta?: { label: string; href: string }
  details?: EmailDetails
  unsubscribeUrl?: string
}

const palettes = {
  green: { accent: "#177a42", soft: "#edf6ef", border: "#c6dfcd" },
  blue: { accent: "#075fca", soft: "#edf3fc", border: "#c7d9f3" },
  amber: { accent: "#c64a08", soft: "#fff4e9", border: "#f0cfb2" },
  purple: { accent: "#6932b4", soft: "#f5effb", border: "#dcccf0" },
}
const templateThemes: Record<EmailTemplateId, keyof typeof palettes> = {
  order: "green", shipped: "blue", season: "amber", loyalty: "purple", welcome: "purple",
  paid: "green", processing: "green", label: "blue", courier: "blue", pickup: "blue", delivered: "green",
  issue: "amber", return: "amber", cancelled: "amber", refunded: "green", contact: "blue", reply: "blue", chat: "blue",
}
export const SHIPMENT_EMAIL_TEMPLATES = {
  label_created: "label", collected: "shipped", at_warehouse: "shipped", sorted: "shipped",
  in_transit: "shipped", at_delivery_point: "shipped", out_for_delivery: "courier",
  delivery_attempted: "issue", handed_to_partner: "issue", awaiting_pickup: "pickup",
  address_issue: "issue", delayed: "issue", customs: "issue", returning: "return", returned: "return", delivered: "delivered",
} as const

export function emailStore(market = "us", lang = "en"): Store {
  return parseStore(market, lang) ?? { market: market === "eu" ? "eu" : "us", lang: "en" }
}
export function emailCopy(store: Store = emailStore()) {
  return copy[localeMeta(store).content]
}
export function escapeEmailHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}
function safeLink(value: string): string | undefined {
  try {
    const url = new URL(value)
    if (["https:", "http:", "mailto:"].includes(url.protocol) && !url.username && !url.password) return url.href
  } catch { /* Unsafe or relative links must never be emitted into email. */ }
}
export function emailAssetAttachments(ids: readonly (keyof typeof assets)[]) {
  return ids.map((id) => ({
    filename: `${id}.${assets[id].type === "image/png" ? "png" : "jpg"}`,
    content: Buffer.from(assets[id].content, "base64"),
    contentType: assets[id].type,
    cid: `tiresshop-${id}@tiresshop.net`,
    contentDisposition: "inline" as const,
  }))
}

export function renderEmail(input: EmailContent, imageMode: "cid" | "data" = "cid") {
  const store = emailStore(input.store?.market, input.store?.lang)
  const meta = localeMeta(store)
  const c = emailCopy(store)
  const id = input.template
  if (id && !EMAIL_TEMPLATE_IDS.includes(id)) throw new Error("Unknown email template")
  const index = id ? EMAIL_TEMPLATE_IDS.indexOf(id) : -1
  const campaign = id === "season" || id === "loyalty"
  const unsubscribe = input.unsubscribeUrl ? safeLink(input.unsubscribeUrl) : undefined
  if (campaign && (!unsubscribe || !unsubscribe.startsWith("https://"))) {
    throw new Error("Campaign templates require a working HTTPS unsubscribe URL")
  }
  const theme = palettes[id ? templateThemes[id] : "blue"]
  const subject = input.subject || `${c.copy[index]?.[0] || COMPANY.tradingName} · ${COMPANY.tradingName}`
  const heading = c.copy[index]?.[1] || subject
  const paragraphs = input.paragraphs?.filter(Boolean) ?? []
  const introduction = paragraphs.length ? "" : (c.copy[index]?.[2] || "")
  const e = escapeEmailHtml
  const p = (value: string) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;overflow-wrap:anywhere">${e(value).replace(/\r?\n/g, "<br>")}</p>`
  const assetIds: (keyof typeof assets)[] = id ? ["brand", id] : ["brand"]
  const image = (name: keyof typeof assets) => imageMode === "data"
    ? `data:${assets[name].type};base64,${assets[name].content}`
    : `cid:tiresshop-${name}@tiresshop.net`
  const detail = input.details ?? {}
  const plainDetails: string[] = []
  const money = (cents: number) => new Intl.NumberFormat(meta.intlLocale, {
    style: "currency", currency: store.market === "eu" ? "EUR" : "USD",
  }).format(cents / 100)
  const row = (label: string, value: string, total = false) => {
    plainDetails.push(`${label}: ${value}`)
    return `<tr><td style="padding:10px 0;vertical-align:top;${total ? `border-top:1px solid ${theme.border};font-weight:700;` : ""}">${e(label)}</td><td align="right" style="padding:10px 0 10px;vertical-align:top;word-break:break-word;font-weight:700;${total ? `border-top:1px solid ${theme.border};font-size:20px;` : ""}">${e(value)}</td></tr>`
  }
  let rows = ""
  if (detail.orderNumber) rows += row(c.order, detail.orderNumber)
  if (detail.trackingNumber) rows += row(c.tracking, detail.trackingNumber)
  if (detail.status) rows += row(c.status, detail.status)
  if (detail.location) rows += row(c.address, detail.location)
  for (const item of detail.items ?? []) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0 || !Number.isSafeInteger(item.lineTotalCents) || item.lineTotalCents < 0) continue
    const name = [item.brandName, item.productName].filter(Boolean).join(" ")
    rows += row(`${item.quantity} × ${name}`, money(item.lineTotalCents))
  }
  for (const [label, cents, negative] of [
    [c.items, detail.subtotalCents, false], [c.discount, detail.discountCents, true], [c.shipping, detail.shippingCents, false],
  ] as const) {
    if (cents !== undefined && Number.isSafeInteger(cents) && cents >= 0) rows += row(label, money(negative ? -cents : cents))
  }
  if (detail.totalCents !== undefined && Number.isSafeInteger(detail.totalCents) && detail.totalCents >= 0) {
    rows += row(c.total, money(detail.totalCents), true)
  }
  let extra = ""
  if (id === "welcome" || id === "loyalty") {
    extra = `<p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1px">${e(c.member)}</p><p style="margin:10px 0;font-size:44px;font-weight:800;color:${theme.accent}">−7%</p>${p(c.auto)}`
    plainDetails.push(`${c.member}: −7%`, c.auto)
  }
  if (id === "season") { extra = p(c.winter); plainDetails.push(c.winter) }
  const notes = id === "label" ? c.labelNote : id === "return" ? c.refundNote : id === "refunded" ? c.bank : id === "paid" ? c.notReceipt : id === "chat" ? c.chatNote : ""
  const base = `${COMPANY.url.replace(/\/$/, "")}/${store.market}/${store.lang}`
  const action = input.cta ?? (id ? {
    label: detail.trackingNumber ? c.track : detail.orderNumber ? c.view : id === "welcome" ? c.account : c.reply,
    href: detail.trackingNumber ? `${base}/track/${encodeURIComponent(detail.trackingNumber)}`
      : detail.orderNumber ? `${base}/order/${encodeURIComponent(detail.orderNumber)}`
      : id === "welcome" ? `${base}/account` : `mailto:${COMPANY.email}`,
  } : undefined)
  const href = action ? safeLink(action.href) : undefined
  const signoff = input.signoff || c.footer
  const html = `<!doctype html><html lang="${meta.htmlLang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${e(subject)}</title><style>@media only screen and (max-width:620px){.email-pad{padding:28px 22px!important}.email-title{font-size:28px!important}.outer-pad{padding:12px 0!important}}a{color:inherit}</style></head><body style="margin:0;padding:0;background:#eef0f3;font-family:Arial,Helvetica,sans-serif;color:#17212d"><div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${e(introduction || subject)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eef0f3"><tr><td class="outer-pad" align="center" style="padding:32px 12px"><!--[if mso]><table role="presentation" width="600"><tr><td><![endif]--><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e1e5ea">
<tr><td align="center" bgcolor="#11171f" style="padding:25px 20px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right:13px"><img src="${image("brand")}" alt="" width="48" height="48" style="display:block;border:0"></td><td><div style="font-family:Archivo,'Arial Black',Arial,sans-serif;font-size:28px;font-weight:900;font-style:italic;letter-spacing:-1.6px;line-height:1;color:#f1f3f5">TIRES<span style="color:#e54c42">SHOP</span></div><div style="margin-top:6px;font-size:9px;font-weight:600;letter-spacing:2.5px;color:#a1a7b1">TIRESSHOP.NET</div></td></tr></table></td></tr>
${id ? `<tr><td><img src="${image(id)}" alt="" width="600" height="235" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>` : ""}
<tr><td class="email-pad" style="padding:36px 42px"><p style="margin:0 0 14px;color:${theme.accent};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.3px">${e(c.copy[index]?.[0] || COMPANY.tradingName)}</p><h1 class="email-title" style="margin:0 0 22px;font-size:34px;font-weight:800;line-height:1.15;letter-spacing:-1px;color:#11171f">${e(heading).replace(/\n/g, "<br>")}</h1>${introduction ? p(introduction) : ""}${paragraphs.map(p).join("")}
${rows || extra ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;background:${theme.soft};border:1px solid ${theme.border};border-radius:8px"><tr><td style="padding:18px 22px">${extra}${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:13px;line-height:1.5">${rows}</table>` : ""}</td></tr></table>` : ""}
${href && action ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px"><tr><td align="center" bgcolor="${theme.accent}" style="border-radius:6px;mso-padding-alt:16px 20px"><a href="${e(href)}" style="display:block;padding:16px 20px;border:1px solid ${theme.accent};border-radius:6px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;text-align:center">${e(action.label)}</a></td></tr></table>` : ""}
${notes ? `<p style="margin:18px 0 0;color:#596575;font-size:12px;line-height:1.6">${e(notes)}</p>` : ""}<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#596575">${e(signoff)}</p></td></tr>
<tr><td align="center" style="padding:24px 30px;border-top:1px solid #e8ebef;background:#f8f9fb;color:#657080;font-size:11px;line-height:1.8">${e(c.help)} <a href="mailto:${COMPANY.email}" style="color:#455365">${COMPANY.email}</a><br>${e(COMPANY.legalName)}<br>${e(companyAddressLine)}<br>${campaign ? `<a href="${e(unsubscribe!)}">${e(c.unsubscribe)}</a>` : e(c.service)}</td></tr></table><!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`
  const text = [heading.replace(/\n/g, " "), introduction, ...paragraphs, ...plainDetails, notes,
    href && action ? `${action.label}: ${href}` : "", signoff, `${COMPANY.legalName}\n${companyAddressLine}\n${COMPANY.email}`,
    campaign ? `${c.unsubscribe}: ${unsubscribe}` : c.service,
  ].filter(Boolean).join("\n\n")
  return { html, text, subject, assetIds }
}
