import { list, del } from "@vercel/blob"
import { Client } from "pg"

const dbUrl = process.env.DATABASE_URL.replace(
  /([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/,
  "$1sslmode=verify-full",
)
const client = new Client({ connectionString: dbUrl })
await client.connect()

const { rows } = await client.query("select data from products")
await client.end()

const usedUrls = new Set()
for (const { data } of rows) {
  const images = Array.isArray(data?.images) ? data.images : []
  for (const img of images) {
    if (typeof img === "string") usedUrls.add(img)
    else if (img?.url) usedUrls.add(img.url)
  }
}

console.log("Referenced image URLs:", usedUrls.size)

let cursor
let totalBlobs = 0
let toDelete = []
do {
  const res = await list({ cursor, limit: 1000 })
  for (const blob of res.blobs) {
    totalBlobs++
    if (!usedUrls.has(blob.url)) {
      toDelete.push(blob.url)
    }
  }
  cursor = res.cursor
} while (cursor)

console.log("Total blobs:", totalBlobs)
console.log("Unused blobs to delete:", toDelete.length)

const dryRun = process.argv.includes("--dry-run")
if (dryRun) {
  console.log("Dry run - sample of unused URLs:")
  console.log(toDelete.slice(0, 20).join("\n"))
} else {
  const batchSize = 100
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize)
    await del(batch)
    console.log(`Deleted ${Math.min(i + batchSize, toDelete.length)}/${toDelete.length}`)
  }
}
