// Removes every product of one brand, e.g. a brand the shop stops carrying.
// By default it only REPORTS what it would delete; pass --apply to delete.
// A product that appears in any order or review is never deleted.
//
//   npm run remove-brand-products -- "NOW Foods"          # dry run
//   npm run remove-brand-products -- "NOW Foods" --apply  # delete
//
// Also drop the brand's entries from the seed scripts, or the next seed run
// brings the products back.
//
// It loads .env.local, so it targets the dev database unless MONGODB_DB is
// set in the shell (run it against production only on purpose).
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { ProductModel } from "../src/models/Product";
import { OrderModel } from "../src/models/Order";
import { ReviewModel } from "../src/models/Review";

async function main() {
  const apply = process.argv.includes("--apply");
  const brand = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!brand) {
    console.error('Usage: npm run remove-brand-products -- "<brand>" [--apply]');
    process.exit(1);
  }

  await connectToDatabase();
  console.log(`Database: ${process.env.MONGODB_DB ?? "(default)"}\n`);

  const existing = await ProductModel.find({ brand }, { id: 1, name: 1 }).lean<
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

  console.log(`\n${deletable.length} of ${existing.length} "${brand}" products can be deleted.`);

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
