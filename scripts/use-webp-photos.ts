// Points products at the transparent .webp version of their photo, for
// photos that were first added as .jpg/.png with a solid background. A
// product only switches when public/<same name>.webp exists. By default it
// only REPORTS what it would change; pass --apply to update.
//
//   npm run use-webp-photos            # dry run
//   npm run use-webp-photos -- --apply # update
//
// Run it against production only after the .webp files are deployed, or
// the products show a broken image until they are. It loads .env.local, so
// it targets the dev database unless MONGODB_DB is set in the shell.
process.loadEnvFile(".env.local");

import { existsSync } from "node:fs";
import { connectToDatabase } from "../src/lib/db";
import { ProductModel } from "../src/models/Product";

async function main() {
  const apply = process.argv.includes("--apply");
  await connectToDatabase();
  console.log(`Database: ${process.env.MONGODB_DB ?? "(default)"}\n`);

  const products = await ProductModel.find(
    { imageUrl: { $regex: /\.(jpe?g|png)$/i } },
    { id: 1, imageUrl: 1 }
  ).lean<{ id: string; imageUrl: string }[]>();

  let changes = 0;
  for (const product of products) {
    const webpUrl = product.imageUrl.replace(/\.(jpe?g|png)$/i, ".webp");
    if (!existsSync(`public${webpUrl}`)) {
      console.log(`SKIP   ${product.id} ${product.imageUrl} (no ${webpUrl})`);
      continue;
    }
    console.log(`UPDATE ${product.id} ${product.imageUrl} -> ${webpUrl}`);
    changes++;
    if (apply) {
      await ProductModel.updateOne({ id: product.id }, { $set: { imageUrl: webpUrl } });
    }
  }

  console.log(`\n${changes} product(s) ${apply ? "updated" : "would be updated"}.`);
  if (!apply && changes > 0) console.log("Dry run: nothing changed. Re-run with --apply to update.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
});
