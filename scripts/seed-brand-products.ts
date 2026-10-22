// Seeds flagship products from well-known supplement brands so the brand
// field, card label and collection brand filter have real data.
// Safe to re-run: each product is upserted by its `id`.
//
// Prices are placeholders to be replaced from the admin panel. Descriptions
// and label details (nutrition facts, usage, warnings, claims) are filled in
// only from photos of the actual packaging, never guessed; products without
// readable label photos keep them empty.
process.loadEnvFile(".env.local");

import { connectToDatabase } from "../src/lib/db";
import { ProductModel } from "../src/models/Product";
import type { SeedProduct } from "../src/data/catalog";

// imageUrl is optional: products without a photo yet get the placeholder.
type BrandProduct = Omit<SeedProduct, "inStock" | "description" | "imageUrl" | "stock"> & {
  description?: string;
  imageUrl?: string;
};

// Shared by every Gold Standard 100% Whey flavour: ON's German shop gives
// the same whey blend, directions, allergen note and claims for all of them.
const onGoldStandardBlend =
  "ایزوله‌ی پروتئین وی، کنسانتره‌ی پروتئین وی، ایزوله‌ی هیدرولیزه‌ی پروتئین وی (از شیر)، امولسیفایر لسیتین سویا";
const onGoldStandardUsage = (scoopGrams: string) =>
  `۱ اسکوپ (${scoopGrams} گرم) را در ۱۸۰ تا ۲۴۰ میلی‌لیتر آب سرد بریزید و با مخلوط‌کن، شیکر یا قاشق هم بزنید تا کاملاً حل شود. بعد از تمرین، بین وعده‌های غذایی یا در طول روز برای رسیدن به پروتئین روزانه مصرف کنید.\nپس از باز کردن، درِ ظرف را محکم ببندید و در جای خنک و خشک نگهداری کنید.`;
const onGoldStandardWarnings =
  "حساسیت‌زاها: حاوی شیر و سویا. ممکن است حاوی گلوتن، تخم‌مرغ، آجیل و بادام‌زمینی باشد.";
const onGoldStandardClaims =
  "۲۴ گرم پروتئین وی در هر وعده\nکمتر از ۱۲۰ کالری در هر وعده\n۵٫۵ گرم BCAA طبیعی در هر وعده\n۱۰۰٪ پروتئین آن از وی است\nپروتئین در کنار تمرین قدرتی منظم به رشد و حفظ توده‌ی عضلانی کمک می‌کند (ادعای سلامت مورد تأیید اتحادیه‌ی اروپا)";

// Shared by every Micronised Creatine Powder variant on ON's German shop.
const onCreatineWarnings =
  "برای افراد زیر ۱۸ سال مناسب نیست.\nمکمل غذایی جایگزین رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم نیست.\nاز مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.\nدر جای خنک و خشک و دور از دسترس کودکان نگهداری شود.\nممکن است حاوی شیر، سویا، گلوتن، تخم‌مرغ، آجیل و بادام‌زمینی باشد.";
const onCreatineClaims =
  "۳ گرم کراتین در هر وعده\nکراتین میکرونیزه: ذرات ریزتر برای حل‌شدن بهتر و ماندن بیشتر در مایع\nکراتین عملکرد بدنی را در تمرین‌های کوتاه‌مدت، پرشدت و پشت‌سرهم افزایش می‌دهد؛ این اثر با مصرف روزانه‌ی ۳ گرم کراتین به دست می‌آید (ادعای سلامت مورد تأیید اتحادیه‌ی اروپا)";

// Shared by both Opti-Men counts (90 and 180 tablets have the same label).
const onOptiMenIngredients =
  "مواد تشکیل‌دهنده: پرکننده (سلولز میکروکریستالی)، مخلوط اسیدهای آمینه‌ی شاخه‌دار (ال-لوسین، ال-ایزولوسین، ال-والین)، کربنات کلسیم، اسید اسکوربیک (ویتامین C)، ال-گلوتامین، اکسید منیزیم، ضدکلوخه (دی‌اکسید سیلیکون، اسیدهای چرب خوراکی، نمک‌های منیزیم اسیدهای چرب)، دی-آلفا-توکوفریل استات (ویتامین E)، پوشش (هیدروکسی‌پروپیل متیل‌سلولز، گلیسرین)، نیکوتین‌آمید (ویتامین B3)، پایدارکننده (کراس‌کارملوز سدیم)، آلفا-لیپوئیک اسید، روتین، کلسیم دی-پانتوتنات (ویتامین B5)، عصاره‌ی ریشه‌ی زنجبیل، عصاره‌ی برگ زیتون، عصاره‌ی برگ چای سبز، بیوفلاونوئیدهای مرکبات، بورات سدیم، اکسید روی، اینوزیتول، کولین بیتارترات، پیریدوکسین هیدروکلراید (ویتامین B6)، ال-سلنومتیونین، تیامین هیدروکلراید (ویتامین B1)، سولفات مس، کوله‌کلسیفرول (ویتامین D3)، ریبوفلاوین (ویتامین B2)، رتینیل استات (ویتامین A)، کلرید کروم، لوتئین، فیلوکینون (ویتامین K1)، سیانوکوبالامین (ویتامین B12)، پیکولینات کروم، مولیبدات سدیم، دی-بیوتین، یدید پتاسیم و فولیک اسید.";
const onOptiMenWarnings =
  "هر دوز روزانه ۲ میلی‌گرم اپی‌گالوکاتچین گالات (EGCG، از عصاره‌ی چای سبز) دارد؛ حداکثر مصرف روزانه‌ی EGCG ۸۰۰ میلی‌گرم است. ناشتا یا همراه محصولات دیگر حاوی چای سبز مصرف نکنید.\nبرای افراد زیر ۱۸ سال و زنان باردار یا شیرده مناسب نیست.\nمکمل غذایی جایگزین رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم نیست.\nاز مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.\nدر جای خنک و خشک و دور از دسترس کودکان نگهداری شود.";
const onOptiMenClaims =
  "۳۶ ماده‌ی مؤثر\nحمایت از متابولیسم و عملکرد سیستم ایمنی\nکاهش خستگی\nادعاهای سلامت مورد تأیید اتحادیه‌ی اروپا: تیامین، نیاسین، پانتوتنیک اسید و ویتامین‌های B6 و B12 به متابولیسم طبیعی تولید انرژی کمک می‌کنند؛ بیوتین، روی و کروم به متابولیسم طبیعی درشت‌مغذی‌ها کمک می‌کنند؛ روی به عملکرد طبیعی سیستم ایمنی و عملکرد شناختی طبیعی کمک می‌کند؛ ویتامین‌های C، B2، B3، B5، B12 و فولیک اسید به کاهش خستگی کمک می‌کنند؛ منیزیم به عملکرد طبیعی عضلات کمک می‌کند؛ پانتوتنیک اسید به عملکرد ذهنی طبیعی کمک می‌کند";

// Shared by every Serious Mass flavour and size on ON's UK shop.
const onSeriousMassMicronutrients =
  "مواد معدنی (منیزیم، آهن، روی، منگنز، فلوراید، سلنیوم، ید (از جلبک کلپ)، مس، مولیبدن، کروم)، ویتامین‌ها (C، E، B3، A، پانتوتنیک اسید (B5)، بیوتین، B12، فولیک اسید، D، B6، B1، K، B2)";
const onSeriousMassUsage = (servingGrams: string) =>
  `۲ اسکوپ سرپر (حدود ${servingGrams} گرم) را در مخلوط‌کنی که ۷۱۰ میلی‌لیتر آب دارد بریزید و ۳۰ تا ۴۵ ثانیه مخلوط کنید. بعد از تمرین (تا ۳۰ دقیقه)، بین وعده‌های غذایی یا پیش از خواب مصرف کنید.\nپس از باز کردن، درِ ظرف را محکم ببندید و در جای خنک و تاریک نگهداری کنید.`;
const onSeriousMassWarnings =
  "برای افراد زیر ۱۸ سال مناسب نیست.\nاین محصول باید بخشی از رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم باشد.\nحساسیت‌زاها: حاوی شیر و سویا. ممکن است حاوی گلوتن، تخم‌مرغ، آجیل و بادام‌زمینی باشد.";
const onSeriousMassClaims =
  "بیش از ۱۲۵۰ کالری در هر وعده برای افزایش وزن و عضله‌سازی\n۵۰ گرم پروتئین در هر وعده\nحدود ۲۵۰ گرم کربوهیدرات در هر وعده\n۳ گرم کراتین افزوده در هر وعده\nبا ویتامین‌ها و مواد معدنی\nادعاهای سلامت مورد تأیید اتحادیه‌ی اروپا: پروتئین در کنار تمرین قدرتی منظم به رشد و حفظ توده‌ی عضلانی کمک می‌کند؛ کربوهیدرات‌ها به بازیابی عملکرد طبیعی عضله پس از فعالیت بدنی بسیار شدید یا طولانی کمک می‌کنند (با مصرف ۴ گرم کربوهیدرات به ازای هر کیلوگرم وزن بدن در ۴ تا ۶ ساعت اول)";

