// Seeds flagship products from six well-known supplement brands so the
// brand field, card label and collection brand filter have real data.
// Safe to re-run: each product is upserted by its `id`.
//
// Prices are placeholders to be replaced from the admin panel; descriptions
// and label details (nutrition facts, usage) are left empty on purpose and
// should be filled in from the actual packaging, not guessed.
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { ProductModel } from "../src/models/Product";
import type { SeedProduct } from "../src/data/catalog";

type BrandProduct = Omit<SeedProduct, "inStock" | "description" | "imageUrl" | "stock">;

const products: BrandProduct[] = [
  // Optimum Nutrition
  {
    id: "on1",
    name: "وی گلد استاندارد (Gold Standard 100% Whey)",
    slug: "on-gold-standard-whey",
    brand: "Optimum Nutrition",
    price: 2450000,
    categorySlug: "protein",
  },
  {
    id: "on2",
    name: "کراتین میکرونیزه (Micronized Creatine Powder)",
    slug: "on-micronized-creatine",
    brand: "Optimum Nutrition",
    price: 990000,
    categorySlug: "creatine",
  },
  {
    id: "on3",
    name: "مولتی ویتامین آقایان (Opti-Men)",
    slug: "on-opti-men",
    brand: "Optimum Nutrition",
    price: 1150000,
    categorySlug: "vitamins",
  },

  // Dymatize
  {
    id: "dy1",
    name: "ایزو ۱۰۰ - وی ایزوله هیدرولیزه (ISO100)",
    slug: "dymatize-iso100",
    brand: "Dymatize",
    price: 2890000,
    categorySlug: "protein",
  },
  {
    id: "dy2",
    name: "الیت کازئین (Elite Casein)",
    slug: "dymatize-elite-casein",
    brand: "Dymatize",
    price: 2390000,
    categorySlug: "protein",
  },
  {
    id: "dy3",
    name: "سوپر ماس گینر (Super Mass Gainer)",
    slug: "dymatize-super-mass-gainer",
    brand: "Dymatize",
    price: 2150000,
    categorySlug: "protein",
  },

  // MuscleTech
  {
    id: "mt1",
    name: "نایترو تک وی (Nitro-Tech Whey)",
    slug: "muscletech-nitro-tech",
    brand: "MuscleTech",
    price: 2250000,
    categorySlug: "protein",
  },
  {
    id: "mt2",
    name: "پلاتینیوم کراتین (Platinum 100% Creatine)",
    slug: "muscletech-platinum-creatine",
    brand: "MuscleTech",
    price: 890000,
    categorySlug: "creatine",
  },
  {
    id: "mt3",
    name: "هیدروکسی‌کات هاردکور (Hydroxycut Hardcore)",
    slug: "muscletech-hydroxycut-hardcore",
    brand: "MuscleTech",
    price: 1190000,
    categorySlug: "fat-burner",
  },

  // BSN
  {
    id: "bsn1",
    name: "سینتا ۶ (Syntha-6)",
    slug: "bsn-syntha-6",
    brand: "BSN",
    price: 2350000,
    categorySlug: "protein",
  },
  {
    id: "bsn2",
    name: "ان‌او اکسپلود (N.O.-Xplode)",
    slug: "bsn-no-xplode",
    brand: "BSN",
    price: 1450000,
    categorySlug: "pre-workout",
  },
  {
    id: "bsn3",
    name: "آمینو ایکس (Amino X)",
    slug: "bsn-amino-x",
    brand: "BSN",
    price: 1250000,
    categorySlug: "aminos",
  },

  // Cellucor
  {
    id: "ce1",
    name: "سی‌فور اورجینال (C4 Original)",
    slug: "cellucor-c4-original",
    brand: "Cellucor",
    price: 1390000,
    categorySlug: "pre-workout",
  },
  {
    id: "ce2",
    name: "سوپر اچ‌دی (Super HD)",
    slug: "cellucor-super-hd",
    brand: "Cellucor",
    price: 1290000,
    categorySlug: "fat-burner",
  },
  {
    id: "ce3",
    name: "آلفا آمینو (Alpha Amino)",
    slug: "cellucor-alpha-amino",
    brand: "Cellucor",
    price: 1190000,
    categorySlug: "aminos",
  },

  // MyProtein
  {
    id: "mp1",
    name: "ایمپکت وی پروتئین (Impact Whey Protein)",
    slug: "myprotein-impact-whey",
    brand: "MyProtein",
    price: 1650000,
    categorySlug: "protein",
  },
  {
    id: "mp2",
    name: "ایمپکت وی ایزوله (Impact Whey Isolate)",
    slug: "myprotein-impact-whey-isolate",
    brand: "MyProtein",
    price: 2050000,
    categorySlug: "protein",
  },
  {
    id: "mp3",
    name: "کراتین مونوهیدرات (Creatine Monohydrate)",
    slug: "myprotein-creatine-monohydrate",
    brand: "MyProtein",
    price: 750000,
    categorySlug: "creatine",
  },

  // Scitec Nutrition
  {
    id: "sc1",
    name: "وی پروتئین پروفشنال (100% Whey Protein Professional)",
    slug: "scitec-whey-protein-professional",
    brand: "Scitec Nutrition",
    price: 2150000,
    categorySlug: "protein",
  },
  {
    id: "sc2",
    name: "جامبو - گینر حجم‌ساز (Jumbo)",
    slug: "scitec-jumbo",
    brand: "Scitec Nutrition",
    price: 1950000,
    categorySlug: "protein",
  },
  {
    id: "sc3",
    name: "کراتین مونوهیدرات (Creatine Monohydrate)",
    slug: "scitec-creatine-monohydrate",
    brand: "Scitec Nutrition",
    price: 820000,
    categorySlug: "creatine",
  },

  // Universal Nutrition
  {
    id: "un1",
    name: "انیمال پک - مولتی ویتامین ورزشی (Animal Pak)",
    slug: "universal-animal-pak",
    brand: "Universal Nutrition",
    price: 1490000,
    categorySlug: "vitamins",
  },
  {
    id: "un2",
    name: "ریل گینز - گینر (Real Gains)",
    slug: "universal-real-gains",
    brand: "Universal Nutrition",
    price: 2050000,
    categorySlug: "protein",
  },
  {
    id: "un3",
    name: "انیمال پامپ - پیش‌تمرین (Animal Pump)",
    slug: "universal-animal-pump",
    brand: "Universal Nutrition",
    price: 1390000,
    categorySlug: "pre-workout",
  },

  // NOW Foods
  {
    id: "nf1",
    name: "اولترا امگا ۳ (Ultra Omega-3)",
    slug: "now-ultra-omega-3",
    brand: "NOW Foods",
    price: 920000,
    categorySlug: "health-wellness",
  },
  {
    id: "nf2",
    name: "منیزیم سیترات (Magnesium Citrate)",
    slug: "now-magnesium-citrate",
    brand: "NOW Foods",
    price: 640000,
    categorySlug: "health-wellness",
  },
  {
    id: "nf3",
    name: "ویتامین D3 (Vitamin D-3)",
    slug: "now-vitamin-d3",
    brand: "NOW Foods",
    price: 540000,
    categorySlug: "vitamins",
  },
];

async function main() {
  await connectToDatabase();

  let count = 0;
  for (const product of products) {
    // $setOnInsert keeps what an admin may have edited later (description,
    // image, price, stock); only the identity fields are rewritten on re-run.
    const { id, name, slug, brand, categorySlug, ...insertOnly } = product;
    await ProductModel.findOneAndUpdate(
      { id },
      {
        $set: { name, slug, brand, categorySlug },
        $setOnInsert: {
          ...insertOnly,
          description: "",
          imageUrl: "/images/placeholder.svg",
          stock: 10,
        },
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
    count++;
  }

  console.log(`Seeded ${count} brand products.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
