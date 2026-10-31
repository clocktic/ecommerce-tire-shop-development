const { Client } = require("pg")
const url = process.env.DATABASE_URL.replace(/([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/, "$1sslmode=verify-full")
const c = new Client({ connectionString: url })
c.connect().then(async () => {
  const r2 = await c.query(
    "select distinct data->>'brand' as brand, count(*) from products where data->>'category'='tires' and archived=true group by 1 order by 2 desc",
  )
  console.log("archived tire brands", r2.rows)
  const sample = await c.query("select data from products where data->>'category'='tires' and archived=true limit 1")
  console.log(JSON.stringify(sample.rows[0].data, null, 2))
  await c.end()
})
