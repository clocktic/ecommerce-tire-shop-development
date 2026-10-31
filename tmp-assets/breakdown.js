const { Client } = require("pg")
const url = process.env.DATABASE_URL.replace(/([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/, "$1sslmode=verify-full")
const c = new Client({ connectionString: url })

function modelFromName(name) {
  // name like "CrossClimate 2 205/55 R16 91V" -> strip trailing size+service token
  return name.replace(/\s+\d{2,3}\/\d{2,3}\s*R\d{2}.*$/, "").trim()
}

c.connect().then(async () => {
  const rows = (
    await c.query(
      "select id, data->>'brand' as brand, data->>'name' as name, data->>'mpn' as mpn, data->>'gtin' as gtin, data->'tire'->'utqg' as utqg, data->'tire'?'euLabel' as haseu, jsonb_array_length(data->'images') as nimg, data->'offers'?'eu' as hasoffereu, data->'offers'?'us' as hasofferus from products where data->>'category'='tires' and archived=true order by brand, name",
    )
  ).rows
  const byBrand = {}
  for (const r of rows) {
    const model = modelFromName(r.name)
    byBrand[r.brand] ??= {}
    byBrand[r.brand][model] ??= []
    byBrand[r.brand][model].push(r)
  }
  for (const brand of Object.keys(byBrand).sort()) {
    const models = byBrand[brand]
    console.log(`\n=== ${brand} (${Object.keys(models).length} models) ===`)
    for (const model of Object.keys(models)) {
      const variants = models[model]
      const okUtqg = variants.filter((v) => v.utqg).length
      const okEu = variants.filter((v) => v.haseu).length
      const okImg = variants.filter((v) => v.nimg >= 2).length
      console.log(
        `  ${model}: ${variants.length} sizes | utqg ${okUtqg}/${variants.length} | euLabel ${okEu}/${variants.length} | img2+ ${okImg}/${variants.length}`,
      )
    }
  }
  await c.end()
})
