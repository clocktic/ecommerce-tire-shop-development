import test from 'node:test'
import assert from 'node:assert/strict'
import { isDatabaseQuotaError, readDatabase } from '../../lib/db/availability.ts'

const quota = () => Object.assign(new Error('Your account or project has exceeded the quota. Upgrade your plan to increase limits.'), { code: '53000' })

test('recognizes the Neon quota response', () => {
  assert.equal(isDatabaseQuotaError(quota()), true)
})

test('unwraps a Drizzle query error without exposing SQL', async () => {
  const wrapped = new Error('Failed query: select private data', { cause: quota() })
  assert.deepEqual(await readDatabase(async () => { throw wrapped }), { ok: false, reason: 'quota' })
})

test('does not confuse other resource errors with Neon quota exhaustion', async () => {
  const error = Object.assign(new Error('disk full'), { code: '53000' })
  assert.equal(isDatabaseQuotaError(error), false)
  await assert.rejects(readDatabase(async () => { throw error }), (actual) => actual === error)
})

test('does not hide programming errors, invalid SQL or authentication failures', async () => {
  for (const error of [new TypeError('Invalid data'), new Error('column does not exist'), new Error('permission denied')]) {
    await assert.rejects(readDatabase(async () => { throw error }), (actual) => actual === error)
  }
})

test('handles malformed and cyclic cause chains safely', () => {
  const cycle = { message: 'not a quota error' }
  cycle.cause = cycle
  for (const value of [undefined, null, 'error', 1, { message: 23 }, cycle]) {
    assert.equal(isDatabaseQuotaError(value), false)
  }
})

test('preserves successful data and legitimate empty results', async () => {
  for (const data of [[{ id: 'real-product' }], [], undefined, null]) {
    assert.deepEqual(await readDatabase(async () => data), { ok: true, data })
  }
})

test('recovers on the next read without caching the outage', async () => {
  let failing = true
  const read = async () => {
    if (failing) throw quota()
    return 'database restored'
  }
  assert.deepEqual(await readDatabase(read), { ok: false, reason: 'quota' })
  failing = false
  assert.deepEqual(await readDatabase(read), { ok: true, data: 'database restored' })
})
