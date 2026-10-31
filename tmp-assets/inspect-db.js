const { Client } = require("pg")
const url = process.env.DATABASE_URL.replace(/([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/, "$1sslmode=verify-full")
const c = new Client({ connectionString: url })
c.connect().then(async () => {
  const r1 = await c.query("select data->>'category' as cat, count(*) from products where archived=false group by 1")
  console.log("categories", r1.rows)
  const r2 = await c.query(
    "select distinct data->>'brand' as brand from products where archived=false and data->>'category'='tires' order by 1",
  )
  console.log("tire brands", r2.rows.map((r) => r.brand))
  const r3 = await c.query("select count(*) from products where archived=false and data->>'category'='tires'")
  console.log("tire count", r3.rows)
  await c.end()
})
