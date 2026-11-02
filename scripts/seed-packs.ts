// Seeds the combo packs and their category. Safe to re-run: both are upserted,
// by `slug` and `id`.
//
// A pack is an ordinary product, so the cart, checkout and orders treat it
// like any other, with its own price. Its stock is only a limit on how many to
// sell: selling one also takes one of each product inside out of stock, and it
// sells out when any of them does (see packStock and expandStockLines).
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { PACKS_CATEGORY } from "../src/lib/packs";
import { CategoryModel } from "../src/models/Category";
import { ProductModel, type Product } from "../src/models/Product";

type SeedPack = Pick<
  Product,
  "id" | "name" | "slug" | "description" | "price" | "imageUrl"
> & { packProductIds: string[] };

// Photos are the products' own, arranged together. Prices are about 10% under
// the products' prices at the time, and can be changed from the admin panel.
const packs: SeedPack[] = [
  {
    id: "pack-energy",
    name: "پک انرژی تمرین",
    slug: "pack-energy",
    description:
      "پیش‌تمرین سی‌فور، کراتین مای‌پروتئین و بی‌سی‌ای‌ای همراه با گلوتامین سایتک، در یک پک. برای کسانی که هر سه را در برنامه‌ی تمرینی‌شان دارند و می‌خواهند یک‌جا تهیه کنند.",
    price: 2910000,
    imageUrl: "/images/products/pack-energy.webp",
    packProductIds: ["ce1", "mp3", "sc5"],
  },
  {
    id: "pack-muscle",
    name: "پک عضله‌سازی",
    slug: "pack-muscle",
    description:
      "پروتئین وی گلد استاندارد، کراتین میکرونیزه و مولتی‌ویتامین اپتی‌من از اپتیموم نوتریشن، در یک پک. برای کسانی که برنامه‌ی تمرین قدرتی دارند و سه مکمل پایه را یک‌جا می‌خواهند.",
    price: 4130000,
    imageUrl: "/images/products/pack-muscle.webp",
    packProductIds: ["on1", "on2", "on3"],
  },
  {
    id: "pack-cut",
    name: "پک کات",
    slug: "pack-cut",
    description:
      "وی ایزوله‌ی ایزو ۱۰۰، چربی‌سوز هیدروکسی‌کات و آمینو بیلد، در یک پک. برای دوره‌ی کات، در کنار رژیم غذایی و تمرین منظم. پیش از مصرف چربی‌سوز، هشدارهای صفحه‌ی آن را بخوانید.",
    price: 4700000,
    imageUrl: "/images/products/pack-cut.webp",
    packProductIds: ["dy1", "mt3", "mt12"],
  },
  {
    id: "pack-mass",
    name: "پک افزایش وزن",
    slug: "pack-mass",
    description:
      "گینر سریوس مس، کراتین خالص بادی اتک و گلوتامین مای‌پروتئین، در یک پک. برای دوره‌ی حجم، کنار غذای کافی و تمرین منظم.",
    price: 4860000,
    imageUrl: "/images/products/pack-mass.webp",
    packProductIds: ["on4", "ba1", "mp7"],
  },
];

async function main() {
  await connectToDatabase();

  await CategoryModel.findOneAndUpdate({ slug: PACKS_CATEGORY.slug }, PACKS_CATEGORY, {
    upsert: true,
    setDefaultsOnInsert: true,
  });

  for (const { id, price, ...fields } of packs) {
    // Price and stock are insert-only, as in seed-brand-products: re-seeding
    // never undoes an admin's edit of them.
    await ProductModel.findOneAndUpdate(
      { id },
      {
        $set: { ...fields, categorySlug: PACKS_CATEGORY.slug },
        $setOnInsert: { price, stock: 10 },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${packs.length} packs.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
