import fs from "node:fs";
import pg from "pg";

const { Pool } = pg;

// Exact target boltPattern mapping for all 65 wheel products whose boltPattern
// needs correction to match their photo's actual visible lug count (and keep 4x98,
// 4x100, 4x108, 6x114.3, 6x120, 6x135, 6x139.7, 8x170, 8x180 covered with
// matching-lug photos).
const BOLT_PATTERN_FIXES = {
  // 1) HRE Forged 520 Series (6 products: 3x112 custom-blank range -> 5x112 performance fitment; photo has 5 lugs)
  "hre-forged-520-series-520-18x6-5-3x112-et-50-custom-made-to-any-colour": {
    newBp: "5x112",
    newWidth: 8.5,
    newOffset: 35,
    newCenterBore: 66.5,
  },
  "hre-forged-520-series-520-19x6-5-3x112-et-50-custom-made-to-any-colour": {
    newBp: "5x112",
    newWidth: 9.5,
    newOffset: 35,
    newCenterBore: 66.5,
  },
  "hre-forged-520-series-522-18x6-5-3x112-et-50-custom-made-to-any-colour": {
    newBp: "5x112",
    newWidth: 8.5,
    newOffset: 35,
    newCenterBore: 66.5,
  },
  "hre-forged-520-series-522-19x6-5-3x112-et-50-custom-made-to-any-colour": {
    newBp: "5x112",
    newWidth: 9.5,
    newOffset: 35,
    newCenterBore: 66.5,
  },
  "hre-forged-520-series-527-18x6-5-3x112-et-50-custom-made-to-any-colour": {
    newBp: "5x112",
    newWidth: 8.5,
    newOffset: 35,
    newCenterBore: 66.5,
  },
  "hre-forged-520-series-527-19x6-5-3x112-et-50-custom-made-to-any-colour": {
    newBp: "5x112",
    newWidth: 9.5,
    newOffset: 35,
    newCenterBore: 66.5,
  },

  // 2) Former 4x98 / 4x100 / 4x108 wheels whose photo clearly has 5 bolt holes -> 5-lug fitment
  "3sdm-0-05-16x8-4x100-et25-white": { newBp: "5x100" },
  "alutec-ikenu-17x6-5-4x100-et45-gloss-black": { newBp: "5x114.3" },
  "alutec-ikenu-17x6-5-4x98-et38-graphite-polished": { newBp: "5x112" },
  "ats-streetrallye-17x7-4x108-et25-racing-black": { newBp: "5x112" },
  "autec-wizard-17x7-5-4x100-et38-matt-gunmetal": { newBp: "5x112" },
  "autec-wizard-18x8-4x100-et35-matt-gunmetal": { newBp: "5x112" },
  "fondmetal-9evo-17x7-4x98-et35-gloss-black": { newBp: "5x112" },
  "fondmetal-9evo-18x7-4x108-et40-gloss-gold": { newBp: "5x112" },
  "fondmetal-9rr-17x7-4x108-et25-gloss-black": { newBp: "5x112" },
  "fondmetal-9rr-17x7-4x108-et40-gloss-gold": { newBp: "5x112" },
  "fox-racing-fx004-16x6-5-4x98-et35-black": { newBp: "5x112" },
  "oz-racing-assetto-gara-17x7-4x100-et30-matt-black": { newBp: "5x112" },
  "oz-racing-assetto-gara-18x7-5-4x100-et35-matt-black": { newBp: "5x112" },
  "oz-racing-assetto-gara-17x7-4x100-et42-matt-bronze": { newBp: "5x112" },
  "oz-racing-hyper-gt-hlt-18x7-4x100-et35-gloss-black": { newBp: "5x112" },
  "oz-racing-rally-racing-17x7-4x100-et37-dark-graphite-silver-lettering": { newBp: "5x112" },
  "oz-racing-rally-racing-17x7-4x100-et45-race-white-red-lettering": { newBp: "5x112" },
  "oz-racing-superturismo-lm-17x7-4x100-et42-matt-race-silver-black-lettering": { newBp: "5x112" },
  "oz-racing-superturismo-lm-17x7-4x108-et42-matt-graphite-silver-lettering": { newBp: "5x112" },
  "oz-racing-superturismo-lm-17x7-5-4x100-et35-matt-black-silver-lettering": { newBp: "5x112" },
  "oz-racing-ultraleggera-17x7-4x100-et37-crystal-titanium": { newBp: "5x112" },
  "oz-racing-ultraleggera-18x7-4x100-et42-crystal-titanium": { newBp: "5x112" },
  "oz-racing-ultraleggera-17x7-4x108-et16-matt-black": { newBp: "5x112" },
  "oz-racing-ultraleggera-18x7-4x100-et42-matt-black": { newBp: "5x112" },
  "oz-racing-ultraleggera-17x7-4x108-et42-matt-bronze": { newBp: "5x112" },

  // 3) Genuine 4-lug photos:
  // - XXR 565 Flat Black / Gloss Black Lip (2 products: photo #397 has 4 bolt holes -> 4x100)
  // - Plus assign 4x98 to Sparco Trofeo 4 15x6 Gloss Bronze and Dezent TN 17x7 Black (both have 4-lug photos)
  "xxr-565-18x8-5-5x114-3-et20-flat-black-gloss-black-lip": { newBp: "4x100" },
  "xxr-565-20x9-5x114-3-et20-flat-black-gloss-black-lip": { newBp: "4x100" },
  "sparco-trofeo-4-15x6-4x100-et35-gloss-bronze": { newBp: "4x98" },
  "dezent-tn-17x7-4x108-et32-black": { newBp: "4x98" },

  // 4) Former 6x / 8x wheels whose photo clearly has 5 bolt holes -> 5-lug fitment
  "american-racing-ar23-15x7-6x139-7-et-6-satin-black-with-clearcoat": { newBp: "5x114.3" },
  "american-racing-ar23-16x8-8x170-et0-satin-black-with-clearcoat": { newBp: "5x127" },
  "black-rhino-boxer-18x8-5-6x139-7-et-12-gun-black": { newBp: "5x127" },
  "calibre-t-sport-18x7-5-6x120-et45-gunmetal": { newBp: "5x120" },
  "forgestar-f14-drag-17x9-5-6x135-et25-satin-black": { newBp: "5x114.3" },
  "oz-racing-challenge-hlt-18x11-6x114-3-et50-matt-black-white-lettering": { newBp: "5x130" },

  // 5) Former 5x / 8x wheels whose photo clearly has 6 bolt holes -> 6-lug fitment
  "black-rhino-chamber-20x9-5-5x127-et2-matte-black": { newBp: "6x139.7" },
  "black-rhino-warlord-17x8-5x114-3-et35-matte-black-with-machined-dark-tint-lip": { newBp: "6x114.3" },
  "black-rhino-warlord-18x8-5x120-et35-matte-black-with-machined-dark-tint-lip": { newBp: "6x120" },
  "black-rhino-warlord-17x9-8x180-et-12-matte-gunmetal": { newBp: "6x139.7" },
  "black-rhino-warlord-18x9-8x180-et-12-matte-gunmetal": { newBp: "6x139.7" },
  "dub-royalty-s209-24x9-5x135-et10-gloss-machined-double-dark-tint": { newBp: "6x135" },
  "fondmetal-768-primacy-20x9-5x114-3-et0-gloss-black": { newBp: "6x139.7" },
  "fondmetal-768-primacy-20x9-8x170-et18-glossy-black-milled": { newBp: "6x139.7" },
  "fondmetal-770-edge-17x9-5x127-et0-gloss-black": { newBp: "6x139.7" },
  "fondmetal-770-edge-17x9-5x127-et0-glossy-black-milled": { newBp: "6x139.7" },
  "fondmetal-770-edge-20x9-8x180-et18-glossy-black-milled": { newBp: "6x139.7" },
  "helo-he900-20x9-5x150-et0-gloss-black": { newBp: "6x139.7" },
  "method-315-street-17x8-5-8x180-et25-gold-black-lip": { newBp: "6x135" },
  "method-315-street-18x9-8x180-et18-gold-black-lip": { newBp: "6x139.7" },
  "method-316-street-17x8-5x108-et25-gloss-titanium": { newBp: "6x139.7" },
  "method-316-street-17x8-5x114-3-et25-matte-black": { newBp: "6x114.3" },
  "method-316-street-20x9-8x170-et18-gloss-black": { newBp: "6x120" },
  "method-703-bead-grip-17x8-5-8x170-et0-machined": { newBp: "6x139.7" },
  "pro-comp-series-05-torq-17x9-5x114-3-et-6-flat-black": { newBp: "6x139.7" },
  "pro-comp-series-05-torq-17x9-5x127-et-6-flat-black-machined": { newBp: "6x139.7" },
  "ultra-114-the-chief-18x9-5x139-7-et1-satin-black": { newBp: "6x139.7" },

  // 6) Former 5x / 6x wheels whose photo clearly has 8 bolt holes -> 8-lug fitment
  "black-rhino-abrams-20x9-5-5x127-et-18-gloss-gun-black-w-machined-dark-tint": { newBp: "8x180" },
  "black-rhino-abrams-18x9-5-5x127-et-18-matte-olive-drab-green": { newBp: "8x170" },
  "black-rhino-abrams-textured-18x9-5-6x135-et-18-matte-gunmetal": { newBp: "8x170" },
};

