// Seeds the brandless products that no brand product covers yet: ZMA
// (creatine category), electrolyte and collagen (health-wellness).
// Safe to re-run: each product is upserted by its `id`.
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { ProductModel } from "../src/models/Product";
import type { SeedProduct } from "../src/data/catalog";

const products: Omit<SeedProduct, "inStock">[] = [
  {
    id: "c4",
    name: "ZMA - ریکاوری و خواب",
    slug: "zma-recovery",
    description: "",
    price: 690000,
    categorySlug: "creatine",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    size: "۹۰ کپسول",
  },
  {
    id: "hw4",
    name: "پودر الکترولیت و ایزوتونیک",
    slug: "electrolyte-isotonic",
    description: "",
    price: 520000,
    categorySlug: "health-wellness",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    flavor: "لیمو",
    size: "۳۰ وعده",
  },
  {
    id: "hw5",
    name: "کلاژن هیدرولیزه",
    slug: "hydrolyzed-collagen",
    description: "",
    price: 880000,
    categorySlug: "health-wellness",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    flavor: "بدون طعم",
    size: "۳۰ وعده",
  },
];

async function main() {
  await connectToDatabase();

  let count = 0;
  for (const product of products) {
    await ProductModel.findOneAndUpdate({ id: product.id }, product, {
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