const products: BrandProduct[] = [
  // Optimum Nutrition
  {
    id: "on1",
    name: "وی گلد استاندارد - Gold Standard 100% Whey",
    slug: "on-gold-standard-whey",
    groupSlug: "on-gold-standard-whey",
    flavor: "شکلات دوبل",
    size: "۲٫۰۲ کیلوگرم",
    imageUrl: "/images/products/on-gold-standard-whey-double-rich-chocolate.webp",
    // Pack photos and label details for every flavour come from ON's German
    // shop (de-de, gold-standard-100-whey-protein-powder-eu): each variant's
    // label record matches its photo (weight, servings, scoop size). The old
    // photo file stays until production is re-seeded with this imageUrl.
    // Delicious Strawberry and Vanilla Ice Cream have no label record there
    // (nor on the en-gb and fr-fr shops), so they aren't added.
    description: `وی گلد استاندارد ۱۰۰٪ اپتیموم نوتریشن با طعم شکلات دوبل؛ پودر پروتئینی آماده‌ی مخلوط از ترکیب ایزوله، کنسانتره و ایزوله‌ی هیدرولیزه‌ی پروتئین وی. هر وعده (۳۱ گرم) ۲۴ گرم پروتئین، ۵٫۵ گرم BCAA طبیعی و ۱۱۶ کیلوکالری دارد و بسته‌ی ۲٫۰۲ کیلوگرمی ۶۵ وعده است.\nمواد تشکیل‌دهنده: ترکیب پروتئین وی ۹۳٪ (${onGoldStandardBlend})، پودر کاکائوی کم‌چرب، طعم‌دهنده‌ها، قوام‌دهنده (زانتان) و شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم).`,
    servingSize: "۳۱ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۶ کیلوکالری" },
      { label: "چربی", amount: "۱٫۴ گرم" },
      { label: "چربی اشباع", amount: "۰٫۵ گرم" },
      { label: "کربوهیدرات", amount: "۱٫۶ گرم" },
      { label: "قندها", amount: "۱٫۰ گرم" },
      { label: "فیبر", amount: "۰٫۷ گرم" },
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "نمک", amount: "۰٫۱۲ گرم" },
    ],
    usage: onGoldStandardUsage("۳۱"),
    warnings: onGoldStandardWarnings,
    manufacturerClaims: onGoldStandardClaims,
    brand: "Optimum Nutrition",
    price: 2450000,
    categorySlug: "protein",
  },
  {
    id: "on1b",
    name: "وی گلد استاندارد - Gold Standard 100% Whey",
    slug: "on-gold-standard-whey-extreme-milk-chocolate",
    groupSlug: "on-gold-standard-whey",
    flavor: "شکلات شیری اکستریم",
    size: "۲٫۰۲ کیلوگرم",
    imageUrl: "/images/products/on-gold-standard-whey-extreme-milk-chocolate.webp",
    description: `وی گلد استاندارد ۱۰۰٪ اپتیموم نوتریشن با طعم شکلات شیری اکستریم؛ پودر پروتئینی آماده‌ی مخلوط از ترکیب ایزوله، کنسانتره و ایزوله‌ی هیدرولیزه‌ی پروتئین وی. هر وعده (۳۲ گرم) ۲۴ گرم پروتئین، ۵٫۵ گرم BCAA طبیعی و ۱۱۹ کیلوکالری دارد و بسته‌ی ۲٫۰۲ کیلوگرمی ۶۳ وعده است.\nمواد تشکیل‌دهنده: ترکیب پروتئین وی ۹۱٪ (${onGoldStandardBlend})، پودر کاکائوی کم‌چرب، طعم‌دهنده‌ها، نمک، قوام‌دهنده (زانتان) و شیرین‌کننده (سوکرالوز).`,
    servingSize: "۳۲ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۹ کیلوکالری" },
      { label: "چربی", amount: "۱٫۵ گرم" },
      { label: "چربی اشباع", amount: "۰٫۶ گرم" },
      { label: "کربوهیدرات", amount: "۲٫۲ گرم" },
      { label: "قندها", amount: "۱٫۳ گرم" },
      { label: "فیبر", amount: "۰٫۸ گرم" },
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "نمک", amount: "۰٫۱۶ گرم" },
    ],
    usage: onGoldStandardUsage("۳۲"),
    warnings: onGoldStandardWarnings,
    manufacturerClaims: onGoldStandardClaims,
    brand: "Optimum Nutrition",
    price: 2450000,
    categorySlug: "protein",
  },
  {
    id: "on1c",
    name: "وی گلد استاندارد - Gold Standard 100% Whey",
    slug: "on-gold-standard-whey-french-vanilla",
    groupSlug: "on-gold-standard-whey",
    flavor: "کرم وانیل فرانسوی",
    size: "۲٫۲۸ کیلوگرم",
    imageUrl: "/images/products/on-gold-standard-whey-french-vanilla.webp",
    description: `وی گلد استاندارد ۱۰۰٪ اپتیموم نوتریشن با طعم کرم وانیل فرانسوی؛ پودر پروتئینی آماده‌ی مخلوط از ترکیب ایزوله، کنسانتره و ایزوله‌ی هیدرولیزه‌ی پروتئین وی. هر وعده (۳۰ گرم) ۲۴ گرم پروتئین، ۵٫۵ گرم BCAA طبیعی و ۱۱۳ کیلوکالری دارد و بسته‌ی ۲٫۲۸ کیلوگرمی ۷۶ وعده است.\nمواد تشکیل‌دهنده: ترکیب پروتئین وی ۹۸٪ (${onGoldStandardBlend})، طعم‌دهنده‌ها، نمک، قوام‌دهنده (زانتان)، شیرین‌کننده (سوکرالوز) و رنگ (کورکومین).`,
    servingSize: "۳۰ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۳ کیلوکالری" },
      { label: "چربی", amount: "۱٫۳ گرم" },
      { label: "چربی اشباع", amount: "۰٫۴ گرم" },
      { label: "کربوهیدرات", amount: "۱٫۵ گرم" },
      { label: "قندها", amount: "۱٫۰ گرم" },
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "نمک", amount: "۰٫۱۵ گرم" },
    ],
    usage: onGoldStandardUsage("۳۰"),
    warnings: onGoldStandardWarnings,
    manufacturerClaims: onGoldStandardClaims,
    brand: "Optimum Nutrition",
    price: 2750000,
    categorySlug: "protein",
  },
  {
    id: "on1d",
    name: "وی گلد استاندارد - Gold Standard 100% Whey",
    slug: "on-gold-standard-whey-unflavored",
    groupSlug: "on-gold-standard-whey",
    flavor: "بدون طعم",
    size: "۲٫۲۵ کیلوگرم",
    imageUrl: "/images/products/on-gold-standard-whey-unflavored.webp",
    description: `وی گلد استاندارد ۱۰۰٪ اپتیموم نوتریشن، بدون طعم و بدون شیرین‌کننده؛ پودر پروتئینی آماده‌ی مخلوط از ترکیب ایزوله، کنسانتره و ایزوله‌ی هیدرولیزه‌ی پروتئین وی. هر وعده (۳۰ گرم) ۲۴ گرم پروتئین، ۵٫۵ گرم BCAA طبیعی و ۱۱۲ کیلوکالری دارد و بسته‌ی ۲٫۲۵ کیلوگرمی ۷۵ وعده است.\nمواد تشکیل‌دهنده: ترکیب پروتئین وی (${onGoldStandardBlend}).`,
    servingSize: "۳۰ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۲ کیلوکالری" },
      { label: "چربی", amount: "۱٫۲ گرم" },
      { label: "چربی اشباع", amount: "۰٫۴ گرم" },
      { label: "کربوهیدرات", amount: "۱٫۳ گرم" },
      { label: "قندها", amount: "۱٫۰ گرم" },
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "نمک", amount: "۰٫۱۶ گرم" },
    ],
    usage: onGoldStandardUsage("۳۰"),
    warnings: onGoldStandardWarnings,
    manufacturerClaims: onGoldStandardClaims,
    brand: "Optimum Nutrition",
    price: 2700000,
    categorySlug: "protein",
  },
  {
    id: "on1e",
    name: "وی گلد استاندارد - Gold Standard 100% Whey",
    slug: "on-gold-standard-whey-banana-cream",
    groupSlug: "on-gold-standard-whey",
    flavor: "کرم موز",
    size: "۲٫۰۴ کیلوگرم",
    imageUrl: "/images/products/on-gold-standard-whey-banana-cream.webp",
    description: `وی گلد استاندارد ۱۰۰٪ اپتیموم نوتریشن با طعم کرم موز؛ پودر پروتئینی آماده‌ی مخلوط از ترکیب ایزوله، کنسانتره و ایزوله‌ی هیدرولیزه‌ی پروتئین وی. هر وعده (۳۰ گرم) ۲۴ گرم پروتئین، ۵٫۵ گرم BCAA طبیعی و ۱۱۲ کیلوکالری دارد و بسته‌ی ۲٫۰۴ کیلوگرمی ۶۸ وعده است.\nمواد تشکیل‌دهنده: ترکیب پروتئین وی ۹۸٪ (${onGoldStandardBlend})، طعم‌دهنده‌ها (حاوی شیر)، رنگ (کورکومین)، قوام‌دهنده (زانتان) و شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم).`,
    servingSize: "۳۰ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۲ کیلوکالری" },
      { label: "چربی", amount: "۱٫۲ گرم" },
      { label: "چربی اشباع", amount: "۰٫۴ گرم" },
      { label: "کربوهیدرات", amount: "۱٫۶ گرم" },
      { label: "قندها", amount: "۱٫۰ گرم" },
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "نمک", amount: "۰٫۱۶ گرم" },
    ],
    usage: onGoldStandardUsage("۳۰"),
    warnings: onGoldStandardWarnings,
    manufacturerClaims: onGoldStandardClaims,
    brand: "Optimum Nutrition",
    price: 2450000,
    categorySlug: "protein",
  },
  {
    id: "on1f",
    name: "وی گلد استاندارد - Gold Standard 100% Whey",
    slug: "on-gold-standard-whey-chocolate-hazelnut",
    groupSlug: "on-gold-standard-whey",
    flavor: "شکلات فندقی",
    size: "۲٫۲۷ کیلوگرم",
    imageUrl: "/images/products/on-gold-standard-whey-chocolate-hazelnut.webp",
    description: `وی گلد استاندارد ۱۰۰٪ اپتیموم نوتریشن با طعم شکلات فندقی؛ پودر پروتئینی آماده‌ی مخلوط از ترکیب ایزوله، کنسانتره و ایزوله‌ی هیدرولیزه‌ی پروتئین وی. هر وعده (۳۲ گرم) ۲۴ گرم پروتئین، ۵٫۵ گرم BCAA طبیعی و ۱۱۷ کیلوکالری دارد و بسته‌ی ۲٫۲۷ کیلوگرمی ۷۱ وعده است.\nمواد تشکیل‌دهنده: ترکیب پروتئین وی ۹۱٪ (${onGoldStandardBlend})، پودر کاکائوی کم‌چرب، طعم‌دهنده‌ها (حاوی شیر)، نمک، قوام‌دهنده (زانتان) و شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم).`,
    servingSize: "۳۲ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۷ کیلوکالری" },
      { label: "چربی", amount: "۱٫۴ گرم" },
      { label: "چربی اشباع", amount: "۰٫۵ گرم" },
      { label: "کربوهیدرات", amount: "۲٫۰ گرم" },
      { label: "قندها", amount: "۱٫۱ گرم" },
      { label: "فیبر", amount: "۰٫۶ گرم" },
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "نمک", amount: "۰٫۲۹ گرم" },
    ],
    usage: onGoldStandardUsage("۳۲"),
    warnings: onGoldStandardWarnings,
    manufacturerClaims: onGoldStandardClaims,
    brand: "Optimum Nutrition",
    price: 2750000,
    categorySlug: "protein",
  },
  {
    id: "on1g",
    name: "وی گلد استاندارد - Gold Standard 100% Whey",
    slug: "on-gold-standard-whey-chocolate-peanut-butter",
    groupSlug: "on-gold-standard-whey",
    flavor: "شکلات و کره‌ی بادام‌زمینی",
    size: "۲٫۲۷ کیلوگرم",
    imageUrl: "/images/products/on-gold-standard-whey-chocolate-peanut-butter.webp",
    description: `وی گلد استاندارد ۱۰۰٪ اپتیموم نوتریشن با طعم شکلات و کره‌ی بادام‌زمینی؛ پودر پروتئینی آماده‌ی مخلوط از ترکیب ایزوله، کنسانتره و ایزوله‌ی هیدرولیزه‌ی پروتئین وی. هر وعده (۳۲ گرم) ۲۴ گرم پروتئین، ۵٫۵ گرم BCAA طبیعی و ۱۱۷ کیلوکالری دارد و بسته‌ی ۲٫۲۷ کیلوگرمی ۷۱ وعده است.\nمواد تشکیل‌دهنده: ترکیب پروتئین وی ۹۱٪ (${onGoldStandardBlend})، طعم‌دهنده، پودر کاکائوی کم‌چرب، نمک، قوام‌دهنده (زانتان) و شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم).`,
    servingSize: "۳۲ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۷ کیلوکالری" },
      { label: "چربی", amount: "۱٫۳ گرم" },
      { label: "چربی اشباع", amount: "۰٫۵ گرم" },
      { label: "کربوهیدرات", amount: "۲٫۲ گرم" },
      { label: "قندها", amount: "۱٫۰ گرم" },
      { label: "فیبر", amount: "۰٫۶ گرم" },
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "نمک", amount: "۰٫۵ گرم" },
    ],
    usage: onGoldStandardUsage("۳۲"),
    warnings: onGoldStandardWarnings,
    manufacturerClaims: onGoldStandardClaims,
    brand: "Optimum Nutrition",
    price: 2750000,
    categorySlug: "protein",
  },
  {
    id: "on1h",
    name: "وی گلد استاندارد - Gold Standard 100% Whey",
    slug: "on-gold-standard-whey-cookies-cream",
    groupSlug: "on-gold-standard-whey",
    flavor: "کوکی و کرم",
    size: "۲٫۰۲ کیلوگرم",
    imageUrl: "/images/products/on-gold-standard-whey-cookies-cream.webp",
    description: `وی گلد استاندارد ۱۰۰٪ اپتیموم نوتریشن با طعم کوکی و کرم؛ پودر پروتئینی آماده‌ی مخلوط از ترکیب ایزوله، کنسانتره و ایزوله‌ی هیدرولیزه‌ی پروتئین وی، با تکه‌های کوکی. هر وعده (۳۲ گرم) ۲۴ گرم پروتئین، ۵٫۵ گرم BCAA طبیعی و ۱۱۹ کیلوکالری دارد و بسته‌ی ۲٫۰۲ کیلوگرمی ۶۳ وعده است.\nمواد تشکیل‌دهنده: ترکیب پروتئین وی ۹۱٪ (${onGoldStandardBlend})، طعم‌دهنده‌ها (حاوی شیر)، خرده‌کوکی ۳٫۲٪ (آرد گندم، شکر، چربی‌های گیاهی (روغن پالم، کلزا)، پودر کاکائوی کم‌چرب، نمک)، قوام‌دهنده (زانتان) و شیرین‌کننده (سوکرالوز).`,
    servingSize: "۳۲ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۹ کیلوکالری" },
      { label: "چربی", amount: "۱٫۳ گرم" },
      { label: "چربی اشباع", amount: "۰٫۵ گرم" },
      { label: "کربوهیدرات", amount: "۳٫۱ گرم" },
      { label: "قندها", amount: "۱٫۲ گرم" },
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "نمک", amount: "۰٫۱۶ گرم" },
    ],
    usage: onGoldStandardUsage("۳۲"),
    // The cookie crumb adds wheat, so gluten is an ingredient here, not a trace.
    warnings:
      "حساسیت‌زاها: حاوی شیر، سویا و گندم (گلوتن). ممکن است حاوی تخم‌مرغ، آجیل و بادام‌زمینی باشد.",
    manufacturerClaims: onGoldStandardClaims,
    brand: "Optimum Nutrition",
    price: 2450000,
    categorySlug: "protein",
  },
  {
    id: "on1i",
    name: "وی گلد استاندارد - Gold Standard 100% Whey",
    slug: "on-gold-standard-whey-white-chocolate-raspberry",
    groupSlug: "on-gold-standard-whey",
    flavor: "شکلات سفید و تمشک",
    size: "۲٫۲۸ کیلوگرم",
    imageUrl: "/images/products/on-gold-standard-whey-white-chocolate-raspberry.webp",
    description: `وی گلد استاندارد ۱۰۰٪ اپتیموم نوتریشن با طعم شکلات سفید و تمشک؛ پودر پروتئینی آماده‌ی مخلوط از ترکیب ایزوله، کنسانتره و ایزوله‌ی هیدرولیزه‌ی پروتئین وی. هر وعده (۳۰ گرم) ۲۴ گرم پروتئین، ۵٫۵ گرم BCAA طبیعی و ۱۱۱ کیلوکالری دارد و بسته‌ی ۲٫۲۸ کیلوگرمی ۷۶ وعده است.\nمواد تشکیل‌دهنده: ترکیب پروتئین وی ۹۸٪ (${onGoldStandardBlend})، تمشک خشک‌شده به روش انجمادی ۱٫۳٪، طعم‌دهنده، قوام‌دهنده (زانتان) و شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم).`,
    servingSize: "۳۰ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۱ کیلوکالری" },
      { label: "چربی", amount: "۱٫۲ گرم" },
      { label: "چربی اشباع", amount: "۰٫۴ گرم" },
      { label: "کربوهیدرات", amount: "۱٫۴ گرم" },
      { label: "قندها", amount: "۱٫۰ گرم" },
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "نمک", amount: "۰٫۱۵ گرم" },
    ],
    usage: onGoldStandardUsage("۳۰"),
    warnings: onGoldStandardWarnings,
    manufacturerClaims: onGoldStandardClaims,
    brand: "Optimum Nutrition",
    price: 2750000,
    categorySlug: "protein",
  },
  {
    id: "on2",
    name: "کراتین میکرونیزه - Micronized Creatine Powder",
    slug: "on-micronized-creatine",
    groupSlug: "on-micronized-creatine",
    flavor: "بدون طعم",
    size: "۳۱۷ گرم",
    imageUrl: "/images/products/on-micronized-creatine.webp",
    // Photos and label details from ON's German shop (de-de,
    // micronised-creatine-powder); the shop has no facts table. Every pack
    // says 3 g creatine per serving. The unflavoured serving is the 3.4 g of
    // creatine monohydrate the description names (634 g ÷ 186 = 3.4 g); the
    // label record's "4.5 g" belongs to the flavoured tubs, and its 88
    // servings for 317 g is overridden by the pack photo's 93 (317 ÷ 3.4).
    description:
      "کراتین میکرونیزه‌ی اپتیموم نوتریشن، بدون طعم؛ مکمل غذایی پودر کراتین مونوهیدرات که ذراتش برای حل‌شدن بهتر ریزتر شده است. هر وعده (۳٫۴ گرم) ۳ گرم کراتین دارد و بسته‌ی ۳۱۷ گرمی ۹۳ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات.",
    servingSize: "۳٫۴ گرم (حدود ۱ قاشق چای‌خوری سرپر)",
    nutritionFacts: [
      { label: "کراتین مونوهیدرات", amount: "۳٫۴ گرم" },
      { label: "کراتین", amount: "۳ گرم" },
    ],
    usage:
      "روزانه ۱ وعده (۳٫۴ گرم، حدود ۱ قاشق چای‌خوری سرپر) را در ۲۵۰ میلی‌لیتر آب سرد، آبمیوه یا نوشیدنی دلخواه حل کنید؛ پیش یا بعد از تمرین. برای حفظ سطح کراتین عضلات، مصرف روزانه توصیه می‌شود.",
    warnings: onCreatineWarnings,
    manufacturerClaims: onCreatineClaims,
    brand: "Optimum Nutrition",
    price: 990000,
    categorySlug: "creatine",
  },
  {
    id: "on2b",
    name: "کراتین میکرونیزه - Micronized Creatine Powder",
    slug: "on-micronized-creatine-634g",
    groupSlug: "on-micronized-creatine",
    flavor: "بدون طعم",
    size: "۶۳۴ گرم",
    imageUrl: "/images/products/on-micronized-creatine-634g.webp",
    description:
      "کراتین میکرونیزه‌ی اپتیموم نوتریشن، بدون طعم؛ مکمل غذایی پودر کراتین مونوهیدرات که ذراتش برای حل‌شدن بهتر ریزتر شده است. هر وعده (۳٫۴ گرم) ۳ گرم کراتین دارد و بسته‌ی ۶۳۴ گرمی ۱۸۶ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات.",
    servingSize: "۳٫۴ گرم (حدود ۱ قاشق چای‌خوری سرپر)",
    nutritionFacts: [
      { label: "کراتین مونوهیدرات", amount: "۳٫۴ گرم" },
      { label: "کراتین", amount: "۳ گرم" },
    ],
    usage:
      "روزانه ۱ وعده (۳٫۴ گرم، حدود ۱ قاشق چای‌خوری سرپر) را در ۲۵۰ میلی‌لیتر آب سرد، آبمیوه یا نوشیدنی دلخواه حل کنید؛ پیش یا بعد از تمرین. برای حفظ سطح کراتین عضلات، مصرف روزانه توصیه می‌شود.",
    warnings: onCreatineWarnings,
    manufacturerClaims: onCreatineClaims,
    brand: "Optimum Nutrition",
    price: 1650000,
    categorySlug: "creatine",
  },
  {
    id: "on2c",
    name: "کراتین میکرونیزه - Micronized Creatine Powder",
    slug: "on-micronized-creatine-fruit-punch",
    groupSlug: "on-micronized-creatine",
    flavor: "فروت پانچ",
    size: "۳۶۰ گرم",
    imageUrl: "/images/products/on-micronized-creatine-fruit-punch.webp",
    // Flavoured tubs: 4.5 g scoop (360 g ÷ 80 = 4.5 g), 3 g creatine per the
    // pack; the shop gives no amount of creatine monohydrate for them.
    description:
      "کراتین میکرونیزه‌ی اپتیموم نوتریشن با طعم فروت پانچ؛ مکمل غذایی پودر کراتین مونوهیدرات با شیرین‌کننده. هر وعده (۴٫۵ گرم) ۳ گرم کراتین دارد و بسته‌ی ۳۶۰ گرمی ۸۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات، اسیدی‌کننده‌ها (سیتریک اسید، مالیک اسید)، طعم‌دهنده‌ها، شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم)، نمک و رنگ (آبی درخشان FCF).",
    servingSize: "۴٫۵ گرم (۱ اسکوپ صاف)",
    nutritionFacts: [{ label: "کراتین", amount: "۳ گرم" }],
    usage:
      "روزانه ۱ وعده (۱ اسکوپ صاف، ۴٫۵ گرم) را در ۲۴۰ میلی‌لیتر آب سرد حل کنید و مصرف کنید.",
    warnings: onCreatineWarnings,
    manufacturerClaims: onCreatineClaims,
    brand: "Optimum Nutrition",
    price: 990000,
    categorySlug: "creatine",
  },
  {
    id: "on2d",
    name: "کراتین میکرونیزه - Micronized Creatine Powder",
    slug: "on-micronized-creatine-blue-raspberry",
    groupSlug: "on-micronized-creatine",
    flavor: "تمشک آبی",
    size: "۳۶۰ گرم",
    imageUrl: "/images/products/on-micronized-creatine-blue-raspberry.webp",
    description:
      "کراتین میکرونیزه‌ی اپتیموم نوتریشن با طعم تمشک آبی؛ مکمل غذایی پودر کراتین مونوهیدرات با شیرین‌کننده. هر وعده (۴٫۵ گرم) ۳ گرم کراتین دارد و بسته‌ی ۳۶۰ گرمی ۸۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات، اسیدی‌کننده‌ها (سیتریک اسید، مالیک اسید)، طعم‌دهنده‌ها، شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم)، نمک و رنگ (آبی درخشان FCF).",
    servingSize: "۴٫۵ گرم (۱ اسکوپ صاف)",
    nutritionFacts: [{ label: "کراتین", amount: "۳ گرم" }],
    usage:
      "روزانه ۱ وعده (۱ اسکوپ صاف، ۴٫۵ گرم) را در ۲۵۰ میلی‌لیتر آب سرد حل کنید و مصرف کنید.",
    warnings: onCreatineWarnings,
    manufacturerClaims: onCreatineClaims,
    brand: "Optimum Nutrition",
    price: 990000,
    categorySlug: "creatine",
  },
  {
    id: "on2e",
    name: "کراتین میکرونیزه - Micronized Creatine Powder",
    slug: "on-micronized-creatine-orange",
    groupSlug: "on-micronized-creatine",
    flavor: "پرتقال",
    size: "۲۴۷٫۵ گرم",
    imageUrl: "/images/products/on-micronized-creatine-orange.webp",
    description:
      "کراتین میکرونیزه‌ی اپتیموم نوتریشن با طعم پرتقال؛ مکمل غذایی پودر کراتین مونوهیدرات با شیرین‌کننده. هر وعده (۴٫۵ گرم) ۳ گرم کراتین دارد و بسته‌ی ۲۴۷٫۵ گرمی ۵۵ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات، طعم‌دهنده‌ها، اسیدی‌کننده‌ها (سیتریک اسید، مالیک اسید)، شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم)، کنسانتره‌ی چغندر، نمک و رنگ (ریبوفلاوین).",
    servingSize: "۴٫۵ گرم (۱ اسکوپ صاف)",
    nutritionFacts: [{ label: "کراتین", amount: "۳ گرم" }],
    usage:
      "روزانه ۱ وعده (۱ اسکوپ صاف، ۴٫۵ گرم) را در ۲۵۰ میلی‌لیتر آب سرد حل کنید و مصرف کنید.",
    warnings: onCreatineWarnings,
    manufacturerClaims: onCreatineClaims,
    brand: "Optimum Nutrition",
    price: 750000,
    categorySlug: "creatine",
  },
  {
    id: "on2t",
    name: "قرص کراتین - Creatine Tablets",
    slug: "on-creatine-tablets",
    size: "۱۸۰ قرص",
    imageUrl: "/images/products/on-creatine-tablets.webp",
    // Dose and count from the pack photo (3.0 g creatine monohydrate per
    // serving, 180 tablets, 60 servings). ON's German shop page (de-de,
    // creatine-tablets-180) has no facts table and says "3 g pure creatine",
    // which doesn't match the label's 3 g of monohydrate, so the label wins
    // and that line is left out. Directions and warnings are from that page.
    description:
      "قرص کراتین اپتیموم نوتریشن؛ مکمل غذایی کراتین مونوهیدرات به شکل قرص. هر وعده (۳ قرص) ۳ گرم کراتین مونوهیدرات دارد و هر قوطی ۱۸۰ قرص، یعنی ۶۰ وعده است.",
    servingSize: "۳ قرص",
    nutritionFacts: [{ label: "کراتین مونوهیدرات", amount: "۳ گرم" }],
    usage:
      "روزانه ۳ قرص مصرف کنید. برای بهترین نتیجه، همراه نوشیدنی ورزشی یا شیک پروتئین دلخواهتان.",
    warnings:
      "مکمل غذایی جایگزین رژیم غذایی متنوع نیست.\nاز مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.\nدور از دسترس کودکان نگهداری شود.",
    manufacturerClaims:
      "کراتین مونوهیدرات خالص با کیفیت بالا\nبدون افزودنی و پرکننده‌ی غیرضروری\nبه گفته‌ی سازنده، کراتین عملکرد را در تمرین‌های کوتاه‌مدت، پرشدت و پشت‌سرهم بهبود می‌دهد؛ طبق ادعای سلامت مورد تأیید اتحادیه‌ی اروپا، این اثر با مصرف روزانه‌ی ۳ گرم کراتین به دست می‌آید",
    brand: "Optimum Nutrition",
    price: 790000,
    categorySlug: "creatine",
  },
  {
    id: "on3",
    name: "مولتی ویتامین آقایان - Opti-Men",
    slug: "on-opti-men",
    groupSlug: "on-opti-men",
    size: "۹۰ قرص",
    imageUrl: "/images/products/on-opti-men.webp",
    // Photo and label details from ON's German shop (de-de,
    // opti-men-multivitamin-tablets). No shop (de, gb, fr) gives the amount
    // of each vitamin and mineral, so the facts table stays empty. The pack
    // says 36 active ingredients (the shop text says 38); the pack wins.
    description:
      "اپتی‌من اپتیموم نوتریشن؛ مولتی ویتامین مخصوص آقایان فعال، مکمل غذایی با ویتامین‌ها، مواد معدنی، اسیدهای آمینه و عصاره‌های گیاهی (۳۶ ماده‌ی مؤثر). هر وعده ۳ قرص است و قوطی ۹۰ قرصی ۳۰ وعده است.\n" + onOptiMenIngredients,
    servingSize: "۳ قرص",
    usage: "روزانه ۳ قرص همراه غذا مصرف کنید.",
    warnings: onOptiMenWarnings,
    manufacturerClaims: onOptiMenClaims,
    brand: "Optimum Nutrition",
    price: 1150000,
    categorySlug: "vitamins",
  },
  {
    id: "on3b",
    name: "مولتی ویتامین آقایان - Opti-Men",
    slug: "on-opti-men-180",
    groupSlug: "on-opti-men",
    size: "۱۸۰ قرص",
    imageUrl: "/images/products/on-opti-men-180.webp",
    // Same label as on3; only the count differs.
    description:
      "اپتی‌من اپتیموم نوتریشن؛ مولتی ویتامین مخصوص آقایان فعال، مکمل غذایی با ویتامین‌ها، مواد معدنی، اسیدهای آمینه و عصاره‌های گیاهی (۳۶ ماده‌ی مؤثر). هر وعده ۳ قرص است و قوطی ۱۸۰ قرصی ۶۰ وعده است.\n" + onOptiMenIngredients,
    servingSize: "۳ قرص",
    usage: "روزانه ۳ قرص همراه غذا مصرف کنید.",
    warnings: onOptiMenWarnings,
    manufacturerClaims: onOptiMenClaims,
    brand: "Optimum Nutrition",
    price: 1990000,
    categorySlug: "vitamins",
  },
  {
    id: "on4",
    name: "سریوس مس - گینر - Serious Mass",
    slug: "on-serious-mass",
    groupSlug: "on-serious-mass",
    flavor: "شکلات",
    size: "۲٫۷۳ کیلوگرم",
    imageUrl: "/images/products/on-serious-mass.webp",
    // Photos and label details from ON's UK shop (en-gb,
    // serious-mass-weight-gainer-protein-powder-eu): the German shop sells a
    // newer formula (2.67/5.34 kg) with no label record anywhere, so the UK
    // packs are used. Each pack shows the same calories, protein, carbs and
    // 3 g creatine as its record; the creatine amount is from the pack.
    description: `سریوس مس اپتیموم نوتریشن با طعم شکلات؛ پودر گینر پرکالری آماده‌ی مخلوط با پروتئین، کربوهیدرات، ویتامین‌ها و مواد معدنی برای افزایش وزن و عضله‌سازی. هر وعده (۳۳۶ گرم، ۲ اسکوپ) ۱۲۶۲ کیلوکالری، ۵۰ گرم پروتئین، ۲۴۸ گرم کربوهیدرات و ۳ گرم کراتین دارد و ظرف ۲٫۷۳ کیلوگرمی ۸ وعده است.\nمواد تشکیل‌دهنده: مالتودکسترین ذرت، کنسانتره‌ی پروتئین وی (از شیر)، امولسیفایر (لسیتین، حاوی سویا)، پودر کاکائوی کم‌چرب، کراتین مونوهیدرات، طعم‌دهنده، کمپلکس مواد معدنی شیر، ${onSeriousMassMicronutrients}، نمک، پایدارکننده‌ها (صمغ سلولز، صمغ گوار، کاراگینان) و شیرین‌کننده (سوکرالوز).`,
    servingSize: "۳۳۶ گرم (۲ اسکوپ سرپر)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲۶۲ کیلوکالری" },
      { label: "چربی", amount: "۷٫۰ گرم" },
      { label: "چربی اشباع", amount: "۳٫۹ گرم" },
      { label: "کربوهیدرات", amount: "۲۴۸ گرم" },
      { label: "قندها", amount: "۱۱ گرم" },
      { label: "پروتئین", amount: "۵۰ گرم" },
      { label: "نمک", amount: "۱٫۱۷ گرم" },
      { label: "کراتین", amount: "۳ گرم" },
    ],
    usage: onSeriousMassUsage("۳۳۶"),
    warnings: onSeriousMassWarnings,
    manufacturerClaims: onSeriousMassClaims,
    brand: "Optimum Nutrition",
    price: 2950000,
    categorySlug: "protein",
  },
  {
    id: "on4b",
    name: "سریوس مس - گینر - Serious Mass",
    slug: "on-serious-mass-chocolate-5kg",
    groupSlug: "on-serious-mass",
    flavor: "شکلات",
    size: "۵٫۴۵ کیلوگرم",
    imageUrl: "/images/products/on-serious-mass-chocolate-5kg.webp",
    description: `سریوس مس اپتیموم نوتریشن با طعم شکلات؛ پودر گینر پرکالری آماده‌ی مخلوط با پروتئین، کربوهیدرات، ویتامین‌ها و مواد معدنی برای افزایش وزن و عضله‌سازی. هر وعده (۳۳۶ گرم، ۲ اسکوپ) ۱۲۶۲ کیلوکالری، ۵۰ گرم پروتئین، ۲۴۸ گرم کربوهیدرات و ۳ گرم کراتین دارد و کیسه‌ی ۵٫۴۵ کیلوگرمی ۱۶ وعده است.\nمواد تشکیل‌دهنده: مالتودکسترین ذرت، کنسانتره‌ی پروتئین وی (از شیر)، امولسیفایر (لسیتین، حاوی سویا)، پودر کاکائوی کم‌چرب، کراتین مونوهیدرات، طعم‌دهنده، کمپلکس مواد معدنی شیر، ${onSeriousMassMicronutrients}، نمک، پایدارکننده‌ها (صمغ سلولز، صمغ گوار، کاراگینان) و شیرین‌کننده (سوکرالوز).`,
    servingSize: "۳۳۶ گرم (۲ اسکوپ سرپر)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲۶۲ کیلوکالری" },
      { label: "چربی", amount: "۷٫۰ گرم" },
      { label: "چربی اشباع", amount: "۳٫۹ گرم" },
      { label: "کربوهیدرات", amount: "۲۴۸ گرم" },
      { label: "قندها", amount: "۱۱ گرم" },
      { label: "پروتئین", amount: "۵۰ گرم" },
      { label: "نمک", amount: "۱٫۱۷ گرم" },
      { label: "کراتین", amount: "۳ گرم" },
    ],
    usage: onSeriousMassUsage("۳۳۶"),
    warnings: onSeriousMassWarnings,
    manufacturerClaims: onSeriousMassClaims,
    brand: "Optimum Nutrition",
    price: 5450000,
    categorySlug: "protein",
  },
  {
    id: "on4c",
    name: "سریوس مس - گینر - Serious Mass",
    slug: "on-serious-mass-vanilla",
    groupSlug: "on-serious-mass",
    flavor: "وانیل",
    size: "۲٫۷۳ کیلوگرم",
    imageUrl: "/images/products/on-serious-mass-vanilla.webp",
    description: `سریوس مس اپتیموم نوتریشن با طعم وانیل؛ پودر گینر پرکالری آماده‌ی مخلوط با پروتئین، کربوهیدرات، ویتامین‌ها و مواد معدنی برای افزایش وزن و عضله‌سازی. هر وعده (۳۳۵ گرم، ۲ اسکوپ) ۱۲۵۹ کیلوکالری، ۵۰ گرم پروتئین، ۲۵۰ گرم کربوهیدرات و ۳ گرم کراتین دارد و ظرف ۲٫۷۳ کیلوگرمی ۸ وعده است.\nمواد تشکیل‌دهنده: مالتودکسترین ذرت، کنسانتره‌ی پروتئین وی (از شیر)، امولسیفایر (لسیتین، حاوی سویا)، طعم‌دهنده‌ها، کراتین مونوهیدرات، کمپلکس مواد معدنی شیر، نمک، ${onSeriousMassMicronutrients}، پایدارکننده‌ها (صمغ سلولز، صمغ گوار، کاراگینان) و شیرین‌کننده (سوکرالوز).`,
    servingSize: "۳۳۵ گرم (۲ اسکوپ سرپر)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲۵۹ کیلوکالری" },
      { label: "چربی", amount: "۶٫۲ گرم" },
      { label: "چربی اشباع", amount: "۳٫۴ گرم" },
      { label: "کربوهیدرات", amount: "۲۵۰ گرم" },
      { label: "قندها", amount: "۱۲ گرم" },
      { label: "پروتئین", amount: "۵۰ گرم" },
      { label: "نمک", amount: "۱٫۸۹ گرم" },
      { label: "کراتین", amount: "۳ گرم" },
    ],
    usage: onSeriousMassUsage("۳۳۵"),
    warnings: onSeriousMassWarnings,
    manufacturerClaims: onSeriousMassClaims,
    brand: "Optimum Nutrition",
    price: 2950000,
    categorySlug: "protein",
  },
  {
    id: "on4d",
    name: "سریوس مس - گینر - Serious Mass",
    slug: "on-serious-mass-vanilla-5kg",
    groupSlug: "on-serious-mass",
    flavor: "وانیل",
    size: "۵٫۴۵ کیلوگرم",
    imageUrl: "/images/products/on-serious-mass-vanilla-5kg.webp",
    description: `سریوس مس اپتیموم نوتریشن با طعم وانیل؛ پودر گینر پرکالری آماده‌ی مخلوط با پروتئین، کربوهیدرات، ویتامین‌ها و مواد معدنی برای افزایش وزن و عضله‌سازی. هر وعده (۳۳۵ گرم، ۲ اسکوپ) ۱۲۵۹ کیلوکالری، ۵۰ گرم پروتئین، ۲۵۰ گرم کربوهیدرات و ۳ گرم کراتین دارد و کیسه‌ی ۵٫۴۵ کیلوگرمی ۱۶ وعده است.\nمواد تشکیل‌دهنده: مالتودکسترین ذرت، کنسانتره‌ی پروتئین وی (از شیر)، امولسیفایر (لسیتین، حاوی سویا)، طعم‌دهنده‌ها، کراتین مونوهیدرات، کمپلکس مواد معدنی شیر، نمک، ${onSeriousMassMicronutrients}، پایدارکننده‌ها (صمغ سلولز، صمغ گوار، کاراگینان) و شیرین‌کننده (سوکرالوز).`,
    servingSize: "۳۳۵ گرم (۲ اسکوپ سرپر)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲۵۹ کیلوکالری" },
      { label: "چربی", amount: "۶٫۲ گرم" },
      { label: "چربی اشباع", amount: "۳٫۴ گرم" },
      { label: "کربوهیدرات", amount: "۲۵۰ گرم" },
      { label: "قندها", amount: "۱۲ گرم" },
      { label: "پروتئین", amount: "۵۰ گرم" },
      { label: "نمک", amount: "۱٫۸۹ گرم" },
      { label: "کراتین", amount: "۳ گرم" },
    ],
    usage: onSeriousMassUsage("۳۳۵"),
    warnings: onSeriousMassWarnings,
    manufacturerClaims: onSeriousMassClaims,
    brand: "Optimum Nutrition",
    price: 5450000,
    categorySlug: "protein",
  },
  {
    id: "on4e",
    name: "سریوس مس - گینر - Serious Mass",
    slug: "on-serious-mass-strawberry",
    groupSlug: "on-serious-mass",
    flavor: "توت‌فرنگی",
    size: "۲٫۷۳ کیلوگرم",
    imageUrl: "/images/products/on-serious-mass-strawberry.webp",
    description: `سریوس مس اپتیموم نوتریشن با طعم توت‌فرنگی؛ پودر گینر پرکالری آماده‌ی مخلوط با پروتئین، کربوهیدرات، ویتامین‌ها و مواد معدنی برای افزایش وزن و عضله‌سازی. هر وعده (۳۳۵ گرم، ۲ اسکوپ) ۱۲۵۹ کیلوکالری، ۵۰ گرم پروتئین، ۲۵۰ گرم کربوهیدرات و ۳ گرم کراتین دارد و ظرف ۲٫۷۳ کیلوگرمی ۸ وعده است.\nمواد تشکیل‌دهنده: مالتودکسترین ذرت، کنسانتره‌ی پروتئین وی (از شیر)، امولسیفایر (لسیتین، حاوی سویا)، طعم‌دهنده‌ها، کراتین مونوهیدرات، کمپلکس مواد معدنی شیر، کنسانتره‌ی چغندر، نمک، ${onSeriousMassMicronutrients}، پایدارکننده‌ها (صمغ سلولز، صمغ گوار، کاراگینان) و شیرین‌کننده (سوکرالوز).`,
    servingSize: "۳۳۵ گرم (۲ اسکوپ سرپر)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲۵۹ کیلوکالری" },
      { label: "چربی", amount: "۶٫۲ گرم" },
      { label: "چربی اشباع", amount: "۳٫۴ گرم" },
      { label: "کربوهیدرات", amount: "۲۵۰ گرم" },
      { label: "قندها", amount: "۱۲ گرم" },
      { label: "پروتئین", amount: "۵۰ گرم" },
      { label: "نمک", amount: "۱٫۸۸ گرم" },
      { label: "کراتین", amount: "۳ گرم" },
    ],
    usage: onSeriousMassUsage("۳۳۵"),
    warnings: onSeriousMassWarnings,
    manufacturerClaims: onSeriousMassClaims,
    brand: "Optimum Nutrition",
    price: 2950000,
    categorySlug: "protein",
  },
  {
    id: "on4f",
    name: "سریوس مس - گینر - Serious Mass",
    slug: "on-serious-mass-strawberry-5kg",
    groupSlug: "on-serious-mass",
    flavor: "توت‌فرنگی",
    size: "۵٫۴۵ کیلوگرم",
    imageUrl: "/images/products/on-serious-mass-strawberry-5kg.webp",
    description: `سریوس مس اپتیموم نوتریشن با طعم توت‌فرنگی؛ پودر گینر پرکالری آماده‌ی مخلوط با پروتئین، کربوهیدرات، ویتامین‌ها و مواد معدنی برای افزایش وزن و عضله‌سازی. هر وعده (۳۳۵ گرم، ۲ اسکوپ) ۱۲۵۹ کیلوکالری، ۵۰ گرم پروتئین، ۲۵۰ گرم کربوهیدرات و ۳ گرم کراتین دارد و کیسه‌ی ۵٫۴۵ کیلوگرمی ۱۶ وعده است.\nمواد تشکیل‌دهنده: مالتودکسترین ذرت، کنسانتره‌ی پروتئین وی (از شیر)، امولسیفایر (لسیتین، حاوی سویا)، طعم‌دهنده‌ها، کراتین مونوهیدرات، کمپلکس مواد معدنی شیر، کنسانتره‌ی چغندر، نمک، ${onSeriousMassMicronutrients}، پایدارکننده‌ها (صمغ سلولز، صمغ گوار، کاراگینان) و شیرین‌کننده (سوکرالوز).`,
    servingSize: "۳۳۵ گرم (۲ اسکوپ سرپر)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲۵۹ کیلوکالری" },
      { label: "چربی", amount: "۶٫۲ گرم" },
      { label: "چربی اشباع", amount: "۳٫۴ گرم" },
      { label: "کربوهیدرات", amount: "۲۵۰ گرم" },
      { label: "قندها", amount: "۱۲ گرم" },
      { label: "پروتئین", amount: "۵۰ گرم" },
      { label: "نمک", amount: "۱٫۸۸ گرم" },
      { label: "کراتین", amount: "۳ گرم" },
    ],
    usage: onSeriousMassUsage("۳۳۵"),
    warnings: onSeriousMassWarnings,
    manufacturerClaims: onSeriousMassClaims,
    brand: "Optimum Nutrition",
    price: 5450000,
    categorySlug: "protein",
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
    id: "mt8",
    name: "مس تک اکستریم - Mass-Tech Extreme",
    slug: "muscletech-mass-tech-extreme",
    flavor: "براونی سه‌شکلاته",
    size: "۲٫۷۲ کیلوگرم",
    imageUrl: "/images/products/muscletech-mass-tech-extreme.webp",
    description:
      "گینر پرکالری مس تک اکستریم مسل‌تک با طعم براونی سه‌شکلاته، برای افرادی که به‌سختی وزن اضافه می‌کنند. هر وعده‌ی کامل (۶ اسکوپ، ۵۶۹ گرم) ۲۱۳۰ کالری، ۶۰ گرم پروتئین، ۴۶۰ گرم کربوهیدرات و ۵ گرم کراتین مونوهیدرات دارد و بسته‌ی ۲٫۷۲ کیلوگرمی (۶ پوند) حدود ۵ وعده‌ی کامل است.\nمقادیر جدول ارزش غذایی برای وعده‌ی کامل است؛ نصف وعده (۳ اسکوپ، ۲۸۴ گرم) ۱۰۷۰ کالری و ۳۰ گرم پروتئین دارد. فولات: ۳۳۰ میکروگرم DFE، معادل ۱۹۵ میکروگرم اسید فولیک.\nسایر مواد: کمپلکس کربوهیدرات چندمرحله‌ای (مالتودکسترین، سبوس جو دوسر، ایزومالتولوز)، ماتریکس پروتئین وی (کنسانتره‌ی پروتئین وی، ایزوله‌ی پروتئین وی هیدرولیزه، ایزوله‌ی پروتئین وی) و ۲٪ یا کمتر از: طعم‌دهنده‌های طبیعی و مصنوعی، پودر کاکائو (فرآوری‌شده با قلیا)، جایگزین کاکائو (پودر خرنوب، روغن نارگیل، جامدات شربت ذرت، کازئینات سدیم، مونو و دی‌گلیسیریدها، دی‌پتاسیم فسفات، دی‌اکسید سیلیکون، طعم‌دهنده‌ی طبیعی)، لسیتین سویا و/یا آفتابگردان، نمک، ترکیب ویتامین و مواد معدنی، سوکرالوز، آسه‌سولفام پتاسیم، ترکیب صمغ (صمغ سلولز، زانتان، کاراگینان) و تری‌گلیسیریدهای با زنجیره‌ی متوسط.",
    servingSize: "۶ اسکوپ (۵۶۹ گرم)",
    nutritionFacts: [
      { label: "کالری", amount: "۲۱۳۰" },
      { label: "چربی کل", amount: "۶ گرم" },
      { label: "چربی اشباع", amount: "۳٫۵ گرم" },
      { label: "کلسترول", amount: "۱۷۰ میلی‌گرم" },
      { label: "کربوهیدرات کل", amount: "۴۶۰ گرم" },
      { label: "فیبر غذایی", amount: "۲ گرم" },
      { label: "قندها", amount: "۲۴ گرم" },
      { label: "پروتئین", amount: "۶۰ گرم" },
      { label: "ویتامین A", amount: "۷۳۰ میکروگرم" },
      { label: "ویتامین C", amount: "۳۰ میلی‌گرم" },
      { label: "ویتامین D", amount: "۴٫۹ میکروگرم" },
      { label: "ویتامین E", amount: "۱۰٫۹ میلی‌گرم" },
      { label: "ویتامین K", amount: "۱۵ میکروگرم" },
      { label: "ویتامین B1 (تیامین)", amount: "۱٫۵ میلی‌گرم" },
      { label: "ویتامین B2 (ریبوفلاوین)", amount: "۱٫۵ میلی‌گرم" },
      { label: "ویتامین B3 (نیاسین)", amount: "۲۷٫۱ میلی‌گرم" },
      { label: "ویتامین B6", amount: "۱٫۵ میلی‌گرم" },
      { label: "فولات", amount: "۳۳۰ میکروگرم DFE" },
      { label: "ویتامین B12", amount: "۳ میکروگرم" },
      { label: "بیوتین", amount: "۱۵۷٫۸ میکروگرم" },
      { label: "ویتامین B5 (پانتوتنیک اسید)", amount: "۴٫۵ میلی‌گرم" },
      { label: "کلسیم", amount: "۲۹۰ میلی‌گرم" },
      { label: "آهن", amount: "۱۳٫۵ میلی‌گرم" },
      { label: "ید", amount: "۷۹ میکروگرم" },
      { label: "روی", amount: "۵٫۸ میلی‌گرم" },
      { label: "سلنیوم", amount: "۱۵ میکروگرم" },
      { label: "مس", amount: "۱٫۵ میلی‌گرم" },
      { label: "کروم", amount: "۱۵۶٫۳ میکروگرم" },
      { label: "سدیم", amount: "۸۳۰ میلی‌گرم" },
      { label: "پتاسیم", amount: "۵۵۰ میلی‌گرم" },
      { label: "ال-گلوتامین و گلوتامیک اسید", amount: "۱۰٫۶ گرم" },
      { label: "ال-لوسین", amount: "۶٫۴ گرم" },
      { label: "کراتین مونوهیدرات", amount: "۵ گرم" },
      { label: "ال-والین", amount: "۳٫۴ گرم" },
      { label: "ال-ایزولوسین", amount: "۳٫۴ گرم" },
    ],
    usage:
      "با شیکر: نصف وعده (۳ اسکوپ) را با ۸ تا ۱۰ اونس (حدود ۲۴۰ تا ۳۰۰ میلی‌لیتر) آب سرد در شیکر مخلوط کنید و دو بار در روز مصرف کنید.\nبا مخلوط‌کن: ۱ وعده‌ی کامل (۶ اسکوپ) را با ۱۶ تا ۲۰ اونس (حدود ۴۷۰ تا ۶۰۰ میلی‌لیتر) آب سرد در مخلوط‌کن مخلوط کنید و روزی یک بار مصرف کنید.\nصبح، بین وعده‌های غذایی یا بعد از تمرین مصرف کنید و در طول مصرف، هیدراتاسیون بدن را حفظ کنید.",
    warnings:
      "برای افراد زیر ۱۸ سال مناسب نیست. در دوران بارداری و شیردهی مصرف نکنید. اگر داروی رقیق‌کننده‌ی خون مصرف می‌کنید، بیماری دارید یا قبل از شروع هر رژیم غذایی یا برنامه‌ی ورزشی، با پزشک مشورت کنید. زنان در سن باروری باید مصرف روزانه‌ی ویتامین A را به ۳۰۰۰ میکروگرم (بدون احتساب بتاکاروتن) محدود کنند. دور از دسترس کودکان نگه دارید. در محل خنک و خشک (۱۶ تا ۲۷ درجه‌ی سانتی‌گراد) نگهداری کنید و اگر بسته‌بندی دستکاری شده بود، مصرف نکنید.\nحساسیت‌زاها: حاوی شیر و سویا. در مجموعه‌ای تولید می‌شود که تخم‌مرغ، بادام‌زمینی، گندم، آجیل درختی، ماهی، سخت‌پوستان و کنجد را هم فرآوری می‌کند.\nاین بیانیه‌ها توسط سازمان غذا و داروی آمریکا (FDA) ارزیابی نشده‌اند و این محصول برای تشخیص، درمان یا پیشگیری از هیچ بیماری‌ای نیست.",
    manufacturerClaims:
      "گینر حجم‌ساز برتر از نظر علمی\nپرکالری‌ترین گینری که مسل‌تک تا امروز فرموله کرده؛ برای افرادی که به‌سختی حجم می‌گیرند\n۶۰ گرم پروتئین و ۵ گرم کراتین مونوهیدرات در هر وعده\nعضله‌سازی، افزایش قدرت، حمایت از ریکاوری، کالری تمیز و طعم افسانه‌ای\nافزایش ۶٫۸ پوند (حدود ۳٫۱ کیلوگرم) در ۶۰ روز، ۵ برابر گروه کنترل: در یک مطالعه‌ی ۸ هفته‌ای دانشگاهی، افرادی که ۲۰۰۰ کالری به رژیم پرپروتئین و برنامه‌ی وزنه‌برداری خود اضافه کردند ۶٫۸ پوند توده به دست آوردند، در برابر ۱٫۳ پوند (حدود ۰٫۶ کیلوگرم) در گروه کنترل (مطالعه روی افزودن کالری بوده، نه خود این محصول)\nافزایش ۱۸٫۶٪ قدرت پرس سینه در ۱۰ روز: در یک مطالعه‌ی بالینی، افراد با مصرف همان دوز کراتینی که در این محصول هست به این نتیجه رسیدند (مطالعه روی کراتین بوده، نه خود این محصول)",
    brand: "MuscleTech",
    price: 2350000,
    categorySlug: "protein",
  },
  {
    id: "mt9",
    name: "کلیر ماسل - Clear Muscle Liquid HMB",
    slug: "muscletech-clear-muscle",
    size: "۸۴ سافت‌ژل",
    imageUrl: "/images/products/muscletech-clear-muscle.webp",
    description:
      "کلیر ماسل مسل‌تک، مکمل HMB مایع در سافت‌ژل شفاف. هر سافت‌ژل ۱ گرم HMB به شکل اسید آزاد (BetaTOR) و ۲۵۰ میلی‌گرم بتائین بی‌آب دارد. HMB (بتا هیدروکسی بتا متیل بوتیرات) از متابولیت‌های اسید آمینه‌ی لوسین است. بسته‌ی ۸۴ سافت‌ژلی با مصرف روزی ۳ عدد حدود ۲۸ روز است.\nسایر مواد: سافت‌ژل (گلیسیرین، نشاسته‌ی اصلاح‌شده، کاراگینان، سوربیتول، آب تصفیه‌شده) و پوشش (هیپروملوز، گلیسیرین، طعم‌دهنده‌ی طبیعی).",
    servingSize: "۱ سافت‌ژل",
    nutritionFacts: [
      { label: "بتا هیدروکسی بتا متیل بوتیرات - BetaTOR HMB", amount: "۱ گرم" },
      { label: "بتائین بی‌آب (از ریشه‌ی چغندر)", amount: "۲۵۰ میلی‌گرم" },
    ],
    usage:
      "روزی سه بار، هر بار ۱ وعده (۱ سافت‌ژل) را با یک لیوان آب مصرف کنید: صبح، بعدازظهر و شب. در روزهای تمرین، یکی از سه وعده را ۳۰ دقیقه قبل از تمرین مصرف کنید. بیش از ۳ وعده (۳ سافت‌ژل) در ۲۴ ساعت مصرف نکنید.\nطبق توصیه‌ی سازنده، برای بهترین نتیجه از همان برنامه‌ی تمرینی شرکت‌کنندگان مطالعه‌ی ۱۲ هفته‌ای استفاده کنید؛ جزئیات آن در سایت muscletech.com/trainhard آمده است.",
    warnings:
      "فقط برای بزرگسالان. در دوران بارداری و شیردهی مصرف نکنید. در صورت داشتن بیماری یا قبل از شروع هر رژیم غذایی یا برنامه‌ی ورزشی، پیش از مصرف با پزشک مشورت کنید. دور از دسترس کودکان نگه دارید. در محل خنک و خشک (۱۶ تا ۲۷ درجه‌ی سانتی‌گراد) نگهداری کنید و اگر بسته‌بندی دستکاری شده بود، مصرف نکنید.\nاین بیانیه‌ها توسط سازمان غذا و داروی آمریکا (FDA) ارزیابی نشده‌اند و این محصول برای تشخیص، درمان یا پیشگیری از هیچ بیماری‌ای نیست.",
    manufacturerClaims:
      "از نظر بالینی اثبات‌شده: عضله‌سازی، افزایش قدرت و بهبود ریکاوری\nجذب برتر نسبت به HMB معمولی\nنتایج اثبات‌شده با پشتوانه‌ی بیش از ۱۵ مطالعه‌ی بالینی\nاولین فرمول HMB با BetaTOR، یک HMB اسید آزاد ثبت‌اختراع‌شده و مشتق از لوسین، در سافت‌ژل مایع شفاف\nدر یک مطالعه‌ی ۱۲ هفته‌ای دانشگاهی، نتایج شرکت‌کنندگان چشمگیرتر از تحقیقات روی پروتئین، کراتین و BCAA بود: افزایش ۱۶ پوند (حدود ۷٫۳ کیلوگرم) عضله، ۲٫۵ برابر دارونما؛ افزایش ۲ برابری قدرت یک تکرار بیشینه نسبت به دارونما؛ و کاهش ۵ برابری کورتیزول (هورمون استرس عضلانی) نسبت به دارونما (این نتایج همراه با برنامه‌ی تمرینی خاص همان مطالعه به دست آمده است)",
    brand: "MuscleTech",
    price: 1450000,
    categorySlug: "creatine",
  },
  {
    id: "mt10",
    name: "کراتین پپتید ۴۴۷ - Creatine Peptide 447",
    slug: "muscletech-creatine-peptide-447",
    flavor: "بدون طعم",
    size: "۲۲۴ گرم",
    imageUrl: "/images/products/muscletech-creatine-peptide-447.jpg",
    description:
      "کراتین پپتید ۴۴۷ مسل‌تک ترکیبی از کراتین مونوهیدرات و پپتید کراتین PepForm (ایزوله‌ی پروتئین وی هیدرولیزه و کراتین مونوهیدرات)، همراه با ال-تیروزین و ال-تیانین. هر اسکوپ (۷ گرم) ۳ گرم کراتین مونوهیدرات و ۳ گرم پپتید کراتین دارد و بسته‌ی ۲۲۴ گرمی حدود ۳۰ وعده است.",
    servingSize: "۱ اسکوپ (۷ گرم)",
    nutritionFacts: [
      { label: "کالری", amount: "۱۰" },
      { label: "پروتئین", amount: "۱ گرم" },
      { label: "سدیم", amount: "۲۰ میلی‌گرم" },
      { label: "کراتین مونوهیدرات", amount: "۳ گرم" },
      { label: "پپتید کراتین PepForm", amount: "۳ گرم" },
      { label: "ال-تیروزین", amount: "۱ گرم" },
      { label: "ال-تیانین", amount: "۲۰۰ میلی‌گرم" },
    ],
    // The front-left claims (muscle size, strength multiples) are partly
    // hidden by the bottle's curve, and directions and warnings weren't in
    // the photos, so they're left out until a clearer label is available.
    manufacturerClaims:
      "عضله‌سازی و افزایش قدرت\n۴٫۴۷ برابر عضله‌ی بدون چربی بیشتر\n۳۰۰۰ میلی‌گرم پپتید کراتین ثبت‌اختراع‌شده و ۳۰۰۰ میلی‌گرم کراتین مونوهیدرات در هر وعده\nحمایت از عملکرد شناختی\n(جزئیات و مبنای این ادعاها روی بخشی از بسته است که در عکس‌ها نبود)",
    brand: "MuscleTech",
    price: 1350000,
    categorySlug: "creatine",
  },
  {
    id: "mt11",
    name: "نایترو تک وی پروتئین - Nitro-Tech Whey Protein",
    slug: "muscletech-nitro-tech-whey-protein",
    flavor: "شکلات شیری",
    size: "۹۰۷ گرم",
    imageUrl: "/images/products/muscletech-nitro-tech-whey-protein.webp",
    description:
      "نایترو تک مسل‌تک، پروتئین وی عضله‌ساز همراه با کراتین مونوهیدرات، با طعم شکلات شیری. هر اسکوپ (۴۵ گرم) ۳۰ گرم پروتئین، ۳ گرم کراتین مونوهیدرات و ۱۶۰ کالری دارد و بسته‌ی ۹۰۷ گرمی (۲ پوند) حدود ۲۰ وعده است.\nسایر مواد: ترکیب پروتئین (کنسانتره‌ی پروتئین وی، ایزوله‌ی پروتئین وی، پروتئین وی هیدرولیزه)، کاکائو (فرآوری‌شده با قلیا)، لسیتین سویا و/یا آفتابگردان، نمک، طعم‌دهنده‌های طبیعی و مصنوعی، سوکرالوز، ترکیب صمغ (گوار، صمغ عربی، زانتان)، استویول گلیکوزیدها و آنزیم‌های Enzyplex (پاپائین و آمیلاز).",
    servingSize: "۱ اسکوپ (۴۵ گرم)",
    nutritionFacts: [
      { label: "کالری", amount: "۱۶۰" },
      { label: "چربی کل", amount: "۳ گرم" },
      { label: "چربی اشباع", amount: "۱٫۵ گرم" },
      { label: "کلسترول", amount: "۸۰ میلی‌گرم" },
      { label: "کربوهیدرات کل", amount: "۴ گرم" },
      { label: "فیبر غذایی", amount: "کمتر از ۱ گرم" },
      { label: "قندها", amount: "۲ گرم" },
      { label: "پروتئین", amount: "۳۰ گرم" },
      { label: "کلسیم", amount: "۱۴۰ میلی‌گرم" },
      { label: "آهن", amount: "۰٫۷ میلی‌گرم" },
      { label: "سدیم", amount: "۲۸۰ میلی‌گرم" },
      { label: "پتاسیم", amount: "۲۷۰ میلی‌گرم" },
      { label: "ال-لوسین", amount: "۳٫۲ گرم" },
      { label: "ال-والین", amount: "۱٫۷ گرم" },
      { label: "ال-ایزولوسین", amount: "۱٫۷ گرم" },
      { label: "کراتین مونوهیدرات", amount: "۳ گرم" },
    ],
    usage:
      "۱ وعده (۱ اسکوپ) را در ۶ اونس (حدود ۱۸۰ میلی‌لیتر) آب سرد یا شیر بدون چربی در شیکر مخلوط کنید و بین وعده‌های اصلی غذا و بعد از ورزش مصرف کنید. طبق توصیه‌ی سازنده، برای بیشترین نتیجه روزانه ۴ وعده (۴ اسکوپ) به مدت دست‌کم ۶ هفته مصرف کنید. در طول مصرف، هیدراتاسیون بدن را حفظ کنید.",
    warnings:
      "برای افراد زیر ۱۸ سال مناسب نیست. در دوران بارداری و شیردهی مصرف نکنید. در صورت داشتن بیماری یا قبل از شروع هر رژیم غذایی یا برنامه‌ی ورزشی با پزشک مشورت کنید. دور از دسترس کودکان نگه دارید. در محل خنک و خشک (۱۶ تا ۲۷ درجه‌ی سانتی‌گراد) نگهداری کنید و اگر بسته‌بندی دستکاری شده بود، مصرف نکنید.\nتوجه: این محصول را فقط به‌عنوان مکمل غذایی مصرف کنید و برای کاهش وزن از آن استفاده نکنید.\nحساسیت‌زاها: حاوی شیر و سویا. در مجموعه‌ای تولید می‌شود که تخم‌مرغ، بادام‌زمینی، گندم، آجیل درختی، ماهی، سخت‌پوستان و کنجد را هم فرآوری می‌کند.\nاین بیانیه‌ها توسط سازمان غذا و داروی آمریکا (FDA) ارزیابی نشده‌اند و این محصول برای تشخیص، درمان یا پیشگیری از هیچ بیماری‌ای نیست.",
    manufacturerClaims:
      "پرفروش‌ترین پروتئین وی مسل‌تک\nپروتئین وی عضله‌ساز نهایی، تقویت‌شده با پرمطالعه‌ترین شکل کراتین\nعضله‌سازی، افزایش قدرت، بهبود عملکرد، حمایت از ریکاوری و طعم عالی\n۷۰٪ عضله‌ی بیشتر و ۱۴۳٪ قدرت بیشتر نسبت به وی معمولی: در یک مطالعه‌ی ۶ هفته‌ای دوسوکور روی افراد با دست‌کم ۳ سال سابقه‌ی وزنه‌برداری، مصرف‌کنندگان اجزای اصلی نایترو تک ۸٫۸ پوند (حدود ۴ کیلوگرم) عضله‌ی بدون چربی به دست آوردند، در برابر ۵٫۱ پوند (حدود ۲٫۳ کیلوگرم) با وی معمولی؛ و پرس سینه‌شان ۳۴ پوند (حدود ۱۵٫۴ کیلوگرم) افزایش یافت، در برابر ۱۴ پوند (حدود ۶٫۴ کیلوگرم) (مطالعه روی اجزای اصلی محصول بوده است)",
    brand: "MuscleTech",
    price: 1650000,
    categorySlug: "protein",
  },
  {
    id: "mt12",
    name: "آمینو بیلد بی‌سی‌ای‌ای - Amino Build BCAA",
    slug: "muscletech-amino-build-bcaa",
    flavor: "توت‌فرنگی هندوانه",
    size: "۵۳۱ گرم",
    imageUrl: "/images/products/muscletech-amino-build-bcaa.webp",
    description:
      "آمینو بیلد BCAA مسل‌تک، نوشیدنی ریکاوری بدون قند با الکترولیت و طعم توت‌فرنگی هندوانه. هر اسکوپ (۱۳ گرم) ۷ گرم BCAA (۴ گرم ال-لوسین، ۱٫۵ گرم ال-ایزولوسین و ۱٫۵ گرم ال-والین)، ۲ گرم تورین و ۹۹۱ میلی‌گرم ترکیب هیدراتاسیون MuscleLyte دارد. بسته‌ی ۵۳۱ گرمی حدود ۴۰ وعده است.\nسایر مواد: اسید مالیک، اسید سیتریک، دی‌اکسید سیلیکون، طعم‌دهنده‌های طبیعی و مصنوعی، سوکرالوز، استویول گلیکوزیدها (از عصاره‌ی برگ استویا)، اسید تارتاریک، لسیتین آفتابگردان، پودر آب چغندر (رنگ) و بتاکاروتن (رنگ).",
    servingSize: "۱ اسکوپ (۱۳ گرم)",
    nutritionFacts: [
      { label: "کالری", amount: "۳۰" },
      { label: "کربوهیدرات کل", amount: "۰ گرم" },
      { label: "قندها", amount: "۰ گرم" },
      { label: "کلسیم", amount: "۴۰ میلی‌گرم" },
      { label: "فسفر", amount: "۴۰ میلی‌گرم" },
      { label: "منیزیم", amount: "۳۵ میلی‌گرم" },
      { label: "سدیم", amount: "۱۰۰ میلی‌گرم" },
      { label: "پتاسیم", amount: "۱۵۰ میلی‌گرم" },
      { label: "ال-لوسین", amount: "۴ گرم" },
      { label: "تورین", amount: "۲ گرم" },
      { label: "ال-ایزولوسین", amount: "۱٫۵ گرم" },
      { label: "ال-والین", amount: "۱٫۵ گرم" },
      { label: "ترکیب هیدراتاسیون MuscleLyte", amount: "۹۹۱ میلی‌گرم" },
      { label: "کلسیم پتاسیم فسفات سیترات", amount: "۲۵۰ میلی‌گرم" },
      { label: "سدیم سیترات", amount: "۲۵۰ میلی‌گرم" },
      { label: "دی‌پتاسیم فسفات", amount: "۱۵۱ میلی‌گرم" },
      { label: "پتاسیم بی‌کربنات", amount: "۱۴۰ میلی‌گرم" },
      { label: "نمک صورتی هیمالیا", amount: "۵۰ میلی‌گرم" },
      { label: "منیزیم بیس‌گلیسینات کلات", amount: "۵۰ میلی‌گرم" },
      { label: "اکسید منیزیم", amount: "۵۰ میلی‌گرم" },
      { label: "سدیم کلرید", amount: "۵۰ میلی‌گرم" },
    ],
    usage: "روزی یک بار، ۱ وعده (۱ اسکوپ) را با ۸ اونس (حدود ۲۴۰ میلی‌لیتر) آب مخلوط و مصرف کنید.",
    warnings:
      "برای افراد زیر ۱۸ سال مناسب نیست. در دوران بارداری و شیردهی مصرف نکنید. در صورت داشتن بیماری یا قبل از شروع هر رژیم غذایی یا برنامه‌ی ورزشی با پزشک مشورت کنید. دور از دسترس کودکان نگه دارید. در محل خنک و خشک (۱۶ تا ۲۷ درجه‌ی سانتی‌گراد) نگهداری کنید و اگر بسته‌بندی دستکاری شده بود، مصرف نکنید.\nتوجه: این محصول را فقط به‌عنوان مکمل غذایی مصرف کنید و برای کاهش وزن از آن استفاده نکنید.\nحساسیت‌زاها: در مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ و سویا را هم فرآوری می‌کند.\nاین بیانیه‌ها توسط سازمان غذا و داروی آمریکا (FDA) ارزیابی نشده‌اند و این محصول برای تشخیص، درمان یا پیشگیری از هیچ بیماری‌ای نیست.",
    manufacturerClaims:
      "بدون قند\nسوخت ریکاوری تقویت‌شده با الکترولیت\nافزایش قدرت، جبران الکترولیت‌ها، افزایش استقامت و حمایت از ریکاوری\nهر وعده الکترولیت‌های کلیدی را برای جبران آنچه حین ورزش از دست می‌رود و بهبود هیدراتاسیون فراهم می‌کند\nافزایش ۴۰٪ قدرت: این محصول همان دوز ۴ گرمی ال-لوسین را دارد که در تحقیقات دانشگاهی به افزایش ۴۰٪ قدرت پنج تکرار بیشینه (در ۸ حرکت مختلف) کمک کرده است (مطالعه روی ال-لوسین بوده، نه خود این محصول)",
    brand: "MuscleTech",
    price: 1150000,
    categorySlug: "aminos",
  },
  {
    id: "mt13",
    name: "ویپور ایکس ۵ - Vapor X5",
    slug: "muscletech-vapor-x5",
    flavor: "تمشک آبی یخی",
    size: "۲۶۶ گرم",
    imageUrl: "/images/products/muscletech-vapor-x5.webp",
    description:
      "پیش‌تمرین ویپور ایکس ۵ مسل‌تک با طعم تمشک آبی یخی (Blue Razz Freeze). هر اسکوپ (۹ گرم) ۱۹۰ میلی‌گرم کافئین، ۱٫۶ گرم بتا-آلانین، ۱٫۵ گرم کراتین مونوهیدرات، ۱٫۲۵ گرم بتائین و ۷۵۰ میلی‌گرم نایتروسیژین دارد. مقادیر روی جلوی بسته (۳٫۲ گرم بتا-آلانین، ۳ گرم کراتین، ۲٫۵ گرم بتائین و ۱٫۵ گرم نایتروسیژین) برای ۲ اسکوپ است. بسته‌ی ۲۶۶ گرمی حدود ۳۰ اسکوپ است.\nسایر مواد: اسید سیتریک، دی‌اکسید سیلیکون، طعم‌دهنده‌های طبیعی و مصنوعی، اسید مالیک، مالتودکسترین مقاوم، سوکرالوز، آسه‌سولفام پتاسیم، ترکیب صمغ (صمغ سلولز، زانتان، کاراگینان) و رنگ FD&C Blue No. 1 (آبی شماره‌ی ۱).",
    servingSize: "۱ اسکوپ (۹ گرم)",
    nutritionFacts: [
      { label: "کربوهیدرات کل", amount: "کمتر از ۱ گرم" },
      { label: "نیاسین", amount: "۱۵ میلی‌گرم" },
      { label: "کولین", amount: "۴۰ میلی‌گرم" },
      { label: "آهن", amount: "۰٫۲ میلی‌گرم" },
      { label: "سدیم", amount: "۵ میلی‌گرم" },
      { label: "پتاسیم", amount: "۴۵ میلی‌گرم" },
      { label: "کراتین مونوهیدرات", amount: "۱۵۰۰ میلی‌گرم" },
      { label: "بتائین بی‌آب", amount: "۱۲۵۰ میلی‌گرم" },
      { label: "بتا-آلانین", amount: "۱۶۰۰ میلی‌گرم" },
      { label: "تورین", amount: "۵۰۰ میلی‌گرم" },
      { label: "نایتروسیژین (آرژنین اینوزیتول سیلیکات)", amount: "۷۵۰ میلی‌گرم" },
      { label: "عصاره‌ی میوه‌ی زالزالک", amount: "۲۰۰ میلی‌گرم" },
      { label: "کافئین بی‌آب", amount: "۱۹۰ میلی‌گرم" },
      { label: "کولین بیتارترات", amount: "۱۰۰ میلی‌گرم" },
      { label: "ال-تیانین", amount: "۶۲٫۵ میلی‌گرم" },
      { label: "عصاره‌ی خولنجان", amount: "۲۵ میلی‌گرم" },
      { label: "عصاره‌ی پوست یوهیمبه (۶٪ یوهیمبین)", amount: "۲۰ میلی‌گرم" },
    ],
    // The directions panel is cut off at the edge of the photo; with caffeine
    // and yohimbe in the formula they're left empty rather than guessed.
    warnings:
      "برای افراد زیر ۱۸ سال مناسب نیست. در دوران بارداری و شیردهی مصرف نکنید. اگر سابقه‌ی سکته‌ی قلبی دارید، مصرف نکنید. استنشاق پودر ممکن است واکنش التهابی راه‌های هوایی را در افراد مبتلا به آسم تشدید کند. یک وعده از این محصول حداکثر به اندازه‌ی ۲ فنجان قهوه کافئین دارد (۱۹۰ میلی‌گرم در هر اسکوپ). افراد حساس به کافئین ممکن است علائمی مانند بی‌قراری، عصبی بودن، لرزش، اضطراب، افزایش ضربان قلب یا اختلال خواب را تجربه کنند. با منابع دیگر کافئین یا محرک‌ها ترکیب نکنید. بعضی افراد ممکن است به‌خاطر دوز بالای بتا-آلانین احساس گزگز بی‌خطری داشته باشند. در صورت داشتن بیماری یا قبل از شروع هر رژیم غذایی یا برنامه‌ی ورزشی با پزشک مشورت کنید. دور از دسترس کودکان نگه دارید. در محل خنک و خشک (۱۶ تا ۲۷ درجه‌ی سانتی‌گراد) نگهداری کنید و اگر بسته‌بندی دستکاری شده بود، مصرف نکنید.\nحساسیت‌زاها: در مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، گندم، سویا، کنجد، بادام‌زمینی، آجیل درختی، ماهی و صدف را هم فرآوری می‌کند.\nاین بیانیه‌ها توسط سازمان غذا و داروی آمریکا (FDA) ارزیابی نشده‌اند و این محصول برای تشخیص، درمان یا پیشگیری از هیچ بیماری‌ای نیست.",
    manufacturerClaims:
      "انرژی و عملکرد انفجاری\nترکیبات کلیدی با پشتوانه‌ی تحقیقات\nافزایش قدرت و عضله‌ی بدون چربی",
    brand: "MuscleTech",
    price: 1390000,
    categorySlug: "pre-workout",
  },
  {
    id: "mt14",
    // \u200E (left-to-right mark) keeps the "+" at the end of the Latin name.
    name: "پلاتینیوم ای‌ای‌ای پلاس - Platinum 100% EAA+\u200E",
    slug: "muscletech-platinum-eaa-grape",
    groupSlug: "muscletech-platinum-eaa",
    flavor: "انگور",
    imageUrl: "/images/products/muscletech-platinum-eaa-grape.webp",
    description:
      "پلاتینیوم ۱۰۰٪ EAA پلاس مسل‌تک، اسیدهای آمینه‌ی ضروری همراه با الکترولیت، با طعم انگور. طبق جلوی بسته، هر وعده ۷٫۴ گرم EAA (شامل ۴٫۵ گرم BCAA) دارد و بسته‌ی ۳۸۷ گرمی ۳۰ وعده است.",
    // Only the per-serving values printed on the front of the pack.
    nutritionFacts: [
      { label: "اسیدهای آمینه‌ی ضروری - EAA", amount: "۷٫۴ گرم" },
      { label: "اسیدهای آمینه‌ی شاخه‌دار - BCAA", amount: "۴٫۵ گرم" },
    ],
    manufacturerClaims:
      "افزایش ۴۰٪ قدرت\nاسیدهای آمینه‌ی ضروری + الکترولیت‌ها\nترکیبات تست‌شده در دانشگاه\n(جزئیات و مبنای این ادعاها روی بخشی از بسته است که در عکس‌ها نبود)",
    brand: "MuscleTech",
    price: 1290000,
    categorySlug: "aminos",
  },
  {
    id: "mt14p",
    // \u200E (left-to-right mark) keeps the "+" at the end of the Latin name.
    name: "پلاتینیوم ای‌ای‌ای پلاس - Platinum 100% EAA+\u200E",
    slug: "muscletech-platinum-eaa-fruit-punch",
    groupSlug: "muscletech-platinum-eaa",
    flavor: "فروت پانچ",
    imageUrl: "/images/products/muscletech-platinum-eaa-fruit-punch.webp",
    description:
      "پلاتینیوم ۱۰۰٪ EAA پلاس مسل‌تک، اسیدهای آمینه‌ی ضروری همراه با الکترولیت، با طعم فروت پانچ. طبق جلوی بسته، هر وعده ۷٫۴ گرم EAA (شامل ۴٫۵ گرم BCAA) دارد و بسته‌ی ۳۹۳ گرمی ۳۰ وعده است.",
    // Only the per-serving values printed on the front of the pack.
    nutritionFacts: [
      { label: "اسیدهای آمینه‌ی ضروری - EAA", amount: "۷٫۴ گرم" },
      { label: "اسیدهای آمینه‌ی شاخه‌دار - BCAA", amount: "۴٫۵ گرم" },
    ],
    manufacturerClaims:
      "افزایش ۴۰٪ قدرت\nاسیدهای آمینه‌ی ضروری + الکترولیت‌ها\nترکیبات تست‌شده در دانشگاه\n(جزئیات و مبنای این ادعاها روی بخشی از بسته است که در عکس‌ها نبود)",
    brand: "MuscleTech",
    price: 1290000,
    categorySlug: "aminos",
  },
  {
    id: "mt15",
    name: "تست پپتید تی ۱۰ - Test Peptide T10",
    slug: "muscletech-test-peptide-t10",
    size: "۵۶ کپسول",
    imageUrl: "/images/products/muscletech-test-peptide-t10.jpg",
    description:
      "تست پپتید T10 مسل‌تک، مکمل حمایت از تستوسترون و میل جنسی سالم در آقایان. طبق جلوی بسته، هر وعده ۵۰۸ میلی‌گرم VasoDrive-AP و ۳۲۵ میلی‌گرم TestFACTOR دارد. بسته‌ی ۵۶ کپسولی است.",
    // Only the per-serving amounts printed on the front of the pack. The
    // facts panel, directions and warnings weren't in the photos; for a
    // hormone-support product they stay empty rather than guessed.
    nutritionFacts: [
      { label: "VasoDrive-AP", amount: "۵۰۸ میلی‌گرم" },
      { label: "TestFACTOR", amount: "۳۲۵ میلی‌گرم" },
    ],
    manufacturerClaims:
      "افزایش تستوسترون و حمایت از میل جنسی سالم\n۱۰ برابر تستوسترون کل بیشتر\nسیستم سه‌مرحله‌ای با فناوری پپتید\nحمایت بالینی از تستوسترون آزاد و کورتیزول، و داده‌های بالینی انسانی درباره‌ی توده‌ی بدون چربی\nمصرف روزانه بدون نیاز به دوره‌بندی\n(جزئیات و مبنای این ادعاها روی بخشی از بسته است که در عکس‌ها نبود)",
    brand: "MuscleTech",
    price: 1590000,
    categorySlug: "creatine",
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
    groupSlug: "scitec-whey-protein-professional",
    flavor: "چیزکیک ماچا",
    size: "۲۳۵۰ گرم",
    imageUrl: "/images/products/scitec-whey-protein-professional.webp",
    // Label details from the product page of Scitec's German shop
    // (scitecshop.de, product p5146), which the pack photo doesn't show. That
    // page gives one facts table for all flavours, without a Matcha-specific
    // ingredient list, so flavour-only warnings (caffeine in Iced Coffee,
    // colourings in some flavours) are left out.
    description:
      "۱۰۰٪ وی پروتئین پروفشنال سایتک نوتریشن با طعم چیزکیک ماچا؛ پودر نوشیدنی پروتئینی از کنسانتره و ایزوله‌ی وی، با اسیدهای آمینه و آنزیم‌های گوارشی افزوده. هر وعده (۳۰ گرم) ۲۲ گرم پروتئین و ۱۱۴ کیلوکالری دارد و بسته‌ی ۲۳۵۰ گرمی ۷۸ وعده است.\nپروفایل آمینو اسید در هر ۱۰۰ گرم: اسیدهای آمینه‌ی ضروری ۳۲٫۸ گرم (شامل لوسین ۷٫۷، لیزین ۶٫۴، ترئونین ۴٫۵، ایزولوسین ۴٫۰ و والین ۳٫۹ گرم)، مجموع BCAA ۱۵٫۶ گرم و گلوتامین ۱۳٫۷ گرم.\nمواد تشکیل‌دهنده‌ی پایه: پروتئین‌های فوری وی (کنسانتره و ایزوله‌ی پروتئین وی از شیر، امولسیفایر لسیتین سویا)، تورین، ال-آرژنین، ال-گلوتامین، ال-لوسین، طعم‌دهنده‌ها، نمک دریا، قوام‌دهنده (زانتان)، شیرین‌کننده‌ها (آسه‌سولفام پتاسیم، سوکرالوز)، ضدکلوخه (دی‌اکسید سیلیکون)، بروملائین و پاپائین. ترکیبات اختصاصی هر طعم ممکن است متفاوت باشد.",
    servingSize: "۳۰ گرم (۳/۴ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۴ کیلوکالری" },
      { label: "چربی", amount: "۱٫۸ گرم" },
      { label: "چربی اشباع", amount: "۱٫۰ گرم" },
      { label: "کربوهیدرات", amount: "۲٫۵ گرم" },
      { label: "قندها", amount: "۱٫۸ گرم" },
      { label: "پروتئین", amount: "۲۲ گرم" },
      { label: "نمک", amount: "۰٫۳۹ گرم" },
      { label: "تورین", amount: "۹۹۰ میلی‌گرم" },
      { label: "ال-گلوتامین", amount: "۵۰۰ میلی‌گرم" },
      { label: "ال-آرژنین", amount: "۴۱۴ میلی‌گرم" },
      { label: "ال-لوسین (افزوده)", amount: "۱۰۰ میلی‌گرم" },
      { label: "بروملائین", amount: "۱۳ میلی‌گرم" },
      { label: "پاپائین", amount: "۱۳ میلی‌گرم" },
    ],
    usage:
      "روزانه ۱ وعده (۳۰ گرم، ۳/۴ اسکوپ) را با ۲۵۰ میلی‌لیتر آب مصرف کنید. در روزهای تمرین، بعد از تمرین و در روزهای استراحت، در هر زمانی از روز.",
    warnings:
      "حساسیت‌زاها: حاوی شیر و سویا. در مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، سویا، بادام‌زمینی، آجیل درختی، کرفس، ماهی، سخت‌پوستان، نرم‌تنان و دی‌اکسید گوگرد را هم فرآوری می‌کند.",
    manufacturerClaims:
      "تمام پروتئین آن از وی است\nبا اسیدهای آمینه‌ی افزوده\nبا آنزیم‌های گوارشی\nبا پروتئین‌های فوری وی (حل‌شدن سریع)\nبدون گلوتن\nپروتئین به افزایش و حفظ توده‌ی عضلانی و حفظ سلامت استخوان‌ها کمک می‌کند (ادعای سلامت مورد تأیید اتحادیه‌ی اروپا)",
    brand: "Scitec Nutrition",
    price: 2150000,
    categorySlug: "protein",
  },
  {
    id: "sc1c",
    // \u200E (left-to-right mark) keeps "100%" with the Latin name that follows it.
    name: "وی پروتئین پروفشنال - \u200E100% Whey Protein Professional",
    slug: "scitec-whey-protein-professional-chocolate",
    groupSlug: "scitec-whey-protein-professional",
    flavor: "شکلات",
    size: "۱۸۱۶ گرم",
    imageUrl: "/images/products/scitec-whey-protein-professional-chocolate.webp",
    // Same facts table as sc1 on Scitec's German shop (product p17604). The
    // page lists two "Schokolade" ingredient lists; the one with low-fat
    // cocoa is used, the other (with beetroot) looks misfiled.
    description:
      "۱۰۰٪ وی پروتئین پروفشنال سایتک نوتریشن با طعم شکلات؛ پودر نوشیدنی پروتئینی از کنسانتره و ایزوله‌ی وی، با اسیدهای آمینه و آنزیم‌های گوارشی افزوده. هر وعده (۳۰ گرم) ۲۲ گرم پروتئین و ۱۱۴ کیلوکالری دارد و بسته‌ی ۱۸۱۶ گرمی ۶۰ وعده است.\nپروفایل آمینو اسید در هر ۱۰۰ گرم: اسیدهای آمینه‌ی ضروری ۳۲٫۸ گرم (شامل لوسین ۷٫۷، لیزین ۶٫۴، ترئونین ۴٫۵، ایزولوسین ۴٫۰ و والین ۳٫۹ گرم)، مجموع BCAA ۱۵٫۶ گرم و گلوتامین ۱۳٫۷ گرم.\nمواد تشکیل‌دهنده: پروتئین‌های فوری وی ۸۵٪ (کنسانتره و ایزوله‌ی پروتئین وی از شیر، امولسیفایر لسیتین سویا)، تورین ۳٫۳٪، پودر کاکائوی کم‌چرب، طعم‌دهنده‌ها، ال-آرژنین ۱٫۷٪، ال-گلوتامین ۱٫۷٪، نمک، قوام‌دهنده (زانتان)، ال-لوسین ۰٫۳٪، شیرین‌کننده‌ها (آسه‌سولفام پتاسیم، سوکرالوز)، ضدکلوخه (دی‌اکسید سیلیکون)، بروملائین (از آناناس) ۰٫۰۷٪ و پاپائین (از پاپایا) ۰٫۰۷٪.",
    servingSize: "۳۰ گرم (۳/۴ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۴ کیلوکالری" },
      { label: "چربی", amount: "۱٫۸ گرم" },
      { label: "چربی اشباع", amount: "۱٫۰ گرم" },
      { label: "کربوهیدرات", amount: "۲٫۵ گرم" },
      { label: "قندها", amount: "۱٫۸ گرم" },
      { label: "پروتئین", amount: "۲۲ گرم" },
      { label: "نمک", amount: "۰٫۳۹ گرم" },
      { label: "تورین", amount: "۹۹۰ میلی‌گرم" },
      { label: "ال-گلوتامین", amount: "۵۰۰ میلی‌گرم" },
      { label: "ال-آرژنین", amount: "۴۱۴ میلی‌گرم" },
      { label: "ال-لوسین (افزوده)", amount: "۱۰۰ میلی‌گرم" },
      { label: "بروملائین", amount: "۱۳ میلی‌گرم" },
      { label: "پاپائین", amount: "۱۳ میلی‌گرم" },
    ],
    usage:
      "روزانه ۱ وعده (۳۰ گرم، ۳/۴ اسکوپ) را با ۲۵۰ میلی‌لیتر آب مصرف کنید. در روزهای تمرین، بعد از تمرین و در روزهای استراحت، در هر زمانی از روز.",
    warnings:
      "حساسیت‌زاها: حاوی شیر و سویا. در مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، سویا، بادام‌زمینی، آجیل درختی، کرفس، ماهی، سخت‌پوستان، نرم‌تنان و دی‌اکسید گوگرد را هم فرآوری می‌کند.",
    manufacturerClaims:
      "تمام پروتئین آن از وی است\nبا اسیدهای آمینه‌ی افزوده\nبا آنزیم‌های گیاهی گوارشی\nکم‌قند، بدون گلوتن و بدون روغن پالم\nبا پروتئین‌های فوری وی (حل‌شدن سریع)\nپروتئین به افزایش و حفظ توده‌ی عضلانی و حفظ سلامت استخوان‌ها کمک می‌کند (ادعای سلامت مورد تأیید اتحادیه‌ی اروپا)",
    brand: "Scitec Nutrition",
    price: 1750000,
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
    // \u200E (left-to-right mark) keeps "100%" with the Latin name that follows it.
    name: "کراتین مونوهیدرات - \u200E100% Creatine Monohydrate",
    slug: "scitec-creatine-monohydrate",
    groupSlug: "scitec-creatine-monohydrate",
    flavor: "بدون طعم",
    size: "۵۰۰ گرم",
    imageUrl: "/images/products/scitec-creatine-monohydrate.webp",
    // Label details from the product page of Scitec's German shop
    // (scitecshop.de, p9581); claims from the pack photo.
    description:
      "۱۰۰٪ کراتین مونوهیدرات سایتک نوتریشن، بدون طعم؛ پودر نوشیدنی از کراتین مونوهیدرات میکرونیزه‌ی خالص. هر وعده (۳٫۴ گرم) ۳ گرم کراتین دارد و بسته‌ی ۵۰۰ گرمی ۱۴۷ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات میکرونیزه ۱۰۰٪.",
    servingSize: "۳٫۴ گرم (۱/۲ اسکوپ)",
    nutritionFacts: [
      { label: "کراتین مونوهیدرات", amount: "۳۴۰۰ میلی‌گرم" },
      { label: "کراتین", amount: "۳۰۰۰ میلی‌گرم" },
    ],
    usage:
      "روزانه ۱ وعده (۳٫۴ گرم، ۱/۲ اسکوپ) را در ۳۰۰ میلی‌لیتر آب حل کنید و مصرف کنید. در روزهای تمرین ۳۰ دقیقه پیش از تمرین و در روزهای استراحت پیش از غذا. از مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.",
    warnings:
      "در مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، سویا، بادام‌زمینی، آجیل، کرفس، ماهی، سخت‌پوستان و دی‌اکسید گوگرد را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۳ گرم کراتین در هر وعده\nوگان\nبدون قند و بدون گلوتن\nکراتین عملکرد بدنی را در تمرین‌های کوتاه‌مدت و پرشدت افزایش می‌دهد (ادعای سلامت مورد تأیید اتحادیه‌ی اروپا)",
    brand: "Scitec Nutrition",
    price: 820000,
    categorySlug: "creatine",
  },
  {
    id: "sc3s",
    // \u200E (left-to-right mark) keeps "100%" with the Latin name that follows it.
    name: "کراتین مونوهیدرات - \u200E100% Creatine Monohydrate",
    slug: "scitec-creatine-monohydrate-300g",
    groupSlug: "scitec-creatine-monohydrate",
    flavor: "بدون طعم",
    size: "۳۰۰ گرم",
    imageUrl: "/images/products/scitec-creatine-monohydrate-300g.webp",
    // Same facts as sc3 on Scitec's German shop (p2164); claims from the pack
    // photo, which doesn't show the sugar-free and gluten-free marks.
    description:
      "۱۰۰٪ کراتین مونوهیدرات سایتک نوتریشن، بدون طعم؛ پودر نوشیدنی از کراتین مونوهیدرات میکرونیزه‌ی خالص. هر وعده (۳٫۴ گرم) ۳ گرم کراتین دارد و بسته‌ی ۳۰۰ گرمی ۸۸ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات میکرونیزه ۱۰۰٪.",
    servingSize: "۳٫۴ گرم (۱/۲ اسکوپ)",
    nutritionFacts: [
      { label: "کراتین مونوهیدرات", amount: "۳۴۰۰ میلی‌گرم" },
      { label: "کراتین", amount: "۳۰۰۰ میلی‌گرم" },
    ],
    usage:
      "روزانه ۱ وعده (۳٫۴ گرم، ۱/۲ اسکوپ) را در ۳۰۰ میلی‌لیتر آب حل کنید و مصرف کنید. در روزهای تمرین ۳۰ دقیقه پیش از تمرین و در روزهای استراحت پیش از غذا. از مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.",
    warnings:
      "در مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، سویا، بادام‌زمینی، آجیل، کرفس، ماهی، سخت‌پوستان و دی‌اکسید گوگرد را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۳ گرم کراتین در هر وعده\nوگان\nکراتین عملکرد بدنی را در تمرین‌های کوتاه‌مدت و پرشدت افزایش می‌دهد (ادعای سلامت مورد تأیید اتحادیه‌ی اروپا)",
    brand: "Scitec Nutrition",
    price: 550000,
    categorySlug: "creatine",
  },
  {
    id: "sc3l",
    // \u200E (left-to-right mark) keeps "100%" with the Latin name that follows it.
    name: "کراتین مونوهیدرات - \u200E100% Creatine Monohydrate",
    slug: "scitec-creatine-monohydrate-1000g",
    groupSlug: "scitec-creatine-monohydrate",
    flavor: "بدون طعم",
    size: "۱۰۰۰ گرم",
    imageUrl: "/images/products/scitec-creatine-monohydrate-1000g.webp",
    // The pack photo is the older label design. Facts from Scitec's German
    // shop (p2166), whose table matches sc3. That page's older text also has a
    // loading phase (body weight in kg ÷ 3 = grams a day for a week), which
    // contradicts its own 3.4 g serving, so the current directions are used.
    description:
      "۱۰۰٪ کراتین مونوهیدرات سایتک نوتریشن، بدون طعم؛ پودر کراتین مونوهیدرات میکرونیزه‌ی خالص. هر وعده (۳٫۴ گرم) ۳ گرم کراتین دارد و بسته‌ی ۱۰۰۰ گرمی ۲۹۴ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات میکرونیزه ۱۰۰٪.",
    servingSize: "۳٫۴ گرم (۱/۲ اسکوپ)",
    nutritionFacts: [
      { label: "کراتین مونوهیدرات", amount: "۳۴۰۰ میلی‌گرم" },
      { label: "کراتین", amount: "۳۰۰۰ میلی‌گرم" },
    ],
    usage:
      "روزانه ۱ وعده (۳٫۴ گرم، ۱/۲ اسکوپ) را در ۳۰۰ میلی‌لیتر آب حل کنید و مصرف کنید. در روزهای تمرین ۳۰ دقیقه پیش از تمرین و در روزهای استراحت پیش از غذا. در طول مصرف کراتین آب کافی بنوشید. از مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.",
    warnings:
      "در مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، سویا، بادام‌زمینی، آجیل، کرفس، ماهی، سخت‌پوستان و دی‌اکسید گوگرد را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۱۰۰٪ کراتین مونوهیدرات میکرونیزه\nبه گفته‌ی سازنده، کراتین مونوهیدرات در صدها کارآزمایی بالینی بررسی شده و ذخیره‌ی کل کراتین عضله را افزایش می‌دهد",
    brand: "Scitec Nutrition",
    price: 1450000,
    categorySlug: "creatine",
  },
  {
    id: "sc3w",
    // \u200E (left-to-right mark) keeps "100%" with the Latin name that follows it.
    name: "کراتین مونوهیدرات - \u200E100% Creatine Monohydrate",
    slug: "scitec-creatine-monohydrate-watermelon",
    groupSlug: "scitec-creatine-monohydrate",
    flavor: "هندوانه",
    size: "۳۰۰ گرم",
    imageUrl: "/images/products/scitec-creatine-monohydrate-watermelon.webp",
    // The fruit in the photo hides the weight; 300 g and the label details are
    // from Scitec's German shop (p17387): 5 g serving × 68% creatine
    // monohydrate = 3.4 g, 3 g of it creatine, and 60 × 5 g = 300 g.
    description:
      "۱۰۰٪ کراتین مونوهیدرات سایتک نوتریشن با طعم هندوانه؛ پودر نوشیدنی بدون قند از کراتین مونوهیدرات میکرونیزه. هر وعده (۵ گرم) ۳ گرم کراتین دارد و بسته‌ی ۳۰۰ گرمی ۶۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات میکرونیزه ۶۸٪، طعم‌دهنده‌ها، حجم‌دهنده (پلی‌دکستروز)، اسیدی‌کننده (مالیک اسید)، کنسانتره‌ی رنگی خوراکی (مالتودکسترین، کنسانتره‌ی چغندر، سیتریک اسید)، شیرین‌کننده (سوکرالوز) و نمک.",
    servingSize: "۵ گرم (۱ اسکوپ، معادل ۲ قاشق چای‌خوری)",
    nutritionFacts: [
      { label: "کراتین مونوهیدرات", amount: "۳۴۰۰ میلی‌گرم" },
      { label: "کراتین", amount: "۳۰۰۰ میلی‌گرم" },
    ],
    usage:
      "روزانه ۱ وعده (۵ گرم، ۱ اسکوپ یا ۲ قاشق چای‌خوری) را در ۲۵۰ میلی‌لیتر آب یا نوشیدنی دلخواه حل کنید و مصرف کنید. برای اندازه‌گیری دقیق از ترازوی گرمی استفاده کنید. از مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.",
    warnings:
      "مکمل غذایی جایگزین رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم نیست.\nدور از دسترس کودکان نگهداری شود.\nبرای افراد زیر ۱۸ سال، زنان باردار یا شیرده و افرادی که تحت درمان پزشکی هستند توصیه نمی‌شود.\nدر مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، سویا، بادام‌زمینی، آجیل، کرفس، ماهی، سخت‌پوستان و دی‌اکسید گوگرد را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۳ گرم کراتین در هر وعده\nتمام کراتین آن از کراتین مونوهیدرات است\nوگان\nبدون قند (حداکثر ۰٫۵ گرم قند در ۱۰۰ میلی‌لیتر نوشیدنی آماده)\nبدون گلوتن (حداکثر ۲۰ میلی‌گرم گلوتن در هر کیلوگرم نوشیدنی آماده)\nکراتین عملکرد بدنی را در تمرین‌های کوتاه‌مدت و پرشدت افزایش می‌دهد (ادعای سلامت مورد تأیید اتحادیه‌ی اروپا)",
    brand: "Scitec Nutrition",
    price: 600000,
    categorySlug: "creatine",
  },
  {
    id: "sc4",
    // \u200E (left-to-right mark) keeps "100%" with the Latin name that follows it.
    name: "هیدرو ایزوله - \u200E100% Hydro Isolate",
    slug: "scitec-hydro-isolate",
    flavor: "وانیل",
    size: "۲۰۰۰ گرم",
    imageUrl: "/images/products/scitec-hydro-isolate.webp",
    // Flavour, weight and servings from the pack photo (it says 86 servings;
    // the shop page says 87). The rest is from the product page of Scitec's
    // German shop (scitecshop.de, p15863). That page's fat and sugar rows
    // don't add up (0.5 g per 23 g but 1.5 g per 100 g; one sugar value
    // above the serving's total carbs), so those two rows are left out.
    description:
      "۱۰۰٪ هیدرو ایزوله سایتک نوتریشن با طعم وانیل؛ پودر نوشیدنی ایزوله‌ی پروتئین وی هیدرولیزه با اسیدهای آمینه‌ی افزوده (ال-گلوتامین و ال-آرژنین). هر وعده (۲۳ گرم) ۱۹ گرم پروتئین و ۸۶ کیلوکالری دارد و بسته‌ی ۲۰۰۰ گرمی ۸۶ وعده است.\nپروفایل آمینو اسید در هر ۱۰۰ گرم: مجموع BCAA ۱۶٫۶ گرم (لوسین ۸٫۰، ایزولوسین ۴٫۴ و والین ۴٫۲ گرم)، گلوتامین و گلوتامیک اسید ۱۸٫۷ گرم، لیزین ۷٫۰ گرم و ترئونین ۴٫۹ گرم.\nمواد تشکیل‌دهنده‌ی پایه: پروتئین فوری وی هیدرولیزه ۸۵٪ (ایزوله‌ی پروتئین وی هیدرولیزه، امولسیفایر لسیتین سویا)، ال-گلوتامین ۵٫۲٪، ال-آرژنین ۱٫۷٪، طعم‌دهنده‌ها، نمک و شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم). ترکیبات اختصاصی هر طعم ممکن است متفاوت باشد.",
    servingSize: "۲۳ گرم (۲/۳ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۸۶ کیلوکالری" },
      { label: "کربوهیدرات", amount: "۱٫۵ گرم" },
      { label: "پروتئین", amount: "۱۹ گرم" },
      { label: "نمک", amount: "۰٫۳۲ گرم" },
      { label: "ال-گلوتامین", amount: "۱۲۰۰ میلی‌گرم" },
      { label: "ال-آرژنین", amount: "۴۰۰ میلی‌گرم" },
    ],
    // The pack and shop page give no directions; this is the store's own
    // advice, followed by the general guidance of the ISSN position stand on
    // protein and exercise (Jäger et al., 2017).
    usage:
      "پیشنهاد فروشگاه: روزانه ۲ وعده (هر وعده ۲۳ گرم، ۲/۳ اسکوپ) را در آب یا شیر حل کنید و مصرف کنید: یک وعده صبح، و یک وعده بلافاصله بعد از تمرین.\nراهنمای عمومی (بیانیه‌ی موضع انجمن بین‌المللی تغذیه‌ی ورزشی، ISSN): برای بیشتر ورزشکارانی که می‌خواهند عضله بسازند یا حفظ کنند، دریافت کل پروتئین روزانه حدود ۱٫۴ تا ۲ گرم به ازای هر کیلوگرم وزن بدن کافی است. بهتر است این مقدار در وعده‌های ۲۰ تا ۴۰ گرمی و هر ۳ تا ۴ ساعت در طول روز پخش شود. این مکمل جایگزین وعده‌های غذایی متنوع نیست؛ در صورت داشتن بیماری کلیوی یا هر بیماری دیگر، پیش از مصرف با پزشک مشورت کنید.",
    warnings:
      "حساسیت‌زاها: حاوی شیر و سویا. در مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، سویا، بادام‌زمینی، آجیل درختی، کرفس، ماهی، سخت‌پوستان، نرم‌تنان و دی‌اکسید گوگرد را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۱۰۰٪ پروتئین از وی هیدرولیزه\nبا ال-گلوتامین و ال-آرژنین افزوده\nبدون قند، بدون گلوتن و بدون روغن پالم\nپروتئین به افزایش و حفظ توده‌ی عضلانی و حفظ سلامت استخوان‌ها کمک می‌کند (ادعای سلامت مورد تأیید اتحادیه‌ی اروپا)",
    brand: "Scitec Nutrition",
    price: 2650000,
    categorySlug: "protein",
  },
  {
    id: "sc5",
    name: "بی‌سی‌ای‌ای + گلوتامین اکسپرس - BCAA + Glutamine Xpress",
    slug: "scitec-bcaa-glutamine-xpress-apple",
    groupSlug: "scitec-bcaa-glutamine-xpress",
    flavor: "سیب",
    size: "۶۰۰ گرم",
    imageUrl: "/images/products/scitec-bcaa-glutamine-xpress-apple.webp",
    // Flavour from the pack photo; the rest from the product page of Scitec's
    // German shop (scitecshop.de, p13026). That page's one ingredient list
    // names kiwi, melon and apricot flavourings and colourings that don't fit
    // the apple flavour, so only the shared base ingredients are listed.
    description:
      "بی‌سی‌ای‌ای + گلوتامین اکسپرس سایتک نوتریشن با طعم سیب؛ پودر نوشیدنی بدون قند از اسیدهای آمینه‌ی شاخه‌دار (BCAA) با نسبت ۲:۱:۱، ال-گلوتامین و تورین افزوده. هر وعده (۱۲ گرم) ۵ گرم BCAA و ۵ گرم گلوتامین دارد و بسته‌ی ۶۰۰ گرمی ۵۰ وعده است.\nمواد تشکیل‌دهنده‌ی پایه: ال-گلوتامین، ال-لوسین، ال-ایزولوسین، ال-والین، طعم‌دهنده‌ها، تورین، شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم) و اسیدی‌کننده (سیتریک اسید). ترکیبات اختصاصی هر طعم ممکن است متفاوت باشد.",
    servingSize: "۱۲ گرم (۱ و ۱/۴ اسکوپ)",
    nutritionFacts: [
      { label: "BCAA", amount: "۵۰۰۰ میلی‌گرم" },
      { label: "ال-لوسین", amount: "۲۵۰۰ میلی‌گرم" },
      { label: "ال-ایزولوسین", amount: "۱۲۵۰ میلی‌گرم" },
      { label: "ال-والین", amount: "۱۲۵۰ میلی‌گرم" },
      { label: "ال-گلوتامین", amount: "۵۰۰۰ میلی‌گرم" },
      { label: "تورین", amount: "۳۰۰ میلی‌گرم" },
    ],
    usage:
      "روزانه ۱ وعده (۱۲ گرم، ۱ و ۱/۴ اسکوپ) را در ۶۰۰ میلی‌لیتر آب سرد حل کنید و پیش، حین یا بعد از تمرین مصرف کنید.",
    warnings:
      "از مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.\nمکمل غذایی جایگزین رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم نیست.\nدور از دسترس کودکان نگهداری شود.\nدر مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، سویا، بادام‌زمینی، آجیل، کرفس، ماهی، سخت‌پوستان و دی‌اکسید گوگرد را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۵ گرم BCAA با نسبت ۲:۱:۱ در هر وعده\n۵ گرم گلوتامین در هر وعده\nبا تورین افزوده\nبدون قند (در نوشیدنی آماده)\nبدون گلوتن",
    brand: "Scitec Nutrition",
    price: 1100000,
    categorySlug: "aminos",
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