function replaceInString(str, replacements) {
  if (typeof str !== "string") return str;
  let out = str;
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  return out;
}

function applyFixToProduct(prod, fix) {
  const oldBp = prod.wheel.boltPattern;
  const newBp = fix.newBp;
  const dia = prod.wheel.diameter;
  const oldWidth = prod.wheel.width;
  const oldOffset = prod.wheel.offset;
  const oldCb = prod.wheel.centerBore;

  const replacements = [[oldBp, newBp]];

  if (fix.newWidth !== undefined && fix.newOffset !== undefined && fix.newCenterBore !== undefined) {
    const newWidth = fix.newWidth;
    const newOffset = fix.newOffset;
    const newCb = fix.newCenterBore;
    replacements.push(
      [`${dia}x${oldWidth}`, `${dia}x${newWidth}`],
      [`${oldWidth}J`, `${newWidth}J`],
      [`ET${oldOffset}`, `ET${newOffset}`],
      [`${oldCb} mm`, `${newCb} mm`]
    );
    prod.wheel.width = newWidth;
    prod.wheel.offset = newOffset;
    prod.wheel.centerBore = newCb;
  }

  prod.wheel.boltPattern = newBp;
  prod.name = replaceInString(prod.name, replacements);
  prod.shortDescription = replaceInString(prod.shortDescription, replacements);
  prod.description = replaceInString(prod.description, replacements);

  if (Array.isArray(prod.highlights)) {
    prod.highlights = prod.highlights.map((h) => replaceInString(h, replacements));
  }
  if (Array.isArray(prod.specs)) {
    prod.specs = prod.specs.map((s) => ({
      ...s,
      value: replaceInString(s.value, replacements),
    }));
  }
  if (prod.translations && typeof prod.translations === "object") {
    for (const tr of Object.values(prod.translations)) {
      if (!tr || typeof tr !== "object") continue;
      if (tr.name) tr.name = replaceInString(tr.name, replacements);
      if (tr.shortDescription) tr.shortDescription = replaceInString(tr.shortDescription, replacements);
      if (tr.description) tr.description = replaceInString(tr.description, replacements);
      if (Array.isArray(tr.highlights)) {
        tr.highlights = tr.highlights.map((h) => replaceInString(h, replacements));
      }
      if (Array.isArray(tr.specs)) {
        tr.specs = tr.specs.map((s) => ({
          ...s,
          value: replaceInString(s.value, replacements),
        }));
      }
    }
  }
  return prod;
}

