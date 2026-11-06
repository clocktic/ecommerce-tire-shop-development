import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import vm from "node:vm"
import ts from "typescript"

const module = { exports: {} }
const dependencies = {
  "@/lib/company": { COMPANY: { url: "https://tiresshop.net/" } },
  "@/lib/markets": {},
  "@/lib/i18n/config": {},
}
const code = ts.transpileModule(readFileSync("lib/seo.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: "lib/seo.ts" })(
  (name) => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`)
    return dependencies[name]
  },
  module,
  module.exports,
)
const { absoluteUrl } = module.exports
const cases = [
  ["", "https://tiresshop.net/"],
  ["/", "https://tiresshop.net/"],
  ["/us/en/product/tire", "https://tiresshop.net/us/en/product/tire"],
  ["images/tire.webp", "https://tiresshop.net/images/tire.webp"],
  ["/api/blob?pathname=products%2Fwheel.jpg", "https://tiresshop.net/api/blob?pathname=products%2Fwheel.jpg"],
  ["https://tpnykvdnqxyidby1.public.blob.vercel-storage.com/products/wheel.jpg", "https://tpnykvdnqxyidby1.public.blob.vercel-storage.com/products/wheel.jpg"],
  ["https://cdn.example.com/brake.jpg?width=800&format=webp", "https://cdn.example.com/brake.jpg?width=800&format=webp"],
  ["http://cdn.example.com/brake.jpg", "http://cdn.example.com/brake.jpg"],
  ["//cdn.example.com/brake.jpg", "https://cdn.example.com/brake.jpg"],
  ["https://tiresshop.net/us/en", "https://tiresshop.net/us/en"],
]
for (const [input, expected] of cases) {
  assert.equal(absoluteUrl(input), expected)
  assert.equal(absoluteUrl(absoluteUrl(input)), expected)
}
for (const input of ["javascript:alert(1)", "data:image/png;base64,AA==", "file:///tmp/image.jpg"]) {
  assert.throws(() => absoluteUrl(input), /Expected an HTTP or HTTPS URL/)
}
console.log(`Passed ${cases.length} URL cases, idempotency checks, and 3 unsafe-scheme checks`)
