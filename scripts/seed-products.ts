// Loads the mock catalog (src/data/catalog.ts) into MongoDB. Safe to re-run:
// each product is upserted by its `id`, so existing documents get updated
// in place instead of duplicated.
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { ProductModel } from "../src/models/Product";
import { productsBySlug } from "../src/data/catalog";

async function main() {
  await connectToDatabase();

  const products = Object.values(productsBySlug).flat();

  let count = 0;
  for (const product of products) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- drop the mock-only inStock field
    const { inStock, ...doc } = product;
    await ProductModel.findOneAndUpdate({ id: doc.id }, doc, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
    count++;
  }

  console.log(`Seeded ${count} products.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
