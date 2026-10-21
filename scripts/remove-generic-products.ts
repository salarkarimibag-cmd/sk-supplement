// Removes the generic (brandless) seed products that the brand products
// replace. By default it only REPORTS what it would delete; pass --apply to
// delete. A product that appears in any order or review is never deleted.
//
//   npm run remove-generic-products            # dry run
//   npm run remove-generic-products -- --apply # delete
//
// It loads .env.local, so it targets the dev database unless MONGODB_DB is
// set in the shell (run it against production only on purpose).
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { ProductModel } from "../src/models/Product";
import { OrderModel } from "../src/models/Order";
import { ReviewModel } from "../src/models/Review";

// Brandless products that stay: no brand product covers them yet.
const KEPT_IDS = new Set(["a5", "a7", "c4", "hw4", "hw5"]);

const GENERIC_IDS = [
  "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9",
  "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9",
  "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9",
  "pw1", "pw2", "pw3", "pw4", "pw5", "pw6",
  "c1", "c2", "c3", "c4",
  "hw1", "hw2", "hw3", "hw4", "hw5", "hw6",
  "v1", "v2", "v3",
].filter((id) => !KEPT_IDS.has(id));

async function main() {
  const apply = process.argv.includes("--apply");
  await connectToDatabase();

  const existing = await ProductModel.find({ id: { $in: GENERIC_IDS } }, { id: 1, name: 1 }).lean<
    { id: string; name: string }[]
  >();

  const deletable: string[] = [];
  for (const product of existing) {
    const [orders, reviews] = await Promise.all([
      OrderModel.countDocuments({ "items.productId": product.id }),
      ReviewModel.countDocuments({ productId: product.id }),
    ]);
    if (orders > 0 || reviews > 0) {
      console.log(`KEEP   ${product.id} ${product.name} (orders: ${orders}, reviews: ${reviews})`);
    } else {
      console.log(`DELETE ${product.id} ${product.name}`);
      deletable.push(product.id);
    }
  }

  console.log(`\n${deletable.length} of ${existing.length} generic products can be deleted.`);

  if (!apply) {
    console.log("Dry run: nothing deleted. Re-run with --apply to delete.");
  } else {
    const result = await ProductModel.deleteMany({ id: { $in: deletable } });
    console.log(`Deleted ${result.deletedCount} products.`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
});
