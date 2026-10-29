const { Client } = require("pg")
const url = process.env.DATABASE_URL.replace(/([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/, "$1sslmode=verify-full")
const c = new Client({ connectionString: url })
c.connect().then(async () => {
  const r = await c.query("select archived, data->>'category' as cat, count(*) from products group by 1,2 order by 1,2")
  console.log(r.rows)
  const r2 = await c.query(
    "select distinct data->>'brand' as brand from products where data->>'category'='tires' order by 1",
  )
  console.log("all tire brands (incl archived)", r2.rows.map((r) => r.brand))
  await c.end()
})
