import assert from "node:assert/strict"
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import path from "node:path"
import vm from "node:vm"
import { createRequire } from "node:module"
import ts from "typescript"

const require = createRequire(import.meta.url)
const root = process.cwd()
const cache = new Map()
const deliveries = []
const mocks = {
  "server-only": {},
  "next/headers": { headers: async () => new Headers({ referer: "https://tiresshop.net/eu/de/account" }) },
  nodemailer: { createTransport: () => ({ sendMail: async (message) => { deliveries.push(message); return { messageId: "test" } } }) },
}
function load(filename) {
  const full = path.resolve(root, filename)
  if (cache.has(full)) return cache.get(full).exports
  if (full.endsWith(".json")) return JSON.parse(readFileSync(full, "utf8"))
  const module = { exports: {} }
  cache.set(full, module)
  const localRequire = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name]
    if (name.startsWith("@/")) return load(name.slice(2) + (name.endsWith(".json") ? "" : ".ts"))
    return require(name)
  }
  const code = ts.transpileModule(readFileSync(full, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: full })(localRequire, module, module.exports)
  return module.exports
}
const { renderEmail, emailAssetAttachments, EMAIL_TEMPLATE_IDS, SHIPMENT_EMAIL_TEMPLATES, emailCopy, emailStore } = load("lib/email-templates.ts")
const { ALL_STORES } = load("lib/i18n/config.ts")
const assets = load("lib/email-assets.json")
const details = {
  orderNumber: "TS-EU-REAL123", trackingNumber: "TRACK123", totalCents: 68960,
  subtotalCents: 72000, discountCents: 5040, shippingCents: 2000,
  items: [{ productName: "Customer-selected tires", quantity: 4, lineTotalCents: 72000 }],
}
let variants = 0
for (const store of ALL_STORES) {
  for (const template of EMAIL_TEMPLATE_IDS) {
    const result = renderEmail({ template, store, details, unsubscribeUrl: "https://tiresshop.net/preferences/test" })
    assert.ok(result.html.startsWith("<!doctype html>"))
    assert.ok(result.html.includes("TS-EU-REAL123"))
    assert.ok(result.text.includes("Customer-selected tires"))
    assert.doesNotMatch(result.html, /Alex Morgan|TS-10482|Musterstraße|Example Avenue|href="#preview"|<script|<svg|undefined/)
    assert.ok(Buffer.byteLength(result.html) < 102_400)
    assert.equal(result.assetIds.join(","), `brand,${template}`)
    const attachments = emailAssetAttachments(result.assetIds)
    assert.equal(attachments.length, 2)
    for (const attachment of attachments) {
      assert.ok(attachment.content.length > 1000)
      assert.ok(result.html.includes(`cid:${attachment.cid}`))
    }
    const currency = store.market === "us" ? "$" : "€"
    assert.ok(result.text.includes(currency))
    variants++
  }
}
assert.equal(Object.keys(SHIPMENT_EMAIL_TEMPLATES).length, 16)
for (const template of Object.values(SHIPMENT_EMAIL_TEMPLATES)) assert.ok(EMAIL_TEMPLATE_IDS.includes(template))
assert.equal(SHIPMENT_EMAIL_TEMPLATES.label_created, "label")
assert.equal(SHIPMENT_EMAIL_TEMPLATES.awaiting_pickup, "pickup")
assert.equal(SHIPMENT_EMAIL_TEMPLATES.returned, "return")
assert.equal(emailStore("us", "de").lang, "en")
assert.equal(emailCopy(emailStore("us", "es")).order, "Pedido")
assert.throws(() => renderEmail({ template: "season" }), /unsubscribe/)
assert.throws(() => renderEmail({ template: "loyalty", unsubscribeUrl: "javascript:alert(1)" }), /unsubscribe/)
const escaped = renderEmail({ template: "reply", paragraphs: ['<script>alert("x")</script>\nSecond line'], cta: { label: "Unsafe", href: "javascript:alert(1)" } })
assert.ok(escaped.html.includes("&lt;script&gt;"))
assert.ok(escaped.html.includes("<br>Second line"))
assert.doesNotMatch(escaped.html, /href="javascript:|<script>/)
assert.ok(escaped.text.includes('<script>alert("x")</script>'))
assert.doesNotMatch(renderEmail({ template: "reply", paragraphs: ["Your actual support answer"] }).html, /vehicle model, year/)
assert.doesNotMatch(renderEmail({ template: "refunded", details: { orderNumber: "REFUND" } }).text, /689|\$|€/)

process.env.SMTP_PASS = "test-only-not-a-real-password"
const email = load("lib/email.ts")
await email.sendMail({ to: "buyer@example.test", subject: "Test", paragraphs: ["First line\nSecond line"], signoff: "Support", template: "order", details, copyStoreInbox: true })
assert.equal(deliveries.length, 1)
assert.equal(deliveries[0].bcc, "info@tiresshop.net")
assert.equal(deliveries[0].replyTo, "info@tiresshop.net")
assert.equal(deliveries[0].attachments.length, 2)
assert.ok(deliveries[0].html.includes("<br>Second line"))
assert.equal(deliveries[0].disableFileAccess, true)
assert.equal(deliveries[0].disableUrlAccess, true)
await email.notifyEmailOrderPaid({ orderNumber: "FR-TEST", market: "eu", lang: "fr", email: "buyer@example.test", totalCents: 12345, items: details.items })
const paid = deliveries.find((m) => m.subject.includes("Paiement reçu"))
assert.ok(paid)
assert.ok(paid.text.includes("123,45"))
assert.ok(paid.html.includes("/eu/fr/order/FR-TEST"))
await email.sendContactFormEmails({ name: "Customer", email: "buyer@example.test", message: "Actual question\nExtra detail", market: "eu", lang: "de" })
assert.ok(deliveries.some((m) => m.subject.includes("Anfrage erhalten") && m.text.includes("Actual question")))
await email.notifyEmailNewUser({ name: "Customer", email: "buyer@example.test", market: "us", lang: "es" })
assert.ok(deliveries.some((m) => m.html.includes("/us/es/account") && m.text.includes("−7%")))
await email.notifyEmailNewUser({ name: "Customer", email: "buyer@example.test" })
assert.ok(deliveries.some((m) => m.html.includes("/eu/de/account") && m.subject.includes("Willkommen")))
const beforeTest = deliveries.length
assert.equal((await email.sendTestStoreEmail()).ok, true)
assert.equal(deliveries.length, beforeTest + 1)
assert.equal(deliveries.at(-1).to, "info@tiresshop.net")
assert.ok(deliveries.at(-1).html)
assert.doesNotMatch(deliveries.at(-1).text, /�/)

const state = { status: "paid", updated: [], checks: [] }
const db = { update: () => ({ set: (patch) => ({ where: (condition) => ({ returning: async () => {
  state.checks.push(condition)
  if (state.status === patch.status) return []
  state.status = patch.status
  state.updated.push(patch.status)
  return [{ orderNumber: "STATUS-TEST", email: "buyer@example.test", market: "eu", lang: "de", status: patch.status }]
} }) }) }) }
const ops = Object.fromEntries(["and", "eq", "ne"].map((name) => [name, (...args) => ({ op: name, args })]))
const adminMocks = {
  "next/cache": { revalidatePath: () => {} }, "next/navigation": {},
  "drizzle-orm": ops, "@/lib/admin-auth": { requireAdmin: async () => {} },
  "@/lib/db": { db }, "@/lib/db/schema": { orders: { id: "id", status: "status" } },
  "@/lib/shipping/tracking": { ORDER_STATUSES: ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] },
  "@/lib/shipping/events": { orderStore: (order) => emailStore(order.market, order.lang) },
  "@/lib/email": email, "@/lib/email-templates": load("lib/email-templates.ts"), "@/lib/company": load("lib/company.ts"),
}
const adminModule = { exports: {} }
const adminCode = ts.transpileModule(readFileSync("lib/actions/admin.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
vm.runInThisContext(`(function(require,module,exports){${adminCode}\n})`)((name) => adminMocks[name] ?? {}, adminModule, adminModule.exports)
for (const status of ["processing", "cancelled", "refunded", "delivered"]) {
  const before = deliveries.length
  await adminModule.exports.setOrderStatus("id-test", status)
  await adminModule.exports.setOrderStatus("id-test", status)
  assert.equal(deliveries.length, before + 1, `${status} should notify only on transition`)
  assert.ok(deliveries.at(-1).attachments.some((a) => a.filename === `${status}.jpg`))
  assert.equal(state.checks.at(-1).args[1].op, "ne")
}
const beforeInvalid = deliveries.length
assert.equal((await adminModule.exports.setOrderStatus("id-test", "unknown")).ok, false)
assert.equal(deliveries.length, beforeInvalid)

if (process.argv[2]) {
  const directory = path.resolve(process.argv[2])
  mkdirSync(directory, { recursive: true })
  for (const template of ["order", "shipped", "welcome", "reply", "refunded"]) {
    const result = renderEmail({ template, store: { market: "eu", lang: "en" }, details, paragraphs: template === "reply" ? ["Thank you for your message. Your order is being prepared.\nWe will send tracking details when it ships."] : undefined }, "data")
    writeFileSync(path.join(directory, `${template}.html`), result.html)
  }
}
console.log(`${variants} localized templates passed; 16 shipment mappings, escaping, currencies, MIME images, SMTP wiring and status-transition notifications verified without sending real email.`)
console.log(`Embedded assets: ${Math.round(Object.values(assets).reduce((sum, asset) => sum + Buffer.byteLength(asset.content, "base64"), 0) / 1024)} KiB total.`)
