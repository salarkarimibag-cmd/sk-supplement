// Fills in each seeded product's description from src/data/productDescriptions.ts.
// Only products whose description is still empty are touched, so anything
// already written from the admin panel is never overwritten. Safe to re-run.
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { ProductModel } from "../src/models/Product";
import { productDescriptions } from "../src/data/productDescriptions";

async function main() {
  await connectToDatabase();

  let count = 0;
  for (const [id, description] of Object.entries(productDescriptions)) {
    const result = await ProductModel.updateOne(
      { id, $or: [{ description: "" }, { description: { $exists: false } }] },
      { $set: { description } }
    );
    count += result.modifiedCount;
  }

  console.log(`Updated ${count} product descriptions.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
