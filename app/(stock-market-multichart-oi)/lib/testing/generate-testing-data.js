/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const DAYS = 100;
const ROWS_PER_DAY = 100;
const STRIKE_START = 130000;
const STRIKE_END = 190000;
const STRIKE_STEP = 5000;
const OUTPUT_FILE = path.join(
  process.cwd(),
  "app/(stock-market-multichart-oi)/lib/testing/testing-data.ts"
);

let seed = 123;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const strikes = [];
for (let s = STRIKE_START; s <= STRIKE_END; s += STRIKE_STEP) strikes.push(s);

const rows = [];
const base = new Date();
base.setUTCHours(0, 0, 0, 0);
base.setUTCDate(base.getUTCDate() - (DAYS - 1));

for (let d = 0; d < DAYS; d++) {
  const dayStart = new Date(base.getTime() + d * 24 * 60 * 60 * 1000);
  for (let i = 0; i < ROWS_PER_DAY; i++) {
    const ts = new Date(dayStart.getTime() + (i * 24 * 60 * 60 * 1000) / ROWS_PER_DAY);
    const datahc = strikes.map((s) => {
      const call_oi = Math.max(
        0,
        Math.floor(350 + (s - STRIKE_START) / 180 + d * 3 + i + randInt(-25, 25))
      );
      const put_oi = Math.max(
        0,
        Math.floor(380 + (STRIKE_END - s) / 200 + d * 3 + i + randInt(-25, 25))
      );
      const change_pct = Math.round((rand() * 90 - 45) * 100) / 100;
      const call_oi_change = randInt(-15, 25);
      const put_oi_change = randInt(-15, 25);
      return [s, call_oi, put_oi, change_pct, call_oi_change, put_oi_change];
    });

    const atm = 160000 + Math.floor(300 * (rand() * 2 - 1));
    const spot = atm + Math.floor(120 * (rand() - 0.5));
    const fut = atm + Math.floor(120 * (rand() - 0.3));
    rows.push({
      symbol: "GOLDM",
      atm,
      spot_price: spot,
      future_price: fut,
      snapshot_at: ts.toISOString(),
      datahc,
    });
  }
}

const out = `import type { GoldmCurrentOptionChainDatahcRow } from \"@/app/(stock-market-multichart-oi)/types/goldm-current-option-chain\";\n\nexport type GoldmSnapshotRow = {\n  symbol: \"GOLDM\";\n  atm: number;\n  spot_price: number;\n  future_price: number;\n  snapshot_at: string;\n  datahc: GoldmCurrentOptionChainDatahcRow[];\n};\n\nexport const testingSnapshots: GoldmSnapshotRow[] = ${JSON.stringify(
  rows,
  null,
  2
)};\n`;

fs.writeFileSync(OUTPUT_FILE, out, "utf8");
console.log(`Wrote ${rows.length} snapshots to ${OUTPUT_FILE}`);
