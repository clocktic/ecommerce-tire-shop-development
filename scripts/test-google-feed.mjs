import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import vm from "node:vm"
import ts from "typescript"

function load(path, dependencies) {
  const module = { exports: {} }
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: path })((name) => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`)
    return dependencies[name]
  }, module, module.exports)
  return module.exports
}

const store = { market: "us", lang: "en" }
const config = { storePath: (s, path = "") => `/${s.market}/${s.lang}${path}` }
const company = { COMPANY: { url: "https://tiresshop.net", tradingName: "TiresShop" } }
const seo = load("lib/seo.ts", { "@/lib/company": company, "@/lib/markets": {}, "@/lib/i18n/config": config })
const catalog = {
  offerFor: (product, market) => product.offers[market],
  localizeProduct: (product) => product,
  tireSize: (t) => `${t.width}/${t.aspect} R${t.rim}`,
  tireServiceDescription: (t) => `${t.loadIndex}${t.speedRating}`,
}
const policies = { POLICIES: { us: { shipping: { rateCents: 0, handlingDays: [1, 2], transitDays: [3, 6] } } } }
const formatter = load("lib/feeds/us-feed-format.ts", {
  "@/lib/catalog": catalog, "@/lib/i18n/config": config, "@/lib/policies": policies, "@/lib/seo": seo,
})
const source = Array.from({ length: 100 }, (_, index) => ({
  id: `fixture-${index}`, slug: `fixture-${index}`, category: index < 35 ? "tires" : index < 70 ? "wheels" : "brakes",
  name: "Model & <size>", brand: "Example", mpn: `MPN-${index}`,
  description: "Description\twith\nline breaks & <markup> and \"quotes\".", highlights: [], specs: [],
  images: ["https://cdn.example.com/product.jpg?size=800&format=jpg"],
  offers: { us: { priceCents: 12345, availability: "in_stock" } },
  tire: { width: 225, aspect: 65, rim: 17, loadIndex: 102, speedRating: "H" },
  wheel: { diameter: 18, width: 8, boltPattern: "5x114.3", offset: 35, finish: "Silver" },
}))
let products = structuredClone(source)
const feed = load("lib/feeds/google.ts", {
  "@/lib/catalog": catalog,
  "@/lib/catalog/queries": { getProducts: async () => products, getProductsBySlugs: async () => products },
  "@/lib/company": company,
  "@/lib/feeds/us-starter-selection": { US_GMC_STARTER_SLUGS: source.map((p) => p.slug) },
  "@/lib/feeds/us-feed-format": formatter,
  "@/lib/i18n": { ...config, getDictionary: () => ({ meta: { description: "Catalog" } }) },
  "@/lib/markets": { MARKETS: { us: { short: "US", currency: "USD" } } },
  "@/lib/policies": policies, "@/lib/seo": seo,
})
const result = await feed.buildGoogleFeed(store)
assert.equal(result.included, 100)
assert.equal(result.skipped.length, 0)
assert.equal((result.xml.match(/<item>/g) || []).length, 100)
assert.ok(result.xml.includes("&amp; &lt;markup&gt;"))
assert.ok(!result.xml.includes("item_group_id"))
const lines = result.text.trimEnd().split("\n")
assert.equal(lines.length, 101)
const headers = lines[0].split("\t")
for (const line of lines) {
  assert.equal(line.split("\t").length, headers.length)
  assert.ok(!line.endsWith("\t"))
}
assert.ok(lines[1].includes("123.45 USD"))
assert.ok(lines[1].includes("US:0.00 USD:1:2:3:6"))
assert.ok(!result.text.includes("tiresshop.net/https:"))

for (const mutation of [
  () => { products.pop() },
  () => { products[0].offers.us.priceCents = NaN },
  () => { products[0].gtin = "1234567890123" },
  () => { products[0].description = "\n\t" },
  () => { products[0].images = ["https://tiresshop.net/https://cdn.example.com/image.jpg"] },
  () => { products[0].images = ["javascript:alert(1)"] },
  () => { products[1].id = products[0].id },
  () => { products[1].gtin = products[0].gtin = "086699210081" },
  () => { products[0].category = "brakes" },
]) {
  products = structuredClone(source)
  mutation()
  await assert.rejects(() => feed.buildGoogleFeed(store), feed.FeedValidationError)
}
products = structuredClone(source)
products[0].gtin = "086699210081"
assert.equal(feed.feedExclusion(products[0], "us"), null)
products[0].offers.us.availability = "preorder"
assert.match(feed.feedExclusion(products[0], "us"), /availability date/)
products[0].offers.us.availableFrom = "2026-12-01T00:00:00Z"
assert.equal(feed.feedExclusion(products[0], "us"), null)
products = structuredClone(source)
products[0].offers.us.availability = "out_of_stock"
assert.ok((await feed.buildGoogleFeed(store)).text.includes("out_of_stock"))
products = []
await assert.rejects(() => feed.buildGoogleFeed(store, { fullCatalog: true }), feed.FeedValidationError)

const route = load("app/feeds/[file]/route.ts", {
  "@/lib/feeds/google": feed,
  "@/lib/i18n/config": { parseStore: (market, lang) => lang === "en" ? { market, lang } : null, localeMeta: () => ({ hreflang: "en-US" }) },
})
const request = new Request("https://tiresshop.net/feeds/google-us-en.txt")
const context = { params: Promise.resolve({ file: "google-us-en.txt" }) }
products = structuredClone(source)
const response = await route.GET(request, context)
assert.equal(response.status, 200)
assert.equal(response.headers.get("x-feed-items"), "100")
assert.equal(response.headers.get("cache-control"), "no-store")
assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8")
assert.equal((await response.text()).trimEnd().split("\n").length, 101)
assert.equal(await (await route.HEAD(request, context)).text(), "")
assert.equal((await route.GET(request, { params: Promise.resolve({ file: "google-eu-en.txt" }) })).status, 404)
products = []
const originalError = console.error
let failureLogged = false
console.error = () => { failureLogged = true }
try {
  const failure = await route.GET(request, context)
  assert.equal(failure.status, 503)
  assert.equal(failure.headers.get("cache-control"), "no-store")
  assert.equal(failure.headers.get("retry-after"), "300")
  assert.ok(failureLogged)
} finally {
  console.error = originalError
}
console.log("Passed feed serialization, quota, missing-product, duplicate, URL, GTIN, price, stock, empty-feed, GET/HEAD and 503 regression checks")
