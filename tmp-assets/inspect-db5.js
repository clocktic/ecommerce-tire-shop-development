const { Client } = require("pg")
const url = process.env.DATABASE_URL.replace(/([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/, "$1sslmode=verify-full")
const c = new Client({ connectionString: url })
c.connect().then(async () => {
  const total = (await c.query("select count(*) from products where data->>'category'='tires' and archived=true")).rows[0]
  const withMpn = (await c.query("select count(*) from products where data->>'category'='tires' and archived=true and data->>'mpn' is not null and data->>'mpn' != ''")).rows[0]
  const withGtin = (await c.query("select count(*) from products where data->>'category'='tires' and archived=true and data->>'gtin' is not null and data->>'gtin' != ''")).rows[0]
  const withEuOffer = (await c.query("select count(*) from products where data->>'category'='tires' and archived=true and data->'offers' ? 'eu'")).rows[0]
  const withEuLabel = (await c.query("select count(*) from products where data->>'category'='tires' and archived=true and data->'tire' ? 'euLabel'")).rows[0]
  const withImages2plus = (await c.query("select count(*) from products where data->>'category'='tires' and archived=true and jsonb_array_length(data->'images') >= 2")).rows[0]
  console.log({ total, withMpn, withGtin, withEuOffer, withEuLabel, withImages2plus })
  const byBrandModel = (await c.query(
    "select data->>'brand' as brand, count(distinct split_part(data->>'name', ' ', 1)) from products where data->>'category'='tires' and archived=true group by 1",
  )).rows
  console.log(byBrandModel)
  await c.end()
})
