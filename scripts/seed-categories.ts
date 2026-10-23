// Loads category content (title/description/banner) into MongoDB. Safe to
// re-run: each category is upserted by its `slug`, so existing documents get
// updated in place instead of duplicated.
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { toSetAndUnset } from "../src/lib/mongoUpdate";
import { CategoryModel, type Category } from "../src/models/Category";

const categories: Category[] = [
  {
    slug: "protein",
    title: "پروتئین‌ها",
    description:
      "پروتئینی که برای سوخت‌رسانی به تمرین‌هایتان نیاز دارید را از محصولات SK Supplement تهیه کنید. طیف پودرها و شیک‌های پروتئینی ما برای هر برنامه‌ی تمرینی مناسب است.",
    // Photos: Unsplash (free licence). 1920x480 desktop crop + 1200x800 phone crop.
    bannerImage: "/images/collection-banner-protein.webp",
    bannerImageMobile: "/images/collection-banner-protein-mobile.webp",
    bannerAspect: "4 / 1",
  },
  {
    slug: "pre-workout",
    title: "پیش‌تمرین‌ها",
    description: "انرژی و تمرکز لازم برای بهترین عملکرد در باشگاه را با پیش‌تمرین‌های ما تجربه کنید.",
    bannerImage: "/images/collection-banner-pre-workout.webp",
    bannerImageMobile: "/images/collection-banner-pre-workout-mobile.webp",
    bannerAspect: "4 / 1",
  },
  {
    slug: "fat-burner",
    title: "چربی‌سوزها",
    description:
      "چربی بسوزانید و مسیر کاهش وزنتان را با مجموعه‌ی چربی‌سوزهای SK Supplement تقویت کنید. محصولات ما برای همراهی با رژیم غذایی و برنامه‌ی تمرینی‌تان طراحی شده‌اند.",
    bannerImage: "/images/collection-banner-fat-burner.webp",
    bannerImageMobile: "/images/collection-banner-fat-burner-mobile.webp",
    bannerAspect: "4 / 1",
  },
  {
    slug: "aminos",
    title: "آمینو اسیدها",
    description: "ریکاوری بهتر و عضله‌سازی موثرتر با آمینو اسیدهای ضروری بدن.",
    bannerImage: "/images/collection-banner-aminos.webp",
    bannerImageMobile: "/images/collection-banner-aminos-mobile.webp",
    bannerAspect: "4 / 1",
  },
  {
    slug: "creatine",
    title: "کراتین و عضله‌سازی",
    description:
      "افزایش قدرت، استقامت و حجم عضلانی با محصولات کراتین و عضله‌سازی SK Supplement.",
    // TODO: no dedicated banner image exists yet for this category; replace with real artwork.
    bannerImage: "/images/promo-banner.webp",
    bannerAspect: "4.8 / 1",
  },
  {
    slug: "health-wellness",
    title: "سلامت و تندرستی",
    description: "مکمل‌های روزمره برای حمایت از سلامت عمومی، گوارش و ایمنی بدن.",
    // TODO: no dedicated banner image exists yet for this category; replace with real artwork.
    bannerImage: "/images/promo-banner.webp",
    bannerAspect: "4.8 / 1",
  },
  {
    slug: "vitamins",
    title: "ویتامین‌ها",
    description: "ویتامین‌ها و مواد معدنی ضروری برای تکمیل رژیم غذایی روزانه‌ی شما.",
    // TODO: no dedicated banner image exists yet for this category; replace with real artwork.
    bannerImage: "/images/promo-banner.webp",
    bannerAspect: "4.8 / 1",
  },
];

async function main() {
  await connectToDatabase();

  let count = 0;
  for (const category of categories) {
    // toSetAndUnset turns `bannerImage: undefined` into $unset, so the old
    // banner path is removed from existing documents (Mongoose would skip it).
    await CategoryModel.findOneAndUpdate({ slug: category.slug }, toSetAndUnset({ ...category }), {
      upsert: true,
      setDefaultsOnInsert: true,
    });
    count++;
  }

  console.log(`Seeded ${count} categories.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
