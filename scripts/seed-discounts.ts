// Seeds a couple of sample discount codes to test checkout with. Safe to
// re-run: each code is upserted by `code`, so existing documents are
// updated in place instead of duplicated.
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { DiscountCodeModel } from "../src/models/DiscountCode";

const discountCodes = [
  { code: "WELCOME10", type: "percent", value: 10, active: true },
  { code: "SK50000", type: "fixed", value: 50000, active: true },
];

async function main() {
  await connectToDatabase();

  let count = 0;
  for (const discount of discountCodes) {
    await DiscountCodeModel.findOneAndUpdate({ code: discount.code }, discount, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
    count++;
  }

  console.log(`Seeded ${count} discount codes.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
