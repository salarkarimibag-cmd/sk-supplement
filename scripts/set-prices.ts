// Sets product prices (Toman) from a JSON file of { "<product id>": price }.
// The brand seed never changes the price of an existing product, so price
// lists go through this script instead.
//
// Usage:
//   npm run set-prices -- <prices.json>           # dry run: only prints changes
//   npm run set-prices -- <prices.json> --apply   # writes them
//
// Loads .env.local, so it hits the dev database unless MONGODB_DB is set.
process.loadEnvFile(".env.local");

import fs from "node:fs";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/lib/db";
import { ProductModel } from "../src/models/Product";

function readPrices(file: string): Map<string, number> {
  const data: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("The file must hold one object: { \"<product id>\": price }");
  }
  const prices = new Map<string, number>();
  for (const [id, price] of Object.entries(data)) {
    if (!Number.isInteger(price) || (price as number) <= 0) {
      throw new Error(`Price for "${id}" must be a positive whole number of Toman, got ${price}`);
    }
    prices.set(id, price as number);
  }
  return prices;
}

async function main() {
  const file = process.argv[2];
  const apply = process.argv.includes("--apply");
  if (!file || file.startsWith("--")) {
    console.error("Usage: npm run set-prices -- <prices.json> [--apply]");
    process.exit(1);
  }

  const prices = readPrices(file);
  await connectToDatabase();
  console.log(`Database: ${mongoose.connection.name}${apply ? "" : " (dry run, nothing is written)"}`);

  const products = await ProductModel.find({ id: { $in: [...prices.keys()] } }, { id: 1, price: 1 }).lean();
  const found = new Map(products.map((product) => [product.id, product.price]));

  let changed = 0;
  for (const [id, price] of prices) {
    const current = found.get(id);
    if (current === undefined) {
      console.log(`  ${id}: not in this database, skipped`);
      continue;
    }
    if (current === price) continue;
    console.log(`  ${id}: ${current.toLocaleString("en-US")} -> ${price.toLocaleString("en-US")}`);
    if (apply) await ProductModel.updateOne({ id }, { $set: { price } });
    changed++;
  }

  console.log(`${changed} price(s) ${apply ? "updated" : "would change"}; ${prices.size - changed} unchanged or skipped.`);
  if (!apply && changed > 0) console.log("Run again with --apply to write them.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
});
