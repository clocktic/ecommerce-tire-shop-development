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

c.connect().then(async () => {
  const rows = (
    await c.query(
      `select id, data->>'brand' as brand, data->>'name' as name, data->'tire'->'utqg' as utqg, data->'tire'?'euLabel' as haseu, jsonb_array_length(data->'images') as nimg from products where data->>'category'='tires' and archived=true and data->>'brand' = any($1::text[])`,
      [BRANDS],
    )
  ).rows
  let bothOk = 0, usOnly = 0, euOnly = 0, neither = 0, lowImg = 0
  for (const r of rows) {
    const hasUtqg = !!r.utqg
    const hasEu = !!r.haseu
    if (hasUtqg && hasEu) bothOk++
    else if (hasUtqg) usOnly++
    else if (hasEu) euOnly++
    else neither++
    if (r.nimg < 2) lowImg++
  }
  console.log({ total: rows.length, bothOk, usOnly, euOnly, neither, lowImg })
  await c.end()
})
