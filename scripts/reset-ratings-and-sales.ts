// One-off: clears the hand-entered ratings and review counts (ratings now
// come only from approved reviews) and fills in each product's salesCount
// from the orders that have already been paid. Safe to re-run: salesCount
// is recomputed from scratch each time. Dry run by default; pass --apply to
// write changes.
// Usage: npx tsx scripts/reset-ratings-and-sales.ts [--apply]
// Reads .env.local, so it targets MONGODB_DB from there (the dev database)
// unless MONGODB_DB is already set in the shell.
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { SOLD_ORDER_STATUSES } from "../src/lib/orderStatus";
import { OrderModel } from "../src/models/Order";
import { ProductModel } from "../src/models/Product";

async function main() {
  const apply = process.argv.includes("--apply");
  const connection = await connectToDatabase();
  console.log(`Database: ${connection.connection.name}${apply ? "" : " (dry run)"}`);

  const sold = await OrderModel.aggregate<{ _id: string; units: number }>([
    { $match: { status: { $in: SOLD_ORDER_STATUSES } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.productId", units: { $sum: "$items.quantity" } } },
  ]);
  const unitsByProduct = new Map(sold.map((row) => [row._id, row.units]));

  const products = await ProductModel.find(
    {},
    { id: 1, name: 1, rating: 1, reviewCount: 1, salesCount: 1 }
  ).lean<{ id: string; name: string; rating?: number; reviewCount?: number; salesCount?: number }[]>();

  let changed = 0;
  for (const product of products) {
    const salesCount = unitsByProduct.get(product.id) ?? 0;
    if (product.rating === 0 && product.reviewCount === 0 && product.salesCount === salesCount) {
      continue;
    }
    console.log(
      `${product.id} ${product.name}: rating ${product.rating ?? "-"} -> 0, ` +
        `reviews ${product.reviewCount ?? "-"} -> 0, sold ${product.salesCount ?? "-"} -> ${salesCount}`
    );
    changed++;
  }

  if (apply && products.length > 0) {
    await ProductModel.bulkWrite(
      products.map((product) => ({
        updateOne: {
          filter: { id: product.id },
          update: {
            $set: { rating: 0, reviewCount: 0, salesCount: unitsByProduct.get(product.id) ?? 0 },
          },
        },
      }))
    );
  }

  console.log(`${products.length} products, ${changed} ${apply ? "updated" : "to update"}.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Reset failed:", error);
  process.exit(1);
});
