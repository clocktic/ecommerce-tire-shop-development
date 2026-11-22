#!/usr/bin/env node
/**
 * Reprices brake SKUs that were above minimum US/EU market prices so every
 * brake product in the catalog sits cleanly below verified market floor prices.
 *
 * Usage:
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/catalog/reprice-brakes-below-market.mjs [--dry-run]
 */

import pg from "pg";

const DRY_RUN = process.argv.includes("--dry-run");

// New target prices in USD / EUR (cents) — every price verified below US/EU market min.
const PRICE_UPDATES_BY_MPN = {
  // ===== TBM BRAKES (ALL 24 SKUs — previously 5–142% above market min) =====
  // XS3 Extreme Street Kits (market min $1,399.99)
  "012-0334-1": { us: 129990, eu: 116990 },
  "012-0336-1": { us: 129990, eu: 116990 },
  "012-0209-1": { us: 129990, eu: 116990 },
  "012-0173B3-1": { us: 128990, eu: 115990 },
  // Sportsman HD F3 / F3X Drag Kits (market min $1,599.00)
  "001-0187C-HD-X": { us: 151990, eu: 136790 },
  "001-0218B3-HD": { us: 149990, eu: 134990 },
  "001-0173B3-HD": { us: 149990, eu: 134990 },
  "001-0220C-HD": { us: 149990, eu: 134990 },
  "001-0363-1": { us: 149990, eu: 134990 },
  "001-0270C-HD-X": { us: 151990, eu: 136790 },
  "001-0203C-HD": { us: 148990, eu: 133990 },
  "001-0203C-HD-X": { us: 150990, eu: 135890 },
  "001-0217A-HD": { us: 148990, eu: 133990 },
  "001-0219C-HD": { us: 148990, eu: 133990 },
  "001-0187C-HD": { us: 148990, eu: 133990 },
  // X-Series Rear Drag Kits (market min $1,499–$1,599)
  "001-0187A-X": { us: 144990, eu: 130490 },
  "001-0219B3-X": { us: 144990, eu: 130490 },
  "001-0203A-X": { us: 142990, eu: 128690 },
  // Full-Floater Drag Kits (market min $1,849 / $1,999 / $3,700)
  "001-0241D-1": { us: 174990, eu: 157490 },
  "001-0247D-1-Floater": { us: 189990, eu: 170990 },
  "001-0247-1-Floater": { us: 349990, eu: 314990 },
  // X-Series F8 Billet Calipers (market min $379.00)
  "002-0020XAP": { us: 34990, eu: 31490 },
  "002-0020XAP-1": { us: 34990, eu: 31490 },
  "002-0020XAP-2": { us: 34990, eu: 31490 },

  // ===== POWERSTOP (11 SKUs above Amazon/RockAuto market min) =====
  "K2009-36": { us: 18490, eu: 16690 },
  "K2010-36": { us: 17490, eu: 15790 },
  "KC2009-36": { us: 36990, eu: 33290 },
  "KC2010-36": { us: 34490, eu: 31090 },
  "K2069": { us: 18990, eu: 17090 },
  "K2070-Rear": { us: 15490, eu: 13990 },
  "Z36-2087": { us: 4990, eu: 4490 },
  "Z23-1792": { us: 4590, eu: 4190 },
  "AR85145XPR": { us: 8990, eu: 8090 },
  "AR85146XPR": { us: 8490, eu: 7690 },
  "JBR1784EVC": { us: 7990, eu: 7190 },

  // ===== BOSCH (ALL 26 SKUs — aligned below AutoDoc/RockAuto market min) =====
  // Brake Discs (market min €28.93–€69.47)
  "0 986 479 D26": { us: 6490, eu: 5890 },
  "0 986 478 885": { us: 3990, eu: 3590 },
  "0 986 479 A98": { us: 3690, eu: 3290 },
  "0 986 479 C21": { us: 2990, eu: 2690 },
  "0 986 479 736": { us: 3190, eu: 2890 },
  "0 986 479 566": { us: 2890, eu: 2590 },
  "0 986 479 364": { us: 2990, eu: 2690 },
  "0 986 479 142": { us: 3190, eu: 2890 },
  "0 986 478 853": { us: 2890, eu: 2590 },
  "0 986 478 810": { us: 2990, eu: 2690 },
  "0 986 479 224": { us: 3190, eu: 2890 },
  "0 986 479 B02": { us: 3190, eu: 2890 },
  "0 986 479 254": { us: 3290, eu: 2990 },
  "0 986 478 892": { us: 2890, eu: 2590 },
  // Brake Pads (market min €21.60–€34.33)
  "0 986 460 975": { us: 2790, eu: 2490 },
  "0 986 424 528": { us: 2790, eu: 2490 },
  "0 986 494 028": { us: 2990, eu: 2690 },
  "0 986 494 122": { us: 2990, eu: 2690 },
  "0 986 494 038": { us: 2190, eu: 1990 },
  "0 986 494 635": { us: 2990, eu: 2690 },
  "0 986 494 482": { us: 2290, eu: 2090 },
  "0 986 424 570": { us: 2890, eu: 2590 },
  "0 986 424 799": { us: 2290, eu: 2090 },
  "0 986 424 794": { us: 2190, eu: 1990 },
  "0 986 494 668": { us: 2490, eu: 2290 },
  "0 986 494 328": { us: 2190, eu: 1990 },

  // ===== WILWOOD (2 SKUs: 1 above US min + 1 EU price anomaly) =====
  "140-11017-DP": { us: 104990, eu: 94490 },
  "140-10209-D": { us: 70990, eu: 63890 },
};

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(
    `SELECT slug, data FROM products WHERE category = 'brakes' AND archived = false`,
  );

  let updated = 0;
  let totalDropUsd = 0;
  const summaryByBrand = {};

  for (const row of rows) {
    const d = row.data;
    const mpn = d.mpn;
    const target = PRICE_UPDATES_BY_MPN[mpn];
    if (!target) continue;

    const oldUs = Number(d.offers?.us?.priceCents ?? 0);
    const oldEu = Number(d.offers?.eu?.priceCents ?? 0);
    if (oldUs === target.us && oldEu === target.eu) continue;

    const nextOffers = {
      ...d.offers,
      us: { ...d.offers.us, priceCents: target.us },
      eu: { ...d.offers.eu, priceCents: target.eu },
    };
    // Clear compareAtCents if it would sit below the new price
    if (nextOffers.us.compareAtCents && nextOffers.us.compareAtCents <= target.us) {
      delete nextOffers.us.compareAtCents;
    }
    if (nextOffers.eu.compareAtCents && nextOffers.eu.compareAtCents <= target.eu) {
      delete nextOffers.eu.compareAtCents;
    }

    if (!DRY_RUN) {
      await pool.query(
        `UPDATE products
           SET data = jsonb_set(data, '{offers}', $1::jsonb, true),
               updated_at = NOW()
         WHERE slug = $2`,
        [JSON.stringify(nextOffers), row.slug],
      );
    }

    updated++;
    const drop = (oldUs - target.us) / 100;
    totalDropUsd += Math.max(0, drop);
    summaryByBrand[d.brand] = summaryByBrand[d.brand] || { count: 0, drops: [] };
    summaryByBrand[d.brand].count++;
    summaryByBrand[d.brand].drops.push({ mpn, oldUs: oldUs / 100, newUs: target.us / 100, oldEu: oldEu / 100, newEu: target.eu / 100 });
  }

  console.log(`Mode: ${DRY_RUN ? "DRY-RUN" : "APPLIED"}`);
  console.log(`Updated brake SKUs: ${updated} / ${rows.length}`);
  for (const [brand, info] of Object.entries(summaryByBrand)) {
    const avgPct =
      info.drops.reduce((acc, x) => acc + (x.oldUs > 0 ? ((x.oldUs - x.newUs) / x.oldUs) * 100 : 0), 0) /
      info.drops.length;
    console.log(`- ${brand}: ${info.count} SKUs updated (avg US reduction -${avgPct.toFixed(1)}%)`);
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
