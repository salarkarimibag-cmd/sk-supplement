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

// imageUrl is optional: products without a photo yet get the placeholder.
type BrandProduct = Omit<SeedProduct, "inStock" | "description" | "imageUrl" | "stock"> & {
  description?: string;
  imageUrl?: string;
};

const products: BrandProduct[] = [
  // Optimum Nutrition
  {
    id: "on1",
    name: "وی گلد استاندارد - Gold Standard 100% Whey",
    slug: "on-gold-standard-whey",
    imageUrl: "/images/products/on-gold-standard-whey.webp",
    brand: "Optimum Nutrition",
    price: 2450000,
    categorySlug: "protein",
  },
  {
    id: "on2",
    name: "کراتین میکرونیزه - Micronized Creatine Powder",
    slug: "on-micronized-creatine",
    brand: "Optimum Nutrition",
    price: 990000,
    categorySlug: "creatine",
  },
  {
    id: "on3",
    name: "مولتی ویتامین آقایان - Opti-Men",
    slug: "on-opti-men",
    brand: "Optimum Nutrition",
    price: 1150000,
    categorySlug: "vitamins",
  },

  // Dymatize
  {
    id: "dy1",
    name: "ایزو ۱۰۰ - وی ایزوله هیدرولیزه - ISO100",
    slug: "dymatize-iso100",
    brand: "Dymatize",
    price: 2890000,
    categorySlug: "protein",
  },
  {
    id: "dy2",
    name: "الیت کازئین - Elite Casein",
    slug: "dymatize-elite-casein",
    brand: "Dymatize",
    price: 2390000,
    categorySlug: "protein",
  },
  {
    id: "dy3",
    name: "سوپر ماس گینر - Super Mass Gainer",
    slug: "dymatize-super-mass-gainer",
    brand: "Dymatize",
    price: 2150000,
    categorySlug: "protein",
  },

  // MuscleTech
  {
    id: "mt1",
    name: "نایترو تک وی گلد - Nitro-Tech Whey Gold",
    slug: "muscletech-nitro-tech-whey-gold",
    flavor: "شکلات دوبل",
    size: "۲٫۲۷ کیلوگرم",
    imageUrl: "/images/products/muscletech-nitro-tech-whey-gold.webp",
    description:
      "پروتئین وی گورمه‌ی نایترو تک وی گلد مسل‌تک با طعم شکلات دوبل. طبق جلوی بسته، هر وعده ۲۴ گرم پروتئین، ۳ گرم کربوهیدرات و ۲٫۵ گرم چربی دارد. بسته‌ی ۲٫۲۷ کیلوگرمی (۵ پوند).",
    // Only the per-serving values printed on the front of the pack; the
    // serving size and full facts panel are on the back.
    nutritionFacts: [
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "کربوهیدرات", amount: "۳ گرم" },
      { label: "چربی", amount: "۲٫۵ گرم" },
    ],
    manufacturerClaims:
      "بهترین طعم در کلاس خود\nساخت آمریکا، از سال ۱۹۹۵\nمیکروفیلتراسیون سرد برتر\nکیفیت بالا و بسیار خالص",
    brand: "MuscleTech",
    price: 2250000,
    categorySlug: "protein",
  },
  {
    id: "mt6",
    name: "نایترو تک ریپد - Nitro-Tech Ripped",
    slug: "muscletech-nitro-tech-ripped",
    flavor: "براونی شکلاتی فاج",
    size: "۱٫۸۲ کیلوگرم",
    imageUrl: "/images/products/muscletech-nitro-tech-ripped.webp",
    description:
      "پروتئین وی کم‌چرب نایترو تک ریپد مسل‌تک با طعم براونی شکلاتی فاج، همراه با ماتریکس ریپد پلاس (۸۲۰ میلی‌گرم: ال-کارنیتین ال-تارترات، عصاره‌ی قهوه‌ی سبز، عصاره‌ی میوه‌ی نسترن و کلپ). هر اسکوپ (۴۳ گرم) ۳۰ گرم پروتئین و ۱۵۰ کالری دارد و بسته‌ی ۱٫۸۲ کیلوگرمی (۴ پوند) حدود ۴۳ وعده است.\nسایر مواد: ترکیب پروتئین (کنسانتره‌ی پروتئین وی، پروتئین وی هیدرولیزه، ایزوله‌ی پروتئین شیر، ایزوله‌ی پروتئین وی)، کاکائو (فرآوری‌شده با قلیا)، لسیتین سویا و/یا آفتابگردان، نمک، طعم‌دهنده‌های طبیعی و مصنوعی، ترکیب صمغ (گوار، صمغ عربی، زانتان)، دانه‌ی کتان، تری‌گلیسیریدهای با زنجیره‌ی متوسط، سوکرالوز و ربادیوزید A (از عصاره‌ی برگ استویا).",
    servingSize: "۱ اسکوپ (۴۳ گرم)",
    nutritionFacts: [
      { label: "کالری", amount: "۱۵۰" },
      { label: "چربی کل", amount: "۲٫۵ گرم" },
      { label: "چربی اشباع", amount: "۱٫۵ گرم" },
      { label: "کلسترول", amount: "۷۰ میلی‌گرم" },
      { label: "کربوهیدرات کل", amount: "۳ گرم" },
      { label: "فیبر غذایی", amount: "کمتر از ۱ گرم" },
      { label: "قندها", amount: "۲ گرم" },
      { label: "پروتئین", amount: "۳۰ گرم" },
      { label: "ویتامین C", amount: "۵ میلی‌گرم" },
      { label: "کلسیم", amount: "۳۲۰ میلی‌گرم" },
      { label: "آهن", amount: "۰٫۸ میلی‌گرم" },
      { label: "سدیم", amount: "۲۳۰ میلی‌گرم" },
      { label: "پتاسیم", amount: "۲۸۰ میلی‌گرم" },
      { label: "ال-کارنیتین ال-تارترات", amount: "۵۰۰ میلی‌گرم" },
      { label: "عصاره‌ی قهوه‌ی سبز (۴۵٪ کلروژنیک اسید)", amount: "۲۰۰ میلی‌گرم" },
      { label: "عصاره‌ی میوه‌ی نسترن (رزهیپ)", amount: "۱۰۰ میلی‌گرم" },
      { label: "کلپ (جلبک دریایی)", amount: "۲۰ میلی‌گرم" },
    ],
    usage:
      "۱ وعده (۱ اسکوپ) را در ۸ اونس (حدود ۲۴۰ میلی‌لیتر) آب سرد یا شیر بدون چربی مخلوط کنید و دو بار در روز، ۳۰ تا ۶۰ دقیقه قبل از دو وعده‌ی اصلی غذا مصرف کنید. برای بهترین نتیجه، به مدت ۶۰ روز همراه با رژیم غذایی و ورزش مصرف کنید.",
    warnings:
      "فقط برای بزرگسالان. در دوران بارداری و شیردهی مصرف نکنید. در صورت داشتن بیماری یا قبل از شروع هر رژیم غذایی یا برنامه‌ی ورزشی با پزشک مشورت کنید. رژیم‌های پروتئینی بسیار کم‌کالری (کمتر از ۴۰۰ کالری در روز) ممکن است باعث بیماری جدی یا مرگ شوند؛ بدون نظارت پزشک از این محصول برای کاهش وزن در چنین رژیم‌هایی استفاده نکنید. دور از دسترس کودکان نگه دارید. در محل خنک و خشک (۱۶ تا ۲۷ درجه‌ی سانتی‌گراد) نگهداری کنید و اگر بسته‌بندی دستکاری شده بود، مصرف نکنید.\nحساسیت‌زاها: حاوی شیر و سویا. در مجموعه‌ای تولید می‌شود که تخم‌مرغ، آجیل درختی، ماهی و صدف را هم فرآوری می‌کند.\nاین بیانیه‌ها توسط سازمان غذا و داروی آمریکا (FDA) ارزیابی نشده‌اند و این محصول برای تشخیص، درمان یا پیشگیری از هیچ بیماری‌ای نیست.",
    manufacturerClaims:
      "پروتئین کم‌چرب + کاهش وزن\n۲ برابر کاهش وزن (بر اساس مطالعه روی ماده‌ی کلیدی، نه خود محصول)\nدر دو مطالعه‌ی دوسوکور با دارونما، عصاره‌ی قهوه‌ی سبز به کاهش وزن کمک کرد: در مطالعه‌ی ۶۰ روزه، میانگین کاهش وزن ۱۰٫۹۵ پوند (حدود ۵ کیلوگرم) در برابر ۵٫۴ پوند (حدود ۲٫۴ کیلوگرم) گروه دارونما بود و در مطالعه‌ی ۸ هفته‌ای ۳٫۷ پوند (حدود ۱٫۷ کیلوگرم) در برابر ۱٫۲۵ پوند (حدود ۰٫۶ کیلوگرم)؛ هر دو گروه رژیم کم‌کالری داشتند\nعضله‌سازی بدون چربی و افزایش قدرت\nپروتئین خالص و طعم عالی",
    brand: "MuscleTech",
    price: 2150000,
    categorySlug: "protein",
  },
  {
    id: "mt7",
    name: "مولتی ویتامین پلاتینیوم - Platinum Multivitamin",
    slug: "muscletech-platinum-multivitamin",
    size: "۹۰ قرص",
    imageUrl: "/images/products/muscletech-platinum-multivitamin.webp",
    description:
      "مولتی ویتامین پلاتینیوم مسل‌تک برای ورزشکاران و افراد فعال. هر وعده (۳ قرص) ۱۸ ویتامین و ماده‌ی معدنی دارد و بسته‌ی ۹۰ قرصی ۳۰ وعده است.\nترکیب ماتریکس‌ها در هر وعده: ماتریکس حمایت آمینو (۸۱۶ میلی‌گرم): گلیسین ۸۰۶ میلی‌گرم و ال-متیونین، ال-سیترولین مالات، ال-آرژنین HCl و ال-سیستئین هر کدام ۲٫۵ میلی‌گرم. ماتریکس گیاهی (۴۰۱ میلی‌گرم): پودر برگ جینکو بیلوبا ۱۰۰، عصاره‌ی قهوه‌ی سبز ۱۰۰ (استانداردشده برای ۴۵٪ کلروژنیک اسید)، عصاره‌ی پوست انگور ۷۵، عصاره‌ی زردچوبه ۶۰، عصاره‌ی میوه‌ی نخل اره‌ای ۵۰، عصاره‌ی ریشه‌ی سرخارگل ۱۵ و اکتاکوسانول (از موم برنج) ۱٫۲۵ میلی‌گرم. کمپلکس حمایت مواد معدنی (۱۱۵ میلی‌گرم): پتاسیم کلرید ۶۸، کولین بیتارترات ۱۴، کولین دی‌هیدروژن سیترات ۱۳، اینوزیتول ۱۰ و بور ۱۰ میلی‌گرم. کمپلکس آنزیمی (۵۰ میلی‌گرم): آمیلاز و پاپائین هر کدام ۲۵ میلی‌گرم.\nفولات: ۵۱۰ میکروگرم DFE، معادل ۳۰۰ میکروگرم اسید فولیک.\nسایر مواد: سلولز میکروکریستالین، کروسکارملوز سدیم، استئاریک اسید، پوشش (پلی‌وینیل الکل، تالک، پلی‌اتیلن گلیکول، پلی‌سوربات ۸۰)، منیزیم استئارات و دی‌اکسید سیلیکون.",
    servingSize: "۳ قرص",
    // The pack lists 45 rows, more than the admin form accepts (40), so the
    // matrices appear here as totals and their parts are in the description.
    nutritionFacts: [
      { label: "کربوهیدرات کل", amount: "کمتر از ۱ گرم" },
      { label: "ویتامین A", amount: "۱۸۰۰ میکروگرم" },
      { label: "ویتامین C", amount: "۱۳۵ میلی‌گرم" },
      { label: "ویتامین D", amount: "۱۰ میکروگرم" },
      { label: "ویتامین E", amount: "۴۰٫۱ میلی‌گرم" },
      { label: "ویتامین B1 (تیامین)", amount: "۲۰٫۲ میلی‌گرم" },
      { label: "ویتامین B2 (ریبوفلاوین)", amount: "۱۳٫۳ میلی‌گرم" },
      { label: "ویتامین B3 (نیاسین)", amount: "۳۰ میلی‌گرم" },
      { label: "ویتامین B6", amount: "۱۰٫۲ میلی‌گرم" },
      { label: "فولات", amount: "۵۱۰ میکروگرم DFE" },
      { label: "ویتامین B12", amount: "۱۰۰ میکروگرم" },
      { label: "بیوتین", amount: "۱۶۵ میکروگرم" },
      { label: "ویتامین B5 (پانتوتنیک اسید)", amount: "۸۰ میلی‌گرم" },
      { label: "کولین", amount: "۱۰ میلی‌گرم" },
      { label: "کلسیم", amount: "۱۸۰ میلی‌گرم" },
      { label: "منیزیم", amount: "۱۴۵ میلی‌گرم" },
      { label: "روی", amount: "۱۳٫۳ میلی‌گرم" },
      { label: "مس", amount: "۱٫۰۵ میلی‌گرم" },
      { label: "منگنز", amount: "۲٫۲ میلی‌گرم" },
      { label: "مولیبدن", amount: "۱۰ میکروگرم" },
      { label: "سدیم", amount: "۲۰ میلی‌گرم" },
      { label: "پتاسیم", amount: "۴۰ میلی‌گرم" },
      { label: "ماتریکس حمایت آمینو", amount: "۸۱۶ میلی‌گرم" },
      { label: "ماتریکس گیاهی", amount: "۴۰۱ میلی‌گرم" },
      { label: "کمپلکس حمایت مواد معدنی", amount: "۱۱۵ میلی‌گرم" },
      { label: "کمپلکس آنزیمی", amount: "۵۰ میلی‌گرم" },
    ],
    usage: "روزانه ۱ وعده (۳ قرص) را با یک لیوان آب مصرف کنید.",
    warnings:
      "فقط برای بزرگسالان. در دوران بارداری و شیردهی مصرف نکنید. زنان در سن باروری باید مصرف روزانه‌ی ویتامین A را به ۳۰۰۰ میکروگرم (بدون احتساب بتاکاروتن) محدود کنند. ممکن است باعث گرگرفتگی و خارش شود. در حالت ناشتا مصرف نکنید. اگر سابقه‌ی سکته‌ی قلبی دارید، مصرف نکنید. در صورت داشتن بیماری یا قبل از شروع هر رژیم غذایی یا برنامه‌ی ورزشی با پزشک مشورت کنید. دور از دسترس کودکان نگه دارید. در محل خنک و خشک نگهداری کنید و اگر بسته‌بندی دستکاری شده بود، مصرف نکنید.\nحساسیت‌زاها: حاوی سویا و سولفیت. در مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، بادام‌زمینی، آجیل درختی، صدف، ماهی، گندم و کنجد را هم فرآوری می‌کند.\nاین بیانیه‌ها توسط سازمان غذا و داروی آمریکا (FDA) ارزیابی نشده‌اند و این محصول برای تشخیص، درمان یا پیشگیری از هیچ بیماری‌ای نیست.",
    manufacturerClaims:
      "حمایت تغذیه‌ای روزانه برای افراد فعال\nمولتی ویتامین کامل و پیشرفته، طراحی‌شده برای ورزشکاران حرفه‌ای و افراد فعال\n۱۰۰٪ یا بیشتر از نیاز روزانه به ویتامین‌های A، C، E، B6 و B12\nآنزیم‌ها و مواد معدنی\nحمایت از سیستم ایمنی با ویتامین C و روی (طبق تحقیقات نوظهور، ویتامین C و روی می‌توانند به عملکرد طبیعی سیستم ایمنی کمک کنند)",
    brand: "MuscleTech",
    price: 950000,
    categorySlug: "vitamins",
  },
  {
    id: "mt2g",
    name: "پلاتینیوم کراتین مونوهیدرات",
    slug: "muscletech-platinum-creatine-grape-freeze",
    groupSlug: "muscletech-platinum-creatine",
    flavor: "انگور",
    imageUrl: "/images/products/muscletech-platinum-creatine-grape-freeze.jpg",
    description:
      "کراتین مونوهیدرات میکرونیزه و بسیار خالص از مدل پلاتینیوم مسل‌تک با طعم انگور. هر وعده ۵ گرم کراتین مونوهیدرات دارد و در بسته‌ی ۳۹۲ گرمی ۶۰ وعده‌ای عرضه می‌شود.",
    manufacturerClaims:
      "افزایش ۶ پوند (حدود ۲٫۷ کیلوگرم) عضله در ۶ هفته\nمیکرونیزه و بسیار خالص\nحجم، قدرت و ریکاوری",
    servingSize: "۵ گرم",
    nutritionFacts: [{ label: "کراتین مونوهیدرات", amount: "۵ گرم" }],
    brand: "MuscleTech",
    price: 890000,
    categorySlug: "creatine",
  },
  {
    id: "mt2",
    name: "پلاتینیوم کراتین مونوهیدرات",
    slug: "muscletech-platinum-creatine",
    groupSlug: "muscletech-platinum-creatine",
    flavor: "بدون طعم",
    imageUrl: "/images/products/muscletech-platinum-creatine.webp",
    description:
      "کراتین مونوهیدرات میکرونیزه و بسیار خالص از مدل پلاتینیوم مسل‌تک. هر وعده ۵ گرم کراتین مونوهیدرات دارد و در بسته‌ی ۴۰۰ گرمی ۸۰ وعده‌ای عرضه می‌شود.",
    manufacturerClaims:
      "افزایش ۶ پوند (حدود ۲٫۷ کیلوگرم) عضله در ۶ هفته\nمیکرونیزه و بسیار خالص\nحجم، قدرت و ریکاوری",
    servingSize: "۵ گرم",
    nutritionFacts: [{ label: "کراتین مونوهیدرات", amount: "۵ گرم" }],
    brand: "MuscleTech",
    price: 890000,
    categorySlug: "creatine",
  },
  {
    id: "mt2o",
    name: "پلاتینیوم کراتین مونوهیدرات",
    slug: "muscletech-platinum-creatine-orange-splash",
    groupSlug: "muscletech-platinum-creatine",
    flavor: "پرتقال",
    imageUrl: "/images/products/muscletech-platinum-creatine-orange-splash.jpg",
    description:
      "کراتین مونوهیدرات میکرونیزه و بسیار خالص از مدل پلاتینیوم مسل‌تک با طعم پرتقال. هر وعده ۵ گرم کراتین مونوهیدرات دارد و در بسته‌ی ۳۹۷ گرمی ۶۰ وعده‌ای عرضه می‌شود.",
    manufacturerClaims:
      "افزایش ۶ پوند (حدود ۲٫۷ کیلوگرم) عضله در ۶ هفته\nمیکرونیزه و بسیار خالص\nحجم، قدرت و ریکاوری",
    servingSize: "۵ گرم",
    nutritionFacts: [{ label: "کراتین مونوهیدرات", amount: "۵ گرم" }],
    brand: "MuscleTech",
    price: 890000,
    categorySlug: "creatine",
  },
  {
    id: "mt2r",
    name: "پلاتینیوم کراتین مونوهیدرات",
    slug: "muscletech-platinum-creatine-red-berry",
    groupSlug: "muscletech-platinum-creatine",
    flavor: "توت قرمز",
    imageUrl: "/images/products/muscletech-platinum-creatine-red-berry.jpg",
    description:
      "کراتین مونوهیدرات میکرونیزه و بسیار خالص از مدل پلاتینیوم مسل‌تک با طعم توت قرمز. هر وعده ۵ گرم کراتین مونوهیدرات دارد و در بسته‌ی ۳۹۸ گرمی ۶۰ وعده‌ای عرضه می‌شود.",
    manufacturerClaims:
      "افزایش ۶ پوند (حدود ۲٫۷ کیلوگرم) عضله در ۶ هفته\nمیکرونیزه و بسیار خالص\nحجم، قدرت و ریکاوری",
    servingSize: "۵ گرم",
    nutritionFacts: [{ label: "کراتین مونوهیدرات", amount: "۵ گرم" }],
    brand: "MuscleTech",
    price: 890000,
    categorySlug: "creatine",
  },
  {
    id: "mt4",
    name: "سل‌تک کراتین - Cell-Tech Creatine",
    slug: "muscletech-cell-tech-creatine",
    flavor: "فروت پانچ",
    size: "۱٫۳۲ کیلوگرم",
    imageUrl: "/images/products/muscletech-cell-tech-creatine.webp",
    description:
      "سل‌تک کراتین مسل‌تک ترکیبی از کراتین مونوهیدرات، ماتریکس BCAA، آلفا لیپوئیک اسید و کربوهیدرات است. هر اسکوپ (۴۹ گرم) ۵ گرم کراتین مونوهیدرات دارد و بسته‌ی ۱٫۳۲ کیلوگرمی حدود ۲۷ وعده است.",
    manufacturerClaims:
      "ساخت ۳٫۳ پوند (حدود ۱٫۵ کیلوگرم) عضله‌ی بدون چربی در ۷ روز\nقدرت حداکثری",
    servingSize: "۱ اسکوپ (۴۹ گرم)",
    nutritionFacts: [
      { label: "کالری", amount: "۱۶۰" },
      { label: "کربوهیدرات کل", amount: "۳۸ گرم" },
      { label: "قندها", amount: "۱۵ گرم" },
      { label: "قند افزوده", amount: "۱۴ گرم" },
      { label: "ویتامین B6", amount: "۱٫۳ میلی‌گرم" },
      { label: "ویتامین B12", amount: "۲٫۴ میکروگرم" },
      { label: "سدیم", amount: "۳۰ میلی‌گرم" },
      { label: "کراتین مونوهیدرات", amount: "۵ گرم" },
      { label: "ال-لوسین", amount: "۵۰۰ میلی‌گرم" },
      { label: "ال-ایزولوسین", amount: "۲۵۰ میلی‌گرم" },
      { label: "ال-والین", amount: "۲۵۰ میلی‌گرم" },
      { label: "آلفا لیپوئیک اسید", amount: "۱۰۰ میلی‌گرم" },
      { label: "سناکتیو - Senactiv", amount: "۲۵ میلی‌گرم" },
    ],
    usage:
      "۱ اسکوپ را بلافاصله بعد از تمرین در ۶ اونس (حدود ۱۸۰ میلی‌لیتر) آب مخلوط کنید. در روزهای بدون تمرین، ۱ اسکوپ را صبح بعد از بیدار شدن مصرف کنید. در طول مصرف، هیدراتاسیون بدن را حفظ کنید.\nبرای نتیجه‌ی بهتر: ۲ اسکوپ را بلافاصله بعد از تمرین در ۱۲ اونس (حدود ۳۵۰ میلی‌لیتر) آب مخلوط کنید؛ در روزهای بدون تمرین، ۲ اسکوپ را صبح بعد از بیدار شدن مصرف کنید.\nبرای بهترین نتیجه (مرحله‌ی بارگیری): در ۷ روز اول، ۲ اسکوپ را صبح بعد از بیدار شدن در ۱۲ اونس آب و ۲ اسکوپ را بلافاصله بعد از تمرین در ۱۲ اونس آب مخلوط کنید. در روزهای بدون تمرین، ۲ اسکوپ صبح و ۲ اسکوپ دیگر در ادامه‌ی روز. مرحله‌ی نگهداری: ۲ اسکوپ را بلافاصله بعد از تمرین در ۱۲ اونس آب مخلوط کنید و در روزهای بدون تمرین، ۲ اسکوپ را صبح بعد از بیدار شدن مصرف کنید.",
    warnings:
      "برای افراد زیر ۱۸ سال مناسب نیست. در دوران بارداری و شیردهی مصرف نکنید. در صورت داشتن بیماری یا قبل از شروع هر رژیم غذایی یا برنامه‌ی ورزشی با پزشک مشورت کنید. در صورت بروز راش پوستی یا هر واکنش آلرژیک، مصرف را قطع کنید و به پزشک مراجعه کنید. دور از دسترس کودکان نگه دارید. در محل خنک و خشک (۱۶ تا ۲۷ درجه‌ی سانتی‌گراد) نگهداری کنید و اگر بسته‌بندی دستکاری شده بود، مصرف نکنید.\nحساسیت‌زاها: در مجموعه‌ای تولید می‌شود که شیر، سویا، بادام‌زمینی، گندم، آجیل درختی، تخم‌مرغ، ماهی، سخت‌پوستان و کنجد را هم فرآوری می‌کند.",
    brand: "MuscleTech",
    price: 1650000,
    categorySlug: "creatine",
  },
  {
    id: "mt5",
    // The trailing \u200E (left-to-right mark) keeps the "+" at the end of the
    // Latin name instead of letting right-to-left text move it to the front.
    name: "سل‌تک کراتین اچ‌سی‌ال پلاس - Cell-Tech Creatine HCl+\u200E",
    slug: "muscletech-cell-tech-creatine-hcl",
    flavor: "فروت پانچ اکستریم",
    size: "۲۵۷ گرم",
    imageUrl: "/images/products/muscletech-cell-tech-creatine-hcl.webp",
    description:
      "سل‌تک کراتین اچ‌سی‌ال پلاس مسل‌تک ترکیبی از کراتین هیدروکلراید (CON-CRĒT) و کراتین مونوهیدرات است. هر اسکوپ (۲ گرم) ۷۵۰ میلی‌گرم از هر کدام دارد و بدون کالری و قند است. بسته‌ی ۲۵۷ گرمی ۱۲۰ وعده است.\nسایر مواد: طعم‌دهنده‌های طبیعی و مصنوعی، اسید سیتریک، اسید مالیک، سوکرالوز، پودر آب چغندر (رنگ)، سیلیکات کلسیم، دی‌اکسید سیلیکون، بتاکاروتن (رنگ).",
    manufacturerClaims:
      "تقویت‌شده با CON-CRĒT، «شماره‌ی ۱ کراتین محلول»\nافزایش عضله و قدرت\nحلالیت بالا و مخلوط‌شدن آسان\nبدون نفخ، بدون کالری، بدون قند و بدون نیاز به دوره‌ی بارگیری\nبخشی از فروش هر بسته صرف تحقیقات علمی می‌شود",
    servingSize: "۱ اسکوپ (۲ گرم)",
    nutritionFacts: [
      { label: "کالری", amount: "۰" },
      { label: "کربوهیدرات کل", amount: "۰ گرم" },
      { label: "قندها", amount: "۰ گرم" },
      { label: "قند افزوده", amount: "۰ گرم" },
      { label: "کراتین هیدروکلراید - CON-CRĒT", amount: "۷۵۰ میلی‌گرم" },
      { label: "کراتین مونوهیدرات", amount: "۷۵۰ میلی‌گرم" },
    ],
    usage:
      "۱ وعده (۱ اسکوپ) را با ۶ تا ۸ اونس (حدود ۱۸۰ تا ۲۴۰ میلی‌لیتر) آب مخلوط کنید و دو بار در روز مصرف کنید. در روزهای تمرین، یکی از دو وعده را بلافاصله بعد از تمرین مصرف کنید. در طول مصرف، هیدراتاسیون بدن را حفظ کنید.",
    warnings:
      "برای افراد زیر ۱۸ سال مناسب نیست. در دوران بارداری و شیردهی مصرف نکنید. در صورت داشتن بیماری یا قبل از شروع هر رژیم غذایی یا برنامه‌ی ورزشی با پزشک مشورت کنید. دور از دسترس کودکان نگه دارید. در محل خنک و خشک (۱۶ تا ۲۷ درجه‌ی سانتی‌گراد) نگهداری کنید و اگر بسته‌بندی دستکاری شده بود، مصرف نکنید.\nحساسیت‌زاها: در مجموعه‌ای تولید می‌شود که بادام‌زمینی، آجیل درختی، شیر، سویا، گندم، تخم‌مرغ، ماهی، سخت‌پوستان و کنجد را هم فرآوری می‌کند.\n\nاین بیانیه‌ها توسط سازمان غذا و داروی آمریکا (FDA) ارزیابی نشده‌اند و این محصول برای تشخیص، درمان یا پیشگیری از هیچ بیماری‌ای نیست.",
    brand: "MuscleTech",
    price: 1250000,
    categorySlug: "creatine",
  },
  {
    id: "mt3",
    name: "هیدروکسی‌کات هاردکور - Hydroxycut Hardcore",
    slug: "muscletech-hydroxycut-hardcore",
    brand: "MuscleTech",
    price: 1190000,
    categorySlug: "fat-burner",
  },

  // BSN
  {
    id: "bsn1",
    name: "سینتا ۶ - Syntha-6",
    slug: "bsn-syntha-6",
    brand: "BSN",
    price: 2350000,
    categorySlug: "protein",
  },
  {
    id: "bsn2",
    name: "ان‌او اکسپلود - N.O.-Xplode",
    slug: "bsn-no-xplode",
    brand: "BSN",
    price: 1450000,
    categorySlug: "pre-workout",
  },
  {
    id: "bsn3",
    name: "آمینو ایکس - Amino X",
    slug: "bsn-amino-x",
    brand: "BSN",
    price: 1250000,
    categorySlug: "aminos",
  },

  // Cellucor
  {
    id: "ce1",
    name: "سی‌فور اورجینال - C4 Original",
    slug: "cellucor-c4-original",
    brand: "Cellucor",
    price: 1390000,
    categorySlug: "pre-workout",
  },
  {
    id: "ce2",
    name: "سوپر اچ‌دی - Super HD",
    slug: "cellucor-super-hd",
    brand: "Cellucor",
    price: 1290000,
    categorySlug: "fat-burner",
  },
  {
    id: "ce3",
    name: "آلفا آمینو - Alpha Amino",
    slug: "cellucor-alpha-amino",
    brand: "Cellucor",
    price: 1190000,
    categorySlug: "aminos",
  },

  // MyProtein
  {
    id: "mp1",
    name: "ایمپکت وی پروتئین - Impact Whey Protein",
    slug: "myprotein-impact-whey",
    brand: "MyProtein",
    price: 1650000,
    categorySlug: "protein",
  },
  {
    id: "mp2",
    name: "ایمپکت وی ایزوله - Impact Whey Isolate",
    slug: "myprotein-impact-whey-isolate",
    brand: "MyProtein",
    price: 2050000,
    categorySlug: "protein",
  },
  {
    id: "mp3",
    name: "کراتین مونوهیدرات - Creatine Monohydrate",
    slug: "myprotein-creatine-monohydrate",
    brand: "MyProtein",
    price: 750000,
    categorySlug: "creatine",
  },

  // Scitec Nutrition
  {
    id: "sc1",
    // \u200E (left-to-right mark) keeps "100%" with the Latin name that follows it.
    name: "وی پروتئین پروفشنال - \u200E100% Whey Protein Professional",
    slug: "scitec-whey-protein-professional",
    brand: "Scitec Nutrition",
    price: 2150000,
    categorySlug: "protein",
  },
  {
    id: "sc2",
    name: "جامبو - گینر حجم‌ساز - Jumbo",
    slug: "scitec-jumbo",
    brand: "Scitec Nutrition",
    price: 1950000,
    categorySlug: "protein",
  },
  {
    id: "sc3",
    name: "کراتین مونوهیدرات - Creatine Monohydrate",
    slug: "scitec-creatine-monohydrate",
    brand: "Scitec Nutrition",
    price: 820000,
    categorySlug: "creatine",
  },

  // Universal Nutrition
  {
    id: "un1",
    name: "انیمال پک - مولتی ویتامین ورزشی - Animal Pak",
    slug: "universal-animal-pak",
    brand: "Universal Nutrition",
    price: 1490000,
    categorySlug: "vitamins",
  },
  {
    id: "un2",
    name: "ریل گینز - گینر - Real Gains",
    slug: "universal-real-gains",
    brand: "Universal Nutrition",
    price: 2050000,
    categorySlug: "protein",
  },
  {
    id: "un3",
    name: "انیمال پامپ - پیش‌تمرین - Animal Pump",
    slug: "universal-animal-pump",
    brand: "Universal Nutrition",
    price: 1390000,
    categorySlug: "pre-workout",
  },

  // BPI Sports
  {
    id: "bpi1",
    name: "ایزو اچ‌دی - وی ایزوله - ISO HD",
    slug: "bpi-iso-hd",
    brand: "BPI Sports",
    price: 2250000,
    categorySlug: "protein",
  },
  {
    id: "bpi2",
    name: "بست بی‌سی‌ای‌ای - Best BCAA",
    slug: "bpi-best-bcaa",
    brand: "BPI Sports",
    price: 1150000,
    categorySlug: "aminos",
  },
  {
    id: "bpi3",
    name: "بست کراتین - Best Creatine",
    slug: "bpi-best-creatine",
    brand: "BPI Sports",
    price: 780000,
    categorySlug: "creatine",
  },

  // Evogen
  {
    id: "ev1",
    name: "ای‌وی‌پی ایکس‌اس - پیش‌تمرین - EVP-XS",
    slug: "evogen-evp-xs",
    brand: "Evogen",
    price: 1490000,
    categorySlug: "pre-workout",
  },
  {
    id: "ev2",
    name: "گلیکوفیوز - کربوهیدرات ریکاوری - Glycofuse",
    slug: "evogen-glycofuse",
    brand: "Evogen",
    price: 1350000,
    categorySlug: "aminos",
  },

  // NOW Foods
  {
    id: "nf1",
    name: "اولترا امگا ۳ - Ultra Omega-3",
    slug: "now-ultra-omega-3",
    brand: "NOW Foods",
    price: 920000,
    categorySlug: "health-wellness",
  },
  {
    id: "nf2",
    name: "منیزیم سیترات - Magnesium Citrate",
    slug: "now-magnesium-citrate",
    brand: "NOW Foods",
    price: 640000,
    categorySlug: "health-wellness",
  },
  {
    id: "nf3",
    name: "ویتامین D3 - Vitamin D-3",
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
    // Whatever an entry spells out (name, brand, photo, description, label
    // details, flavor...) is rewritten on every run. Price and stock are
    // insert-only so re-seeding never undoes an admin's edit of them, and
    // the empty description / placeholder photo are only filled in on
    // insert, so they never replace what an admin has set since.
    const { id, price, ...fields } = product;
    await ProductModel.findOneAndUpdate(
      { id },
      {
        $set: fields,
        $setOnInsert: {
          price,
          stock: 10,
          ...(fields.description === undefined ? { description: "" } : {}),
          ...(fields.imageUrl === undefined ? { imageUrl: "/images/placeholder.svg" } : {}),
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
