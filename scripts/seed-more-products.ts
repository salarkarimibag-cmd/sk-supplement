// Seeds a few products for the categories added alongside the real
// (database-backed) site navigation: creatine, health-wellness, vitamins.
// Safe to re-run: each product is upserted by its `id`.
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { ProductModel } from "../src/models/Product";
import type { Product } from "../src/models/Product";

const products: Product[] = [
  {
    id: "c1",
    name: "کراتین مونوهیدرات",
    slug: "creatine-monohydrate",
    description: "",
    price: 890000,
    categorySlug: "creatine",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    rating: 5,
    reviewCount: 38,
    flavor: "بدون طعم",
    size: "۳۰۰ گرم",
  },
  {
    id: "c2",
    name: "کراتین میکرونیزه",
    slug: "creatine-micronized",
    description: "",
    price: 950000,
    categorySlug: "creatine",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    rating: 4,
    reviewCount: 19,
    flavor: "بدون طعم",
    size: "۳۰۰ گرم",
  },
  {
    id: "c3",
    name: "بوستر تستوسترون طبیعی",
    slug: "natural-testo-booster",
    description: "",
    price: 1190000,
    categorySlug: "creatine",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    rating: 4,
    reviewCount: 12,
    size: "۹۰ کپسول",
  },
  {
    id: "hw1",
    name: "آشواگاندا",
    slug: "ashwagandha",
    description: "",
    price: 790000,
    categorySlug: "health-wellness",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    rating: 5,
    reviewCount: 27,
    size: "۶۰ کپسول",
  },
  {
    id: "hw2",
    name: "سرکه سیب (کپسول)",
    slug: "apple-cider-vinegar-capsule",
    description: "",
    price: 590000,
    categorySlug: "health-wellness",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    rating: 4,
    reviewCount: 33,
    size: "۹۰ کپسول",
  },
  {
    id: "hw3",
    name: "امگا ۳ (روغن ماهی)",
    slug: "omega-3-fish-oil",
    description: "",
    price: 850000,
    categorySlug: "health-wellness",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    rating: 5,
    reviewCount: 21,
    size: "۶۰ کپسول",
  },
  {
    id: "v1",
    name: "مولتی ویتامین روزانه",
    slug: "daily-multivitamin",
    description: "",
    price: 690000,
    categorySlug: "vitamins",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    rating: 5,
    reviewCount: 44,
    size: "۶۰ قرص",
  },
  {
    id: "v2",
    name: "ویتامین D3 + K2",
    slug: "vitamin-d3-k2",
    description: "",
    price: 590000,
    categorySlug: "vitamins",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    rating: 5,
    reviewCount: 29,
    size: "۶۰ قطره",
  },
  {
    id: "v3",
    name: "ویتامین C",
    slug: "vitamin-c",
    description: "",
    price: 490000,
    categorySlug: "vitamins",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    rating: 4,
    reviewCount: 16,
    size: "۹۰ قرص جوشان",
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