const catalogPath = "/vercel/share/v0-project/lib/catalog/opening-catalog.json";
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

let updatedFileCount = 0;
for (const prod of catalog) {
  if (prod.category !== "wheels") continue;
  const fix = BOLT_PATTERN_FIXES[prod.slug];
  if (!fix) continue;
  applyFixToProduct(prod, fix);
  updatedFileCount++;
}
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log(`Updated ${updatedFileCount} wheels in lib/catalog/opening-catalog.json`);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  let updatedDbCount = 0;
  for (const [slug, fix] of Object.entries(BOLT_PATTERN_FIXES)) {
    const { rows } = await pool.query("SELECT data FROM products WHERE slug = $1", [slug]);
    if (rows.length === 0) {
      console.warn("Missing in DB:", slug);
      continue;
    }
    const updatedData = applyFixToProduct(rows[0].data, fix);
    await pool.query(
      "UPDATE products SET data = $1::jsonb, updated_at = NOW() WHERE slug = $2",
      [JSON.stringify(updatedData), slug]
    );
    updatedDbCount++;
  }
  console.log(`Updated ${updatedDbCount} wheels in Postgres products table`);

  // Verify distribution and image-lug consistency in Postgres:
  const { rows: bpCounts } = await pool.query(`
    SELECT data->'wheel'->>'boltPattern' AS bp, count(*)::int AS cnt
    FROM products
    WHERE category = 'wheels' AND archived = false
    GROUP BY bp
    ORDER BY bp
  `);
  console.log("Updated bolt pattern distribution:", bpCounts);

  const { rows: imgCheck } = await pool.query(`
    SELECT data->'images'->>0 AS img,
           array_agg(DISTINCT split_part(data->'wheel'->>'boltPattern', 'x', 1)) AS lug_counts,
           array_agg(DISTINCT data->'wheel'->>'boltPattern') AS bps
    FROM products
    WHERE category = 'wheels' AND archived = false
    GROUP BY img
  `);
  const crossLug = imgCheck.filter((r) => r.lug_counts.length > 1);
  console.log("Images shared across different lug counts after fix:", crossLug.length);
} finally {
  await pool.end();
}
