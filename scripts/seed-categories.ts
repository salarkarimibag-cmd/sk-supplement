// Loads category content (title/description/banner) into MongoDB. Safe to
// re-run: each category is upserted by its `slug`, so existing documents get
// updated in place instead of duplicated.
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { CategoryModel, type Category } from "../src/models/Category";

const categories: Category[] = [
  {
    slug: "protein",
    title: "پروتئین‌ها",
    description:
      "پروتئینی که برای سوخت‌رسانی به تمرین‌هایتان نیاز دارید را از محصولات SK Supplement تهیه کنید. طیف پودرها و شیک‌های پروتئینی ما برای هر برنامه‌ی تمرینی مناسب است.",
    bannerImage: "/images/collection-banner-protein.webp",
    bannerAspect: "4.8 / 1",
  },
  {
    slug: "pre-workout",
    title: "پیش‌تمرین‌ها",
    description: "انرژی و تمرکز لازم برای بهترین عملکرد در باشگاه را با پیش‌تمرین‌های ما تجربه کنید.",
    bannerImage: "/images/collection-banner-pre-workout.webp",
    bannerAspect: "4.8 / 1",
  },
  {
    slug: "fat-burner",
    title: "چربی‌سوزها",
    description:
      "چربی بسوزانید و مسیر کاهش وزنتان را با مجموعه‌ی چربی‌سوزهای SK Supplement تقویت کنید. محصولات ما برای همراهی با رژیم غذایی و برنامه‌ی تمرینی‌تان طراحی شده‌اند.",
    bannerImage: "/images/collection-banner-fat-burner.webp",
    bannerAspect: "4.8 / 1",
  },
  {
    slug: "aminos",
    title: "آمینو اسیدها",
    description: "ریکاوری بهتر و عضله‌سازی موثرتر با آمینو اسیدهای ضروری بدن.",
    bannerImage: "/images/collection-banner-aminos.webp",
    bannerAspect: "3 / 1",
  },
];

async function main() {
  await connectToDatabase();

  let count = 0;
  for (const category of categories) {
    await CategoryModel.findOneAndUpdate({ slug: category.slug }, category, {
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
