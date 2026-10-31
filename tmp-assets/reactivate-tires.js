const { Client } = require("pg")
const url = process.env.DATABASE_URL.replace(/([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/, "$1sslmode=verify-full")
const c = new Client({ connectionString: url })

const BRANDS = [
  "Michelin",
  "Continental",
  "Pirelli",
  "Bridgestone",
  "Goodyear",
  "Falken",
  "Yokohama",
  "Kumho",
  "Firestone",
  "Hankook",
  "BFGoodrich",
  "Dunlop",
]

const DRY_RUN = process.argv.includes("--apply") ? false : true

function modelKey(brand, name) {
  const model = name.replace(/\s+\d{2,3}\/\d{2,3}\s*R\d{2}.*$/, "").trim()
  return brand + "|" + model
}

c.connect().then(async () => {
  // Pull ALL archived+active tires (any brand) to build the richest possible image pool per model.
  const all = (
    await c.query(
      "select id, data from products where data->>'category'='tires'",
    )
  ).rows

  const imagePool = new Map() // modelKey -> Set(images)
  for (const row of all) {
    const d = row.data
    const key = modelKey(d.brand, d.name)
    if (!imagePool.has(key)) imagePool.set(key, new Set())
    for (const img of d.images || []) imagePool.get(key).add(img)
  }

  const targets = all.filter((r) => BRANDS.includes(r.data.brand))
  let toActivateUs = 0, toActivateEu = 0, excluded = 0, stillLowImg = 0
  const updates = []
  for (const row of targets) {
    const d = row.data
    const hasUtqg = !!(d.tire && d.tire.utqg)
    const hasEu = !!(d.tire && d.tire.euLabel)
    if (!hasUtqg && !hasEu) {
      excluded++
      continue
    }
    const newOffers = {}
    if (hasUtqg && d.offers.us) newOffers.us = d.offers.us
    if (hasEu && d.offers.eu) newOffers.eu = d.offers.eu
    if (Object.keys(newOffers).length === 0) {
      excluded++
      continue
    }
    if (hasUtqg) toActivateUs++
    if (hasEu) toActivateEu++

    let images = Array.from(new Set(d.images || []))
    if (images.length < 2) {
      const pool = imagePool.get(modelKey(d.brand, d.name))
      if (pool) images = Array.from(new Set([...images, ...pool]))
    }
    images = images.slice(0, 4)
    if (images.length < 2) stillLowImg++

    updates.push({ id: row.id, newData: { ...d, offers: newOffers, images } })
  }

  console.log({
    totalCandidates: targets.length,
    excluded,
    toActivateUs,
    toActivateEu,
    willActivate: updates.length,
    stillLowImg,
    dryRun: DRY_RUN,
  })

  if (!DRY_RUN) {
    for (const u of updates) {
      await c.query("update products set data = $1, archived = false where id = $2", [JSON.stringify(u.newData), u.id])
    }
    console.log("applied", updates.length, "updates")
  }

  await c.end()
})
