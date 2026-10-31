import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync('lib/catalog/tire-variants.ts', 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
const context = { exports: {} }
vm.runInNewContext(outputText, context)
const { tireModelKey, tireVariants } = context.exports
const product = (slug, name, overrides = {}) => ({ category: 'tires', brand: 'Michelin', slug, name, tire: { width: 225, aspect: 45, rim: 18, loadIndex: 95, ...overrides } })
const first = product('a', 'Pilot Sport 4S 225/45 R18 95Y')
const second = product('b', 'Michelin Pilot Sport 4S 205/55 R17 91Y', { width: 205, aspect: 55, rim: 17, loadIndex: 91 })
const differentModel = product('c', 'Pilot Sport 4 225/45 R18 95Y')
const otherBrand = { ...first, brand: 'Pirelli', slug: 'd' }
const explicit = product('e', 'Localized tyre name', { model: 'Pilot Sport 4S' })
assert.equal(tireModelKey(first), tireModelKey(second))
assert.equal(tireModelKey(first), tireModelKey(explicit))
assert.notEqual(tireModelKey(first), tireModelKey(differentModel))
assert.notEqual(tireModelKey(first), tireModelKey(otherBrand))
assert.equal(tireVariants(first, [first, second, differentModel, otherBrand, explicit]).map(p => p.slug).join(','), 'b,a,e')
console.log('5 tire family and variant ordering checks passed')
