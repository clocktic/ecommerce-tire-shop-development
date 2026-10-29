const { Client } = require("pg")
const url = process.env.DATABASE_URL.replace(/([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/, "$1sslmode=verify-full")
const c = new Client({ connectionString: url })
c.connect().then(async () => {
  const r = await c.query(
    "select data from products where data->'category'='\"tires\"'::jsonb and archived=true and data->'tire'?'utqg' limit 1",
  )
  console.log("has utqg count check")
  const r2 = await c.query(
    "select count(*) from products where data->>'category'='tires' and archived=true and data->'tire' ? 'utqg'",
  )
  console.log("utqg count", r2.rows)
  const r3 = await c.query(
    "select count(*) from products where data->>'category'='tires' and archived=true and data->'offers' ? 'us'",
  )
  console.log("us offer count", r3.rows)
  const r4 = await c.query(
    "select data->'tire' as tire, data->'offers' as offers, data->>'brand' as brand, data->>'name' as name from products where data->>'category'='tires' and archived=true and data->'offers' ? 'us' limit 1",
  )
  console.log(JSON.stringify(r4.rows[0], null, 2))
  await c.end()
})
