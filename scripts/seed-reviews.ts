// Seeds a few sample customer reviews (already approved) so the homepage
// testimonials section has real content to show. Safe to re-run: each
// review is upserted by `name`, so existing documents are updated in place
// instead of duplicated.
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { ReviewModel } from "../src/models/Review";

const reviews = [
  {
    name: "محمد",
    rating: 5,
    comment: "ارسال خیلی سریع بود و بسته‌بندی محصول هم عالی بود. حتماً باز هم خرید می‌کنم.",
    approved: true,
    ip: "seed",
  },
  {
    name: "امید",
    rating: 5,
    comment: "چند ساله از این فروشگاه خرید می‌کنم، کیفیت محصولات همیشه ثابت و قابل اعتماده.",
    approved: true,
    ip: "seed",
  },
  {
    name: "سالار",
    rating: 5,
    comment: "پشتیبانی سایت خیلی خوب جواب می‌ده و تا حالا هیچ مشکلی توی سفارش‌هام نداشتم.",
    approved: true,
    ip: "seed",
  },
  {
    name: "نیلوفر",
    rating: 4,
    comment: "کیفیت محصول خوب بود، فقط کاش تنوع طعم‌ها بیشتر می‌شد.",
    approved: true,
    ip: "seed",
  },
];

async function main() {
  await connectToDatabase();

  let count = 0;
  for (const review of reviews) {
    await ReviewModel.findOneAndUpdate({ name: review.name }, review, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
    count++;
  }

  console.log(`Seeded ${count} reviews.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
