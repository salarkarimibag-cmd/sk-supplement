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

// Shared by both Opti-Women counts (60 and 120 capsules have the same label).
// From ON's US shop (en-us/products/opti-women-multivitamin): facts panel,
// back and side label images, label version V.5.450.1025US. This newer
// formula has only vitamins and minerals; the older one's herbal extracts
// (chasteberry, garcinia, uva ursi...) and soy isoflavones are gone.
const onOptiWomenFacts = [
  { label: "ویتامین A (بتاکاروتن)", amount: "۹۰۰ میکروگرم" },
  { label: "ویتامین C (اسید اسکوربیک)", amount: "۳۷۵ میلی‌گرم" },
  { label: "ویتامین D (کوله‌کلسیفرول)", amount: "۳۰ میکروگرم" },
  { label: "ویتامین E (دی-آلفا توکوفریل سوکسینات)", amount: "۵۰ میلی‌گرم" },
  { label: "تیامین (ویتامین B1)", amount: "۱۰ میلی‌گرم" },
  { label: "ریبوفلاوین (ویتامین B2)", amount: "۱۲ میلی‌گرم" },
  { label: "نیاسین (نیاسینامید)", amount: "۱۶ میلی‌گرم" },
  { label: "ویتامین B6 (پیریدوکسین هیدروکلراید)", amount: "۱۲ میلی‌گرم" },
  { label: "فولات (۳۶۰ میکروگرم اسید فولیک)", amount: "۶۰۰ میکروگرم DFE" },
  { label: "ویتامین B12 (سیانوکوبالامین)", amount: "۱۸ میکروگرم" },
  { label: "بیوتین", amount: "۲۵ میکروگرم" },
  { label: "پانتوتنیک اسید (کلسیم دی-پانتوتنات)", amount: "۱۰ میلی‌گرم" },
  { label: "کلسیم (کربنات کلسیم)", amount: "۱۹۰ میلی‌گرم" },
  { label: "آهن (فروس فومارات)", amount: "۱۸ میلی‌گرم" },
  { label: "ید (یدید پتاسیم)", amount: "۲۰۰ میکروگرم" },
  { label: "منیزیم (اکسید منیزیم)", amount: "۸۰ میلی‌گرم" },
  { label: "روی (سیترات روی)", amount: "۱۱ میلی‌گرم" },
  { label: "سلنیوم (سلنات سدیم، ال-سلنومتیونین)", amount: "۵۵ میکروگرم" },
  { label: "مس (گلوکونات مس)", amount: "۰٫۹ میلی‌گرم" },
  { label: "منگنز (سولفات منگنز)", amount: "۵٫۸ میلی‌گرم" },
  { label: "کروم (کلرید کروم)", amount: "۳۵ میکروگرم" },
  { label: "مولیبدن (کلات اسید آمینه‌ی مولیبدن)", amount: "۴۲ میکروگرم" },
];
const onOptiWomenUsage =
  "روزانه ۲ کپسول همراه غذا مصرف کنید.\nبرای بزرگسالان سالم و به‌عنوان بخشی از رژیم غذایی سالم و متعادل و برنامه‌ی ورزشی.\nدر جای خنک و خشک نگهداری کنید.";
const onOptiWomenWarnings =
  "مصرف بیش از حد تصادفی محصولات حاوی آهن یکی از علت‌های اصلی مسمومیت کشنده در کودکان زیر ۶ سال است. دور از دسترس کودکان نگهداری شود. در صورت مصرف بیش از حد تصادفی، فوراً با پزشک یا مرکز کنترل مسمومیت تماس بگیرید.\nاگر دارو مصرف می‌کنید یا به علت بیماری تحت نظر پزشک هستید، پیش از مصرف با پزشک مشورت کنید.\nبرای افراد زیر ۱۸ سال و زنان باردار، در حال اقدام به بارداری یا شیرده مناسب نیست.";
const onOptiWomenClaims =
  "مولتی ویتامین مخصوص بانوان فعال: ۲۲ ویتامین و ماده‌ی معدنی\n۱۹۰ میلی‌گرم کلسیم، ۱۸ میلی‌گرم آهن و ۶۰۰ میکروگرم فولات در هر وعده (۲ کپسول)\nکپسول گیاهی Vcaps مورد تأیید Vegetarian Society\nبه گفته‌ی سازنده: حمایت از متابولیسم انرژی سلولی (ویتامین‌های B به تجزیه و انتقال مواد مغذی کمک می‌کنند)، سلامت سیستم ایمنی و سلامت عضلات و استخوان‌ها (این ادعاها توسط FDA ارزیابی نشده است)";

// Shared by every Serious Mass flavour and size on ON's UK shop.
const onSeriousMassMicronutrients =
  "مواد معدنی (منیزیم، آهن، روی، منگنز، فلوراید، سلنیوم، ید (از جلبک کلپ)، مس، مولیبدن، کروم)، ویتامین‌ها (C، E، B3، A، پانتوتنیک اسید (B5)، بیوتین، B12، فولیک اسید، D، B6، B1، K، B2)";
const onSeriousMassUsage = (servingGrams: string) =>
  `۲ اسکوپ سرپر (حدود ${servingGrams} گرم) را در مخلوط‌کنی که ۷۱۰ میلی‌لیتر آب دارد بریزید و ۳۰ تا ۴۵ ثانیه مخلوط کنید. بعد از تمرین (تا ۳۰ دقیقه)، بین وعده‌های غذایی یا پیش از خواب مصرف کنید.\nپس از باز کردن، درِ ظرف را محکم ببندید و در جای خنک و تاریک نگهداری کنید.`;
const onSeriousMassWarnings =
  "برای افراد زیر ۱۸ سال مناسب نیست.\nاین محصول باید بخشی از رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم باشد.\nحساسیت‌زاها: حاوی شیر و سویا. ممکن است حاوی گلوتن، تخم‌مرغ، آجیل و بادام‌زمینی باشد.";
const onSeriousMassClaims =
  "بیش از ۱۲۵۰ کالری در هر وعده برای افزایش وزن و عضله‌سازی\n۵۰ گرم پروتئین در هر وعده\nحدود ۲۵۰ گرم کربوهیدرات در هر وعده\n۳ گرم کراتین افزوده در هر وعده\nبا ویتامین‌ها و مواد معدنی\nادعاهای سلامت مورد تأیید اتحادیه‌ی اروپا: پروتئین در کنار تمرین قدرتی منظم به رشد و حفظ توده‌ی عضلانی کمک می‌کند؛ کربوهیدرات‌ها به بازیابی عملکرد طبیعی عضله پس از فعالیت بدنی بسیار شدید یا طولانی کمک می‌کنند (با مصرف ۴ گرم کربوهیدرات به ازای هر کیلوگرم وزن بدن در ۴ تا ۶ ساعت اول)";

// Shared by every Gold Standard Pre-Workout flavour (EU version).
const onPreWorkoutVitamins =
  "نیکوتین‌آمید (ویتامین B3)، کلسیم دی-پانتوتنات (ویتامین B5)، سیانوکوبالامین (ویتامین B12)، عصاره‌ی فلفل سیاه، فولیک اسید، تیامین هیدروکلراید (ویتامین B1) و کوله‌کلسیفرول (ویتامین D3)";
const onPreWorkoutFacts = [
  { label: "کافئین (از منابع طبیعی)", amount: "۱۷۵ میلی‌گرم" },
  { label: "کراتین مونوهیدرات", amount: "۳٫۴ گرم" },
  { label: "بتا-آلانین", amount: "۱٫۵ گرم" },
  { label: "پرفورملون (عصاره‌ی هندوانه)", amount: "۲۵۰ میلی‌گرم" },
];
const onPreWorkoutUsage =
  "روزانه ۱ وعده (۱۱ گرم، حدود ۱ اسکوپ صاف) را در ۳۵۰ میلی‌لیتر آب سرد حل کنید و ۱۵ تا ۳۰ دقیقه پیش از تمرین مصرف کنید.\nدر جای خنک و خشک و دور از نور مستقیم خورشید نگهداری کنید.";
const onPreWorkoutWarnings =
  "حاوی کافئین (۱۷۵ میلی‌گرم در هر وعده). برای کودکان و زنان باردار توصیه نمی‌شود.\nمکمل غذایی جایگزین رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم نیست.\nاز مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.\nدور از دسترس کودکان نگهداری شود.\nداخل قوطی یک بسته‌ی رطوبت‌گیر هست؛ آن را نخورید و باز نکنید.\nممکن است حاوی شیر، گلوتن، تخم‌مرغ، سویا، آجیل و بادام‌زمینی باشد.";
const onPreWorkoutClaims =
  "برای انرژی، تمرکز، قدرت و عملکرد\n۱۷۵ میلی‌گرم کافئین از منابع طبیعی در هر وعده\n۳٫۴ گرم کراتین مونوهیدرات در هر وعده\n۲۵۰ میلی‌گرم پرفورملون (عصاره‌ی هندوانه) در هر وعده\n۱٫۵ گرم بتا-آلانین در هر وعده\nادعاهای سلامت مورد تأیید اتحادیه‌ی اروپا: ویتامین‌های B1، B3، B5، B6 و B12 به متابولیسم طبیعی تولید انرژی کمک می‌کنند؛ کراتین عملکرد بدنی را در تمرین‌های کوتاه‌مدت، پرشدت و پشت‌سرهم افزایش می‌دهد";

// Shared by both Syntha-6 flavours on BSN's US site.
const bsnSynthaUsage =
  "۱ اسکوپ را با ۱۲۰ تا ۱۵۰ میلی‌لیتر (۴ تا ۵ اونس) آب سرد یا نوشیدنی دلخواه مخلوط کنید؛ هر زمانی از روز: بعد از تمرین، بین وعده‌ها یا به‌عنوان میان‌وعده. برای پروتئین بیشتر و طعم میلک‌شیکی، با شیر بدون چربی یا کم‌چرب مخلوط کنید.";
const bsnSynthaClaims =
  "۲۲ گرم پروتئین در هر وعده\n۱۰ گرم اسید آمینه‌ی ضروری طبیعی در هر وعده\nپروتئین برای هر زمانی از روز\nبه گفته‌ی سازنده، همراه با تمرین مقاومتی منظم از عضله‌سازی و ریکاوری پشتیبانی می‌کند (این ادعا توسط FDA ارزیابی نشده است)";

// Shared by both Rule 1 Mass Gainer packs (tub and bag): same Chocolate
// Fudge Supplement Facts panel on ruleoneproteins.com/products/mass-gainer.
const rule1MassGainerIngredients =
  "مواد تشکیل‌دهنده: ترکیب کربوهیدرات (مالتودکسترین، سبوس برنج ارگانیک، نشاسته‌ی نخود [®Carb10])، ترکیب پروتئین (کنسانتره‌ی پروتئین وی، ایزوله‌ی پروتئین وی، پروتئین وی هیدرولیزه)، کاکائو (قلیایی‌شده)، و کمتر از ۲٪: طعم‌دهنده‌های طبیعی و مصنوعی، صمغ گوار، سوکرالوز، آسه‌سولفام پتاسیم، عصاره‌ی برگ استویا، لسیتین سویا، لسیتین آفتابگردان.";
const rule1MassGainerFacts = [
  { label: "انرژی", amount: "۱۲۶۰ کیلوکالری" },
  { label: "چربی", amount: "۸ گرم" },
  { label: "چربی اشباع", amount: "۴ گرم" },
  { label: "کلسترول", amount: "۱۶۰ میلی‌گرم" },
  { label: "کربوهیدرات", amount: "۲۵۴ گرم" },
  { label: "فیبر", amount: "۷ گرم" },
  { label: "قندها", amount: "۱۴ گرم" },
  { label: "قند افزوده", amount: "۱۰ گرم" },
  { label: "پروتئین", amount: "۴۰ گرم" },
  { label: "کلسیم", amount: "۳۶۰ میلی‌گرم" },
  { label: "آهن", amount: "۸ میلی‌گرم" },
  { label: "سدیم", amount: "۳۵۰ میلی‌گرم" },
  { label: "پتاسیم", amount: "۱۲۴۰ میلی‌گرم" },
  { label: "کراتین مونوهیدرات", amount: "۱ گرم" },
];
const rule1MassGainerUsage =
  "۲ اسکوپ پر (۳۲۵ گرم) را با ۶۰۰ تا ۷۰۰ میلی‌لیتر (۲۰ تا ۲۴ اونس) آب، شیر یا نوشیدنی دلخواه در مخلوط‌کن یا شیکر بزرگ هم بزنید تا یکدست شود. برای اسموتی، با میوه، یک قاشق کره‌ی بادام‌زمینی یا مغزها و یخ مخلوط کنید؛ برای کالری بیشتر، با شیر پرچرب و ۲ اسکوپ بستنی.\nهر زمانی از روز، در کنار وعده‌های غذایی (نه به‌جای آن‌ها) مصرف کنید. برای بهترین نتیجه همراه با رژیم غذایی مغذی و تمرین مقاومتی منظم.";
const rule1MassGainerWarnings = "حساسیت‌زاها: حاوی شیر و سویا.";
// Shared by every R1 Protein Whey Isolate flavour (5 lb tubs): directions
// from ruleoneproteins.com/products/r1-protein-whey-isolate, notice and
// claims from the pack front.
const rule1ProteinUsage =
  "حدود ۱ اسکوپ را با ۱۸۰ تا ۲۴۰ میلی‌لیتر (۶ تا ۸ اونس) آب سرد، شیر یا نوشیدنی دلخواه در شیکر یا لیوان با قاشق هم بزنید. برای تنوع، با میوه مخلوط کنید یا در غلات صبحانه یا ماست بریزید.\nهر زمانی از روز: پیش یا بعد از تمرین، صبح یا بین وعده‌ها.";
const rule1ProteinWarnings =
  "حساسیت‌زاها: حاوی شیر و سویا.\nفقط به‌عنوان مکمل غذایی مصرف کنید؛ برای کاهش وزن مصرف نکنید.";
const rule1ProteinClaims =
  "۲۵ گرم پروتئین در هر وعده؛ ۱۰۰٪ پروتئین آن از وی ایزوله است\nبدون کنسانتره‌ی وی، کریمر و «آمینو اسپایکینگ» (افزودن اسید آمینه‌ی ارزان برای بالا نشان دادن پروتئین)\nپروتئین آن در برنامه‌ی Informed Protein آزمایش و تأیید شده و در Informed Choice برای مواد ممنوعه آزمایش می‌شود";
// Shared by every R1 Whey Protein flavour (5 lb tubs): facts panels and
// ingredients from ruleoneproteins.com/products/whey-protein
// (`WheyProtein-NutritionPanels-*`), claims from the pack front and the
// product page. The page has no directions, so `usage` stays empty; the
// notice is the one printed on the pack plus the allergen line.
const rule1WheyBlend =
  "ترکیب پروتئین (کنسانتره‌ی پروتئین وی، ایزوله‌ی پروتئین وی، ایزوله‌ی پروتئین وی هیدرولیزه)";
const rule1WheyWarnings =
  "حساسیت‌زاها: حاوی شیر و سویا.\nفقط به‌عنوان مکمل غذایی مصرف کنید؛ برای کاهش وزن مصرف نکنید.";
const rule1WheyClaims =
  "۲۴ گرم پروتئین در هر وعده؛ ۱۰۰٪ پروتئین آن از منابع وی است\nحدود ۱۱ گرم اسید آمینه‌ی ضروری (EAA) طبیعی در هر وعده\nدارای گواهی Informed Choice؛ به‌طور منظم در آزمایشگاه ضددوپینگ LGC برای مواد ممنوعه آزمایش می‌شود\nپروتئین آن آزمایش و تأیید شده است (Protein Tested & Verified)";
const rule1MassGainerClaims =
  "۱۲۶۰ کیلوکالری، ۲۵۴ گرم کربوهیدرات و ۴۰ گرم پروتئین تمام‌وی در هر وعده\nنسبت کربوهیدرات به پروتئین ۶ به ۱، با ۱ گرم کراتین مونوهیدرات\nدارای گواهی Informed Choice؛ به‌طور منظم در آزمایشگاه ضددوپینگ LGC برای مواد ممنوعه آزمایش می‌شود\nبه گفته‌ی سازنده: برای افرادی با متابولیسم سریع که به‌سختی وزن می‌گیرند (این ادعا توسط FDA ارزیابی نشده است)";

// Applied Nutrition (appliednutrition.uk, Shopify): directions, cautions,
// ingredients and facts panels come from each product page's text and
// "Nutritional Information" image; pack photos are the variants' own images.
// Flavours and sizes of one product share a groupSlug and these constants.
const appliedCaution =
  "پیش از مصرف، اگر زیر ۱۸ سال دارید، باردار هستید یا شیر می‌دهید، یا بیماری یا دارویی (با نسخه یا بدون نسخه) در کار است، با یک متخصص سلامت مشورت کنید.\nجایگزین رژیم غذایی متنوع و شیوه‌ی زندگی سالم نیست.\nدر جای خنک و خشک و دور از دسترس کودکان نگهداری شود.\nاز مقدار توصیه‌شده بیشتر مصرف نکنید.";

const appliedCreatineUsage =
  "۱ اسکوپ (۵ گرم) را با ۲۵۰ میلی‌لیتر آب یا آبمیوه مخلوط کنید و بنوشید. ۱ تا ۲ بار در روز، ترجیحاً درست پیش از تمرین و پس از آن. پس از ۸ هفته مصرف مداوم، ۱ هفته استراحت کنید و دوباره شروع کنید.\nاسکوپ‌ها تقریبی‌اند؛ ترازو توصیه می‌شود.";
const appliedCreatinePlainFacts = [
  { label: "کراتین مونوهیدرات", amount: "۵۰۰۰ میلی‌گرم" },
  { label: "از این مقدار کراتین", amount: "۴۴۰۰ میلی‌گرم" },
];
const appliedCreatinePlainClaims =
  "۵ گرم کراتین مونوهیدرات میکرونیزه در هر وعده (۴٫۴ گرم کراتین)\n۱۰۰٪ کراتین مونوهیدرات میکرونیزه\nهر بچ تحت برنامه‌ی Informed Sport برای مواد ممنوعه آزمایش می‌شود\nحلال (Halal)\nروی بسته: افزایش عملکرد بدنی در تمرین‌های پرشدت";
const appliedCreatineFlavouredClaims =
  "۵ گرم کراتین مونوهیدرات میکرونیزه در هر وعده\nحلال (Halal)\nروی بسته: افزایش عملکرد بدنی در تمرین‌های پرشدت";

const appliedGlutamineUsage =
  "۱ وعده (۵ گرم) را ۱ تا ۳ بار در روز همراه وعده‌های غذایی مصرف کنید. برای بهترین نتیجه ۱ وعده را پس از تمرین با آب یا آبمیوه بنوشید.";
const appliedGlutamineWarnings = `${appliedCaution}\nحساسیت‌زاها: ماده‌ی حساسیت‌زای رایجی ندارد؛ در مجموعه‌ای تولید می‌شود که شیر، سویا، تخم‌مرغ، ماهی، کرفس و غلات حاوی گلوتن را هم فرآوری می‌کند.`;
const appliedGlutamineClaims =
  "۵ گرم ال-گلوتامین در هر وعده؛ ۱۰۰٪ ال-گلوتامین میکرونیزه\nگلوتامین فراوان‌ترین اسید آمینه‌ی بافت عضله است و اسید آمینه‌ی نیمه‌ضروری به شمار می‌رود\nهر بچ برای مواد ممنوعه آزمایش می‌شود (آزمایش‌شده برای ورزشکاران)\nحلال (Halal)";

// Critical Mass Original 6 kg: 25 servings of 240 g. The facts panel on the
// site is the Vanilla one ("other flavours may vary").
const appliedGainerFacts = [
  { label: "انرژی", amount: "۹۱۷ کیلوکالری (۳۸۸۳ کیلوژول)" },
  { label: "چربی", amount: "۸٫۴ گرم" },
  { label: "چربی اشباع", amount: "۶٫۹ گرم" },
  { label: "کربوهیدرات", amount: "۱۵۳٫۸ گرم" },
  { label: "قندها", amount: "۸۰٫۸ گرم" },
  { label: "فیبر", amount: "۲٫۹ گرم" },
  { label: "پروتئین", amount: "۵۴٫۹ گرم" },
  { label: "نمک", amount: "۰٫۶۴ گرم" },
];
const appliedGainerUsage =
  "۴ اسکوپ (۲۴۰ گرم) را با ۵۰۰ تا ۱۰۰۰ میلی‌لیتر شیر یا آب در شیکر خوب هم بزنید. روزانه ۱ تا ۳ وعده، بسته به کالری موردنیازتان.\nاسکوپ‌ها تقریبی‌اند؛ ترازو توصیه می‌شود.";
const appliedGainerWarnings = (allergens: string) =>
  `حساسیت‌زاها: ${allergens}. در مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، سویا، ماهی و غلات حاوی گلوتن را هم فرآوری می‌کند.\nاگر شیر می‌دهید یا بیماری یا دارویی (با نسخه یا بدون نسخه) در کار است، پیش از مصرف با متخصص سلامت مشورت کنید. برای کودکان و زنان باردار توصیه نمی‌شود. زیر ۱۸ سال مصرف نکنید.\nدور از دسترس کودکان خردسال نگهداری شود.`;
const appliedGainerClaims =
  "۵۵ گرم پروتئین کاملاً لبنی و بیش از ۹۰۰ کیلوکالری در هر وعده (۲۴۰ گرم)\nاسیدهای آمینه‌ی ضروری (EAA و BCAA) طبیعی و ال-گلوتامین افزوده\nاسیدهای چرب ضروری، CLA و پودر MCT\nحاوی نشاسته‌ی ذرت واکسی\nحلال (Halal)\nبه گفته‌ی سازنده: برای افراد با متابولیسم سریع که به‌سختی وزن می‌گیرند. پروتئین به رشد و حفظ توده‌ی عضلانی کمک می‌کند";
// Only the cocoa and the natural colours differ between the six flavours.
const appliedGainerIngredients = (cocoa = "", colourMid = "", colourEnd = "") =>
  `کنسانتره‌ی پروتئین وی (شیر)، مالتودکسترین، فروکتوز، پودر آب‌پنیر شیرین (شیر)، ${cocoa}پودر MCT، اینولین، طعم‌دهنده‌ی طبیعی، کازئینات کلسیم (شیر)، ضدکلوخه (تری‌کلسیم فسفات)، ایزوله‌ی پروتئین وی (شیر)، نشاسته‌ی ذرت واکسی، آلبومین تخم‌مرغ، ${colourMid}ال-گلوتامین، آنزیم (برومِلین)، پودر روغن بذر کتان، پودر CLA (۶۰٪)${colourEnd}.`;
const appliedGainerFlavours = [
  {
    id: "apm1",
    slug: "banana",
    flavor: "موز",
    ingredients: appliedGainerIngredients("", "", "، رنگ طبیعی (کورکومین)"),
    allergens: "شیر و تخم‌مرغ",
  },
  {
    id: "apm2",
    slug: "chocolate",
    flavor: "شکلات",
    ingredients: appliedGainerIngredients("پودر کاکائو (سویا)، "),
    allergens: "شیر، تخم‌مرغ و سویا",
  },
  {
    id: "apm3",
    slug: "strawberry",
    flavor: "توت‌فرنگی",
    ingredients: appliedGainerIngredients("", "رنگ طبیعی (پودر چغندر)، "),
    allergens: "شیر و تخم‌مرغ",
  },
  { id: "apm4", slug: "vanilla", flavor: "وانیل", ingredients: appliedGainerIngredients(), allergens: "شیر و تخم‌مرغ" },
  {
    id: "apm5",
    slug: "cookies-cream",
    flavor: "کوکی و کرم",
    ingredients: appliedGainerIngredients(),
    allergens: "شیر و تخم‌مرغ",
  },
  {
    id: "apm6",
    slug: "white-choco-hazelnut",
    flavor: "شکلات سفید و فندق",
    ingredients: appliedGainerIngredients(),
    allergens: "شیر و تخم‌مرغ",
  },
];

// Amino Fuel 390 g: 30 servings of 13 g, the same facts panel for every flavour.
const appliedAminoFacts = [
  { label: "انرژی", amount: "۲ کیلوکالری (۱۰ کیلوژول)" },
  { label: "چربی", amount: "۰ گرم" },
  { label: "کربوهیدرات", amount: "۰٫۶ گرم" },
  { label: "قندها", amount: "۰٫۴ گرم" },
  { label: "پروتئین", amount: "۰ گرم" },
  { label: "نمک", amount: "۰٫۲ گرم" },
  { label: "ال-لوسین (BCAA)", amount: "۳۰۰۰ میلی‌گرم" },
  { label: "ال-ایزولوسین (BCAA)", amount: "۱۵۰۰ میلی‌گرم" },
  { label: "ال-والین (BCAA)", amount: "۱۵۰۰ میلی‌گرم" },
  { label: "ال-لیزین", amount: "۱۰۰۰ میلی‌گرم" },
  { label: "ال-ترئونین", amount: "۵۰۰ میلی‌گرم" },
  { label: "ال-هیستیدین", amount: "۵۰۰ میلی‌گرم" },
  { label: "ال-فنیل‌آلانین", amount: "۳۳۵ میلی‌گرم" },
  { label: "ال-متیونین", amount: "۱۵۰ میلی‌گرم" },
  { label: "ال-تریپتوفان", amount: "۴۵ میلی‌گرم" },
  { label: "ال-گلوتامین", amount: "۲۵۰۰ میلی‌گرم" },
];
const appliedAminoUsage =
  "۱ اسکوپ (۱۳ گرم) را با ۵۰۰ میلی‌لیتر آب مخلوط کنید و خوب تکان دهید. پیش، حین و پس از تمرین، یا هر زمان از روز که به آمینو اسید بیشتری نیاز دارید مصرف کنید.\nاسکوپ‌ها تقریبی‌اند؛ ترازو توصیه می‌شود.";
const appliedAminoClaims =
  "۱۱ گرم اسید آمینه در هر وعده: ۹ گرم اسید آمینه‌ی ضروری (EAA) از جمله ۶ گرم BCAA با نسبت ۲:۱:۱ (۳ گرم لوسین، ۱٫۵ گرم ایزولوسین، ۱٫۵ گرم والین)\n۲٫۵ گرم ال-گلوتامین افزوده\nآزمایش‌شده برای ورزشکاران؛ حلال (Halal)";
// The flavours differ only in their colour (Candy Ice Blast also has the
// Breathe Easy flavouring).
const appliedAminoIngredients = (colour: string) =>
  `ال-لوسین، ال-گلوتامین، ال-ایزولوسین، ال-والین، اسیدی‌کننده (اسید سیتریک)، ال-لیزین، طعم‌دهنده، ال-هیستیدین، ال-ترئونین، ال-فنیل‌آلانین، نمک، ال-متیونین، ضدکلوخه (دی‌اکسید سیلیکون)، شیرین‌کننده (سوکرالوز)، رنگ (${colour})، ال-تریپتوفان.`;
const appliedAminoFlavours = [
  { id: "apa1", slug: "cherry-limeade", flavor: "گیلاس و لیمو (چری لایمید)", colour: "قرمز چغندر، کاراملِ ساده" },
  { id: "apa2", slug: "icy-blue-raz", flavor: "تمشک آبی یخی", colour: "آبی درخشان FCF" },
  { id: "apa3", slug: "cola-blast", flavor: "کولا (میلیونز)", colour: "کاراملِ ساده" },
  { id: "apa4", slug: "pineapple", flavor: "آناناس (میلیونز)", colour: "کاروتن‌ها" },
  { id: "apa5", slug: "raspberry-mojito", flavor: "موهیتو تمشک", colour: "قرمز چغندر" },
  { id: "apa6", slug: "candy-ice-blast", flavor: "آب‌نبات یخی (کندی آیس بلاست)", colour: "قرمز چغندر" },
  { id: "apa7", slug: "fruit-burst", flavor: "میوه‌ای (فروت برست)", colour: "قرمز چغندر" },
  { id: "apa8", slug: "fruit-salad", flavor: "سالاد میوه", colour: "عصاره‌ی کورکومین" },
];

const appliedProducts: BrandProduct[] = [
  // Creatine Monohydrate: unflavoured 250 g / 500 g / 1 kg, then three
  // 250 g flavours. The site has no facts panel or ingredients for the
  // flavoured tubs, so they only carry what the pack front says.
  ...[
    { id: "apc1", slug: "applied-creatine-monohydrate", size: "۲۵۰ گرم", servings: "۵۰", price: 1200000 },
    { id: "apc2", slug: "applied-creatine-monohydrate-500g", size: "۵۰۰ گرم", servings: "۱۰۰", price: 2000000 },
    { id: "apc3", slug: "applied-creatine-monohydrate-1kg", size: "۱ کیلوگرم", servings: "۲۰۰", price: 3400000 },
  ].map(
    ({ id, slug, size, servings, price }): BrandProduct => ({
      id,
      name: "کراتین مونوهیدرات - Creatine Monohydrate",
      slug,
      groupSlug: "applied-creatine-monohydrate",
      flavor: "بدون طعم",
      size,
      imageUrl: `/images/products/${slug}.webp`,
      description: `کراتین مونوهیدرات میکرونیزه‌ی اپلاید نوتریشن، بدون طعم؛ ۱۰۰٪ کراتین مونوهیدرات میکرونیزه که به‌راحتی در آب حل می‌شود. هر وعده (۱ اسکوپ، ۵ گرم) ۴٫۴ گرم کراتین دارد و بسته‌ی ${size} ${servings} وعده است.\nمواد تشکیل‌دهنده: ۱۰۰٪ کراتین مونوهیدرات میکرونیزه.`,
      servingSize: "۵ گرم (۱ اسکوپ)",
      nutritionFacts: appliedCreatinePlainFacts,
      usage: appliedCreatineUsage,
      warnings: `${appliedCaution}\nحساسیت‌زاها: ماده‌ی حساسیت‌زای رایجی ندارد.`,
      manufacturerClaims: appliedCreatinePlainClaims,
      brand: "Applied Nutrition",
      price,
      categorySlug: "creatine",
    })
  ),
  ...[
    { id: "apc4", slug: "applied-creatine-cherry-apple", flavor: "گیلاس و سیب" },
    { id: "apc5", slug: "applied-creatine-strawberry-raspberry", flavor: "توت‌فرنگی و تمشک" },
    { id: "apc6", slug: "applied-creatine-icy-blue-raz", flavor: "تمشک آبی یخی" },
  ].map(
    ({ id, slug, flavor }): BrandProduct => ({
      id,
      name: "کراتین مونوهیدرات - Creatine Monohydrate",
      slug,
      groupSlug: "applied-creatine-monohydrate",
      flavor,
      size: "۲۵۰ گرم",
      imageUrl: `/images/products/${slug}.webp`,
      description: `کراتین مونوهیدرات میکرونیزه‌ی اپلاید نوتریشن با طعم ${flavor}؛ مکمل غذایی پودری کراتین مونوهیدرات با طعم طبیعی و شیرین‌کننده. بسته‌ی ۲۵۰ گرمی ۵۰ وعده (هر وعده ۱ اسکوپ، ۵ گرم) است.`,
      servingSize: "۵ گرم (۱ اسکوپ)",
      usage: appliedCreatineUsage,
      warnings: `${appliedCaution}\nمکمل غذایی دارای شیرین‌کننده.`,
      manufacturerClaims: appliedCreatineFlavouredClaims,
      brand: "Applied Nutrition",
      price: 1300000,
      categorySlug: "creatine",
    })
  ),
  // L-Glutamine Powder 250 g and 500 g (5 g servings).
  ...[
    { id: "apg1", slug: "applied-l-glutamine", size: "۲۵۰ گرم", servings: "۵۰", price: 1100000 },
    { id: "apg2", slug: "applied-l-glutamine-500g", size: "۵۰۰ گرم", servings: "۱۰۰", price: 1800000 },
  ].map(
    ({ id, slug, size, servings, price }): BrandProduct => ({
      id,
      name: "ال-گلوتامین - L-Glutamine Powder",
      slug,
      groupSlug: "applied-l-glutamine",
      flavor: "بدون طعم",
      size,
      imageUrl: `/images/products/${slug}.webp`,
      description: `ال-گلوتامین اپلاید نوتریشن؛ پودر ۱۰۰٪ ال-گلوتامین میکرونیزه برای حمایت از ریکاوری و ترمیم عضله و سلامت سیستم ایمنی. هر وعده (۱ اسکوپ، ۵ گرم) ۵ گرم ال-گلوتامین دارد و بسته‌ی ${size} ${servings} وعده است.\nمواد تشکیل‌دهنده: ۱۰۰٪ ال-گلوتامین میکرونیزه.`,
      servingSize: "۵ گرم (۱ اسکوپ)",
      nutritionFacts: [{ label: "ال-گلوتامین", amount: "۵۰۰۰ میلی‌گرم" }],
      usage: appliedGlutamineUsage,
      warnings: appliedGlutamineWarnings,
      manufacturerClaims: appliedGlutamineClaims,
      brand: "Applied Nutrition",
      price,
      categorySlug: "creatine",
    })
  ),
  // Critical Mass Original 6 kg in the six flavours the site sells.
  ...appliedGainerFlavours.map(
    ({ id, slug, flavor, ingredients, allergens }): BrandProduct => ({
      id,
      name: "کریتیکال مس اوریجینال - Critical Mass Original",
      slug: `applied-critical-mass-${slug}`,
      groupSlug: "applied-critical-mass-original",
      flavor,
      size: "۶ کیلوگرم",
      imageUrl: `/images/products/applied-critical-mass-${slug}.webp`,
      description: `گینر پرکالری کریتیکال مس اوریجینال اپلاید نوتریشن با طعم ${flavor}؛ برای افرادی که متابولیسم سریع دارند و به‌سختی وزن می‌گیرند. هر وعده (۴ اسکوپ، ۲۴۰ گرم) حدود ۹۱۷ کیلوکالری و ۵۵ گرم پروتئین لبنی دارد و کیسه‌ی ۶ کیلوگرمی ۲۵ وعده است. جدول ارزش غذایی مربوط به طعم وانیل است و طعم‌های دیگر کمی تفاوت دارند.\nمواد تشکیل‌دهنده: ${ingredients}`,
      servingSize: "۲۴۰ گرم (۴ اسکوپ)",
      nutritionFacts: appliedGainerFacts,
      usage: appliedGainerUsage,
      warnings: appliedGainerWarnings(allergens),
      manufacturerClaims: appliedGainerClaims,
      brand: "Applied Nutrition",
      price: 5500000,
      categorySlug: "protein",
    })
  ),
  // Amino Fuel EAA 390 g in all eight flavours.
  ...appliedAminoFlavours.map(
    ({ id, slug, flavor, colour }): BrandProduct => ({
      id,
      name: "آمینو فیول - Amino Fuel EAA",
      slug: `applied-amino-fuel-${slug}`,
      groupSlug: "applied-amino-fuel",
      flavor,
      size: "۳۹۰ گرم",
      imageUrl: `/images/products/applied-amino-fuel-${slug}.webp`,
      description: `آمینو فیول اپلاید نوتریشن با طعم ${flavor}؛ مکمل اسیدهای آمینه‌ی ضروری (EAA) با ۶ گرم BCAA با نسبت ۲:۱:۱ و ۲٫۵ گرم ال-گلوتامین. هر وعده (۱ اسکوپ، ۱۳ گرم) ۱۱ گرم اسید آمینه دارد و قوطی ۳۹۰ گرمی ۳۰ وعده است.\nمواد تشکیل‌دهنده: ${appliedAminoIngredients(colour)}${slug === "candy-ice-blast" ? " این طعم Breathe Easy™ (طعم‌دهنده) هم دارد." : ""}`,
      servingSize: "۱۳ گرم (۱ اسکوپ)",
      nutritionFacts: appliedAminoFacts,
      usage: appliedAminoUsage,
      warnings: appliedCaution,
      manufacturerClaims:
        slug === "candy-ice-blast"
          ? `${appliedAminoClaims}\nفرمول Breathe Easy™ برای باز شدن راه‌های هوایی (به گفته‌ی سازنده)`
          : appliedAminoClaims,
      brand: "Applied Nutrition",
      price: 1500000,
      categorySlug: "aminos",
    })
  ),
];

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
    id: "on3w",
    name: "مولتی ویتامین بانوان - Opti-Women",
    slug: "on-opti-women",
    groupSlug: "on-opti-women",
    size: "۶۰ کپسول",
    imageUrl: "/images/products/on-opti-women.webp",
    description:
      "اپتی‌وومن اپتیموم نوتریشن؛ مولتی ویتامین مخصوص بانوان فعال با ۲۲ ویتامین و ماده‌ی معدنی، در کپسول گیاهی. هر وعده ۲ کپسول است و قوطی ۶۰ کپسولی ۳۰ وعده است.\nسایر مواد: هیدروکسی‌پروپیل متیل‌سلولز، سلولز میکروکریستالی، استئارات منیزیم، دی‌اکسید سیلیکون.",
    servingSize: "۲ کپسول",
    nutritionFacts: onOptiWomenFacts,
    usage: onOptiWomenUsage,
    warnings: onOptiWomenWarnings,
    manufacturerClaims: onOptiWomenClaims,
    brand: "Optimum Nutrition",
    price: 950000,
    categorySlug: "vitamins",
  },
  {
    id: "on3wb",
    name: "مولتی ویتامین بانوان - Opti-Women",
    slug: "on-opti-women-120",
    groupSlug: "on-opti-women",
    size: "۱۲۰ کپسول",
    imageUrl: "/images/products/on-opti-women-120.webp",
    // Same label as on3w; only the count differs.
    description:
      "اپتی‌وومن اپتیموم نوتریشن؛ مولتی ویتامین مخصوص بانوان فعال با ۲۲ ویتامین و ماده‌ی معدنی، در کپسول گیاهی. هر وعده ۲ کپسول است و قوطی ۱۲۰ کپسولی ۶۰ وعده است.\nسایر مواد: هیدروکسی‌پروپیل متیل‌سلولز، سلولز میکروکریستالی، استئارات منیزیم، دی‌اکسید سیلیکون.",
    servingSize: "۲ کپسول",
    nutritionFacts: onOptiWomenFacts,
    usage: onOptiWomenUsage,
    warnings: onOptiWomenWarnings,
    manufacturerClaims: onOptiWomenClaims,
    brand: "Optimum Nutrition",
    price: 1590000,
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
  {
    id: "on5",
    name: "گلد استاندارد پری‌ورک‌اوت - Gold Standard Pre-Workout",
    slug: "on-gold-standard-pre-workout",
    groupSlug: "on-gold-standard-pre-workout",
    flavor: "فروت پانچ",
    size: "۳۳۰ گرم",
    imageUrl: "/images/products/on-gold-standard-pre-workout.webp",
    // The US shop (en-us) has no label record and mislabelled photos, so the
    // EU version from ON's UK shop (en-gb, gold-standard-pre-workout-powder-eu)
    // is used: photos and ingredients per flavour. No shop gives a facts
    // table; doses are from the pack (175 mg caffeine, 3.4 g creatine
    // monohydrate, 250 mg Performelon) and the description (1.5 g
    // beta-alanine). The description's "3 g creatine monohydrate" is
    // overridden by the pack's 3.4 g (≈ 3 g creatine).
    description: `گلد استاندارد پری‌ورک‌اوت اپتیموم نوتریشن با طعم فروت پانچ؛ مکمل پیش از تمرین با کافئین طبیعی، کراتین مونوهیدرات، بتا-آلانین و ویتامین‌های گروه B برای انرژی، تمرکز و عملکرد. هر وعده (۱۱ گرم) ۱۷۵ میلی‌گرم کافئین دارد و قوطی ۳۳۰ گرمی ۳۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات، بتا-آلانین، اسیدی‌کننده‌ها (سیتریک اسید، مالیک اسید، ال-تارتاریک اسید)، طعم‌دهنده‌ها، ضدکلوخه‌ها (سیلیکات کلسیم، دی‌اکسید سیلیکون)، ال-سیترولین، رنگ‌ها (قرمز چغندر، بتا-کاروتن، کورکومین)، استیل ال-کارنیتین هیدروکلراید، قوام‌دهنده‌ها (کربوکسی‌متیل‌سلولز سدیم، زانتان، کاراگینان)، ان-استیل ال-تیروزین، پیریدوکسین هیدروکلراید (ویتامین B6)، عصاره‌ی هندوانه، کافئین طبیعی، شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم)، ${onPreWorkoutVitamins}.`,
    servingSize: "۱۱ گرم (حدود ۱ اسکوپ صاف)",
    nutritionFacts: onPreWorkoutFacts,
    usage: onPreWorkoutUsage,
    warnings: onPreWorkoutWarnings,
    manufacturerClaims: onPreWorkoutClaims,
    brand: "Optimum Nutrition",
    price: 1350000,
    categorySlug: "pre-workout",
  },
  {
    id: "on5b",
    name: "گلد استاندارد پری‌ورک‌اوت - Gold Standard Pre-Workout",
    slug: "on-gold-standard-pre-workout-blue-raspberry",
    groupSlug: "on-gold-standard-pre-workout",
    flavor: "تمشک آبی",
    size: "۳۳۰ گرم",
    imageUrl: "/images/products/on-gold-standard-pre-workout-blue-raspberry.webp",
    // The shop's list names spirulina powder twice; it is listed once here.
    description: `گلد استاندارد پری‌ورک‌اوت اپتیموم نوتریشن با طعم تمشک آبی؛ مکمل پیش از تمرین با کافئین طبیعی، کراتین مونوهیدرات، بتا-آلانین و ویتامین‌های گروه B برای انرژی، تمرکز و عملکرد. هر وعده (۱۱ گرم) ۱۷۵ میلی‌گرم کافئین دارد و قوطی ۳۳۰ گرمی ۳۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات، بتا-آلانین، اسیدی‌کننده‌ها (سیتریک اسید، مالیک اسید، ال-تارتاریک اسید)، طعم‌دهنده، ضدکلوخه‌ها (سیلیکات کلسیم، دی‌اکسید سیلیکون)، ال-سیترولین، استیل ال-کارنیتین هیدروکلراید، قوام‌دهنده‌ها (کربوکسی‌متیل‌سلولز سدیم، زانتان، کاراگینان)، ان-استیل ال-تیروزین، پیریدوکسین هیدروکلراید (ویتامین B6)، عصاره‌ی هندوانه، کافئین طبیعی، شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم)، پودر اسپیرولینا، ${onPreWorkoutVitamins}.`,
    servingSize: "۱۱ گرم (حدود ۱ اسکوپ صاف)",
    nutritionFacts: onPreWorkoutFacts,
    usage: onPreWorkoutUsage,
    warnings: onPreWorkoutWarnings,
    manufacturerClaims: onPreWorkoutClaims,
    brand: "Optimum Nutrition",
    price: 1350000,
    categorySlug: "pre-workout",
  },
  {
    id: "on5c",
    name: "گلد استاندارد پری‌ورک‌اوت - Gold Standard Pre-Workout",
    slug: "on-gold-standard-pre-workout-green-apple",
    groupSlug: "on-gold-standard-pre-workout",
    flavor: "سیب سبز",
    size: "۳۳۰ گرم",
    imageUrl: "/images/products/on-gold-standard-pre-workout-green-apple.webp",
    description: `گلد استاندارد پری‌ورک‌اوت اپتیموم نوتریشن با طعم سیب سبز؛ مکمل پیش از تمرین با کافئین طبیعی، کراتین مونوهیدرات، بتا-آلانین و ویتامین‌های گروه B برای انرژی، تمرکز و عملکرد. هر وعده (۱۱ گرم) ۱۷۵ میلی‌گرم کافئین دارد و قوطی ۳۳۰ گرمی ۳۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات، بتا-آلانین، اسیدی‌کننده‌ها (سیتریک اسید، مالیک اسید، ال-تارتاریک اسید)، طعم‌دهنده‌ها، ضدکلوخه‌ها (سیلیکات کلسیم، دی‌اکسید سیلیکون)، ال-سیترولین، استیل ال-کارنیتین هیدروکلراید، قوام‌دهنده‌ها (کربوکسی‌متیل‌سلولز سدیم، زانتان، کاراگینان)، ان-استیل ال-تیروزین، پیریدوکسین هیدروکلراید (ویتامین B6)، عصاره‌ی هندوانه، رنگ (لوتئین)، کافئین طبیعی، شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم)، پودر اسپیرولینا، ${onPreWorkoutVitamins}.`,
    servingSize: "۱۱ گرم (حدود ۱ اسکوپ صاف)",
    nutritionFacts: onPreWorkoutFacts,
    usage: onPreWorkoutUsage,
    warnings: onPreWorkoutWarnings,
    manufacturerClaims: onPreWorkoutClaims,
    brand: "Optimum Nutrition",
    price: 1350000,
    categorySlug: "pre-workout",
  },
  {
    id: "on5d",
    name: "گلد استاندارد پری‌ورک‌اوت - Gold Standard Pre-Workout",
    slug: "on-gold-standard-pre-workout-watermelon",
    groupSlug: "on-gold-standard-pre-workout",
    flavor: "هندوانه",
    size: "۳۳۰ گرم",
    imageUrl: "/images/products/on-gold-standard-pre-workout-watermelon.webp",
    description: `گلد استاندارد پری‌ورک‌اوت اپتیموم نوتریشن با طعم هندوانه؛ مکمل پیش از تمرین با کافئین طبیعی، کراتین مونوهیدرات، بتا-آلانین و ویتامین‌های گروه B برای انرژی، تمرکز و عملکرد. هر وعده (۱۱ گرم) ۱۷۵ میلی‌گرم کافئین دارد و قوطی ۳۳۰ گرمی ۳۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات، بتا-آلانین، طعم‌دهنده‌ها، اسیدی‌کننده‌ها (سیتریک اسید، مالیک اسید، ال-تارتاریک اسید)، ضدکلوخه‌ها (سیلیکات کلسیم، دی‌اکسید سیلیکون)، ال-سیترولین، استیل ال-کارنیتین هیدروکلراید، قوام‌دهنده‌ها (کربوکسی‌متیل‌سلولز سدیم، زانتان، کاراگینان)، ان-استیل ال-تیروزین، پیریدوکسین هیدروکلراید (ویتامین B6)، عصاره‌ی هندوانه، کافئین طبیعی، شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم)، رنگ (قرمز چغندر)، ${onPreWorkoutVitamins}.`,
    servingSize: "۱۱ گرم (حدود ۱ اسکوپ صاف)",
    nutritionFacts: onPreWorkoutFacts,
    usage: onPreWorkoutUsage,
    warnings: onPreWorkoutWarnings,
    manufacturerClaims: onPreWorkoutClaims,
    brand: "Optimum Nutrition",
    price: 1350000,
    categorySlug: "pre-workout",
  },
  {
    id: "on6",
    name: "گلوتامین پودر - Glutamine Powder",
    slug: "on-glutamine-powder",
    flavor: "بدون طعم",
    size: "۶۳۰ گرم",
    imageUrl: "/images/products/on-glutamine-powder.webp",
    // Pack photo and label record (variantNutritionalData, variant 1102346)
    // from ON's German shop (de-de/products/glutamine-powder). The label
    // says 123 servings; 630 g ÷ 5.25 g is 120, so the pack's own figure is
    // quoted as is.
    description:
      "گلوتامین پودر اپتیموم نوتریشن؛ ۱۰۰٪ ال-گلوتامین خالص و بدون طعم که به‌راحتی در شیک پروتئین یا نوشیدنی دلخواه حل می‌شود. هر وعده (۱ اسکوپ صاف، ۵٫۲۵ گرم) ۵ گرم ال-گلوتامین دارد و روی قوطی ۶۳۰ گرمی ۱۲۳ وعده نوشته شده است.\nمواد تشکیل‌دهنده: ال-گلوتامین.",
    servingSize: "۵٫۲۵ گرم (۱ اسکوپ صاف)",
    nutritionFacts: [{ label: "ال-گلوتامین", amount: "۵ گرم" }],
    usage:
      "۱ اسکوپ صاف (۵٫۲۵ گرم) را در ۲۴۰ میلی‌لیتر آب سرد، نوشیدنی دلخواه یا شیک پروتئین بریزید و هم بزنید تا حل شود. حداکثر ۲ وعده در روز.\nبعد از تمرین، بین وعده‌های غذایی یا پیش از خواب مصرف کنید.\nدر جای خنک و خشک و دور از دسترس کودکان نگهداری شود.",
    warnings:
      "برای افراد زیر ۱۸ سال مناسب نیست.\nمکمل غذایی جایگزین رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم نیست.\nاز مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.\nممکن است حاوی شیر، سویا، گلوتن، تخم‌مرغ، آجیل و بادام‌زمینی باشد.",
    manufacturerClaims:
      "۵ گرم ال-گلوتامین خالص در هر وعده\nبدون طعم؛ به‌راحتی در شیک پروتئین یا هر نوشیدنی حل می‌شود\nاسیدهای آمینه سازنده‌ی پروتئین‌اند و پروتئین به رشد و حفظ توده‌ی عضلانی و حفظ سلامت استخوان‌ها کمک می‌کند (ادعای سلامت مورد تأیید اتحادیه‌ی اروپا)",
    brand: "Optimum Nutrition",
    price: 1750000,
    categorySlug: "creatine",
  },

  // Dymatize
  {
    id: "dy1",
    name: "ایزو ۱۰۰ - وی ایزوله هیدرولیزه - ISO100",
    slug: "dymatize-iso100",
    groupSlug: "dymatize-iso100",
    flavor: "شکلات گورمه",
    size: "۶۵۰ گرم",
    imageUrl: "/images/products/dymatize-iso100.webp",
    // Photo and label details from Dymatize's US site
    // (dymatize.com/products/iso100-gourmet-chocolate). The only pack photo
    // there is the 650 g / 20-serving tub (650 ÷ 32 g ≈ 20), so that size is
    // used. The site gives no directions.
    description:
      "ایزو ۱۰۰ دایماتیز با طعم شکلات گورمه؛ پودر پروتئین با ایزوله‌ی وی هیدرولیزه برای جذب و هضم سریع، که لاکتوز، کربوهیدرات، چربی و قند اضافه‌اش فیلتر شده است. هر وعده (۳۲ گرم) ۲۵ گرم پروتئین و ۱۲۰ کیلوکالری دارد و بسته‌ی ۶۵۰ گرمی ۲۰ وعده است.\nپروفایل آمینو اسید در هر وعده: لوسین ۲۶۷۷، ایزولوسین ۱۴۲۱ و والین ۱۴۴۷ میلی‌گرم (مجموع BCAA حدود ۵٫۵ گرم)، گلوتامین و گلوتامیک اسید ۴۴۰۶ میلی‌گرم.\nمواد تشکیل‌دهنده: ایزوله‌ی پروتئین وی هیدرولیزه، ایزوله‌ی پروتئین وی، پودر کاکائو (قلیایی‌شده)؛ کمتر از ۲٪: نمک، لسیتین سویا، طعم‌دهنده‌ی طبیعی و مصنوعی، کلرید پتاسیم، سوکرالوز و استویا (استویول گلیکوزیدها).",
    servingSize: "۳۲ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲۰ کیلوکالری" },
      { label: "چربی", amount: "۱ گرم" },
      { label: "چربی اشباع", amount: "۰ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۱۰ میلی‌گرم" },
      { label: "سدیم", amount: "۱۸۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۲ گرم" },
      { label: "فیبر", amount: "کمتر از ۱ گرم" },
      { label: "قندها", amount: "۱ گرم" },
      { label: "قند افزوده", amount: "۰ گرم" },
      { label: "پروتئین", amount: "۲۵ گرم" },
      { label: "کلسیم", amount: "۱۲۰ میلی‌گرم" },
      { label: "آهن", amount: "۰٫۸ میلی‌گرم" },
      { label: "پتاسیم", amount: "۲۳۰ میلی‌گرم" },
    ],
    warnings:
      "حساسیت‌زاها: حاوی شیر و سویا.\nفقط به‌عنوان مکمل غذایی مصرف شود؛ برای کاهش وزن استفاده نشود.",
    manufacturerClaims:
      "۲۵ گرم پروتئین در هر وعده\n۱۰۰٪ پروتئین آن از ایزوله‌ی وی است\nپروتئین وی هیدرولیزه برای جذب سریع\nبدون قند افزوده\nبه‌راحتی در آب، شیر یا جایگزین شیر حل می‌شود\nهضم آسان\nتست‌شده برای مواد ممنوعه (Banned Substance Tested)",
    brand: "Dymatize",
    price: 1290000,
    categorySlug: "protein",
  },
  {
    id: "dy3",
    name: "سوپر ماس گینر - Super Mass Gainer",
    slug: "dymatize-super-mass-gainer",
    groupSlug: "dymatize-super-mass-gainer",
    flavor: "شکلات",
    size: "۲٫۷ کیلوگرم",
    imageUrl: "/images/products/dymatize-super-mass-gainer.webp",
    // Photo and label details from Dymatize's US site
    // (dymatize.com/products/super-mass-gainer-rich-chocolate), 6 lb tub:
    // 8 servings × 335 g ≈ 2.7 kg. Two facts rows don't match their %DV
    // (vitamin E "14.3 mcg" at 95% fits 14.3 mg; magnesium 130 mg would be
    // 31%, not 25%), so they are left out.
    description:
      "سوپر ماس گینر دایماتیز با طعم شکلات؛ مکمل گینر با ترکیب پروتئین‌های سریع‌جذب و آهسته‌جذب، کربوهیدرات زیاد و ۱۴ ویتامین و ماده‌ی معدنی برای افزایش وزن و حجم عضله. هر وعده (۳۳۵ گرم) ۱۲۸۰ کیلوکالری، ۵۲ گرم پروتئین و ۲۴۵ گرم کربوهیدرات دارد و ظرف ۲٫۷ کیلوگرمی (۶ پوند) ۸ وعده است.\nمواد تشکیل‌دهنده: مالتودکسترین، ترکیب پروتئین (کنسانتره‌ی پروتئین وی، ایزوله‌ی پروتئین شیر، ایزوله‌ی پروتئین وی، پروتئین وی هیدرولیزه، کازئین میسلار)، کریمر آفتابگردان (روغن آفتابگردان، مالتودکسترین، کازئینات سدیم، مونو و دی‌گلیسریدها، توکوفرول‌های طبیعی، تری‌کلسیم فسفات)، پودر کاکائو (قلیایی‌شده)؛ کمتر از ۲٪: کراتین مونوهیدرات، فروکتوز، طعم‌دهنده‌های طبیعی و مصنوعی، ترکیب ویتامین و مواد معدنی (آسکوربات سدیم، دی-آلفا-توکوفریل استات، کلسیم دی-پانتوتنات، یدید پتاسیم، پیریدوکسین هیدروکلراید، تیامین هیدروکلراید، ریبوفلاوین، سیانوکوبالامین)، ترکیب صمغ‌ها (صمغ سلولز، زانتان، کاراگینان)، کلرید پتاسیم، نمک، لسیتین سویا، آسه‌سولفام پتاسیم، سوکرالوز و لسیتین آفتابگردان.",
    servingSize: "۳۳۵ گرم (۲ و ۱/۲ پیمانه)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲۸۰ کیلوکالری" },
      { label: "چربی", amount: "۱۱ گرم" },
      { label: "چربی اشباع", amount: "۳ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۱۳۰ میلی‌گرم" },
      { label: "سدیم", amount: "۵۸۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۲۴۵ گرم" },
      { label: "فیبر", amount: "۳ گرم" },
      { label: "قندها", amount: "۲۱ گرم" },
      { label: "قند افزوده", amount: "۱۲ گرم" },
      { label: "پروتئین", amount: "۵۲ گرم" },
      { label: "ویتامین C", amount: "۵۳ میلی‌گرم" },
      { label: "تیامین (B1)", amount: "۰٫۶ میلی‌گرم" },
      { label: "ریبوفلاوین (B2)", amount: "۰٫۲ میلی‌گرم" },
      { label: "ویتامین B6", amount: "۱٫۵ میلی‌گرم" },
      { label: "ویتامین B12", amount: "۱٫۸ میکروگرم" },
      { label: "پانتوتنیک اسید (B5)", amount: "۸ میلی‌گرم" },
      { label: "کلسیم", amount: "۹۵۰ میلی‌گرم" },
      { label: "آهن", amount: "۴٫۵ میلی‌گرم" },
      { label: "فسفر", amount: "۶۶۰ میلی‌گرم" },
      { label: "ید", amount: "۱۵۰ میکروگرم" },
      { label: "پتاسیم", amount: "۱۱۰۰ میلی‌گرم" },
    ],
    usage: "هر وعده ۲ و ۱/۲ پیمانه (۳۳۵ گرم) پودر است که با ۷۱۰ میلی‌لیتر (۲۴ اونس) آب مخلوط می‌شود.",
    warnings: "حساسیت‌زاها: حاوی شیر و سویا.",
    manufacturerClaims:
      "۵۲ گرم پروتئین باکیفیت با جذب سریع و آهسته در هر وعده\nدست‌کم ۲۴۵ گرم کربوهیدرات در هر وعده\n۱۰٫۷ گرم BCAA و ۵٫۱ گرم لوسین در هر وعده\nبا ۱۴ ویتامین و ماده‌ی معدنی\nبه‌راحتی مخلوط می‌شود و برای پخت هم مناسب است\nتست‌شده برای مواد ممنوعه (Banned Substance Tested)",
    brand: "Dymatize",
    price: 2150000,
    categorySlug: "protein",
  },
  {
    id: "dy4",
    name: "کراتین مونوهیدرات - Creatine Monohydrate",
    slug: "dymatize-creatine-monohydrate",
    groupSlug: "dymatize-creatine-monohydrate",
    flavor: "بدون طعم",
    size: "۳۰۰ گرم",
    imageUrl: "/images/products/dymatize-creatine-monohydrate.webp",
    // Photo and label details from Dymatize's US site
    // (dymatize.com/products/creatine-monohydrate): 60 × 5 g = 300 g. The
    // site gives no directions or warnings.
    description:
      "کراتین مونوهیدرات دایماتیز، بدون طعم؛ مکمل غذایی ۱۰۰٪ کراتین مونوهیدرات کرپیور (Creapure®) بدون پرکننده و افزودنی. هر وعده (۵ گرم) ۵ گرم کراتین مونوهیدرات دارد و قوطی ۳۰۰ گرمی ۶۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات (Creapure®).",
    servingSize: "۵ گرم (حدود ۱ اسکوپ)",
    nutritionFacts: [{ label: "کراتین مونوهیدرات (Creapure®)", amount: "۵ گرم" }],
    manufacturerClaims:
      "ساخته‌شده با ۱۰۰٪ کرپیور (Creapure®)\nبدون پرکننده و افزودنی\nتست‌شده برای مواد ممنوعه (Banned Substance Tested)\nبه گفته‌ی سازنده، همراه با ورزش و تمرین قدرتی منظم به عضله‌سازی، افزایش قدرت و تمرین‌های پرشدت کمک می‌کند (این ادعا توسط FDA ارزیابی نشده است)\nبدون طعم و آسان‌حل",
    brand: "Dymatize",
    price: 850000,
    categorySlug: "creatine",
  },
  {
    id: "dy5",
    name: "انرجایز پری‌ورک‌اوت - Energyze Pre-Workout",
    slug: "dymatize-energyze-pre-workout",
    groupSlug: "dymatize-energyze-pre-workout",
    flavor: "لیمو و لیموترش",
    size: "۴۰۰ گرم",
    imageUrl: "/images/products/dymatize-energyze-pre-workout.webp",
    // Photo and label details from Dymatize's US site
    // (dymatize.com/products/energyze-pre-workout-lemon-lime): 30 × 13.3 g ≈
    // 400 g. The site gives no directions or warnings; only the caffeine
    // content is stated as a warning here.
    description:
      "انرجایز پری‌ورک‌اوت دایماتیز با طعم لیمو و لیموترش؛ مکمل پیش از تمرین با کافئین کمتر و بدون قند، با ۵ گرم BCAA و ال-سیترولین، ال-تیروزین و ال-تیانین. هر وعده (۱۳٫۳ گرم) ۱۵۰ میلی‌گرم کافئین از عصاره‌ی میوه‌ی قهوه‌ی سبز دارد و قوطی ۴۰۰ گرمی ۳۰ وعده است.\nسایر مواد: سیتریک اسید، پودر لیمو (صمغ عربی، عصاره‌ی لیمو، کنسانتره‌ی آب لیمو)، طعم‌دهنده‌های طبیعی، سوکرالوز، دی‌اکسید سیلیکون، اولئورزین زردچوبه (رنگ) و لسیتین آفتابگردان.",
    servingSize: "۱۳٫۳ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۳۰ کیلوکالری" },
      { label: "کربوهیدرات", amount: "کمتر از ۱ گرم" },
      { label: "BCAA (ال-لوسین، ال-ایزولوسین، ال-والین با نسبت ۲:۱:۱)", amount: "۵ گرم" },
      { label: "ال-سیترولین", amount: "۴ گرم" },
      { label: "ال-تیروزین", amount: "۵۰۰ میلی‌گرم" },
      { label: "ال-تیانین", amount: "۵۰ میلی‌گرم" },
      { label: "عصاره‌ی میوه‌ی قهوه‌ی سبز", amount: "۱۵۷ میلی‌گرم" },
      { label: "کافئین (از عصاره‌ی قهوه‌ی سبز)", amount: "۱۵۰ میلی‌گرم" },
    ],
    warnings: "حاوی کافئین (۱۵۰ میلی‌گرم در هر وعده).",
    manufacturerClaims:
      "کافئین کمتر و بدون قند، برای انرژی پایدار\n۵ گرم ترکیب اسید آمینه که به گفته‌ی سازنده به تمرکز ذهنی کمک می‌کند (این ادعا توسط FDA ارزیابی نشده است)\nبه گفته‌ی سازنده: عملکرد بهتر، انرژی پایدار و ریکاوری سریع‌تر",
    brand: "Dymatize",
    price: 1250000,
    categorySlug: "pre-workout",
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
    imageUrl: "/images/products/muscletech-creatine-peptide-447.webp",
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
    imageUrl: "/images/products/muscletech-test-peptide-t10.webp",
    description:
      "تست پپتید T10 مسل‌تک، مکمل حمایت از تستوسترون و میل جنسی سالم در آقایان. هر وعده (۲ کپسول) ۵۰۸ میلی‌گرم VasoDrive-AP (کازئین هیدرولیزه)، ۳۲۵ میلی‌گرم TestFACTOR، ۲۰۰ میلی‌گرم سیترات بور و ۱۵ میلی‌گرم روی دارد. بسته‌ی ۵۶ کپسولی ۲۸ وعده است.\nمواد دیگر: کپسول (هیدروکسی‌پروپیل متیل‌سلولز، کربنات کلسیم)، سلولز میکروکریستالی، آرد برنج، منیزیم استئارات، سیلیکون دی‌اکسید.",
    // Facts panel and directions are from the "What's in the Formula" and
    // "How to Use" images on muscletech.com/products/peptide-t10. Its
    // warnings weren't there; only the panel's "Contains milk" is listed.
    servingSize: "۲ کپسول",
    nutritionFacts: [
      { label: "کربوهیدرات", amount: "کمتر از ۱ گرم" },
      { label: "فیبر", amount: "کمتر از ۱ گرم" },
      { label: "روی (سیترات روی)", amount: "۱۵ میلی‌گرم" },
      { label: "سدیم", amount: "۱۰ میلی‌گرم" },
      { label: "VasoDrive-AP (کازئین هیدرولیزه؛ پپتیدهای IPP و VPP)", amount: "۵۰۸ میلی‌گرم" },
      { label: "TestFACTOR (عصاره‌ی گل کنگر هندی و پوست انبه)", amount: "۳۲۵ میلی‌گرم" },
      { label: "سیترات بور (۵٪ بور)", amount: "۲۰۰ میلی‌گرم" },
    ],
    usage: "روزی ۱ وعده (۲ کپسول) با یک لیوان آب مصرف کنید.",
    warnings: "حساسیت‌زاها: حاوی شیر.",
    manufacturerClaims:
      "افزایش تستوسترون و حمایت از میل جنسی سالم\n۱۰ برابر تستوسترون کل بیشتر\nسیستم سه‌مرحله‌ای با فناوری پپتید\nحمایت بالینی از تستوسترون آزاد و کورتیزول، و داده‌های بالینی انسانی درباره‌ی توده‌ی بدون چربی\nمصرف روزانه بدون نیاز به دوره‌بندی\nبه گفته‌ی سازنده، در یک مطالعه‌ی بالینی ۸ هفته‌ای روی مردان سالم میانسال، مصرف‌کنندگان یکی از مواد اصلی این محصول ۴۸ برابر دارونما تستوسترون آزاد بیشتری داشتند (۱٫۹۵ در برابر ۰٫۰۴ پیکوگرم بر میلی‌لیتر)\nبه گفته‌ی سازنده، در ۸ هفته مصرف‌کنندگان یکی از مواد اصلی ۶ برابر گروه دارونما عضله‌ی بدون چربی به دست آوردند (۰٫۹۸ در برابر ۰٫۱۴ کیلوگرم)\n(مبنای ادعای «۱۰ برابر تستوسترون کل» در عکس‌های سایت سازنده نبود)",
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
    imageUrl: "/images/products/muscletech-platinum-creatine-grape-freeze.webp",
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
    imageUrl: "/images/products/muscletech-platinum-creatine-orange-splash.webp",
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
    imageUrl: "/images/products/muscletech-platinum-creatine-red-berry.webp",
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
    name: "هیدروکسی‌کات اورجینال - چربی‌سوز - Hydroxycut Original",
    slug: "hydroxycut-original",
    size: "۷۲ کپسول",
    imageUrl: "/images/products/hydroxycut-original.webp",
    // Pack photo, Supplement Facts panel (72 ct) and directions from
    // hydroxycut.com/products/hydroxycut-original: 72 ÷ 2 = 36 servings.
    // Replaces the Hydroxycut Hardcore placeholder, whose label has 50 mg
    // yohimbe extract. Plum, baobab and cardamom have no amounts on the
    // label, so they are only in the description. The site gives no
    // warnings beyond the caffeine amount.
    description:
      "هیدروکسی‌کات اورجینال (نام قبلی: Pro Clinical)؛ کپسول کاهش وزن با عصاره‌ی قهوه‌ی روبوستا (C. canephora robusta)، سرکه‌ی سیب و کافئین، به‌همراه ویتامین D و ویتامین‌های گروه B. هر وعده (۲ کپسول) ۲۰۰ میلی‌گرم کافئین دارد و قوطی ۷۲ کپسولی ۳۶ وعده است.\nترکیب Weight Loss Plus: عصاره‌ی قهوه‌ی روبوستا (۴۵٪ کلروژنیک اسید)، سرکه‌ی سیب، آلو، عصاره‌ی بائوباب و هل.\nسایر مواد: آرد برنج، کپسول (ژلاتین گاوی، دی‌اکسید تیتانیوم)، استئارات منیزیم، دی‌اکسید سیلیکون.",
    servingSize: "۲ کپسول",
    nutritionFacts: [
      { label: "ویتامین D (کوله‌کلسیفرول)", amount: "۱۰ میکروگرم" },
      { label: "تیامین (ویتامین B1)", amount: "۰٫۳ میلی‌گرم" },
      { label: "ریبوفلاوین (ویتامین B2)", amount: "۰٫۳ میلی‌گرم" },
      { label: "نیاسین (نیاسینامید)", amount: "۴ میلی‌گرم" },
      { label: "ویتامین B6", amount: "۰٫۴ میلی‌گرم" },
      { label: "ویتامین B12", amount: "۶ میکروگرم" },
      { label: "کمپلکس هیدروکسی‌کات (کل)", amount: "۶۰۴ میلی‌گرم" },
      { label: "عصاره‌ی قهوه‌ی روبوستا (۴۵٪ کلروژنیک اسید)", amount: "۲۰۰ میلی‌گرم" },
      { label: "سرکه‌ی سیب", amount: "۱۰۰ میلی‌گرم" },
      { label: "عصاره‌ی قهوه (Coffea robusta)", amount: "۲۰۴ میلی‌گرم" },
      { label: "کافئین (از عصاره‌ی قهوه)", amount: "۲۰۰ میلی‌گرم" },
    ],
    usage:
      "برای سنجش تحمل بدن، روزهای ۱ تا ۳: ۱ کپسول دو بار در روز؛ از روز ۴ به بعد: ۲ کپسول دو بار در روز، هر بار ۳۰ تا ۶۰ دقیقه پیش از دو وعده‌ی اصلی غذا و با یک لیوان آب.\nدر هر ۴ ساعت بیش از ۲ کپسول و در ۲۴ ساعت بیش از ۴ کپسول مصرف نکنید.\nبرای بهترین نتیجه، ۶۰ روز همراه با رژیم کم‌کالری و ورزش منظم مصرف کنید و روزانه ۸ لیوان آب بنوشید. پیش از مصرف کل برچسب را بخوانید.",
    warnings: "حاوی کافئین: ۲۰۰ میلی‌گرم در هر وعده (تا ۴۰۰ میلی‌گرم در روز).",
    manufacturerClaims:
      "ماده‌ی کلیدی کاهش وزن: عصاره‌ی قهوه‌ی روبوستا (C. canephora robusta) با پشتوانه‌ی دو مطالعه به گفته‌ی سازنده: میانگین ۱۰٫۹۵ پوند (حدود ۵ کیلوگرم) کاهش وزن در ۶۰ روز با رژیم کم‌کالری در برابر ۵٫۴ پوند در گروه دارونما، و ۳٫۷ پوند در ۸ هفته با رژیم و ورزش متوسط در برابر ۱٫۲۵ پوند\nکافئین برای انرژی و افزایش موقت کالری‌سوزی\nبا سرکه‌ی سیب و ویتامین‌های ضروری\n«پرفروش‌ترین برند مکمل کاهش وزن آمریکا» (به گفته‌ی سازنده)",
    brand: "MuscleTech",
    price: 1190000,
    categorySlug: "fat-burner",
  },
  {
    id: "mt3w",
    name: "هیدروکسی‌کات پلاس وومن - چربی‌سوز بانوان - Hydroxycut +Women",
    slug: "hydroxycut-plus-women",
    size: "۶۰ کپسول",
    imageUrl: "/images/products/hydroxycut-plus-women.webp",
    // Pack photo, Supplement Facts panel (60 ct) and directions from
    // hydroxycut.com/products/hydroxycut-pluswomen: 60 ÷ 2 = 30 servings.
    // Folate 340 mcg DFE = 200 mcg folic acid × 1.7; biotin and iron match
    // their %DV. Ingredients inside the blends have no separate amounts.
    description:
      "هیدروکسی‌کات پلاس وومن (نام قبلی: Hydroxycut Max)؛ فرمول کاهش وزن مخصوص بانوان در کپسول‌های مایع سریع‌رهش، با عصاره‌ی قهوه‌ی روبوستا (C. canephora robusta) و کافئین، به‌همراه بیوتین، کلاژن، اسید فولیک و آهن. هر وعده (۲ کپسول) ۱۵۰ میلی‌گرم کافئین دارد و قوطی ۶۰ کپسولی ۳۰ وعده است.\nترکیب HydroxyBoost™: کافئین، انبه، کیوی، روغن آووکادو. ترکیب ProDefine™: عصاره‌ی قهوه‌ی روبوستا (۴۵٪ کلروژنیک اسید)، عصاره‌ی برگ انجیر هندی. ترکیب Radiance Support: کلاژن هیدرولیزشده، دی‌اکسید سیلیکون، ال-سیستئین، ال-متیونین.\nسایر مواد: روغن کنجد، کپسول (ژلاتین، رنگ قرمز FD&C شماره‌ی ۴۰).",
    servingSize: "۲ کپسول مایع سریع‌رهش",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۰ کیلوکالری" },
      { label: "چربی", amount: "۱ گرم" },
      { label: "فولات (۲۰۰ میکروگرم اسید فولیک)", amount: "۳۴۰ میکروگرم DFE" },
      { label: "بیوتین", amount: "۳۰۰ میکروگرم" },
      { label: "آهن (فروس گلوکونات)", amount: "۲ میلی‌گرم" },
      { label: "کمپلکس هیدروکسی‌کات پلاس وومن (کل)", amount: "۴۳۰٫۸ میلی‌گرم" },
      { label: "کافئین", amount: "۱۵۰ میلی‌گرم" },
    ],
    usage:
      "برای سنجش تحمل بدن، روزهای ۱ تا ۳: ۱ کپسول دو بار در روز؛ از روز ۴ به بعد: ۱ وعده (۲ کپسول) دو بار در روز، ۳۰ تا ۶۰ دقیقه پیش از دو وعده‌ی اصلی غذا (مثلاً صبحانه و ناهار).\nبین وعده‌ها و پیش از شام چیزی نخورید. تا ۵ ساعت پیش از خواب مصرف نکنید.\nدر هر ۴ ساعت بیش از ۲ کپسول و در ۲۴ ساعت بیش از ۴ کپسول مصرف نکنید.\nبرای بهترین نتیجه، ۶۰ روز همراه با رژیم غذایی و ورزش مصرف کنید.",
    warnings: "حاوی کافئین: ۱۵۰ میلی‌گرم در هر وعده (تا ۳۰۰ میلی‌گرم در روز).\nحساسیت‌زا: حاوی کنجد.",
    manufacturerClaims:
      "ماده‌ی کلیدی کاهش وزن: عصاره‌ی قهوه‌ی روبوستا (C. canephora robusta) با پشتوانه‌ی دو مطالعه به گفته‌ی سازنده: میانگین ۱۰٫۹۵ پوند (حدود ۵ کیلوگرم) کاهش وزن در ۶۰ روز با رژیم کم‌کالری، و ۳٫۷ پوند در ۸ هفته با رژیم و ورزش متوسط\nانرژی سریع و افزایش متابولیسم با کافئین\nبا بیوتین و کلاژن، و مواد مناسب بانوان: اسید فولیک و آهن",
    brand: "MuscleTech",
    price: 1190000,
    categorySlug: "fat-burner",
  },
  {
    id: "mt16",
    name: "پلاتینیوم ۱۰۰٪ گلوتامین - Platinum 100% Glutamine",
    slug: "muscletech-platinum-glutamine",
    flavor: "بدون طعم",
    size: "۳۰۰ گرم",
    imageUrl: "/images/products/muscletech-platinum-glutamine.webp",
    // Pack photo and Supplement Facts panel (with its allergen line) from
    // muscletech.com/products/platinum-100-glutamine: 60 × 5 g = 300 g. The
    // site has no directions or warnings, so those are from the older label
    // in the NIH Dietary Supplement Label Database (dsld id 41721, 2014).
    description:
      "پلاتینیوم ۱۰۰٪ گلوتامین ماسل‌تک؛ پودر گلوتامین خالص، بی‌بو و بی‌مزه و بدون محرک که تنها یا همراه هر مکمل دیگری حل می‌شود و روز یا شب قابل مصرف است. هر وعده (۱ اسکوپ، ۵ گرم) ۵ گرم ال-گلوتامین دارد و قوطی ۳۰۰ گرمی ۶۰ وعده است.\nماده‌ی مؤثر: ال-گلوتامین.",
    servingSize: "۵ گرم (۱ اسکوپ)",
    nutritionFacts: [{ label: "ال-گلوتامین", amount: "۵ گرم" }],
    usage:
      "۱ وعده (۱ اسکوپ) را با ۲۴۰ میلی‌لیتر آب یا نوشیدنی ورزشی دلخواه مخلوط کنید و روزانه ۱ تا ۲ بار مصرف کنید. برای بهترین نتیجه روزانه ۲ وعده بخورید: در روزهای تمرین، ۱ وعده ۴۵ تا ۶۰ دقیقه پیش از تمرین و ۱ وعده ۱۵ تا ۳۰ دقیقه بعد از تمرین.\nدر جای خنک و خشک (۱۵ تا ۲۷ درجه‌ی سانتی‌گراد) نگهداری کنید.",
    warnings:
      "در دوران بارداری یا شیردهی مصرف نکنید.\nپیش از شروع رژیم غذایی یا برنامه‌ی ورزشی با پزشک مشورت کنید.\nاگر بسته‌بندی دستکاری شده است استفاده نکنید.\nدر مجموعه‌ای فرآوری می‌شود که شیر، تخم‌مرغ، سویا، بادام‌زمینی، آجیل درختی، کنجد، ماهی و صدف را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۵ گرم گلوتامین خالص در هر وعده\nبی‌بو، بی‌مزه و بدون محرک\nبه گفته‌ی سازنده: گلوتامین بیش از ۲۰٪ اسیدهای آمینه‌ی بدن را تشکیل می‌دهد و یک جلسه‌ی تمرین سنگین می‌تواند تا ۵۰٪ ذخایر گلوتامین عضله را کم کند؛ این محصول برای جبران گلوتامین از دست‌رفته در تمرین شدید طراحی شده است (این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "MuscleTech",
    price: 1200000,
    categorySlug: "creatine",
  },

  // BSN
  {
    id: "bsn1",
    name: "سینتا ۶ - Syntha-6",
    slug: "bsn-syntha-6",
    groupSlug: "bsn-syntha-6",
    flavor: "میلک‌شیک شکلات",
    size: "۱٫۳۲ کیلوگرم",
    imageUrl: "/images/products/bsn-syntha-6.webp",
    // Pack photo from BSN's US site (gobsn.com/products/syntha-6-protein),
    // Chocolate Milkshake 2.91 lb / 28 servings. The site's only facts panel
    // is for Blueberry Pancake (bsn1b), so this flavour has just what its
    // pack front shows: 22 g protein and 10 g essential amino acids.
    description:
      "سینتا ۶ بی‌اس‌ان با طعم میلک‌شیک شکلات؛ ماتریکس پروتئینی فوق‌ممتاز از چند منبع پروتئین (طبق سایت سازنده: کنسانتره و ایزوله‌ی پروتئین وی، کازئینات کلسیم، کازئین میسلار، ایزوله‌ی پروتئین شیر و آلبومین تخم‌مرغ) برای هر زمانی از روز. هر وعده ۲۲ گرم پروتئین و ۱۰ گرم اسید آمینه‌ی ضروری طبیعی دارد و بسته‌ی ۱٫۳۲ کیلوگرمی ۲۸ وعده است.",
    servingSize: "۱ اسکوپ",
    nutritionFacts: [
      { label: "پروتئین", amount: "۲۲ گرم" },
      { label: "اسیدهای آمینه‌ی ضروری (طبیعی)", amount: "۱۰ گرم" },
    ],
    usage: bsnSynthaUsage,
    // The site lists milk and egg proteins; this flavour's full ingredient
    // and allergen list isn't published there.
    warnings: "حساسیت‌زاها: حاوی شیر و تخم‌مرغ (طبق منابع پروتئینی که سایت سازنده نام برده است).",
    manufacturerClaims: bsnSynthaClaims,
    brand: "BSN",
    price: 2350000,
    categorySlug: "protein",
  },
  {
    id: "bsn1b",
    name: "سینتا ۶ - Syntha-6",
    slug: "bsn-syntha-6-blueberry-pancake",
    groupSlug: "bsn-syntha-6",
    flavor: "پنکیک بلوبری",
    size: "۱٫۳۲ کیلوگرم",
    imageUrl: "/images/products/bsn-syntha-6-blueberry-pancake.webp",
    // Pack photo and the Nutrition Facts panel image from BSN's US site
    // (Blueberry Pancake, 28 servings): 28 × 47 g ≈ 1.32 kg; every row
    // matches its %DV.
    description:
      "سینتا ۶ بی‌اس‌ان با طعم پنکیک بلوبری؛ ماتریکس پروتئینی فوق‌ممتاز از چند منبع پروتئین برای هر زمانی از روز. هر وعده (۴۷ گرم) ۲۲ گرم پروتئین، ۱۰ گرم اسید آمینه‌ی ضروری طبیعی و ۲۰۰ کیلوکالری دارد و بسته‌ی ۱٫۳۲ کیلوگرمی ۲۸ وعده است.\nمواد تشکیل‌دهنده: ماتریکس پروتئین (کنسانتره‌ی پروتئین وی، کازئینات کلسیم، ایزوله‌ی پروتئین وی هیدرولیزه، ایزوله‌ی پروتئین وی، کازئین میسلار، ایزوله‌ی پروتئین شیر)، پلی‌دکستروز، کریمر (روغن آفتابگردان، شربت ذرت جامد، کازئینات سدیم، مونو و دی‌گلیسریدها، دی‌پتاسیم فسفات، تری‌کلسیم فسفات، لسیتین سویا، توکوفرول‌ها)، مالتودکسترین، طعم‌دهنده‌ی طبیعی و مصنوعی، پودر MCT (تری‌گلیسریدهای با زنجیره‌ی متوسط، دی‌اکسید سیلیکون، مالتودکسترین)، لسیتین آفتابگردان و/یا سویا، صمغ سلولز، نمک، سوکرالوز و رنگ‌های آبی ۲ و قرمز ۴۰.",
    servingSize: "۴۷ گرم (حدود ۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۲۰۰ کیلوکالری" },
      { label: "چربی", amount: "۵ گرم" },
      { label: "چربی اشباع", amount: "۲ گرم" },
      { label: "کلسترول", amount: "۹۰ میلی‌گرم" },
      { label: "سدیم", amount: "۲۰۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۱۶ گرم" },
      { label: "فیبر", amount: "۶ گرم" },
      { label: "قندها", amount: "۳ گرم" },
      { label: "قند افزوده", amount: "۱ گرم" },
      { label: "پروتئین", amount: "۲۲ گرم" },
      { label: "کلسیم", amount: "۱۲۰ میلی‌گرم" },
      { label: "پتاسیم", amount: "۱۹۰ میلی‌گرم" },
      { label: "فسفر", amount: "۱۴۰ میلی‌گرم" },
      { label: "منیزیم", amount: "۱۵ میلی‌گرم" },
    ],
    usage: bsnSynthaUsage,
    warnings: "حساسیت‌زاها: حاوی شیر و سویا.",
    manufacturerClaims: bsnSynthaClaims,
    brand: "BSN",
    price: 2350000,
    categorySlug: "protein",
  },
  {
    id: "bsn2",
    name: "ان‌او اکسپلود - N.O.-Xplode",
    slug: "bsn-no-xplode",
    groupSlug: "bsn-no-xplode",
    flavor: "بلو رز (تمشک آبی)",
    size: "۲۹۶ گرم",
    imageUrl: "/images/products/bsn-no-xplode.webp",
    // Pack photo and Supplement Facts panel image from BSN's US site
    // (gobsn.com/products/no-xplode-pre-workout, Blue Raz 16 servings):
    // 16 × 18.5 g = 296 g; every %DV row checks out. Caffeine (275 mg, on
    // the pack front) and beta-alanine (1.8 g, page text) sit inside the
    // proprietary blends. The site gives no warnings, so only the caffeine
    // content is stated.
    description:
      "ان‌او اکسپلود بی‌اس‌ان با طعم بلو رز؛ پیش‌تمرین افسانه‌ای (اولین پیش‌تمرین کامل، از ۲۰۰۴) برای انرژی انفجاری، تمرکز، پمپ و استقامت. هر وعده (۱۸٫۵ گرم) ۲۷۵ میلی‌گرم کافئین دارد و قوطی ۲۹۶ گرمی ۱۶ وعده است.\nترکیب اختصاصی N.O.-XPLODE: ماتریکس میوژنیک ۵٫۱ گرم (کراتین مونوهیدرات، تورین، دی‌کلسیم فسفات، دی‌سدیم فسفات، AstraGin®)؛ اندورا شات ۲٫۹ گرم (بتا-آلانین، بی‌کربنات پتاسیم، بی‌کربنات سدیم، اکسید منیزیم، کوله‌کلسیفرول)؛ ترمیک انرژی ۱٫۳ گرم (ان-استیل تیروزین، ال-تیروزین، کافئین بی‌آب، بیوفلاونوئید گریپ‌فروت)؛ ان‌او آلفا فیوژن ۱ گرم (ال-سیترولین مالات، عصاره‌ی ریشه‌ی دانشن، عصاره‌ی پوست انگور، عصاره‌ی آمله (CAPROS®)، عصاره‌ی زالزالک، فولیک اسید)؛ شاک کامپوزیت ۲۹۰ میلی‌گرم (DMAE بیتارترات، ال-فنیل‌آلانین، نیکوتینیک اسید، کلسیم دی-پانتوتنات، عصاره‌ی هوپرزیا، تیامین، پیریدوکسین، سیانوکوبالامین).\nسایر مواد: طعم‌دهنده‌ی طبیعی و مصنوعی، سیتریک اسید، مالیک اسید، سیلیکات کلسیم، دی‌اکسید سیلیکون، سوکرالوز، آسه‌سولفام پتاسیم و رنگ‌های آبی ۱ و آبی ۲.",
    servingSize: "۱۸٫۵ گرم (حدود ۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۲۰ کیلوکالری" },
      { label: "کربوهیدرات", amount: "۵ گرم" },
      { label: "ویتامین D", amount: "۱۲٫۵ میکروگرم" },
      { label: "تیامین (B1)", amount: "۲ میلی‌گرم" },
      { label: "نیاسین", amount: "۲۰ میلی‌گرم" },
      { label: "ویتامین B6", amount: "۲ میلی‌گرم" },
      { label: "فولات", amount: "۳۳۰ میکروگرم DFE" },
      { label: "ویتامین B12", amount: "۶ میکروگرم" },
      { label: "پانتوتنیک اسید", amount: "۱۰ میلی‌گرم" },
      { label: "کلسیم", amount: "۴۰ میلی‌گرم" },
      { label: "منیزیم", amount: "۱۲۵ میلی‌گرم" },
      { label: "سدیم", amount: "۱۰۰ میلی‌گرم" },
      { label: "پتاسیم", amount: "۲۰۰ میلی‌گرم" },
      { label: "ماتریکس میوژنیک", amount: "۵٫۱ گرم" },
      { label: "اندورا شات", amount: "۲٫۹ گرم" },
      { label: "ترمیک انرژی", amount: "۱٫۳ گرم" },
      { label: "ان‌او آلفا فیوژن", amount: "۱ گرم" },
      { label: "شاک کامپوزیت", amount: "۲۹۰ میلی‌گرم" },
      { label: "کافئین (روی بسته)", amount: "۲۷۵ میلی‌گرم" },
      { label: "بتا-آلانین (طبق سایت سازنده)", amount: "۱٫۸ گرم" },
    ],
    usage:
      "۱۸٫۵ گرم (حدود ۱ اسکوپ) را با ۱۲۰ تا ۱۸۰ میلی‌لیتر (۴ تا ۶ اونس) آب سرد مخلوط کنید و ۲۰ تا ۳۰ دقیقه پیش از تمرین مصرف کنید. تکان ندهید؛ پودر را هم بزنید.",
    warnings: "حاوی ۲۷۵ میلی‌گرم کافئین در هر وعده.",
    manufacturerClaims:
      "انرژی انفجاری، تمرکز شدید، پمپ و استقامت بیشتر\nاولین پیش‌تمرین کامل، عرضه‌شده در ۲۰۰۴ (به گفته‌ی سازنده)\nساخت آمریکا\n(این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "BSN",
    price: 1450000,
    categorySlug: "pre-workout",
  },
  {
    id: "bsn4",
    name: "کراتین - Creatine",
    slug: "bsn-creatine",
    groupSlug: "bsn-creatine",
    flavor: "بدون طعم",
    size: "۳۰۹ گرم",
    imageUrl: "/images/products/bsn-creatine.webp",
    // Pack photo and Supplement Facts panel image from BSN's US site
    // (gobsn.com/products/creatine): 60 × 5 g; the pack's net weight is
    // 309 g. The site gives no warnings.
    description:
      "کراتین بی‌اس‌ان، بدون طعم؛ کراتین مونوهیدرات میکرونیزه برای حل‌شدن سریع، بدون پرکننده و افزودنی، مناسب برای ترکیب با مکمل‌های دیگر. هر وعده (۵ گرم) ۵ گرم کراتین مونوهیدرات دارد و قوطی ۳۰۹ گرمی ۶۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات میکرونیزه (سایر مواد: ندارد).",
    servingSize: "۵ گرم (حدود ۱ اسکوپ)",
    nutritionFacts: [{ label: "کراتین مونوهیدرات میکرونیزه", amount: "۵ گرم" }],
    usage:
      "۵ گرم (حدود ۱ اسکوپ) را با ۲۴۰ تا ۳۵۰ میلی‌لیتر (۸ تا ۱۲ اونس) آب یا نوشیدنی دلخواه مخلوط کنید؛ بعد از تمرین یا هر زمانی از روز.",
    manufacturerClaims:
      "۵ گرم کراتین مونوهیدرات در هر وعده\nبدون پرکننده و افزودنی\nمیکرونیزه برای حل‌شدن سریع\nبه گفته‌ی سازنده، از قدرت و توان عضله و بازچرخش ATP در تمرین پرشدت پشتیبانی می‌کند (این ادعا توسط FDA ارزیابی نشده است)",
    brand: "BSN",
    price: 750000,
    categorySlug: "creatine",
  },
  {
    id: "bsn5",
    name: "ترو مس - گینر - True-Mass",
    slug: "bsn-true-mass",
    groupSlug: "bsn-true-mass",
    flavor: "میلک‌شیک شکلات",
    size: "۲٫۶۴ کیلوگرم",
    imageUrl: "/images/products/bsn-true-mass.webp",
    // Pack photo and Nutrition Facts panel image from BSN's US site
    // (gobsn.com/products/true-mass, Chocolate Milkshake 16 servings):
    // 16 × 165 g ≈ 2.64 kg. The protein %DV (86%) is lower than 47 g ÷ 50 g
    // because US labels base it on digestibility-corrected protein, so the
    // row is kept. The site gives no warnings.
    description:
      "ترو مس بی‌اس‌ان با طعم میلک‌شیک شکلات؛ گینر فوق‌ممتاز با ماتریکس پروتئین و کربوهیدرات (نسبت حدود ۲ به ۱) و MCT، برای ورزشکارانی که به کالری بیشتری نیاز دارند. هر وعده (۱۶۵ گرم) ۶۹۰ کیلوکالری، ۴۷ گرم پروتئین و ۸۷ گرم کربوهیدرات دارد و ظرف ۲٫۶۴ کیلوگرمی ۱۶ وعده است.\nمواد تشکیل‌دهنده: ماتریکس پروتئین (کنسانتره‌ی پروتئین وی، کازئینات کلسیم، ایزوله‌ی پروتئین وی هیدرولیزه، ایزوله‌ی پروتئین وی، کازئین میسلار، ایزوله‌ی پروتئین شیر)، پلی‌دکستروز، کریمر (روغن آفتابگردان، شربت ذرت جامد، کازئینات سدیم، مونو و دی‌گلیسریدها، دی‌پتاسیم فسفات، تری‌کلسیم فسفات، لسیتین سویا، توکوفرول‌ها)، مالتودکسترین، طعم‌دهنده‌ی طبیعی و مصنوعی، پودر MCT (تری‌گلیسریدهای با زنجیره‌ی متوسط، دی‌اکسید سیلیکون، مالتودکسترین)، لسیتین آفتابگردان و/یا سویا، صمغ سلولز، نمک، سوکرالوز و رنگ‌های آبی ۲ و قرمز ۴۰.",
    servingSize: "۱۶۵ گرم (حدود ۳ اسکوپ سرپر)",
    nutritionFacts: [
      { label: "انرژی", amount: "۶۹۰ کیلوکالری" },
      { label: "چربی", amount: "۱۷ گرم" },
      { label: "چربی اشباع", amount: "۵ گرم" },
      { label: "کلسترول", amount: "۱۴۵ میلی‌گرم" },
      { label: "سدیم", amount: "۳۸۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۸۷ گرم" },
      { label: "فیبر", amount: "۵ گرم" },
      { label: "قندها", amount: "۱۵ گرم" },
      { label: "قند افزوده", amount: "۳ گرم" },
      { label: "پروتئین", amount: "۴۷ گرم" },
      { label: "کلسیم", amount: "۴۱۰ میلی‌گرم" },
      { label: "آهن", amount: "۴٫۲ میلی‌گرم" },
      { label: "پتاسیم", amount: "۱۰۶۰ میلی‌گرم" },
      { label: "فسفر", amount: "۴۷۰ میلی‌گرم" },
      { label: "منیزیم", amount: "۱۰۰ میلی‌گرم" },
    ],
    usage:
      "۱۶۵ گرم (حدود ۳ اسکوپ سرپر) را با ۴۷۰ میلی‌لیتر (۱۶ اونس) آب سرد یا نوشیدنی دلخواه مخلوط کنید؛ بعد از تمرین، بین وعده‌ها و/یا پیش از خواب. روزانه ۱ وعده یا به اندازه‌ی نیاز پروتئین و کالری‌تان. برای پروتئین و کالری بیشتر و طعم میلک‌شیکی، با شیر مخلوط کنید.",
    warnings: "حساسیت‌زاها: حاوی شیر و سویا.",
    manufacturerClaims:
      "۴۷ گرم پروتئین و ۶۹۰ کالری در هر وعده\n۲۰ گرم اسید آمینه‌ی ضروری و ۹٫۵ گرم BCAA طبیعی در هر وعده\nبا تری‌گلیسریدهای زنجیره‌متوسط (MCT)\nبه گفته‌ی سازنده، همراه با تمرین مقاومتی منظم از عضله‌سازی و ریکاوری پشتیبانی می‌کند (این ادعا توسط FDA ارزیابی نشده است)",
    brand: "BSN",
    price: 2650000,
    categorySlug: "protein",
  },

  // Cellucor
  {
    id: "ce1",
    name: "سی‌فور اورجینال - C4 Original",
    slug: "cellucor-c4-original",
    groupSlug: "cellucor-c4-original",
    flavor: "آیسی بلو رز (تمشک آبی یخی)",
    size: "۲۶۷ گرم",
    imageUrl: "/images/products/cellucor-c4-original.webp",
    // Pack photo and Supplement Facts panel image from Cellucor's US site
    // (cellucor.com/products/c4-original, Icy Blue Razz): 30 × 8.9 g = 267 g.
    // Directions and warnings are from that page's text.
    description:
      "سی‌فور اورجینال سلوکور با طعم آیسی بلو رز؛ مکمل پیش از تمرین (نسل پنجم فرمول) برای انرژی، تمرکز، استقامت عضلانی و پمپ، بدون قند و رنگ مصنوعی. هر وعده (۸٫۹ گرم) ۲۰۰ میلی‌گرم کافئین و ۲ گرم بتا-آلانین کارنوسین دارد و قوطی ۲۶۷ گرمی ۳۰ وعده است.\nسایر مواد: سیتریک اسید، مالیک اسید، دی‌اکسید سیلیکون، طعم‌دهنده‌های طبیعی و مصنوعی، سیلیکات کلسیم، سوکرالوز، آسه‌سولفام پتاسیم و عصاره‌ی اسپیرولینا (رنگ).",
    servingSize: "۸٫۹ گرم (حدود ۱ اسکوپ صاف)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۰ کیلوکالری" },
      { label: "کربوهیدرات", amount: "۱ گرم" },
      { label: "قندها", amount: "۰ گرم" },
      { label: "ویتامین B6 (پیریدوکسال-۵-فسفات)", amount: "۳٫۴ میلی‌گرم" },
      { label: "فولات (متیل‌تتراهیدروفولات)", amount: "۱۰۰ میکروگرم DFE" },
      { label: "ویتامین B12 (متیل‌کوبالامین)", amount: "۶ میکروگرم" },
      { label: "کولین (کولین بیتارترات)", amount: "۲۲۵ میلی‌گرم" },
      { label: "مجموعه‌ی استقامت عضلانی و عملکرد", amount: "۴٫۵ گرم" },
      { label: "بتا-آلانین کارنوسین (CarnoSyn®)", amount: "۲ گرم" },
      { label: "ال-سیترولین (Velox®)", amount: "۱٫۲ گرم" },
      { label: "ال-آرژنین (Velox®)", amount: "۱٫۲ گرم" },
      { label: "پپتیدهای عدس (PeptiPump®)", amount: "۱۰۰ میلی‌گرم" },
      { label: "کراتین نیترات (NO3-T®)", amount: "۱ گرم" },
      { label: "مجموعه‌ی انرژی و تمرکز", amount: "۲۰۵ میلی‌گرم" },
      { label: "کافئین بی‌آب", amount: "۲۰۰ میلی‌گرم" },
      { label: "عصاره‌ی هوپرزیا (۱٪ هوپرزین A)", amount: "۵ میلی‌گرم" },
    ],
    usage:
      "۱ اسکوپ را با ۱۸۰ تا ۲۴۰ میلی‌لیتر (۶ تا ۸ اونس) آب مخلوط کنید و ۲۰ تا ۳۰ دقیقه پیش از تمرین مصرف کنید. اگر بار اول است، با نصف اسکوپ شروع کنید تا تحمل بدنتان را بسنجید.\nدر جای خنک و خشک نگهداری کنید.",
    warnings:
      "فقط برای بزرگسالان سالم ۱۸ سال به بالا.\nحاوی ۲۰۰ میلی‌گرم کافئین در هر وعده؛ اگر مصرف کافئین را محدود می‌کنید استفاده نکنید و آن را با منابع دیگر کافئین یا محرک‌ها همراه نکنید.\nدر دوران بارداری یا شیردهی، یا اگر نیترات (برای درد قفسه‌ی سینه) یا داروهای مهارکننده‌ی PDE-5 (برای اختلال نعوظ) مصرف می‌کنید، استفاده نکنید.\nاگر داروهای ضدافسردگی (MAOI یا SSRI)، رقیق‌کننده‌ی خون، داروهای ضدالتهاب غیراستروئیدی (NSAID)، سودوافدرین یا مکمل و داروی دیگری مصرف می‌کنید، یا بیماری‌هایی مانند فشار خون، دیابت، بیماری قلبی، کبدی، کلیوی یا تیروئید، اضطراب، تشنج یا مشکل ادراری مربوط به پروستات دارید، پیش از مصرف با پزشک مشورت کنید.\nدو هفته پیش از جراحی مصرف را قطع کنید.\nدر صورت بروز هر واکنش نامطلوب، مصرف را قطع و با پزشک تماس بگیرید.\nاز مقدار توصیه‌شده بیشتر مصرف نکنید.\nاگر پلمب ایمنی شکسته یا موجود نیست استفاده نکنید.\nدور از دسترس کودکان نگهداری شود.",
    manufacturerClaims:
      "برند شماره‌ی ۱ پیش‌تمرین در جهان (به گفته‌ی سازنده)\nانرژی، تمرکز، استقامت و پمپ عضلانی\nپپتیدهای طراحی‌شده با هوش مصنوعی (PeptiPump®)\nبدون قند و بدون رنگ مصنوعی\n(این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "Cellucor",
    price: 1390000,
    categorySlug: "pre-workout",
  },
  {
    id: "ce4",
    name: "سی‌فور وی پروتئین - C4 Whey Protein",
    slug: "cellucor-c4-whey-protein",
    groupSlug: "cellucor-c4-whey-protein",
    flavor: "شکلات و کره‌ی بادام‌زمینی ریسز",
    size: "۱٫۱۳ کیلوگرم",
    imageUrl: "/images/products/cellucor-c4-whey-protein.webp",
    // Pack photo and Nutrition Facts panel image from Cellucor's US site
    // (cellucor.com/products/c4-whey-protein, REESE'S flavour, the only one
    // with a facts panel there): 28 × 40.2 g ≈ 1.13 kg; every row matches
    // its %DV. The page gives no warnings.
    description:
      "سی‌فور وی پروتئین سلوکور با طعم شکلات و کره‌ی بادام‌زمینی ریسز (REESE'S)؛ پودر پروتئین وی از کنسانتره و ایزوله‌ی وی، بدون قند افزوده و بدون گلوتن. هر وعده (۴۰٫۲ گرم) ۲۵ گرم پروتئین و ۱۴۰ کیلوکالری دارد و بسته‌ی ۱٫۱۳ کیلوگرمی ۲۸ وعده است.\nمواد تشکیل‌دهنده: کنسانتره‌ی پروتئین وی، ایزوله‌ی پروتئین وی، آرد بادام‌زمینی نیمه‌چربی‌گرفته، پودر کاکائو (قلیایی‌شده)، طعم‌دهنده‌های طبیعی و مصنوعی، کلرید پتاسیم، لسیتین آفتابگردان، نمک، صمغ زانتان، صمغ سلولز، سوکرالوز و آسه‌سولفام پتاسیم.",
    servingSize: "۴۰٫۲ گرم (حدود ۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۴۰ کیلوکالری" },
      { label: "چربی", amount: "۲٫۵ گرم" },
      { label: "چربی اشباع", amount: "۲ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۸۰ میلی‌گرم" },
      { label: "سدیم", amount: "۱۹۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۴ گرم" },
      { label: "فیبر", amount: "۱ گرم" },
      { label: "قندها", amount: "۲ گرم" },
      { label: "قند افزوده", amount: "۰ گرم" },
      { label: "پروتئین", amount: "۲۵ گرم" },
      { label: "کلسیم", amount: "۱۴۰ میلی‌گرم" },
      { label: "آهن", amount: "۱ میلی‌گرم" },
      { label: "پتاسیم", amount: "۴۹۰ میلی‌گرم" },
    ],
    usage: "۱ اسکوپ (۴۰٫۲ گرم) را با آب مخلوط کنید، یا برای افزایش پروتئین به دستور پخت غذاها اضافه کنید.",
    warnings: "حساسیت‌زاها: حاوی شیر و بادام‌زمینی.",
    manufacturerClaims:
      "۲۵ گرم پروتئین وی در هر اسکوپ برای رشد و ریکاوری عضله\nبدون قند افزوده\nبدون گلوتن\nکمک به ساخت و حفظ عضله‌ی بدون چربی (به گفته‌ی سازنده؛ این ادعا توسط FDA ارزیابی نشده است)",
    brand: "Cellucor",
    price: 1650000,
    categorySlug: "protein",
  },
  {
    id: "ce5",
    name: "کراتین مونوهیدرات میکرونیزه - Cor-Performance Creatine",
    slug: "cellucor-creatine",
    groupSlug: "cellucor-creatine",
    flavor: "بدون طعم",
    size: "۳۶۰ گرم",
    imageUrl: "/images/products/cellucor-creatine.webp",
    // Pack photo and Supplement Facts image from Cellucor's US site
    // (cellucor.com/products/creatine-monohydrate-powder): 72 × 5 g = 360 g.
    // The page gives no directions or warnings.
    description:
      "کراتین سلوکور (Cor-Performance)، بدون طعم؛ مکمل غذایی کراتین مونوهیدرات میکرونیزه برای حل‌شدن بهتر در آب، بدون هیچ ماده‌ی دیگر. هر وعده (۵ گرم) ۵ گرم کراتین مونوهیدرات دارد و قوطی ۳۶۰ گرمی ۷۲ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات میکرونیزه (سایر مواد: ندارد).",
    servingSize: "۵ گرم (حدود ۱ اسکوپ صاف)",
    nutritionFacts: [{ label: "کراتین مونوهیدرات میکرونیزه", amount: "۵ گرم" }],
    manufacturerClaims:
      "۵ گرم کراتین مونوهیدرات میکرونیزه در هر وعده\nبدون قند، بدون رنگ مصنوعی و بدون چربی\nبه گفته‌ی سازنده، همراه با تمرین مقاومتی به عضله‌ی بدون چربی و افزایش قدرت کمک می‌کند و از حافظه پشتیبانی می‌کند (این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "Cellucor",
    price: 850000,
    categorySlug: "creatine",
  },
  {
    id: "ce2",
    name: "سوپر ترمو - چربی‌سوز بدون محرک - Super Thermo",
    slug: "cellucor-super-thermo",
    size: "۶۰ کپسول",
    imageUrl: "/images/products/cellucor-super-thermo.webp",
    // Pack photo and Supplement Facts panel from cellucor.com/products/
    // super-thermo: 60 ÷ 2 = 30 servings; 20 mg cayenne × 5% = the 1 mg
    // capsaicinoids on the pack front. Replaces the SuperHD placeholder,
    // whose label (like Super Shred's) has yohimbe; SuperHD also has
    // rauwolfia. The site gives no directions or warnings.
    description:
      "سوپر ترمو سلوکور؛ چربی‌سوز بدون محرک (بدون کافئین) برای کالری‌سوزی، متابولیسم و کنترل اشتها. هر وعده (۲ کپسول) ۵۰۰ میلی‌گرم پپتید DNF-10®، ۴۰۰ میلی‌گرم بربرین، ۱۰۰ میلی‌گرم ۵-HTP و ۲۰ میلی‌گرم عصاره‌ی فلفل قرمز دارد و قوطی ۶۰ کپسولی ۳۰ وعده است.\nسایر مواد: کپسول گیاهی (هیپروملوز)، میکروکریستالین سلولز، استئارات منیزیم، دی‌اکسید سیلیکون.",
    servingSize: "۲ کپسول",
    nutritionFacts: [
      { label: "کروم (Chromax®، کروم پیکولینات)", amount: "۲۰۰ میکروگرم" },
      { label: "پپتید مخمر DNF-10®", amount: "۵۰۰ میلی‌گرم" },
      { label: "بربرین HCl", amount: "۴۰۰ میلی‌گرم" },
      { label: "۵-HTP (از عصاره‌ی دانه‌ی گریفونیا)", amount: "۱۰۰ میلی‌گرم" },
      { label: "عصاره‌ی برگ بانابا (۱٪ کوروسولیک اسید)", amount: "۵۰ میلی‌گرم" },
      { label: "عصاره‌ی فلفل قرمز (۵٪ کپسایسینوئید)", amount: "۲۰ میلی‌گرم" },
    ],
    manufacturerClaims:
      "چربی‌سوز بدون محرک\nبه گفته‌ی سازنده: کالری‌سوزی و متابولیسم بیشتر با عصاره‌ی فلفل قرمز، سیری و کنترل اشتها با DNF-10® و کمک به مدیریت قند خون (در محدوده‌ی طبیعی) با بربرین، بانابا و Chromax® (این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "Cellucor",
    price: 1290000,
    categorySlug: "fat-burner",
  },

  // MyProtein
  {
    id: "mp1",
    name: "ایمپکت وی پروتئین - Impact Whey Protein",
    slug: "myprotein-impact-whey",
    groupSlug: "myprotein-impact-whey",
    flavor: "شکلات اسموت",
    size: "۲٫۷ کیلوگرم",
    imageUrl: "/images/products/myprotein-impact-whey.webp",
    // Photo and label details from MyProtein's UK site (myprotein.com,
    // impact-whey-protein-powder, variation 17712168 = Chocolate Smooth,
    // 90 servings / 2.7 kg, the size with its own pack photo): 90 × 30 g.
    description:
      "ایمپکت وی پروتئین مای‌پروتئین با طعم شکلات اسموت؛ پودر کنسانتره‌ی پروتئین وی، پرفروش‌ترین وی بریتانیا و اروپا به گفته‌ی سازنده. هر وعده (۳۰ گرم) ۲۲ گرم پروتئین و ۱۱۳ کیلوکالری دارد و بسته‌ی ۲٫۷ کیلوگرمی ۹۰ وعده است. مناسب گیاه‌خواران (لاکتو).\nمواد تشکیل‌دهنده: کنسانتره‌ی پروتئین وی (از شیر) ۹۶٪ (حاوی امولسیفایرهای لسیتین سویا و لسیتین آفتابگردان)، پودر کاکائوی کم‌چرب، طعم‌دهنده و شیرین‌کننده (سوکرالوز).",
    servingSize: "۳۰ گرم (حدود ۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۳ کیلوکالری" },
      { label: "چربی", amount: "۱٫۹ گرم" },
      { label: "چربی اشباع", amount: "۱٫۲ گرم" },
      { label: "کربوهیدرات", amount: "۲٫۰ گرم" },
      { label: "قندها", amount: "۱٫۵ گرم" },
      { label: "پروتئین", amount: "۲۲ گرم" },
      { label: "نمک", amount: "۰٫۱۳ گرم" },
    ],
    usage:
      "۳۰ گرم (حدود ۱ اسکوپ) را با ۲۵۰ میلی‌لیتر آب یا شیر مخلوط کنید و ۳۰ دقیقه پیش و/یا بعد از تمرین مصرف کنید. پودر به مرور ته‌نشین می‌شود؛ برای دقت بیشتر آن را وزن کنید.\nدر جای خنک و خشک و دور از نور مستقیم خورشید نگهداری کنید.",
    warnings:
      "حساسیت‌زاها: حاوی شیر و سویا.\nاین محصول باید در کنار رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم مصرف شود.",
    manufacturerClaims:
      "تا ۲۳ گرم پروتئین در هر وعده (بسته به طعم)\nحدود ۵ گرم BCAA طبیعی در هر وعده\nدارای گواهی Informed Choice (تست مواد ممنوعه) و Informed Protein (تأیید مقدار پروتئین برچسب)\nپرفروش‌ترین وی پروتئین بریتانیا و اروپا (به گفته‌ی سازنده)\nادعاهای سلامت مورد تأیید اتحادیه‌ی اروپا: پروتئین به رشد و حفظ توده‌ی عضلانی و حفظ سلامت استخوان‌ها کمک می‌کند",
    brand: "MyProtein",
    price: 3950000,
    categorySlug: "protein",
  },
  {
    id: "mp3",
    name: "ایمپکت کراتین مونوهیدرات - Impact Creatine",
    slug: "myprotein-creatine-monohydrate",
    groupSlug: "myprotein-creatine-monohydrate",
    flavor: "بدون طعم",
    size: "۵۰۰ گرم",
    imageUrl: "/images/products/myprotein-creatine-monohydrate.webp",
    // Photo and label details from MyProtein's UK site (myprotein.com,
    // creatine-monohydrate-powder, variation 10530054 = Unflavoured,
    // 147 servings / 0.5 kg): 147 × 3.4 g ≈ 500 g.
    description:
      "ایمپکت کراتین مای‌پروتئین، بدون طعم؛ پودر ۱۰۰٪ کراتین مونوهیدرات بدون فاز بارگیری. هر وعده (۳٫۴ گرم) ۳ گرم کراتین دارد و بسته‌ی ۵۰۰ گرمی ۱۴۷ وعده است. مناسب گیاه‌خواران و وگان‌ها.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات.",
    servingSize: "۳٫۴ گرم (حدود ۱ اسکوپ)",
    nutritionFacts: [
      { label: "کراتین مونوهیدرات", amount: "۳٫۴ گرم" },
      { label: "کراتین", amount: "۳٫۰ گرم" },
    ],
    usage:
      "روزانه ۱ بار، ۳٫۴ گرم (حدود ۱ اسکوپ) را با ۲۵۰ میلی‌لیتر آب مخلوط کنید، تکان دهید و پیش یا بعد از تمرین مصرف کنید. پودر به مرور ته‌نشین می‌شود؛ برای دقت بیشتر آن را وزن کنید.\nدر جای خنک و خشک و دور از نور مستقیم خورشید نگهداری کنید.",
    warnings:
      "از مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.\nمکمل غذایی جایگزین رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم نیست.\nدور از دسترس کودکان نگهداری شود.\nدر مجموعه‌ای تولید می‌شود که شیر را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۳ گرم کراتین در هر وعده؛ بدون نیاز به فاز بارگیری\nدارای گواهی Informed Choice (تست مواد ممنوعه)\nکراتین عملکرد بدنی را در تمرین‌های کوتاه‌مدت، پرشدت و پشت‌سرهم افزایش می‌دهد؛ این اثر با مصرف روزانه‌ی ۳ گرم کراتین به دست می‌آید (ادعای سلامت مورد تأیید اتحادیه‌ی اروپا)",
    brand: "MyProtein",
    price: 750000,
    categorySlug: "creatine",
  },
  {
    id: "mp4",
    name: "ایمپکت ویت گینر - Impact Weight Gainer",
    slug: "myprotein-impact-weight-gainer",
    groupSlug: "myprotein-impact-weight-gainer",
    flavor: "شکلات اسموت",
    size: "۳ کیلوگرم",
    imageUrl: "/images/products/myprotein-impact-weight-gainer.webp",
    // Photo and label details from MyProtein's UK site (myprotein.com,
    // impact-weight-gainer, variation 17921182 = Chocolate Smooth,
    // 30 servings / 3 kg): 30 × 100 g. The page's table matches the
    // chocolate per-100 g panel in that variant's gallery; a gallery
    // infographic says 29 g protein / 51 g carbs / 383 kcal for the same
    // 100 g, which contradicts both, so its numbers are left out.
    description:
      "ایمپکت ویت گینر مای‌پروتئین با طعم شکلات اسموت؛ گینر با پروتئین باکیفیت (ترکیب پروتئین‌های سریع و آهسته‌جذب) و کربوهیدرات پیچیده از آرد جو دوسر، برای افزایش حجم و قدرت در کنار تمرین مقاومتی. هر وعده (۱۰۰ گرم) ۳۷۲ کیلوکالری، ۲۸ گرم پروتئین و ۵۲ گرم کربوهیدرات دارد و بسته‌ی ۳ کیلوگرمی ۳۰ وعده است. مناسب گیاه‌خواران (لاکتو).\nمواد تشکیل‌دهنده: آرد جو دوسر ۵۱٪، ترکیب پروتئین ۲۸٪ (کنسانتره‌ی پروتئین شیر، ایزوله‌ی پروتئین شیر، کنسانتره‌ی پروتئین وی (از شیر)؛ حاوی امولسیفایر لسیتین آفتابگردان)، مالتودکسترین، پودر کاکائوی کم‌چرب، طعم‌دهنده و شیرین‌کننده (سوکرالوز).",
    servingSize: "۱۰۰ گرم (حدود ۳ و ۱/۳ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۳۷۲ کیلوکالری" },
      { label: "چربی", amount: "۵٫۱ گرم" },
      { label: "چربی اشباع", amount: "۱٫۸ گرم" },
      { label: "کربوهیدرات", amount: "۵۲ گرم" },
      { label: "قندها", amount: "۲٫۸ گرم" },
      { label: "پروتئین", amount: "۲۸ گرم" },
      { label: "نمک", amount: "۰٫۰۹ گرم" },
    ],
    usage:
      "۱۰۰ گرم (حدود ۳ و ۱/۳ اسکوپ) را با ۵۰۰ میلی‌لیتر شیر پرچرب یا آب مخلوط کنید و ۳۰ ثانیه تکان دهید؛ بهترین زمان مصرف بین وعده‌های غذایی است. پودر به مرور ته‌نشین می‌شود؛ برای دقت بیشتر آن را وزن کنید.\nدر جای خنک و خشک و دور از نور مستقیم خورشید نگهداری کنید.",
    warnings:
      "حساسیت‌زاها: حاوی شیر و جو دوسر (گلوتن). ممکن است حاوی منابع دیگر گلوتن (گندم، جو) باشد.\nاین محصول باید در کنار رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم مصرف شود.",
    manufacturerClaims:
      "پروتئین باکیفیت و کربوهیدرات پیچیده برای افزایش حجم و قدرت\nترکیب پروتئین‌های سریع و آهسته‌جذب\nادعاهای سلامت مورد تأیید اتحادیه‌ی اروپا: پروتئین به رشد و حفظ توده‌ی عضلانی کمک می‌کند؛ کربوهیدرات‌ها به بازیابی عملکرد طبیعی عضله پس از فعالیت بدنی بسیار شدید یا طولانی کمک می‌کنند (با مصرف ۴ گرم کربوهیدرات به ازای هر کیلوگرم وزن بدن در ۴ تا ۶ ساعت اول)",
    brand: "MyProtein",
    price: 2350000,
    categorySlug: "protein",
  },
  {
    id: "mp5",
    name: "د پری‌ورک‌اوت - THE Pre-Workout",
    slug: "myprotein-the-pre-workout",
    groupSlug: "myprotein-the-pre-workout",
    flavor: "تمشک آبی",
    size: "۳۰ وعده",
    imageUrl: "/images/products/myprotein-the-pre-workout.webp",
    // Photo and label details from MyProtein's UK site (myprotein.com,
    // the-pre-workout, variation 15150230 = Blue Raspberry, 30 servings).
    // It only comes in Blue Raspberry and Orange Mango Passionfruit. The site
    // gives no net weight (30 × 15.7 g ≈ 471 g), so the size is servings.
    description:
      "د پری‌ورک‌اوت (سری PRO) مای‌پروتئین با طعم تمشک آبی؛ پیش‌تمرین پیشرفته با کافئین، کراتین و مواد مؤثر بر تمرکز (سیتی‌کولین Cognizin®). هر وعده (۱۵٫۷ گرم) ۲۰۰ میلی‌گرم کافئین، ۴ گرم ال-سیترولین و ۳ گرم کراتین دارد و هر قوطی ۳۰ وعده است. مناسب گیاه‌خواران و وگان‌ها.\nمواد تشکیل‌دهنده: ال-سیترولین، کراتین مونوهیدرات، بتا-آلانین، طعم‌دهنده‌ها، بتائین بی‌آب، اسیدی‌کننده‌ها (سیتریک اسید، مالیک اسید)، طعم‌دهنده‌های طبیعی، ال-تیروزین، ضدکلوخه‌ها (دی‌اکسید سیلیکون، سیلیکات کلسیم)، سیتی‌کولین (Cognizin®)، کافئین بی‌آب، شیرین‌کننده‌ها (سوکرالوز، آسه‌سولفام پتاسیم)، عصاره‌ی اسپیرولینا، ویتامین C، Senactiv® (عصاره‌ی ریشه‌ی پاناکس نوتوجینسنگ و میوه‌ی نسترن)، AstraGin® (عصاره‌ی ریشه‌ی گون و پاناکس نوتوجینسنگ)، سولفات آهن، نیاسین، BioPerine® (عصاره‌ی فلفل سیاه)، ویتامین B1 و ویتامین B12.",
    servingSize: "۱۵٫۷ گرم (حدود ۱ اسکوپ)",
    nutritionFacts: [
      { label: "ال-سیترولین", amount: "۴ گرم" },
      { label: "کراتین", amount: "۳ گرم" },
      { label: "بتا-آلانین", amount: "۲ گرم" },
      { label: "بتائین بی‌آب", amount: "۱ گرم" },
      { label: "ال-تیروزین", amount: "۷۵۰ میلی‌گرم" },
      { label: "سیتی‌کولین (Cognizin®)", amount: "۲۵۰ میلی‌گرم" },
      { label: "کافئین", amount: "۲۰۰ میلی‌گرم" },
      { label: "Senactiv®", amount: "۵۰ میلی‌گرم" },
      { label: "AstraGin®", amount: "۲۵ میلی‌گرم" },
      { label: "BioPerine®", amount: "۲٫۵ میلی‌گرم" },
      { label: "ویتامین C", amount: "۷۵ میلی‌گرم" },
      { label: "آهن", amount: "۶ میلی‌گرم" },
      { label: "نیاسین", amount: "۳ میلی‌گرم" },
      { label: "ویتامین B1", amount: "۱٫۱ میلی‌گرم" },
      { label: "ویتامین B12", amount: "۱۵ میکروگرم" },
    ],
    usage:
      "روزانه ۱ بار، ۱۵٫۷ گرم (حدود ۱ اسکوپ) را با ۳۵۰ میلی‌لیتر آب مخلوط کنید و ۳۰ دقیقه پیش از تمرین مصرف کنید. پودر به مرور ته‌نشین می‌شود؛ برای دقت بیشتر آن را وزن کنید.\nدر جای خنک و خشک و دور از نور مستقیم خورشید نگهداری کنید.",
    warnings:
      "کافئین بالا (۶۳ میلی‌گرم در ۱۰۰ میلی‌لیتر نوشیدنی آماده). برای کودکان و زنان باردار یا شیرده توصیه نمی‌شود.\nخطر خفگی: داخل قوطی یک بسته‌ی سیلیکاژل هست که خوردنی نیست؛ اگر بسته پاره یا آسیب‌دیده است، محصول را دور بریزید.\nاز مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.\nمکمل غذایی جایگزین رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم نیست.\nدور از دسترس کودکان نگهداری شود.\nدر مجموعه‌ای تولید می‌شود که شیر را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۲۰۰ میلی‌گرم کافئین برای تمرکز و استقامت بیشتر\n۲۵۰ میلی‌گرم سیتی‌کولین Cognizin®\n۳ گرم کراتین برای تمرین‌های پرشدت\nسرشار از ویتامین‌های گروه B\nدارای گواهی Informed Choice (تست مواد ممنوعه)\nادعای سلامت مورد تأیید اتحادیه‌ی اروپا: ویتامین B12 به کاهش خستگی و عملکرد طبیعی روانی کمک می‌کند",
    brand: "MyProtein",
    price: 1450000,
    categorySlug: "pre-workout",
  },
  {
    id: "mp6",
    name: "ترموپیور - چربی‌سوز - Thermopure",
    slug: "myprotein-thermopure",
    size: "۹۰ کپسول",
    imageUrl: "/images/products/myprotein-thermopure.webp",
    // Pack photo and nutrition panels from myprotein.com/p/sports-nutrition/
    // thermopure/10530152 (Myvitamins line, 90 capsules): 90 ÷ 3 = 30
    // servings. The page text and the facts images give the same amounts.
    description:
      "ترموپیور مای‌پروتئین (سری Myvitamins)؛ کپسول ترموژنیک با کافئین، عصاره‌ی چای سبز، ال-تیروزین، ال-تئانین، فلفل قرمز، BioPerine®، کروم و ویتامین‌های B6 و B12. هر وعده‌ی روزانه (۳ کپسول) ۱۸۰ میلی‌گرم کافئین دارد و قوطی ۹۰ کپسولی ۳۰ وعده است. مناسب گیاه‌خواران و وگان‌ها.\nمواد تشکیل‌دهنده: آرد برنج قهوه‌ای، عصاره‌ی چای سبز ۱۵:۱، پوسته‌ی کپسول (هیدروکسی‌پروپیل متیل‌سلولز، آب)، ال-تیروزین، کافئین بدون آب، ال-تئانین، پودر فلفل قرمز، ویتامین B6، عصاره‌ی فلفل سیاه ۵۰:۱ (BioPerine®)، کروم پیکولینات، ویتامین B12.",
    servingSize: "۳ کپسول (وعده‌ی روزانه)",
    nutritionFacts: [
      { label: "کافئین", amount: "۱۸۰ میلی‌گرم" },
      { label: "عصاره‌ی چای سبز (۱۵:۱)", amount: "۳۷۵ میلی‌گرم" },
      { label: "EGCG (از چای سبز)", amount: "۳۷٫۵ میلی‌گرم" },
      { label: "ال-تیروزین", amount: "۲۰۰ میلی‌گرم" },
      { label: "ال-تئانین", amount: "۱۲۵ میلی‌گرم" },
      { label: "پودر فلفل قرمز", amount: "۵۰ میلی‌گرم" },
      { label: "BioPerine® (عصاره‌ی فلفل سیاه ۵۰:۱)", amount: "۵٫۱ میلی‌گرم" },
      { label: "کروم (پیکولینات)", amount: "۱۱۵ میکروگرم" },
      { label: "ویتامین B6", amount: "۵٫۱ میلی‌گرم" },
      { label: "ویتامین B12", amount: "۲۱ میکروگرم" },
    ],
    usage:
      "روزانه ۳ کپسول، ترجیحاً پیش از ورزش. در روزهای بدون ورزش، صبح، بعدازظهر و عصر هر بار ۱ کپسول.\nدر جای خنک و خشک و دور از نور مستقیم خورشید نگهداری کنید.",
    warnings:
      "حاوی ۱۸۰ میلی‌گرم کافئین در هر وعده؛ برای کودکان و زنان باردار توصیه نمی‌شود.\nدر صورت مصرف دیگر محصولات حاوی چای سبز، در دوران بارداری یا شیردهی، زیر ۱۸ سال یا در حال روزه‌داری (ناشتا) مصرف نکنید.\nهر وعده ۳۷٫۵ میلی‌گرم EGCG دارد؛ مصرف روزانه‌ی EGCG نباید از ۸۰۰ میلی‌گرم بیشتر شود.\nاز مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.\nمکمل غذایی جایگزین رژیم غذایی متنوع و شیوه‌ی زندگی سالم نیست.\nدور از دسترس کودکان نگهداری شود.\nحساسیت‌زا: ممکن است حاوی سویا باشد. در مجموعه‌ای تولید می‌شود که شیر را هم فرآوری می‌کند.",
    manufacturerClaims:
      "کافئین به افزایش استقامت در ورزش کمک می‌کند\nکروم به متابولیسم طبیعی درشت‌مغذی‌ها کمک می‌کند\nویتامین‌های B6 و B12 به عملکرد طبیعی سیستم ایمنی کمک می‌کنند",
    brand: "MyProtein",
    price: 950000,
    categorySlug: "fat-burner",
  },
  {
    id: "mp7",
    name: "ال-گلوتامین - L-Glutamine",
    slug: "myprotein-l-glutamine",
    flavor: "بدون طعم",
    size: "۵۰۰ گرم",
    imageUrl: "/images/products/myprotein-l-glutamine.webp",
    // Pack photo (backdrop cut out) and label text from myprotein.com
    // (l-glutamine-powder/10636931, ?variation=10530125, Unflavoured 500 g):
    // 500 g ÷ 5 g = 100 servings.
    description:
      "ال-گلوتامین مای‌پروتئین؛ پودر ال-گلوتامین خالص و بدون طعم، مناسب گیاه‌خواران و وگان‌ها. هر وعده ۵ گرم ال-گلوتامین است و بسته‌ی ۵۰۰ گرمی ۱۰۰ وعده است.\nمواد تشکیل‌دهنده: ال-گلوتامین.",
    servingSize: "۵ گرم (حدود ۱ و ۱/۲ اسکوپ)",
    nutritionFacts: [{ label: "ال-گلوتامین", amount: "۵ گرم" }],
    usage:
      "۵ گرم (حدود ۱ و ۱/۲ اسکوپ) را در ۲۵۰ میلی‌لیتر آب یا آبمیوه حل کنید و پیش، حین و/یا بعد از ورزش مصرف کنید. روزانه ۱ بار. پودر به‌مرور ته‌نشین می‌شود؛ برای دقیق‌ترین مقدار، آن را وزن کنید.\nدر جای خنک و خشک و دور از نور مستقیم خورشید نگهداری کنید.",
    warnings:
      "از مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.\nمکمل غذایی جایگزین رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم نیست.\nدور از دسترس کودکان نگهداری شود.\nدر مجموعه‌ای تولید می‌شود که شیر را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۵ گرم ال-گلوتامین در هر وعده\nمناسب گیاه‌خواران و وگان‌ها\nبه گفته‌ی سازنده: گلوتامین از پرطرفدارترین اسیدهای آمینه است و به‌طور طبیعی در پروتئین وجود دارد؛ پروتئین به ساخت و ترمیم عضله کمک می‌کند",
    brand: "MyProtein",
    price: 1350000,
    categorySlug: "creatine",
  },
  {
    id: "mp8",
    name: "سیترولین مالات - Citrulline Malate",
    slug: "myprotein-citrulline-malate",
    flavor: "بدون طعم",
    size: "۲۵۰ گرم",
    imageUrl: "/images/products/myprotein-citrulline-malate.webp",
    // Pack photo (backdrop cut out) and label text from myprotein.com
    // (citrulline-malate/10529326, ?variation=10529328, 250 g / 125
    // servings). The page says 2 g is "approx. 7 1/2 scoops", which doesn't
    // fit a normal scoop, so the scoop count is left out.
    description:
      "سیترولین مالات مای‌پروتئین؛ پودر بدون طعم از ال-سیترولین و دی‌ال-مالات به نسبت ۲:۱، برای تمرین‌های پرشدت مثل وزنه‌برداری و دوی سرعت و مناسب گیاه‌خواران و وگان‌ها. هر وعده ۲ گرم است و بسته‌ی ۲۵۰ گرمی ۱۲۵ وعده است.\nمواد تشکیل‌دهنده: ال-سیترولین دی‌ال-مالات ۲:۱.",
    servingSize: "۲ گرم",
    nutritionFacts: [{ label: "ال-سیترولین دی‌ال-مالات (۲:۱)", amount: "۲ گرم" }],
    usage:
      "۲ گرم را با مقدار دلخواه آب یا آبمیوه مخلوط کنید؛ برای بهترین نتیجه دست‌کم با ۵۰ میلی‌لیتر مایع. روزانه ۱ بار. پودر به‌مرور ته‌نشین می‌شود؛ برای دقیق‌ترین مقدار، آن را وزن کنید.\nدر جای خنک و خشک و دور از نور مستقیم خورشید نگهداری کنید.",
    warnings:
      "از مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.\nمکمل غذایی جایگزین رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم نیست.\nدور از دسترس کودکان نگهداری شود.\nدر مجموعه‌ای تولید می‌شود که شیر را هم فرآوری می‌کند.",
    manufacturerClaims:
      "ترکیب اسید آمینه‌ی سیترولین و نمک آلی مالات\nمناسب تمرین‌های پرشدت\nاغلب در فرمول‌های پیش‌تمرین به کار می‌رود\nمناسب گیاه‌خواران و وگان‌ها",
    brand: "MyProtein",
    price: 1000000,
    categorySlug: "aminos",
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
      "۳ گرم کراتین در هر وعده\nوگان، بدون قند و بدون گلوتن\nکراتین عملکرد بدنی را در تمرین‌های کوتاه‌مدت و پرشدت افزایش می‌دهد (ادعای سلامت مورد تأیید اتحادیه‌ی اروپا)",
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
      "۳ گرم کراتین در هر وعده\nتمام کراتین آن از کراتین مونوهیدرات است\nوگان، بدون قند و بدون گلوتن\nبدون قند: حداکثر ۰٫۵ گرم قند در ۱۰۰ میلی‌لیتر نوشیدنی آماده؛ بدون گلوتن: حداکثر ۲۰ میلی‌گرم گلوتن در هر کیلوگرم نوشیدنی آماده\nکراتین عملکرد بدنی را در تمرین‌های کوتاه‌مدت و پرشدت افزایش می‌دهد (ادعای سلامت مورد تأیید اتحادیه‌ی اروپا)",
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
  {
    id: "sc6",
    name: "ترمو ایکس - چربی‌سوز - Thermo-X",
    slug: "scitec-thermo-x",
    size: "۱۰۰ کپسول",
    imageUrl: "/images/products/scitec-thermo-x.webp",
    // Pack photo, nutrition table, ingredients and directions from
    // scitecshop.de (Thermo-X 100 kap., p2317): 100 ÷ 3 = 33 servings, as
    // the pack front says. The shop gives no warnings beyond the allergen
    // note.
    description:
      "ترمو ایکس سایتک؛ فرمول محرک کنترل وزن و چربی بدن، بدون افدرین، با کافئین، ال-تیروزین، ال-کارنیتین، عصاره‌ی گارسینیا کامبوجیا (HCA) و عصاره‌ی کولئوس فورسکولی. هر وعده‌ی روزانه (۳ کپسول) ۱۸۰ میلی‌گرم کافئین دارد و قوطی ۱۰۰ کپسولی ۳۳ وعده است.\nمواد تشکیل‌دهنده: ال-تیروزین ۳۱٪، پوسته‌ی کپسول [ژلاتین، براق‌کننده (شلاک)، رنگ (اکسیدها و هیدروکسیدهای آهن)، تنظیم‌کننده‌های اسیدیته (آمونیوم هیدروکسید، پتاسیم هیدروکسید)]، عصاره‌ی میوه‌ی گارسینیا کامبوجیا ۱۶٪، ال-کارنیتین ال-تارترات ۱۶٪، کافئین بدون آب ۹٪، عصاره‌ی ریشه‌ی کولئوس فورسکولی ۶٪، حجم‌دهنده (ژل سلولز)، ضدکلوخه (نمک‌های منیزیم اسیدهای چرب).",
    servingSize: "۳ کپسول (۳ بار در روز، هر بار ۱ کپسول)",
    nutritionFacts: [
      { label: "ال-تیروزین", amount: "۶۰۰ میلی‌گرم" },
      { label: "عصاره‌ی گارسینیا کامبوجیا", amount: "۳۰۰ میلی‌گرم" },
      { label: "هیدروکسی سیتریک اسید - HCA (از عصاره‌ی گارسینیا)", amount: "۱۸۰ میلی‌گرم" },
      { label: "ال-کارنیتین ال-تارترات", amount: "۳۰۰ میلی‌گرم" },
      { label: "ال-کارنیتین (از ال-کارنیتین ال-تارترات)", amount: "۲۰۵ میلی‌گرم" },
      { label: "کافئین", amount: "۱۸۰ میلی‌گرم" },
      { label: "عصاره‌ی کولئوس فورسکولی", amount: "۱۱۳ میلی‌گرم" },
      { label: "فورسکولین (از عصاره‌ی کولئوس)", amount: "۱۱ میلی‌گرم" },
    ],
    usage: "روزانه ۳ بار، هر بار ۱ کپسول، ۳۰ دقیقه پیش از تمرین و پیش از وعده‌های غذایی مصرف کنید.",
    warnings:
      "حاوی کافئین: ۱۸۰ میلی‌گرم در وعده‌ی روزانه.\nممکن است حاوی ردپای پروتئین شیر، سویا و تخم‌مرغ، آجیل، بادام‌زمینی و گلوتن باشد. در کارخانه‌ای تولید می‌شود که مواد غذایی حاوی شیر، تخم‌مرغ، گلوتن، سویا، بادام‌زمینی، آجیل، کرفس، ماهی، سخت‌پوستان، نرم‌تنان و دی‌اکسید گوگرد را هم تولید می‌کند.",
    manufacturerClaims:
      "فرمول محرک کنترل وزن، بدون افدرین\n۶۰۰ میلی‌گرم ال-تیروزین، ۲۰۵ میلی‌گرم ال-کارنیتین، ۱۸۰ میلی‌گرم HCA، ۱۸۰ میلی‌گرم کافئین و ۱۱ میلی‌گرم فورسکولین در هر وعده\nبه گفته‌ی فروشگاه رسمی سایتک: HCA به کنترل وزن، چربی بدن و احساس گرسنگی کمک می‌کند",
    brand: "Scitec Nutrition",
    price: 1050000,
    categorySlug: "fat-burner",
  },
  {
    id: "sc7",
    name: "ال-گلوتامین - L-Glutamine",
    slug: "scitec-l-glutamine",
    flavor: "بدون طعم",
    size: "۳۰۰ گرم",
    imageUrl: "/images/products/scitec-l-glutamine.webp",
    // Pack photo, composition and directions from scitecshop.de
    // (L-Glutamine 300 gr., p2265): 300 g ÷ 6 g = 50 servings, as the pack
    // front says. The shop gives no warnings beyond the allergen note.
    description:
      "ال-گلوتامین سایتک نوتریشن؛ پودر نوشیدنی ۱۰۰٪ ال-گلوتامین و بدون طعم. هر وعده (۶ گرم، ۱/۲ اسکوپ) ۶ گرم ال-گلوتامین دارد و قوطی ۳۰۰ گرمی ۵۰ وعده است.\nمواد تشکیل‌دهنده: ال-گلوتامین.",
    servingSize: "۶ گرم (۱/۲ اسکوپ)",
    nutritionFacts: [{ label: "ال-گلوتامین", amount: "۶۰۰۰ میلی‌گرم" }],
    usage:
      "روزانه ۱ وعده (۶ گرم) را در ۲۵۰ میلی‌لیتر آب یا نوشیدنی دیگر حل کنید و خوب تکان دهید. پیش، حین یا بعد از تمرین، یا هر زمان دیگری مثل پیش از خواب مصرف کنید.",
    warnings:
      "در مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، گلوتن، سویا، بادام‌زمینی، آجیل، کرفس، ماهی و سخت‌پوستان را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۱۰۰٪ ال-گلوتامین\n۶ گرم ال-گلوتامین در هر وعده\nبه گفته‌ی سازنده: گلوتامین فراوان‌ترین اسید آمینه‌ی خون است و در شرایطی مثل تمرین شدید، که بدن نمی‌تواند به‌اندازه‌ی کافی آن را بسازد، ممکن است نیمه‌ضروری شود",
    brand: "Scitec Nutrition",
    price: 1150000,
    categorySlug: "creatine",
  },
  {
    id: "sc8",
    name: "سیترولین مالات - Citrulline Malate",
    slug: "scitec-citrulline-malate",
    flavor: "بدون طعم",
    size: "۳۰۰ گرم",
    imageUrl: "/images/products/scitec-citrulline-malate.webp",
    // Pack photo, composition, directions and warnings from scitecshop.de
    // (Citrulline Malate 300 gr., p17429): 300 g ÷ 3 g = 100 servings.
    description:
      "سیترولین مالات سایتک نوتریشن؛ پودر بدون طعم از ال-سیترولین و مالات (نمک اسید مالیک) به نسبت ۱:۱. هر وعده (۳ گرم، ۱/۲ اسکوپ) ۱٫۵ گرم ال-سیترولین و ۱٫۵ گرم مالات دارد و قوطی ۳۰۰ گرمی ۱۰۰ وعده است.\nمواد تشکیل‌دهنده: ال-سیترولین ۴۹٫۸٪، اسیدی‌کننده (اسید مالیک) ۴۹٫۸٪، ضدکلوخه (دی‌اکسید سیلیکون).",
    servingSize: "۳ گرم (۱/۲ اسکوپ)",
    nutritionFacts: [
      { label: "ال-سیترولین", amount: "۱٫۵ گرم" },
      { label: "مالات (اسید مالیک)", amount: "۱٫۵ گرم" },
    ],
    usage: "۱ وعده (۳ گرم، ۱/۲ اسکوپ) را با ۳۰۰ میلی‌لیتر آب در شیکر مخلوط کنید. روزانه ۱ وعده مصرف کنید.",
    warnings:
      "دور از دسترس کودکان نگهداری شود.\nمکمل غذایی جایگزین رژیم غذایی متنوع و متعادل و شیوه‌ی زندگی سالم نیست.\nاز مقدار توصیه‌شده‌ی روزانه بیشتر مصرف نکنید.\nدر مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، گلوتن، سویا، بادام‌زمینی، آجیل، کرفس، ماهی، سخت‌پوستان و دی‌اکسید گوگرد را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۱٫۵ گرم ال-سیترولین و ۱٫۵ گرم مالات در هر وعده\nبه گفته‌ی سازنده: ال-سیترولین در بدن به ال-آرژنین تبدیل می‌شود که پیش‌ساز نیتریک اکسید (NO) است؛ طبق مطالعه‌ای که فروشگاه رسمی سایتک نام می‌برد (Schwedhelm و همکاران، ۲۰۰۸)، مکمل ال-سیترولین سطح آرژنین خون را مؤثرتر از خود ال-آرژنین بالا می‌برد\nبه گفته‌ی سازنده: مالات واسطه‌ی چرخه‌ی کربس است و در تولید انرژی سلول نقش دارد",
    brand: "Scitec Nutrition",
    price: 1400000,
    categorySlug: "aminos",
  },

  // Universal Nutrition
  {
    id: "un3",
    name: "انیمال پامپ - پیش‌تمرین - Animal Pump",
    slug: "universal-animal-pump",
    groupSlug: "universal-animal-pump",
    size: "۳۰ پک",
    imageUrl: "/images/products/universal-animal-pump.webp",
    // Pack photo and Supplement Facts panel image from Universal's Animal
    // site (animalpak.com/products/animal-pump-pre-workout-supplement), 30
    // packs. Pills per pack (9) and the 200 mg caffeine of the red pill are
    // from that page's FAQ. The site gives no directions or warnings beyond
    // the panel's allergen note.
    description:
      "انیمال پامپ یونیورسال؛ پیش‌تمرین کپسولی در پک‌های روزانه (هر پک ۹ قرص و کپسول، از جمله یک کپسول قرمز محرک که می‌شود آن را کنار گذاشت) برای پمپ، حجم سلولی، گردش خون، انرژی و تمرکز. قوطی ۳۰ پک، یعنی ۳۰ وعده است.\nمجموعه‌ها در هر پک: ماتریکس پایه‌ی کراتین ۳۰۰۰ میلی‌گرم (کراتین مونوهیدرات، دی‌کراتین مالات)؛ مجموعه‌ی NO Blast ۲۰۰۰ میلی‌گرم (آرژنین آلفا-کتوگلوتارات، سیترولین مالات، ال-آرژنین، بتا-آلانین، ال-نوروالین)؛ مجموعه‌ی Energy Rush ۷۰۰ میلی‌گرم (ترکیب متیل‌زانتین: کافئین بی‌آب، دانه‌ی کولا، دانه‌ی گوارانا؛ ال-تیروزین، هوپرزین A)؛ مجموعه‌ی آنتی‌اکسیدان ۵۰۰ میلی‌گرم (چغندر، عصاره‌ی هسته‌ی انگور، عصاره‌ی برگ چای سبز (EGCG)، آلفا لیپوئیک اسید)؛ مجموعه‌ی Pump Transport ۷۰۰ میلی‌گرم (ال-تورین، ریشه‌ی زنجبیل، AstraGin™، عصاره‌ی دانه‌ی شنبلیله، BioPerine®).\nسایر مواد: دی‌کلسیم فسفات، ژلاتین (گاوی)، سلولز میکروکریستالی، مالتودکسترین، منیزیم استئارات، استئاریک اسید، دی‌اکسید تیتانیوم، رنگ‌های قرمز ۴۰، زرد ۵ و آبی ۱ و پوشش دارویی.",
    servingSize: "۱ پک (۹ قرص و کپسول)",
    nutritionFacts: [
      { label: "ماتریکس پایه‌ی کراتین", amount: "۳۰۰۰ میلی‌گرم" },
      { label: "مجموعه‌ی NO Blast", amount: "۲۰۰۰ میلی‌گرم" },
      { label: "مجموعه‌ی Energy Rush", amount: "۷۰۰ میلی‌گرم" },
      { label: "مجموعه‌ی آنتی‌اکسیدان", amount: "۵۰۰ میلی‌گرم" },
      { label: "مجموعه‌ی Pump Transport", amount: "۷۰۰ میلی‌گرم" },
      { label: "کافئین (کپسول قرمز، طبق سایت سازنده)", amount: "۲۰۰ میلی‌گرم" },
    ],
    warnings:
      "حاوی کافئین (۲۰۰ میلی‌گرم در کپسول قرمز هر پک).\nحاوی ژلاتین گاوی.\nدر مجموعه‌ای تولید می‌شود که شیر، سویا، تخم‌مرغ، بادام‌زمینی، آجیل درختی، ماهی، صدف، گندم و کنجد را هم فرآوری می‌کند.",
    manufacturerClaims:
      "اولین پیش‌تمرین کپسولی (به گفته‌ی سازنده)\nپمپ و حجم سلولی بیشتر، بهبود گردش خون با تقویت‌کننده‌های نیتریک اکساید، و محرک‌ها و نوتروپیک‌ها برای انرژی و تمرکز\nکپسول محرک جدا، تا بتوانید بدون کافئین هم مصرف کنید\n(این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "Universal Nutrition",
    price: 1390000,
    categorySlug: "pre-workout",
  },
  {
    id: "un4",
    name: "انیمال وی - Animal Whey",
    slug: "universal-animal-whey",
    groupSlug: "universal-animal-whey",
    flavor: "شکلات",
    size: "۹۰۷ گرم",
    imageUrl: "/images/products/universal-animal-whey.webp",
    // Pack photo from Universal's Animal site
    // (animalpak.com/products/animal-whey-iso-protein-supplement, Chocolate
    // 2 lb bag). The site has no facts panel or ingredient list for it, so
    // only the pack front's numbers and note are used.
    description:
      "انیمال وی یونیورسال با طعم شکلات؛ پودر پروتئین وی سرشار از ایزوله، باکیفیت و آسان‌هضم. هر وعده ۲۵ گرم پروتئین، ۵٫۶ گرم BCAA و بدون قند افزوده است و کیسه‌ی ۹۰۷ گرمی (۲ پوند) حدود ۲۷ وعده است.",
    servingSize: "۱ اسکوپ",
    nutritionFacts: [
      { label: "پروتئین", amount: "۲۵ گرم" },
      { label: "BCAA", amount: "۵٫۶ گرم" },
      { label: "قند افزوده", amount: "۰ گرم" },
    ],
    warnings:
      "فقط به‌عنوان مکمل غذایی مصرف شود؛ برای کاهش وزن استفاده نشود. این محصول غذای کم‌کالری نیست.",
    manufacturerClaims:
      "پروتئین وی سرشار از ایزوله، باکیفیت و آسان‌هضم\n۲۵ گرم پروتئین در هر وعده\nبدون قند افزوده\nبه گفته‌ی سازنده، به ترمیم بافت عضله و کاهش کوفتگی بعد از تمرین کمک می‌کند (این ادعا توسط FDA ارزیابی نشده است)",
    brand: "Universal Nutrition",
    price: 1950000,
    categorySlug: "protein",
  },
  {
    id: "un5",
    name: "انیمال کراتین میکرونیزه - Animal Micronized Creatine",
    slug: "universal-animal-creatine",
    groupSlug: "universal-animal-creatine",
    flavor: "بدون طعم",
    size: "۳۰۰ گرم",
    imageUrl: "/images/products/universal-animal-creatine.webp",
    // Pack photo and Supplement Facts panel image from Universal's Animal
    // site (animalpak.com/products/animal-micronized-creatine-powder-supplement,
    // 300 g): about 60 servings of 5 g.
    description:
      "انیمال کراتین یونیورسال، بدون طعم؛ ۱۰۰٪ کراتین مونوهیدرات خالص و میکرونیزه. هر وعده (حدود ۵ گرم) ۵ گرم کراتین مونوهیدرات دارد و قوطی ۳۰۰ گرمی حدود ۶۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات.",
    servingSize: "۱ اسکوپ (حدود ۵ گرم)",
    nutritionFacts: [{ label: "کراتین مونوهیدرات", amount: "۵۰۰۰ میلی‌گرم" }],
    usage:
      "روزانه ۱ اسکوپ را با ۲۴۰ تا ۳۵۰ میلی‌لیتر (۸ تا ۱۲ اونس) نوشیدنی دلخواه مخلوط کنید.\nدر جای خنک و خشک و دور از گرما، رطوبت و نور خورشید نگهداری کنید.",
    warnings:
      "دور از دسترس کودکان نگهداری شود.\nپیش از مصرف با پزشک مشورت کنید.\nدر مجموعه‌ای تولید می‌شود که شیر، سویا، تخم‌مرغ، بادام‌زمینی، آجیل درختی، ماهی، صدف و گندم را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۱۰۰٪ کراتین مونوهیدرات خالص و میکرونیزه\nبه گفته‌ی سازنده، به عضله‌سازی و ریکاوری، قدرت و استقامت و عملکرد شناختی کمک می‌کند (این ادعاها توسط FDA ارزیابی نشده است)\nساخت آمریکا، تولید در کارخانه‌ی دارای GMP",
    brand: "Universal Nutrition",
    price: 750000,
    categorySlug: "creatine",
  },
  {
    id: "un6",
    name: "انیمال کاتس - چربی‌سوز - Animal Cuts",
    slug: "universal-animal-cuts",
    size: "۴۲ پک",
    imageUrl: "/images/products/universal-animal-cuts.webp",
    // Pack photo and Supplement Facts panel (with dosage and warnings) from
    // animalpak.com/products/animal-cuts-fat-burner-supplement, pill packs.
    // The complexes add up to 3,730 mg per pack, so the page's "nearly
    // 8,500 mg" claim is left out. Ingredients inside each complex have no
    // separate amounts on the label.
    description:
      "انیمال کاتس یونیورسال؛ چربی‌سوز کامل در پک‌های قرص با ۸ کمپلکس: ترموژنیک (محرک)، متابولیک، تیروئید، دفع آب، نوتروپیک، مهار کورتیزول، افزایش CCK (کنترل اشتها) و جذب بهتر. برای آقایان و بانوان. هر پک یک وعده است و جعبه ۴۲ پک دارد. کپسول قرمز کمپلکس محرک و کپسول‌های آبی کمپلکس دفع آب است.\nکمپلکس محرک: کافئین بدون آب، دانه‌ی کولا، دانه‌ی گوارانا، برگ یربا ماته، رزبری کتون، عصاره‌ی ریشه‌ی کولئوس فورسکولی. کمپلکس متابولیک: عصاره‌ی برگ چای سبز (پلی‌فنول/EGCG)، عصاره‌ی چای اولانگ، عصاره‌ی چای سیاه، عصاره‌ی دانه‌ی قهوه. کمپلکس تیروئید: ال-تیروزین، عصاره‌ی برگ زیتون، مریم‌گلی. کمپلکس دفع آب: ریشه‌ی قاصدک، برگ انگور خرس (آربوتین)، میوه‌ی سرو کوهی، دانه‌ی کرفس. کمپلکس نوتروپیک: پودر کاکائو، DMAE بیتارترات، هوپرزین A. کمپلکس مهار کورتیزول: عصاره‌ی اشواگاندا، جینسینگ سیبری. کمپلکس CCK: چا-د-بوگره، پودر سرکه‌ی سیب. کمپلکس جذب: Astragin™ (جینسینگ پاناکس، گون)، عصاره‌ی فلفل سیاه (BioPerine®).\nسایر مواد: ژلاتین (گاوی)، دی‌کلسیم فسفات، استئارات منیزیم، استئاریک اسید، میکروکریستالین سلولز، دی‌اکسید تیتانیوم، دی‌اکسید سیلیکون، رنگ‌های FD&C قرمز ۴۰، آبی ۱، زرد ۵ و زرد ۶.",
    servingSize: "۱ پک",
    nutritionFacts: [
      { label: "کمپلکس محرک (ترموژنیک)", amount: "۷۵۰ میلی‌گرم" },
      { label: "کمپلکس متابولیک", amount: "۷۵۰ میلی‌گرم" },
      { label: "کمپلکس تیروئید", amount: "۳۵۰ میلی‌گرم" },
      { label: "کمپلکس دفع آب", amount: "۷۵۰ میلی‌گرم" },
      { label: "کمپلکس نوتروپیک", amount: "۵۰۰ میلی‌گرم" },
      { label: "کمپلکس مهار کورتیزول", amount: "۳۰۰ میلی‌گرم" },
      { label: "کمپلکس افزایش CCK", amount: "۳۰۰ میلی‌گرم" },
      { label: "کمپلکس جذب بهتر", amount: "۳۰ میلی‌گرم" },
    ],
    usage:
      "روزانه ۲ پک به مدت ۳ هفته‌ی پیاپی: ۱ پک پس از بیدار شدن و پک دوم ۴ تا ۶ ساعت بعد. پک‌ها را با یک وعده‌ی سبک غذا مصرف کنید و در دوره‌ی مصرف آب کافی بنوشید.\nچرخه‌ی ۳ هفته مصرف و ۱ هفته استراحت را رعایت کنید؛ پس از هفته‌ی استراحت می‌توانید دوباره شروع کنید.",
    warnings:
      "برای افراد زیر ۱۸ سال مناسب نیست. پیش از مصرف با پزشک مشورت کنید. حاوی کافئین است؛ همراه با دیگر محصولات کافئین‌دار مصرف نکنید. عوارض احتمالی: عصبی بودن، تحریک‌پذیری، سردرد، بی‌خوابی، علائم گوارشی و گاهی تپش قلب.\nاگر خودتان یا خانواده‌تان سابقه‌ی بیماری قلبی، تیروئید، کبد، کلیه، دیابت، فشار خون بالا، سردردهای مکرر، افسردگی یا دیگر بیماری‌های روانی، گلوکوم، مشکل در ادرار کردن، بزرگی پروستات یا تشنج دارید، یا داروی مهارکننده‌ی MAO، ضدافسردگی یا هر داروی دیگر، مکمل یا داروی با نسخه و بدون نسخه مصرف می‌کنید، با پزشک مشورت کنید.\nاگر علائم مشکل کبدی مانند زردی پوست یا چشم، درد معده، ادرار تیره، تعریق، تهوع، خستگی غیرعادی و/یا بی‌اشتهایی دیدید، مصرف را قطع کنید و با پزشک مشورت کنید. موارد نادر و غیرقابل‌پیش‌بینی آسیب کبدی همراه با محصولات حاوی عصاره‌ی چای سبز گزارش شده است.\nدو هفته پیش از جراحی مصرف را قطع کنید. در دوران بارداری یا شیردهی مصرف نکنید. از مقدار توصیه‌شده بیشتر مصرف نکنید.\nدر مجموعه‌ای تولید می‌شود که شیر، سویا، تخم‌مرغ، بادام‌زمینی، آجیل درختی، ماهی، صدف و گندم را هم فرآوری می‌کند.",
    manufacturerClaims:
      "چربی‌سوز، لیپولیتیک، دیورتیک (دفع آب) و متابولیک در یک بسته\nبه گفته‌ی سازنده: افزایش متابولیسم، کمک به کنترل اشتها، تمرکز و وضوح ذهنی، پاسخ سالم به استرس و کاهش احتباس آب و نفخ (این ادعاها توسط FDA ارزیابی نشده است)\nحفظ حجم عضله با گیاهان نگه‌دارنده‌ی پتاسیم (به گفته‌ی سازنده)",
    brand: "Universal Nutrition",
    price: 1650000,
    categorySlug: "fat-burner",
  },
  {
    id: "un7",
    name: "بیف آمینو - آمینو - 100% Beef Aminos",
    slug: "universal-beef-aminos",
    groupSlug: "universal-beef-aminos",
    size: "۴۰۰ قرص",
    imageUrl: "/images/products/universal-beef-aminos.webp",
    // Universal's own site has no product pages any more. Label from the
    // NIH Dietary Supplement Label Database (dsld id 274618, Classic Series
    // 400 tablets): 400 ÷ 3 ≈ 133 servings. Pack photo from a retailer
    // (lifepharmacy.com), backdrop cut out. The label's "typical amino acid
    // profile" says grams per 100 g but lists mg values, so it is left out.
    description:
      "بیف آمینو یونیورسال (سری کلاسیک)؛ قرص اسید آمینه از ایزوله‌ی پروتئین گوشت گاو و جگر خشک‌شده‌ی گاو آرژانتینی، با همه‌ی اسیدهای آمینه‌ی ضروری (EAA) از جمله BCAA، به‌صورت آهسته‌رهش. هر قرص ۱ گرم پروتئین دارد؛ هر وعده ۳ قرص است و قوطی ۴۰۰ قرصی حدود ۱۳۳ وعده است. بدون گلوتن.\nمواد تشکیل‌دهنده: کمپلکس اسید آمینه‌ی ۱۰۰٪ گوشت گاو (ایزوله‌ی پروتئین گوشت گاو، جگر خشک‌شده‌ی گاو آرژانتینی)، دی‌کلسیم فسفات، سلولز میکروکریستالی، استئاریک اسید، استئارات منیزیم، پوشش دارویی.",
    servingSize: "۳ قرص",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲ کیلوکالری" },
      { label: "پروتئین", amount: "۳ گرم" },
    ],
    usage:
      "۳ قرص همراه هر وعده‌ی غذا برای پروتئین بیشتر، یا بین وعده‌ها برای رساندن پیوسته‌ی اسید آمینه به بدن. می‌توانید مقدار هر نوبت را کم‌کم به ۶ تا ۹ قرص برسانید.\nدر جای خنک و خشک و دور از گرما، رطوبت و نور خورشید نگهداری کنید.",
    warnings:
      "برای افراد زیر ۱۸ سال مناسب نیست. پیش از مصرف با پزشک مشورت کنید. ورزشکاران پیش از مصرف با فدراسیون یا نهاد ناظر خود هماهنگ کنند.\nدر مجموعه‌ای تولید می‌شود که شیر، سویا، تخم‌مرغ، بادام‌زمینی، آجیل درختی، ماهی، صدف و گندم را هم فرآوری می‌کند.",
    manufacturerClaims:
      "از ایزوله‌ی پروتئین گوشت گاو و جگر خشک‌شده‌ی گاو آرژانتینی\nاسیدهای آمینه‌ی آهسته‌رهش\nشامل همه‌ی اسیدهای آمینه‌ی ضروری، از جمله BCAA\n۱ گرم پروتئین در هر قرص\nاسیدهای آمینه به‌طور طبیعی از منبع پروتئینی می‌آیند و جداگانه افزوده نشده‌اند (این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "Universal Nutrition",
    price: 1450000,
    categorySlug: "aminos",
  },

  // BPI Sports
  {
    id: "bpi1",
    name: "ایزو اچ‌دی - وی ایزوله - ISO HD",
    slug: "bpi-iso-hd",
    groupSlug: "bpi-iso-hd",
    flavor: "بستنی شکلاتی",
    size: "۷۱۳ گرم",
    imageUrl: "/images/products/bpi-iso-hd.webp",
    // Pack photo and Supplement Facts panel image from BPI's US site
    // (bpisports.com/products/iso-hd, Chocolate Ice Cream 23 servings, the
    // flavour with a facts panel): 713 g ÷ 32 g ≈ 23 servings.
    description:
      "ایزو اچ‌دی بی‌پی‌آی با طعم بستنی شکلاتی؛ ۱۰۰٪ پروتئین ایزوله‌ی وی خالص برای جذب سریع و ریکاوری سریع عضله. هر وعده (۳۲ گرم) ۲۵ گرم پروتئین، ۱ گرم کربوهیدرات، ۱ گرم چربی و ۱۲۰ کیلوکالری دارد و قوطی ۷۱۳ گرمی حدود ۲۳ وعده است.\nمواد تشکیل‌دهنده: ایزوله‌ی پروتئین وی، کاکائوی رد راست، طعم‌دهنده‌های طبیعی و مصنوعی، لسیتین سویا، سلولز، صمغ، آسه‌سولفام پتاسیم، نمک، سوکرالوز و ترهالوز.",
    servingSize: "۳۲ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲۰ کیلوکالری" },
      { label: "چربی", amount: "۱ گرم" },
      { label: "چربی اشباع", amount: "۰ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۱۵ میلی‌گرم" },
      { label: "سدیم", amount: "۱۷۵ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۱ گرم" },
      { label: "فیبر", amount: "۰ گرم" },
      { label: "قندها", amount: "۱ گرم" },
      { label: "پروتئین", amount: "۲۵ گرم" },
      { label: "کلسیم", amount: "۷۹ میلی‌گرم" },
      { label: "آهن", amount: "۲ میلی‌گرم" },
      { label: "پتاسیم", amount: "۱۶۷ میلی‌گرم" },
    ],
    warnings:
      "حساسیت‌زاها: حاوی شیر و سویا.\nدر مجموعه‌ای تولید می‌شود که شیر، سویا، گندم، تخم‌مرغ، صدف، آجیل درختی، بادام‌زمینی و کنجد را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۱۰۰٪ پروتئین ایزوله‌ی خالص\n۲۵ گرم پروتئین، ۱ گرم کربوهیدرات و ۱ گرم چربی در هر اسکوپ\nبه گفته‌ی سازنده، جذب سریع و ریکاوری سریع عضله (این ادعا توسط FDA ارزیابی نشده است)",
    brand: "BPI Sports",
    price: 2250000,
    categorySlug: "protein",
  },
  {
    id: "bpi4",
    name: "کراتین میکرونیزه - Micronized Creatine",
    slug: "bpi-micronized-creatine",
    groupSlug: "bpi-micronized-creatine",
    flavor: "بدون طعم",
    size: "۶۰۰ گرم",
    imageUrl: "/images/products/bpi-micronized-creatine.webp",
    // Pack photo and Supplement Facts panel image from BPI's US site
    // (bpisports.com/products/micronized-creatine-1, 120 servings): 120 × 5 g
    // = 600 g. The site gives no directions or warnings.
    description:
      "کراتین میکرونیزه‌ی بی‌پی‌آی، بدون طعم و بدون رنگ مصنوعی؛ ۱۰۰٪ کراتین مونوهیدرات خالص و میکرونیزه. هر وعده (۵ گرم) ۵ گرم کراتین مونوهیدرات دارد و قوطی ۶۰۰ گرمی ۱۲۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات (سایر مواد: ندارد).",
    servingSize: "۵ گرم (۱ اسکوپ)",
    nutritionFacts: [{ label: "کراتین مونوهیدرات", amount: "۵ گرم" }],
    manufacturerClaims:
      "۱۰۰٪ کراتین میکرونیزه‌ی خالص\nبدون رنگ مصنوعی\nبه گفته‌ی سازنده: قدرت بیشتر، رشد و ریکاوری عضله و عملکرد ورزشی بهتر (این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "BPI Sports",
    price: 950000,
    categorySlug: "creatine",
  },
  {
    id: "bpi5",
    name: "بالک ماسل ایکس‌ال - گینر - Bulk Muscle XL",
    slug: "bpi-bulk-muscle-xl",
    groupSlug: "bpi-bulk-muscle-xl",
    flavor: "شکلات",
    size: "۵٫۹۵ کیلوگرم",
    imageUrl: "/images/products/bpi-bulk-muscle-xl.webp",
    // Pack photo and Supplement Facts panel image from BPI's US site
    // (bpisports.com/products/bulk-muscle-xl-…, 13 lb bag): 48 × 124 g =
    // 5952 g. The panel's "Calories from Fat: 5" doesn't fit 2.5 g of fat
    // (≈ 22 kcal), so that row is left out. The site gives no directions or
    // warnings.
    description:
      "بالک ماسل ایکس‌ال بی‌پی‌آی با طعم شکلات؛ گینر پیشرفته برای افزایش وزن و حجم. هر وعده (۱۲۴ گرم) ۴۹۷ کیلوکالری، ۲۵ گرم پروتئین و ۸۸ گرم کربوهیدرات دارد و کیسه‌ی ۵٫۹۵ کیلوگرمی (۱۳ پوند) حدود ۴۸ وعده است. ساخت آمریکا.\nمواد تشکیل‌دهنده: مالتودکسترین، کنسانتره‌ی پروتئین وی، طعم‌دهنده‌های طبیعی و مصنوعی، کاکائوی رد راست، صمغ سلولز، سوکرالوز و آسه‌سولفام پتاسیم.",
    servingSize: "۱۲۴ گرم (۲ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۴۹۷ کیلوکالری" },
      { label: "چربی", amount: "۲٫۵ گرم" },
      { label: "چربی اشباع", amount: "۰ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۴ میلی‌گرم" },
      { label: "سدیم", amount: "۶۰ میلی‌گرم" },
      { label: "پتاسیم", amount: "۱۶۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۸۸ گرم" },
      { label: "فیبر", amount: "۱ گرم" },
      { label: "قندها", amount: "۱٫۵ گرم" },
      { label: "پروتئین", amount: "۲۵ گرم" },
      { label: "کلسیم", amount: "۹۰ میلی‌گرم" },
    ],
    warnings:
      "حساسیت‌زاها: حاوی شیر و سویا.\nدر مجموعه‌ای تولید می‌شود که تخم‌مرغ، آجیل درختی و گندم را هم فرآوری می‌کند.",
    manufacturerClaims:
      "گینر پیشرفته برای افزایش وزن و حجم\n۲۵ گرم پروتئین و ۸۸ گرم کربوهیدرات در هر وعده\nساخت آمریکا",
    brand: "BPI Sports",
    price: 4950000,
    categorySlug: "protein",
  },
  {
    id: "bpi6",
    name: "سی‌ال‌ای + کارنیتین - چربی‌سوز بدون محرک - CLA + Carnitine",
    slug: "bpi-cla-carnitine",
    groupSlug: "bpi-cla-carnitine",
    flavor: "اسنو کون (یخ در بهشت)",
    size: "۳۵۰ گرم",
    imageUrl: "/images/products/bpi-cla-carnitine.webp",
    // Pack photo and Supplement Facts panel from bpisports.com/products/
    // cla-plus-carnitine (Snow Cone, 50 servings, 12.34 oz / 350 g). The
    // label says 50 × 7.4 g, which would be 370 g, so the serving count is
    // left out. Chosen over RoxyLean, whose label has yohimbe and rauwolfia.
    // The site gives no directions or warnings.
    description:
      "سی‌ال‌ای + کارنیتین بی‌پی‌آی با طعم اسنو کون؛ پودر چربی‌سوز بدون محرک (بدون کافئین) و بدون قند با اسیدهای چرب امگا ۶ و CLA (اسید لینولئیک مزدوج) و ترکیب سه نوع کارنیتین. هر اسکوپ (۷٫۴ گرم) ۲٫۵ گرم ترکیب امگا ۶ و CLA، ۲ گرم ترکیب کارنیتین و ۱۰۰۰ واحد ویتامین D3 دارد.\nترکیب امگا ۶ و CLA: پودر روغن نارگیل، پودر روغن آووکادو، پودر روغن گلرنگ (منبع CLA). ترکیب کارنیتین: کارنیتین بتائین بدون آب، ال-کارنیتین تارترات، گلیسین پروپیونیل ال-کارنیتین HCl.\nسایر مواد: مالتودکسترین، سیلیس، اسید سیتریک، طعم‌دهنده‌های طبیعی و مصنوعی، سوکرالوز، اسید مالیک، آسه‌سولفام پتاسیم، کلرید سدیم.",
    servingSize: "۷٫۴ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۳۵ کیلوکالری" },
      { label: "چربی", amount: "۲ گرم" },
      { label: "ویتامین D3 (کوله‌کلسیفرول)", amount: "۲۵ میکروگرم (۱۰۰۰ واحد)" },
      { label: "ترکیب اسیدهای چرب امگا ۶ و CLA", amount: "۲٫۵ گرم" },
      { label: "ترکیب کارنیتین", amount: "۲ گرم" },
    ],
    manufacturerClaims:
      "بدون محرک (بدون کافئین) و بدون قند، بدون رنگ مصنوعی\n۲٫۵ گرم امگا ۶ و CLA، ۲ گرم کارنیتین و ۱۰۰۰ واحد ویتامین D3 در هر اسکوپ\nبه گفته‌ی سازنده: کمک به کاهش چربی بدن و حفظ عضله‌ی بدون چربی، و تبدیل چربی به انرژی (این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "BPI Sports",
    price: 1250000,
    categorySlug: "fat-burner",
  },
  {
    id: "bpi7",
    name: "بست گلوتامین - Best Glutamine",
    slug: "bpi-best-glutamine",
    flavor: "توت و مرکبات",
    size: "۴۹۰ گرم",
    imageUrl: "/images/products/bpi-best-glutamine.webp",
    // Pack photo, Supplement Facts panel and directions from
    // bpisports.com/products/best-glutamine (Berry Citrus, 50 servings, the
    // flavour with its own pack photo and facts panel): 50 × 9.8 g = 490 g
    // (17.3 oz on the pack). The blend's ingredients have no separate
    // amounts. The site gives no warnings beyond the allergen note.
    description:
      "بست گلوتامین بی‌پی‌آی با طعم توت و مرکبات؛ ترکیبی از ۶ شکل گلوتامین برای ریکاوری سریع‌تر، همراه با مقدار زیادی ویتامین C. هر وعده (۱ اسکوپ، ۹٫۸ گرم) ۶٫۵ گرم ترکیب اختصاصی گلوتامین و ۵۰۰ میلی‌گرم ویتامین C دارد و قوطی ۴۹۰ گرمی ۵۰ وعده است. بدون رنگ مصنوعی.\nترکیب اختصاصی بست گلوتامین (۶٫۵ گرم): ال-گلوتامین، گلوتامین آلفا-کتوگلوتارات، گلوتامیک اسید، ان-استیل-ال-گلوتامین، گلوتامین (به‌صورت ال-گلیسیل، ال-آلانیل، ال-لیزین، ال-گلوتامین)، ال-آلانیل-ال-گلوتامین.\nسایر مواد: طعم‌دهنده‌های طبیعی و مصنوعی، دی‌پتاسیم فسفات، سوکرالوز، سیلیس، سیتریک اسید، آسه‌سولفام پتاسیم، مالیک اسید.",
    servingSize: "۹٫۸ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "ویتامین C (اسید اسکوربیک)", amount: "۵۰۰ میلی‌گرم" },
      { label: "ترکیب اختصاصی بست گلوتامین", amount: "۶٫۵ گرم" },
    ],
    usage: "۱ اسکوپ را در ۱۸۰ میلی‌لیتر (۶ اونس) آب سرد حل کنید و پیش، حین یا بعد از ورزش مصرف کنید.",
    warnings:
      "در مجموعه‌ای تولید می‌شود که سویا، ماهی، صدف، شیر، بادام‌زمینی، آجیل درختی، گندم و تخم‌مرغ را هم فرآوری می‌کند.",
    manufacturerClaims:
      "۶ شکل گلوتامین در یک فرمول\n۵۰۰ میلی‌گرم ویتامین C در هر وعده\nبدون رنگ مصنوعی\nبه گفته‌ی سازنده: کمک به ریکاوری، حفظ عضله‌ی خشک، جبران ذخایر گلوتامین و جلوگیری از تجزیه‌ی پروتئین عضله در تمرین شدید (این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "BPI Sports",
    price: 1300000,
    categorySlug: "creatine",
  },
  {
    id: "bpi8",
    name: "ال-آرژنین + ال-سیترولین - L-Arginine + L-Citrulline",
    slug: "bpi-arginine-citrulline",
    size: "۱۲۰ کپسول",
    imageUrl: "/images/products/bpi-arginine-citrulline.webp",
    // Pack photo, Supplement Facts panel and directions from
    // bpisports.com/products/l-arginine-l-citrulline (120 servings, the size
    // with a facts panel). The site gives no warnings, so none are listed.
    description:
      "ال-آرژنین + ال-سیترولین بی‌پی‌آی؛ کپسول ترکیبی از دو اسید آمینه‌ی مکمل برای حمایت از تولید نیتریک اکسید و جریان خون. ال-سیترولین در بدن به ال-آرژنین تبدیل می‌شود. هر وعده (۱ کپسول) ۵۰۰ میلی‌گرم ال-آرژنین و ۲۵۰ میلی‌گرم ال-سیترولین دارد و قوطی ۱۲۰ کپسولی ۱۲۰ وعده است.\nسایر مواد: هیدروکسی‌پروپیل متیل‌سلولز (کپسول سلولزی)، استئاریک اسید (گیاهی)، دی‌اکسید سیلیکون.",
    servingSize: "۱ کپسول",
    nutritionFacts: [
      { label: "ال-آرژنین", amount: "۵۰۰ میلی‌گرم" },
      { label: "ال-سیترولین", amount: "۲۵۰ میلی‌گرم" },
    ],
    usage: "روزانه ۲ بار، هر بار ۱ کپسول با ۲۴۰ تا ۳۶۰ میلی‌لیتر (۸ تا ۱۲ اونس) آب مصرف کنید.",
    manufacturerClaims:
      "ترکیب ال-آرژنین و ال-سیترولین در یک کپسول\nبه گفته‌ی سازنده: حمایت از متابولیسم پروتئین، حفظ بافت عضله و تولید نیتریک اکسید برای جریان خون سالم؛ ال-سیترولین در بدن به ال-آرژنین تبدیل می‌شود و هر دو از راه چرخه‌ی اوره به دفع آمونیاک در ورزش کمک می‌کنند (این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "BPI Sports",
    price: 950000,
    categorySlug: "aminos",
  },

  // Evogen
  {
    id: "ev3",
    name: "ایزوجکت - وی ایزوله - Isoject",
    slug: "evogen-isoject",
    groupSlug: "evogen-isoject",
    flavor: "شکلات",
    size: "۸۰۰ گرم",
    imageUrl: "/images/products/evogen-isoject.webp",
    // Pack photo and Nutrition Facts panel image from Evogen's US site
    // (evogennutrition.com/products/isoject, Chocolate): 800 g ÷ 32 g = 25.
    // The potassium row (169 mg at "2%") doesn't match its %DV (≈ 4%), so it
    // is left out. The site gives no directions or warnings.
    description:
      "ایزوجکت اوو‌ژن با طعم شکلات؛ پودر پروتئین ایزوله‌ی وی فوق‌خالص با فیلتراسیون سرد و آنزیم IGNITOR® برای جذب بهتر. هر وعده (۳۲ گرم) ۲۵ گرم پروتئین، ۱۲٫۲ گرم EAA، ۵٫۴ گرم BCAA و ۱۲۰ کیلوکالری دارد و قوطی ۸۰۰ گرمی حدود ۲۵ وعده است.\nمواد تشکیل‌دهنده: ایزوله‌ی پروتئین وی با فیلتراسیون سرد، کاکائوی قلیایی‌شده، طعم‌دهنده‌های طبیعی و مصنوعی، نمک، صمغ زانتان، لسیتین سویا و/یا آفتابگردان، آنزیم IGNITOR® (آمینوپپتیداز، پروتئاز، پپتیداز)، سوکرالوز و آسه‌سولفام پتاسیم.",
    servingSize: "۳۲ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲۰ کیلوکالری" },
      { label: "چربی", amount: "۱ گرم" },
      { label: "چربی اشباع", amount: "۰ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۱۵ میلی‌گرم" },
      { label: "سدیم", amount: "۱۹۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۳ گرم" },
      { label: "فیبر", amount: "۱ گرم" },
      { label: "قندها", amount: "۲ گرم" },
      { label: "قند افزوده", amount: "۰ گرم" },
      { label: "پروتئین", amount: "۲۵ گرم" },
      { label: "کلسیم", amount: "۹۶ میلی‌گرم" },
      { label: "آهن", amount: "۱ میلی‌گرم" },
    ],
    warnings: "حساسیت‌زاها: حاوی شیر و سویا.",
    manufacturerClaims:
      "۲۵ گرم پروتئین، ۱۲٫۲ گرم EAA و ۵٫۴ گرم BCAA در هر وعده\nایزوله‌ی وی فوق‌خالص با فیلتراسیون سرد\nبه گفته‌ی سازنده: خلوص، ریکاوری و جذب بهتر (این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "Evogen",
    price: 2150000,
    categorySlug: "protein",
  },
  {
    id: "ev4",
    name: "کراتین مونوهیدرات میکرونیزه - Creatine",
    slug: "evogen-creatine",
    groupSlug: "evogen-creatine",
    flavor: "بدون طعم",
    size: "۳۰۰ گرم",
    imageUrl: "/images/products/evogen-creatine.webp",
    // Pack photo and Supplement Facts panel image from Evogen's US site
    // (evogennutrition.com/products/creatine-monohydrate, 60 servings
    // unflavoured, NSF Certified for Sport): about 60 × 5 g = 300 g.
    description:
      "کراتین اوو‌ژن (سری Essential)، بدون طعم؛ پودر کراتین مونوهیدرات میکرونیزه با گواهی NSF Certified for Sport. هر وعده (۵ گرم) ۵ گرم کراتین مونوهیدرات دارد و قوطی ۳۰۰ گرمی حدود ۶۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات میکرونیزه.",
    servingSize: "۵ گرم (۱ اسکوپ)",
    nutritionFacts: [{ label: "کراتین مونوهیدرات میکرونیزه", amount: "۵ گرم" }],
    warnings:
      "فقط برای بزرگسالان سالم ۱۸ سال به بالا. در دوران بارداری یا شیردهی مصرف نکنید.\nاگر داروی تجویزی یا بدون نسخه مصرف می‌کنید یا بیماری دارید، پیش از مصرف با پزشک مشورت کنید.\nدر صورت بروز هر واکنش نامطلوب، فوراً مصرف را قطع و با پزشک تماس بگیرید.\nدو هفته پیش از جراحی مصرف را قطع کنید.\nاگر پلمب ایمنی شکسته یا موجود نیست استفاده نکنید. در جای خنک و خشک و دور از دسترس کودکان نگهداری شود.\nحساسیت‌زا ندارد؛ در مجموعه‌ای تولید می‌شود که شیر، ماهی، سخت‌پوستان، آجیل درختی، گندم، بادام‌زمینی، سویا و تخم‌مرغ را هم فرآوری می‌کند.",
    manufacturerClaims:
      "کراتین مونوهیدرات میکرونیزه با گواهی NSF Certified for Sport\nبه گفته‌ی سازنده: افزایش قدرت و توان، حجم عضله و پشتیبانی از عملکرد شناختی (این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "Evogen",
    price: 850000,
    categorySlug: "creatine",
  },
  {
    id: "ev5",
    name: "سوپر هیوج - گینر - Super Huge",
    slug: "evogen-super-huge",
    groupSlug: "evogen-super-huge",
    flavor: "شیک شکلات",
    size: "۵٫۴۴ کیلوگرم",
    imageUrl: "/images/products/evogen-super-huge.webp",
    // Pack photo and Nutrition Facts panel image from Evogen's US site
    // (evogennutrition.com/products/super-huge-mass-gainer, Chocolate Shake
    // 12 lb): 5440 g ÷ 313 g ≈ 17 servings; every row matches its %DV.
    description:
      "سوپر هیوج اوو‌ژن با طعم شیک شکلات؛ گینر با پروتئین ممتاز و کربوهیدرات تمیز (ترکیب مالتودکسترین، آرد جو دوسر و نشاسته‌ی نخود Carb10™) برای حجم و افزایش وزن. هر وعده (۳۱۳ گرم) ۱۲۲۰ کیلوکالری، ۵۰ گرم پروتئین، ۲۲۶ گرم کربوهیدرات، ۲۲ گرم EAA و ۱۰ گرم BCAA دارد و کیسه‌ی ۵٫۴۴ کیلوگرمی (۱۲ پوند) حدود ۱۷ وعده است.\nمواد تشکیل‌دهنده: ترکیب کربوهیدرات (مالتودکسترین، آرد جو دوسر، نشاسته‌ی نخود (Carb10™))، ترکیب پروتئین (کنسانتره‌ی پروتئین وی، ایزوله‌ی پروتئین وی، کازئین میسلار، پروتئین وی هیدرولیزه، کنسانتره‌ی پروتئین شیر)، کریمر نارگیل (روغن نارگیل، مالتودکسترین، نشاسته، مونو و دی‌گلیسریدها، تری‌کلسیم فسفات)، کاکائوی قلیایی‌شده، طعم‌دهنده‌ی طبیعی و مصنوعی، نمک، سوکرالوز، پروتئاز، آسه‌سولفام پتاسیم، لسیتین سویا و/یا آفتابگردان، پودر روغن MCT و لاکتاز.",
    servingSize: "۳۱۳ گرم (۵ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲۲۰ کیلوکالری" },
      { label: "چربی", amount: "۱۲ گرم" },
      { label: "چربی اشباع", amount: "۸ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۱۴۰ میلی‌گرم" },
      { label: "سدیم", amount: "۳۹۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۲۲۶ گرم" },
      { label: "فیبر", amount: "۴ گرم" },
      { label: "قندها", amount: "۱۲ گرم" },
      { label: "قند افزوده", amount: "۲ گرم" },
      { label: "پروتئین", amount: "۵۰ گرم" },
      { label: "کلسیم", amount: "۴۷۸ میلی‌گرم" },
      { label: "آهن", amount: "۴ میلی‌گرم" },
      { label: "پتاسیم", amount: "۷۱۵ میلی‌گرم" },
    ],
    warnings: "حساسیت‌زاها: حاوی شیر و سویا. حاوی جو دوسر و روغن نارگیل.",
    manufacturerClaims:
      "۱۲۲۰ کالری و ۵۰ گرم پروتئین در هر وعده\n۲۲ گرم EAA، ۱۰ گرم BCAA و ۵ گرم لوسین در هر وعده\nپروتئین ممتاز و کربوهیدرات تمیز، بدون افزایش ناگهانی قند خون (به گفته‌ی سازنده)\nبرای حجم عضله و افزایش وزن",
    brand: "Evogen",
    price: 5250000,
    categorySlug: "protein",
  },
  {
    id: "ev6",
    name: "ای‌وی‌پی تری‌دی - پیش‌تمرین بدون محرک - EVP-3D",
    slug: "evogen-evp-3d",
    groupSlug: "evogen-evp-3d",
    flavor: "قهوه‌ی موکای سرد",
    size: "۵۴۴ گرم",
    imageUrl: "/images/products/evogen-evp-3d.webp",
    // Pack photo and Supplement Facts panel image from Evogen's US site
    // (evogennutrition.com/products/evp-3d, Iced Mocha): 40 × 13.6 g = 544 g.
    // Chosen over the high-stim EVP Xtreme N.O., which adds yohimbe. The
    // site gives no directions or warnings beyond the panel.
    description:
      "ای‌وی‌پی تری‌دی اوو‌ژن با طعم قهوه‌ی موکای سرد؛ پیش‌تمرین بدون محرک (بدون کافئین) برای پمپ، تمرکز ذهنی و حجم عضله، با فناوری نیترات NO3-T®. هر وعده (۱۳٫۶ گرم) ۳ گرم ال-سیترولین، ۱٫۶ گرم بتا-آلانین و ۱٫۲۵ گرم کراتین مونوهیدرات دارد و قوطی ۵۴۴ گرمی حدود ۴۰ وعده (یا ۲۰ وعده‌ی دوتایی) است.\nسایر مواد: روغن آفتابگردان، قهوه‌ی کلمبیایی خشک‌شده، طعم‌دهنده‌های طبیعی و مصنوعی، سیلیکات کلسیم، سیلیس، کاکائو، ترکیب صمغ‌ها (سلولز، زانتان، کاراگینان)، دی‌اکسید تیتانیوم، آسه‌سولفام پتاسیم و سوکرالوز.",
    servingSize: "۱۳٫۶ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۵ کیلوکالری" },
      { label: "چربی", amount: "۰٫۵ گرم" },
      { label: "کربوهیدرات", amount: "۱ گرم" },
      { label: "سدیم (نمک صورتی هیمالیا)", amount: "۶۰ میلی‌گرم" },
      { label: "ال-سیترولین", amount: "۳۰۰۰ میلی‌گرم" },
      { label: "بتا-آلانین", amount: "۱۶۰۰ میلی‌گرم" },
      { label: "آرژنین نیترات (NO3-T®)", amount: "۱۰۰۰ میلی‌گرم" },
      { label: "کراتین مونوهیدرات", amount: "۱۲۵۰ میلی‌گرم" },
      { label: "پودر آب نارگیل", amount: "۵۰۰ میلی‌گرم" },
      { label: "ال-تیروزین", amount: "۵۰۰ میلی‌گرم" },
      { label: "DMAE (دی‌متیل‌آمینواتانول)", amount: "۳۰۰ میلی‌گرم" },
      { label: "عصاره‌ی قارچ یال شیر", amount: "۲۵۰ میلی‌گرم" },
    ],
    usage: "برای تازه ماندن، می‌توانید پس از باز کردن آن را در یخچال نگهداری کنید.",
    warnings:
      "حساسیت‌زاها: حاوی شیر و آجیل درختی (نارگیل). در مجموعه‌ای تولید می‌شود که بادام‌زمینی، گندم و تخم‌مرغ را هم فرآوری می‌کند.",
    manufacturerClaims:
      "بدون محرک (بدون کافئین)\nپمپ، تمرکز ذهنی و حجم عضله (به گفته‌ی سازنده؛ این ادعاها توسط FDA ارزیابی نشده است)\nفناوری ثبت‌شده‌ی نیترات NO3-T®",
    brand: "Evogen",
    price: 1550000,
    categorySlug: "pre-workout",
  },
  {
    id: "ev7",
    name: "ایووبرن بدون کافئین - چربی‌سوز - Evoburn Caffeine Free",
    slug: "evogen-evoburn-caffeine-free",
    groupSlug: "evogen-evoburn-caffeine-free",
    flavor: "انگور",
    size: "۱۴۶ گرم",
    imageUrl: "/images/products/evogen-evoburn-caffeine-free.webp",
    // Pack photo, Supplement Facts panel and directions/warnings from
    // evogennutrition.com/products/evoburn-elite-thermogenic-powder-caffeine-
    // free (Grape Blast): 30 × 4.87 g ≈ 146 g. Chosen over the regular
    // Evoburn, whose label has yohimbe. The site's warning copy still says
    // "contains caffeine" (copied from the regular version), so those
    // caffeine-only lines are left out.
    description:
      "ایووبرن بدون کافئین اوو‌ژن با طعم انگور؛ پودر ترموژنیک (چربی‌سوز) بدون کافئین، طراحی‌شده توسط هانی رامبد، برای کمک به متابولیسم، کنترل اشتها و تمرکز در دوره‌ی کات، با برچسب کاملاً شفاف و بدون ترکیب اختصاصی. هر وعده (۴٫۸۷ گرم) ۵۰۰ میلی‌گرم MitoBurn®، ۲۵۰ میلی‌گرم InnoSlim® و ۵۰۰ میلی‌گرم ال-تیروزین دارد و قوطی ۱۴۶ گرمی حدود ۳۰ وعده است.\nسایر مواد: اسید سیتریک، اسید مالیک، طعم‌دهنده‌های طبیعی و مصنوعی، سیلیکات کلسیم، سوکرالوز، سیلیس، عصاره‌ی پوست انگور، آسه‌سولفام پتاسیم.",
    servingSize: "۴٫۸۷ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "ال-تیروزین", amount: "۵۰۰ میلی‌گرم" },
      { label: "عصاره‌ی کاکائو", amount: "۲۰۰ میلی‌گرم" },
      { label: "DMAE بیتارترات", amount: "۲۰۰ میلی‌گرم" },
      { label: "عصاره‌ی پرتقال تلخ (Advantra Z® ۲۵٪)", amount: "۴۰ میلی‌گرم" },
      { label: "MitoBurn® (ال-بتا-آمینوایزوبوتیریک اسید)", amount: "۵۰۰ میلی‌گرم" },
      { label: "InnoSlim® (ریشه‌ی گون و جینسینگ پاناکس نوتوجینسنگ)", amount: "۲۵۰ میلی‌گرم" },
      { label: "ProGBB® (گاما-بوتیروبتائین اتیل استر کلراید)", amount: "۴۰ میلی‌گرم" },
      { label: "BioPerine® (عصاره‌ی فلفل سیاه)", amount: "۵ میلی‌گرم" },
    ],
    usage:
      "در چند نوبت اول، برای سنجش تحمل بدن نصف وعده (۱/۲ اسکوپ) مصرف کنید و بعد سراغ یک اسکوپ کامل بروید. صبح، ناشتا و ۲۰ تا ۳۰ دقیقه پیش از اولین وعده‌ی غذا یا شیک پروتئین، با ۳۰۰ تا ۳۵۰ میلی‌لیتر (۱۰ تا ۱۲ اونس) آب سرد مخلوط کنید. برای بهترین نتیجه همراه با رژیم غذایی و برنامه‌ی تمرینی مصرف کنید.\nبیش از ۸ هفته پشت سر هم مصرف نکنید و پس از آن ۴ هفته استراحت دهید. پس از باز کردن در یخچال نگهداری کنید.",
    warnings:
      "فقط برای افراد سالم ۱۸ تا ۵۰ سال. در دوران بارداری یا شیردهی مصرف نکنید.\nپیش از مصرف با پزشک مشورت کنید، به‌ویژه اگر دارو، مکمل یا داروی بدون نسخه مصرف می‌کنید یا بیماری زمینه‌ای دارید، از جمله فشار خون بالا یا پایین، آریتمی قلبی، سکته، بیماری قلب، کبد، کلیه یا تیروئید، تشنج، بیماری روانی، دیابت، مشکل در ادرار کردن به علت بزرگی پروستات، یا اگر مهارکننده‌ی MAO-B، MAOI، SSRI یا هر داروی سروتونرژیک دیگر مصرف می‌کنید.\nدو هفته پیش از جراحی مصرف را قطع کنید. همراه با الکل مصرف نکنید. در صورت بروز هر واکنش نامطلوب، فوراً مصرف را قطع و با پزشک مشورت کنید. از مقدار توصیه‌شده بیشتر مصرف نکنید.\nاگر بسته‌بندی دستکاری شده است استفاده نکنید. دور از دسترس کودکان و در جای خنک و خشک نگهداری شود.\nممکن است حاوی موادی باشد که برخی سازمان‌های ورزشی ممنوع کرده‌اند؛ مسئولیت نتیجه‌ی آزمایش‌های دوپینگ با مصرف‌کننده است.\nحساسیت‌زا ندارد؛ در مجموعه‌ای تولید می‌شود که شیر، ماهی، سخت‌پوستان، آجیل درختی، گندم، بادام‌زمینی، سویا و تخم‌مرغ را هم فرآوری می‌کند.",
    manufacturerClaims:
      "بدون کافئین\nطراحی‌شده توسط هانی رامبد («The Pro Creator»)، مربی ۲۵ بار قهرمان مسترالمپیا\nبرچسب کاملاً شفاف، بدون ترکیب اختصاصی، با مواد ثبت‌شده‌ی MitoBurn®، InnoSlim® و ProGBB®\nبه گفته‌ی سازنده: کمک به متابولیسم، کنترل اشتها و تمرکز، و حفظ عضله در دوره‌ی کات (این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "Evogen",
    price: 1450000,
    categorySlug: "fat-burner",
  },
  {
    id: "ev8",
    name: "گلوتامین - Glutamine",
    slug: "evogen-glutamine",
    flavor: "بدون طعم",
    size: "۳۰۰ گرم",
    imageUrl: "/images/products/evogen-glutamine.webp",
    // Pack photo, Supplement Facts panel, directions and warnings from
    // evogennutrition.com/products/evogen-glutamine (Essential Series
    // Unflavored, 60 servings, 300 g).
    description:
      "گلوتامین ایووژن (سری Essential)؛ ال-گلوتامین خالص با کیفیت دارویی و بدون طعم، از تخمیر منابع گیاهی، برای پر کردن ذخایر گلوتامین و ریکاوری سریع‌تر. هر وعده (۱ اسکوپ، ۵ گرم) ۵ گرم ال-گلوتامین دارد و قوطی ۳۰۰ گرمی حدود ۶۰ وعده است.",
    servingSize: "۵ گرم (۱ اسکوپ)",
    nutritionFacts: [{ label: "ال-گلوتامین", amount: "۵ گرم" }],
    usage:
      "۱ وعده (۱ اسکوپ) را با ۲۴۰ میلی‌لیتر (۸ اونس) آب سرد یا نوشیدنی دلخواه مخلوط کنید و پیش، حین یا بعد از تمرین، تا ۲ بار در روز مصرف کنید.\nدر جای خنک و خشک نگهداری کنید؛ ممکن است پودر ته‌نشین شود.",
    warnings:
      "فقط برای بزرگسالان سالم ۱۸ سال به بالا. در دوران بارداری یا شیردهی مصرف نکنید.\nپیش از مصرف با پزشک مشورت کنید، به‌ویژه اگر داروی با نسخه یا بدون نسخه مصرف می‌کنید یا بیماری زمینه‌ای دارید. در صورت بروز هر واکنش نامطلوب، فوراً مصرف را قطع و با پزشک مشورت کنید.\nدو هفته پیش از جراحی مصرف را قطع کنید. اگر مهر ایمنی شکسته یا نیست استفاده نکنید. دور از دسترس کودکان نگهداری شود.\nحساسیت‌زا ندارد؛ در مجموعه‌ای تولید می‌شود که شیر، تخم‌مرغ، ماهی، سخت‌پوستان، آجیل درختی، گندم، بادام‌زمینی، سویا و کنجد را هم فرآوری می‌کند.",
    manufacturerClaims:
      "ال-گلوتامین خالص با کیفیت دارویی، از تخمیر منابع گیاهی\nبه گفته‌ی سازنده: حمایت از سیستم ایمنی و دستگاه گوارش (این ادعاها توسط FDA ارزیابی نشده است)\nطراحی‌شده توسط هانی رامبد («The Pro Creator»)، مربی ۲۵ بار قهرمان مسترالمپیا",
    brand: "Evogen",
    price: 1200000,
    categorySlug: "creatine",
  },

  // Nutrex
  // Every stimulant Lipo-6 has yohimbine and/or rauwolfia on its label; the
  // owner chose to sell Black UC and Hers UC anyway, with the full warnings.
  {
    id: "nx1",
    name: "لیپو ۶ بلک اولترا کنسانتره - چربی‌سوز - Lipo-6 Black UC",
    slug: "nutrex-lipo-6-black-uc",
    size: "۶۰ کپسول",
    imageUrl: "/images/products/nutrex-lipo-6-black-uc.webp",
    // Pack photo, Supplement Facts panel and back label from
    // nutrex.com/products/lipo-6-black-ultra-concentrate (60 liqui-caps,
    // label LBL-LIPO6BLKUC-60CT-V9-US). The complex's ingredients have no
    // separate amounts; caffeine (200 mg) is from the warning.
    description:
      "لیپو ۶ بلک اولترا کنسانتره ناترکس؛ چربی‌سوز ترموژنیک بسیار غلیظ در کپسول مایع سریع‌جذب (لیکوئی‌کپ). هر وعده فقط ۱ کپسول است، ۲۰۰ میلی‌گرم کافئین دارد و قوطی ۶۰ کپسولی ۶۰ وعده است.\nکمپلکس چربی‌سوز اولترا کنسانتره (۳۱۵٫۱ میلی‌گرم): کافئین بی‌آب، تئوبرومین بی‌آب، AdipoSyn™ (عصاره‌ی پرتقال تلخ Citrus aurantium، ۵۰٪ پی-سینفرین)، GBBGO® (گاما-بوتیروبتائین هیدروکلراید)، یوهیمبین HCl، عصاره‌ی ریشه‌ی رائولفیا ومیتوریا (۹۰٪ رائولسین HCl).\nسایر مواد: گلیسرین، کپسول گیاهی، آب تصفیه‌شده، کلروفیلین.",
    servingSize: "۱ کپسول مایع",
    nutritionFacts: [
      { label: "کمپلکس چربی‌سوز اولترا کنسانتره (کل)", amount: "۳۱۵٫۱ میلی‌گرم" },
      { label: "کافئین (طبق هشدار برچسب)", amount: "۲۰۰ میلی‌گرم" },
    ],
    usage:
      "روزی دو بار ۱ کپسول، صبح و بعدازظهر، بین وعده‌های غذا مصرف کنید؛ همراه غذا نخورید. این فرمول بسیار غلیظ است: در هر نوبت بیش از ۱ کپسول و بیش از مقدار توصیه‌شده‌ی روزانه مصرف نکنید.\nتا ۶ ساعت پیش از خواب مصرف نکنید. برای بهترین نتیجه، روزانه به مدت ۱ تا ۲ ماه همراه با ورزش منظم و رژیم غذایی مناسب مصرف کنید.\nدر دمای ۱۵ تا ۲۷ درجه‌ی سانتی‌گراد، رطوبت ۳۵ تا ۶۵٪ و دور از نور مستقیم خورشید نگهداری کنید.",
    warnings:
      "حاوی یوهیمبین و رائولفیا (رائولسین).\nاگر زیر ۱۸ سال هستید، باردار یا شیرده هستید یا به کافئین حساسیت دارید، مصرف نکنید. همراه با کافئین یا هر محرک دیگری از منابع دیگر، از جمله نوشیدنی انرژی‌زا، قهوه، نوشابه، مکمل‌های غذایی یا داروها مصرف نکنید. هر وعده ۲۰۰ میلی‌گرم کافئین دارد، حدود ۱٫۵ فنجان قهوه‌ی قوی.\nبیش از ۲ ماه مصرف نکنید و پس از آن ۱ ماه استراحت دهید.\nاگر دارو مصرف می‌کنید یا هر بیماری دارید، از جمله بیماری قلب، کبد، کلیه یا تیروئید، اختلالات روانی، مشکل در ادرار کردن، دیابت، فشار خون بالا، آریتمی قلبی، سردردهای مکرر، بزرگی پروستات یا گلوکوم، پیش از مصرف با پزشک مشورت کنید.\nدو هفته پیش از جراحی مصرف را قطع کنید. اگر دچار تپش قلب، سرگیجه، سردرد شدید یا تنگی نفس شدید، فوراً مصرف را قطع کنید.\nاین محصول موادی دارد که ممکن است برخی سازمان‌های ورزشی ممنوع کرده باشند. دور از دسترس کودکان نگهداری شود.",
    manufacturerClaims:
      "چربی‌سوز ترموژنیک بسیار غلیظ؛ آن‌قدر قوی که نباید در هر نوبت بیش از ۱ کپسول مصرف کرد\nبه گفته‌ی سازنده: افزایش متابولیسم و کالری‌سوزی، کنترل اشتها و جلوگیری از پرخوری، و افزایش انرژی و هوشیاری در دوره‌ی رژیم (این ادعاها توسط FDA ارزیابی نشده است)\nکپسول گیاهی، بدون مواد حیوانی",
    brand: "Nutrex",
    price: 1350000,
    categorySlug: "fat-burner",
  },
  {
    id: "nx1w",
    name: "لیپو ۶ هرز اولترا کنسانتره - چربی‌سوز بانوان - Lipo-6 Hers UC",
    slug: "nutrex-lipo-6-hers-uc",
    size: "۶۰ کپسول",
    imageUrl: "/images/products/nutrex-lipo-6-hers-uc.webp",
    // Pack photo, Supplement Facts panel and back label from
    // nutrex.com/products/lipo-6-hers-ultra-concentrate (60 liqui-caps,
    // label LBL-LIPO6HERSUC-60CT-V9-US). Folate 340 mcg DFE = 200 mcg folic
    // acid × 1.7. The complex's ingredients have no separate amounts;
    // caffeine (200 mg) is from the warning.
    description:
      "لیپو ۶ هرز اولترا کنسانتره ناترکس؛ چربی‌سوز ترموژنیک بسیار غلیظ مخصوص بانوان در کپسول مایع سریع‌جذب (لیکوئی‌کپ)، با اسید فولیک، ویتامین B12 و بیوتین برای سلامت مو. هر وعده فقط ۱ کپسول است، ۲۰۰ میلی‌گرم کافئین دارد و قوطی ۶۰ کپسولی ۶۰ وعده است.\nکمپلکس چربی‌سوز اولترا کنسانتره (۳۰۵ میلی‌گرم): کافئین بی‌آب، تئوبرومین بی‌آب، CitruBurn™ (عصاره‌ی پرتقال تلخ Citrus aurantium، ۵۰٪ پی-سینفرین)، GBBGO® (گاما-بوتیروبتائین هیدروکلراید)، یوهیمبین HCl، عصاره‌ی ریشه‌ی رائولفیا ومیتوریا (۹۰٪ رائولسین HCl).\nسایر مواد: گلیسرین، کپسول گیاهی، آب تصفیه‌شده، کلروفیلین.",
    servingSize: "۱ کپسول مایع",
    nutritionFacts: [
      { label: "فولات (۲۰۰ میکروگرم اسید فولیک)", amount: "۳۴۰ میکروگرم DFE" },
      { label: "ویتامین B12 (سیانوکوبالامین)", amount: "۳ میکروگرم" },
      { label: "بیوتین", amount: "۵۰۰ میکروگرم" },
      { label: "کمپلکس چربی‌سوز اولترا کنسانتره (کل)", amount: "۳۰۵ میلی‌گرم" },
      { label: "کافئین (طبق هشدار برچسب)", amount: "۲۰۰ میلی‌گرم" },
    ],
    usage:
      "روزی دو بار ۱ کپسول، صبح و بعدازظهر، بین وعده‌های غذا مصرف کنید؛ همراه غذا نخورید. این فرمول بسیار غلیظ است: در هر نوبت بیش از ۱ کپسول و بیش از مقدار توصیه‌شده‌ی روزانه مصرف نکنید.\nتا ۶ ساعت پیش از خواب مصرف نکنید. برای بهترین نتیجه، روزانه به مدت ۱ تا ۲ ماه همراه با ورزش منظم و رژیم غذایی مناسب مصرف کنید.\nدر دمای ۱۵ تا ۲۷ درجه‌ی سانتی‌گراد، رطوبت ۳۵ تا ۶۵٪ و دور از نور مستقیم خورشید نگهداری کنید.",
    warnings:
      "حاوی یوهیمبین و رائولفیا (رائولسین).\nاگر زیر ۱۸ سال هستید، باردار یا شیرده هستید یا به کافئین حساسیت دارید، مصرف نکنید. همراه با کافئین یا هر محرک دیگری از منابع دیگر، از جمله نوشیدنی انرژی‌زا، قهوه، نوشابه، مکمل‌های غذایی یا داروها مصرف نکنید. هر وعده ۲۰۰ میلی‌گرم کافئین دارد، حدود ۱٫۵ فنجان قهوه‌ی قوی.\nبیش از ۲ ماه مصرف نکنید و پس از آن ۱ ماه استراحت دهید.\nاگر دارو مصرف می‌کنید یا هر بیماری دارید، از جمله بیماری قلب، کبد، کلیه یا تیروئید، اختلالات روانی، مشکل در ادرار کردن، دیابت، فشار خون بالا، آریتمی قلبی، سردردهای مکرر، بزرگی پروستات یا گلوکوم، پیش از مصرف با پزشک مشورت کنید.\nدو هفته پیش از جراحی مصرف را قطع کنید. اگر دچار تپش قلب، سرگیجه، سردرد شدید یا تنگی نفس شدید، فوراً مصرف را قطع کنید.\nاین محصول موادی دارد که ممکن است برخی سازمان‌های ورزشی ممنوع کرده باشند. دور از دسترس کودکان نگهداری شود.",
    manufacturerClaims:
      "چربی‌سوز ترموژنیک بسیار غلیظ مخصوص بانوان؛ آن‌قدر قوی که نباید در هر نوبت بیش از ۱ کپسول مصرف کرد\nبه گفته‌ی سازنده: افزایش متابولیسم و کالری‌سوزی، کنترل اشتها و جلوگیری از پرخوری، و افزایش انرژی و هوشیاری در دوره‌ی رژیم\nبا اسید فولیک، ویتامین B12 و بیوتین برای سلامت مو (به گفته‌ی سازنده)\n(این ادعاها توسط FDA ارزیابی نشده است)\nکپسول گیاهی، بدون مواد حیوانی",
    brand: "Nutrex",
    price: 1350000,
    categorySlug: "fat-burner",
  },
  {
    id: "nx2",
    name: "گلوتامین پیور - Glutamine Pure",
    slug: "nutrex-glutamine-pure",
    flavor: "بدون طعم",
    size: "۳۰۰ گرم",
    imageUrl: "/images/products/nutrex-glutamine-pure.webp",
    // Pack photo, Supplement Facts panel and back label from
    // nutrex.com/products/glutamine-pure (300 g / 60 servings, label
    // LLBL-GLUTAMINE-10.58OZ-V6-U).
    description:
      "گلوتامین پیور ناترکس؛ ال-گلوتامین خالص و بدون طعم، بدون هیچ ماده‌ی دیگر، که به‌راحتی در هر نوشیدنی حل می‌شود. هر وعده (۱ اسکوپ، ۵ گرم) ۵ گرم ال-گلوتامین دارد و قوطی ۳۰۰ گرمی ۶۰ وعده است.\nمواد تشکیل‌دهنده: ال-گلوتامین. سایر مواد: ندارد.",
    servingSize: "۵ گرم (۱ اسکوپ)",
    nutritionFacts: [{ label: "ال-گلوتامین", amount: "۵ گرم" }],
    usage:
      "روزانه ۱ تا ۲ وعده را با ۱۸۰ تا ۲۴۰ میلی‌لیتر (۶ تا ۸ اونس) آب یا هر نوشیدنی دلخواه مصرف کنید. بهترین زمان مصرف گلوتامین صبح و پیش از خواب است؛ در روزهای تمرین ۱ وعده را بلافاصله بعد از تمرین بخورید.\nدر جای خنک و خشک، دور از نور مستقیم خورشید و رطوبت (۱۵ تا ۲۷ درجه‌ی سانتی‌گراد) نگهداری کنید.",
    warnings:
      "در دوران بارداری یا شیردهی مصرف نکنید. دور از دسترس کودکان نگهداری شود.\nدر مجموعه‌ای تولید می‌شود که محصولات حاوی شیر، تخم‌مرغ، ماهی، صدف، آجیل درختی، گندم و سویا را هم تولید می‌کند.",
    manufacturerClaims:
      "خالص؛ بدون هیچ ماده‌ی دیگر\nبه گفته‌ی سازنده: محافظت از بافت عضله در برابر تجزیه بر اثر تمرین سنگین، استرس و رژیم، ریکاوری و ترمیم سریع‌تر عضله، افزایش سنتز پروتئین و استقامت عضلانی، و حمایت از سیستم ایمنی و سلامت گوارش (این ادعاها توسط FDA ارزیابی نشده است)",
    brand: "Nutrex",
    price: 1200000,
    categorySlug: "creatine",
  },

  // Rule 1
  // ruleoneproteins.com is Shopify: pack photos from `products/<handle>.json`,
  // Supplement Facts panels and directions from the product pages, warnings
  // from each page's "Warnings" tab.
  {
    id: "r1c",
    name: "کراتین - Creatine",
    slug: "rule1-creatine",
    flavor: "بدون طعم",
    size: "۳۹۰ گرم",
    imageUrl: "/images/products/rule1-creatine.webp",
    // Unflavored 75 servings: 75 × 5.2 g = 390 g (13.76 oz on the pack).
    description:
      "کراتین رول وان؛ کراتین مونوهیدرات خالص و بدون طعم، پرمطالعه‌ترین شکل کراتین، بدون هیچ ماده‌ی دیگر. هر وعده (حدود ۱ اسکوپ، ۵٫۲ گرم) ۵ گرم کراتین مونوهیدرات و ۲۰ کیلوکالری دارد و قوطی ۳۹۰ گرمی ۷۵ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات. سایر مواد: ندارد.",
    servingSize: "۵٫۲ گرم (حدود ۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۲۰ کیلوکالری" },
      { label: "کراتین مونوهیدرات", amount: "۵ گرم" },
    ],
    usage:
      "۱ اسکوپ را با ۱۸۰ تا ۳۶۰ میلی‌لیتر (۶ تا ۱۲ اونس) شیک پروتئین، آبمیوه، مکمل تمرینی یا نوشیدنی سرد دلخواه مخلوط کنید. بهتر است بعد از تمرین و همراه با غذا مصرف شود.\nروش جایگزین (دوره‌ی بارگیری): ۵ روز، روزانه ۲۰ گرم کراتین برای اشباع عضله، سپس روزانه ۳ تا ۵ گرم برای نگهداری.",
    warnings:
      "دور از دسترس کودکان نگهداری شود. فقط برای بزرگسالان سالم و فعال.\nاگر دارو مصرف می‌کنید، تحت درمان پزشک هستید یا زیر ۱۸ سال هستید، پیش از مصرف با پزشک مشورت کنید.\nدر دوران بارداری، اقدام به بارداری یا شیردهی مصرف نکنید.",
    manufacturerClaims:
      "۵ گرم کراتین مونوهیدرات در هر وعده\nبه گفته‌ی سازنده: مؤثرترین مکمل افزایش عملکرد در پرمطالعه‌ترین شکل آن (مونوهیدرات) و پشتیبان تمرین‌های پرشدت (این ادعا توسط FDA ارزیابی نشده است)",
    brand: "Rule 1",
    price: 1100000,
    categorySlug: "creatine",
  },
  {
    id: "r1p",
    name: "آر وان پروتئین - وی ایزوله - R1 Protein Whey Isolate",
    slug: "rule1-r1-protein-chocolate-fudge",
    groupSlug: "rule1-r1-protein",
    flavor: "شکلات فاج",
    size: "۲٫۲۷ کیلوگرم",
    imageUrl: "/images/products/rule1-r1-protein-chocolate-fudge.webp",
    // Chocolate Fudge 5 lb: 71 × 32 g ≈ 2.27 kg, as the pack says.
    description:
      "آر وان پروتئین رول وان با طعم شکلات فاج؛ ۱۰۰٪ وی ایزوله و وی ایزوله‌ی نیمه‌هیدرولیزه‌ی سریع‌جذب. هر وعده (۱ اسکوپ، ۳۲ گرم) ۲۵ گرم پروتئین، ۳ گرم کربوهیدرات، ۰٫۵ گرم چربی و ۱۲۰ کیلوکالری دارد و قوطی ۲٫۲۷ کیلوگرمی ۷۱ وعده است.\nمواد تشکیل‌دهنده: ترکیب پروتئین (ایزوله‌ی پروتئین وی، ایزوله‌ی پروتئین وی هیدرولیزه)، کاکائو (قلیایی‌شده)، و کمتر از ۲٪: طعم‌دهنده‌های طبیعی و مصنوعی، سوکرالوز، نمک، آسه‌سولفام پتاسیم، لسیتین سویا، لسیتین آفتابگردان.",
    servingSize: "۳۲ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۲۰ کیلوکالری" },
      { label: "چربی", amount: "۰٫۵ گرم" },
      { label: "چربی اشباع", amount: "۰ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۰ میلی‌گرم" },
      { label: "سدیم", amount: "۶۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۳ گرم" },
      { label: "فیبر", amount: "۱ گرم" },
      { label: "قندها", amount: "۰ گرم" },
      { label: "پروتئین", amount: "۲۵ گرم" },
      { label: "کلسیم", amount: "۱۲۰ میلی‌گرم" },
      { label: "آهن", amount: "۱ میلی‌گرم" },
      { label: "پتاسیم", amount: "۲۸۰ میلی‌گرم" },
    ],
    usage: rule1ProteinUsage,
    warnings: rule1ProteinWarnings,
    manufacturerClaims: rule1ProteinClaims,
    brand: "Rule 1",
    price: 4500000,
    categorySlug: "protein",
  },
  {
    id: "r1pv",
    name: "آر وان پروتئین - وی ایزوله - R1 Protein Whey Isolate",
    slug: "rule1-r1-protein-vanilla-creme",
    groupSlug: "rule1-r1-protein",
    flavor: "وانیل کرم",
    size: "۲٫۲۵ کیلوگرم",
    imageUrl: "/images/products/rule1-r1-protein-vanilla-creme.webp",
    // Vanilla Crème 5 lb: 75 × 30 g = 2.25 kg, as the pack says.
    description:
      "آر وان پروتئین رول وان با طعم وانیل کرم؛ ۱۰۰٪ وی ایزوله و وی ایزوله‌ی نیمه‌هیدرولیزه‌ی سریع‌جذب. هر وعده (۱ اسکوپ، ۳۰ گرم) ۲۵ گرم پروتئین، ۱ گرم کربوهیدرات، ۰ گرم چربی و ۱۱۰ کیلوکالری دارد و قوطی ۲٫۲۵ کیلوگرمی ۷۵ وعده است.\nمواد تشکیل‌دهنده: ترکیب پروتئین (ایزوله‌ی پروتئین وی، ایزوله‌ی پروتئین وی هیدرولیزه)، طعم‌دهنده‌های طبیعی و مصنوعی، و کمتر از ۲٪: سوکرالوز، آسه‌سولفام پتاسیم، لسیتین سویا، لسیتین آفتابگردان.",
    servingSize: "۳۰ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۰ کیلوکالری" },
      { label: "چربی", amount: "۰ گرم" },
      { label: "چربی اشباع", amount: "۰ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۰ میلی‌گرم" },
      { label: "سدیم", amount: "۴۵ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۱ گرم" },
      { label: "فیبر", amount: "۰ گرم" },
      { label: "قندها", amount: "۱ گرم" },
      { label: "پروتئین", amount: "۲۵ گرم" },
      { label: "کلسیم", amount: "۱۲۰ میلی‌گرم" },
      { label: "آهن", amount: "۰ میلی‌گرم" },
      { label: "پتاسیم", amount: "۱۶۰ میلی‌گرم" },
    ],
    usage: rule1ProteinUsage,
    warnings: rule1ProteinWarnings,
    manufacturerClaims: rule1ProteinClaims,
    brand: "Rule 1",
    price: 4500000,
    categorySlug: "protein",
  },
  {
    id: "r1pc",
    name: "آر وان پروتئین - وی ایزوله - R1 Protein Whey Isolate",
    slug: "rule1-r1-protein-cookies-creme",
    groupSlug: "rule1-r1-protein",
    flavor: "کوکی و کرم",
    size: "۲٫۲۵ کیلوگرم",
    imageUrl: "/images/products/rule1-r1-protein-cookies-creme.webp",
    // Cookies & Crème 5 lb: 75 × 30 g = 2.25 kg, as the pack says.
    description:
      "آر وان پروتئین رول وان با طعم کوکی و کرم؛ ۱۰۰٪ وی ایزوله و وی ایزوله‌ی نیمه‌هیدرولیزه‌ی سریع‌جذب، با تکه‌های کوکی. هر وعده (۱ اسکوپ، ۳۰ گرم) ۲۵ گرم پروتئین، ۱ گرم کربوهیدرات، ۱ گرم چربی و ۱۱۰ کیلوکالری دارد و قوطی ۲٫۲۵ کیلوگرمی ۷۵ وعده است.\nمواد تشکیل‌دهنده: ترکیب پروتئین (ایزوله‌ی پروتئین وی، ایزوله‌ی پروتئین وی هیدرولیزه)، طعم‌دهنده‌های طبیعی و مصنوعی، و کمتر از ۲٪: تکه‌های کوکی (نشاسته‌ی تاپیوکا، آرد برنج، شکر، کاکائو [قلیایی‌شده]، روغن پالم، نمک، لیکور شکلات، طعم‌دهنده‌ی طبیعی، بی‌کربنات سدیم)، سوکرالوز، آسه‌سولفام پتاسیم، لسیتین سویا، لسیتین آفتابگردان.",
    servingSize: "۳۰ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۱۰ کیلوکالری" },
      { label: "چربی", amount: "۱ گرم" },
      { label: "چربی اشباع", amount: "۰ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۱۰ میلی‌گرم" },
      { label: "سدیم", amount: "۵۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۱ گرم" },
      { label: "فیبر", amount: "۰ گرم" },
      { label: "قندها", amount: "۱ گرم" },
      { label: "پروتئین", amount: "۲۵ گرم" },
      { label: "کلسیم", amount: "۱۲۰ میلی‌گرم" },
      { label: "آهن", amount: "۰٫۳ میلی‌گرم" },
      { label: "پتاسیم", amount: "۱۵۰ میلی‌گرم" },
    ],
    usage: rule1ProteinUsage,
    warnings: rule1ProteinWarnings,
    manufacturerClaims: rule1ProteinClaims,
    brand: "Rule 1",
    price: 4500000,
    categorySlug: "protein",
  },
  {
    id: "r1w",
    name: "وی پروتئین - R1 Whey Protein",
    slug: "rule1-whey-protein-chocolate-fudge",
    groupSlug: "rule1-whey-protein",
    flavor: "شکلات فاج",
    size: "۲٫۲۸ کیلوگرم",
    imageUrl: "/images/products/rule1-whey-protein-chocolate-fudge.webp",
    // Chocolate Fudge 5 lb: 65 × 35 g ≈ 2.28 kg, as the pack says.
    description: `وی پروتئین رول وان با طعم شکلات فاج؛ پودر پروتئین وی معمولی از ترکیب کنسانتره، ایزوله و ایزوله‌ی هیدرولیزه‌ی وی. هر وعده (۱ اسکوپ، ۳۵ گرم) ۲۴ گرم پروتئین، ۴ گرم کربوهیدرات، ۲٫۵ گرم چربی و ۱۳۰ کیلوکالری دارد و قوطی ۲٫۲۸ کیلوگرمی ۶۵ وعده است.\nمواد تشکیل‌دهنده: ${rule1WheyBlend}، کاکائو (قلیایی‌شده)، و کمتر از ۲٪: طعم‌دهنده‌های طبیعی و مصنوعی، صمغ سلولز، صمغ زانتان، نمک، سوکرالوز، آسه‌سولفام پتاسیم، لسیتین سویا، لسیتین آفتابگردان.`,
    servingSize: "۳۵ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۳۰ کیلوکالری" },
      { label: "چربی", amount: "۲٫۵ گرم" },
      { label: "چربی اشباع", amount: "۱ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۸۰ میلی‌گرم" },
      { label: "سدیم", amount: "۱۲۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۴ گرم" },
      { label: "فیبر", amount: "۱ گرم" },
      { label: "قندها", amount: "۱ گرم" },
      { label: "قند افزوده", amount: "۰ گرم" },
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "ویتامین D", amount: "۰ میکروگرم" },
      { label: "کلسیم", amount: "۱۷۰ میلی‌گرم" },
      { label: "آهن", amount: "۱ میلی‌گرم" },
      { label: "پتاسیم", amount: "۲۵۰ میلی‌گرم" },
    ],
    warnings: rule1WheyWarnings,
    manufacturerClaims: rule1WheyClaims,
    brand: "Rule 1",
    price: 3200000,
    categorySlug: "protein",
  },
  {
    id: "r1wv",
    name: "وی پروتئین - R1 Whey Protein",
    slug: "rule1-whey-protein-vanilla-ice-cream",
    groupSlug: "rule1-whey-protein",
    flavor: "بستنی وانیلی",
    size: "۲٫۲۴ کیلوگرم",
    imageUrl: "/images/products/rule1-whey-protein-vanilla-ice-cream.webp",
    // Vanilla Ice Cream 5 lb: 68 × 33 g = 2.24 kg, as the pack says.
    description: `وی پروتئین رول وان با طعم بستنی وانیلی؛ پودر پروتئین وی معمولی از ترکیب کنسانتره، ایزوله و ایزوله‌ی هیدرولیزه‌ی وی. هر وعده (۱ اسکوپ، ۳۳ گرم) ۲۴ گرم پروتئین، ۳ گرم کربوهیدرات، ۲ گرم چربی و ۱۳۰ کیلوکالری دارد و قوطی ۲٫۲۴ کیلوگرمی ۶۸ وعده است.\nمواد تشکیل‌دهنده: ${rule1WheyBlend}، طعم‌دهنده‌های طبیعی و مصنوعی، و کمتر از ۲٪: صمغ سلولز، صمغ زانتان، سوکرالوز، آسه‌سولفام پتاسیم، لسیتین سویا، لسیتین آفتابگردان.`,
    servingSize: "۳۳ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۳۰ کیلوکالری" },
      { label: "چربی", amount: "۲ گرم" },
      { label: "چربی اشباع", amount: "۱ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۸۰ میلی‌گرم" },
      { label: "سدیم", amount: "۹۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۳ گرم" },
      { label: "فیبر", amount: "۰ گرم" },
      { label: "قندها", amount: "۱ گرم" },
      { label: "قند افزوده", amount: "۰ گرم" },
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "ویتامین D", amount: "۰ میکروگرم" },
      { label: "کلسیم", amount: "۱۶۰ میلی‌گرم" },
      { label: "آهن", amount: "۰ میلی‌گرم" },
      { label: "پتاسیم", amount: "۱۳۰ میلی‌گرم" },
    ],
    warnings: rule1WheyWarnings,
    manufacturerClaims: rule1WheyClaims,
    brand: "Rule 1",
    price: 3200000,
    categorySlug: "protein",
  },
  {
    id: "r1wc",
    name: "وی پروتئین - R1 Whey Protein",
    slug: "rule1-whey-protein-cookies-creme",
    groupSlug: "rule1-whey-protein",
    flavor: "کوکی و کرم",
    size: "۲٫۲۴ کیلوگرم",
    imageUrl: "/images/products/rule1-whey-protein-cookies-creme.webp",
    // Cookies & Crème 5 lb: 66 × 34 g = 2.24 kg, as the pack says.
    description: `وی پروتئین رول وان با طعم کوکی و کرم؛ پودر پروتئین وی معمولی از ترکیب کنسانتره، ایزوله و ایزوله‌ی هیدرولیزه‌ی وی. هر وعده (۱ اسکوپ، ۳۴ گرم) ۲۴ گرم پروتئین، ۴ گرم کربوهیدرات، ۲ گرم چربی و ۱۳۰ کیلوکالری دارد و قوطی ۲٫۲۴ کیلوگرمی ۶۶ وعده است.\nمواد تشکیل‌دهنده: ${rule1WheyBlend}، طعم‌دهنده‌های طبیعی و مصنوعی، تکه‌های کوکی (نشاسته‌ی تاپیوکا، آرد برنج، شکر، کاکائو [قلیایی‌شده]، روغن پالم، نمک، لیکور شکلات، طعم‌دهنده‌ی طبیعی، بی‌کربنات سدیم)، و کمتر از ۲٪: صمغ سلولز، صمغ زانتان، نمک، سوکرالوز، لسیتین سویا، لسیتین آفتابگردان.`,
    servingSize: "۳۴ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۳۰ کیلوکالری" },
      { label: "چربی", amount: "۲ گرم" },
      { label: "چربی اشباع", amount: "۱ گرم" },
      { label: "چربی ترانس", amount: "۰ گرم" },
      { label: "کلسترول", amount: "۸۰ میلی‌گرم" },
      { label: "سدیم", amount: "۱۴۰ میلی‌گرم" },
      { label: "کربوهیدرات", amount: "۴ گرم" },
      { label: "فیبر", amount: "۰ گرم" },
      { label: "قندها", amount: "۱ گرم" },
      { label: "قند افزوده", amount: "۰ گرم" },
      { label: "پروتئین", amount: "۲۴ گرم" },
      { label: "ویتامین D", amount: "۰ میکروگرم" },
      { label: "کلسیم", amount: "۱۶۰ میلی‌گرم" },
      { label: "آهن", amount: "۰٫۴ میلی‌گرم" },
      { label: "پتاسیم", amount: "۱۳۰ میلی‌گرم" },
    ],
    warnings: rule1WheyWarnings,
    manufacturerClaims: rule1WheyClaims,
    brand: "Rule 1",
    price: 3200000,
    categorySlug: "protein",
  },
  {
    id: "r1g",
    name: "گلوتامین - Glutamine",
    slug: "rule1-glutamine",
    flavor: "بدون طعم",
    size: "۳۹۸ گرم",
    imageUrl: "/images/products/rule1-glutamine.webp",
    // Unflavored 75 servings: 75 × 5.3 g ≈ 398 g (14.04 oz on the pack).
    description:
      "گلوتامین رول وان؛ ال-گلوتامین خالص و بدون طعم، بدون هیچ ماده‌ی دیگر، که به‌راحتی در مکمل‌های تمرینی، شیک پروتئین و آبمیوه حل می‌شود. هر وعده (حدود ۱ اسکوپ، ۵٫۳ گرم) ۵ گرم ال-گلوتامین و ۲۰ کیلوکالری دارد و قوطی ۳۹۸ گرمی ۷۵ وعده است.\nمواد تشکیل‌دهنده: ال-گلوتامین. سایر مواد: ندارد.",
    servingSize: "۵٫۳ گرم (حدود ۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۲۰ کیلوکالری" },
      { label: "ال-گلوتامین", amount: "۵ گرم" },
    ],
    usage:
      "۱ اسکوپ را با ۲۴۰ تا ۳۶۰ میلی‌لیتر (۸ تا ۱۲ اونس) نوشیدنی سرد دلخواه یا شیک پروتئین مخلوط کنید و پیش، حین یا بعد از تمرین مصرف کنید؛ بهترین زمان، حین یا بعد از تمرین است.",
    warnings:
      "دور از دسترس کودکان نگهداری شود. فقط برای بزرگسالان سالم و فعال.\nاگر دارو مصرف می‌کنید، تحت درمان پزشک هستید یا زیر ۱۸ سال هستید، پیش از مصرف با پزشک مشورت کنید.\nدر دوران بارداری، اقدام به بارداری یا شیردهی مصرف نکنید.",
    manufacturerClaims:
      "۵ گرم ال-گلوتامین خالص در هر وعده\nبه گفته‌ی سازنده: گلوتامین اسید آمینه‌ای نیمه‌ضروری و از اجزای سازنده‌ی پروتئین است؛ تمرین شدید و طولانی ذخایر بدن را کم می‌کند و این محصول به بالا نگه داشتن سطح گلوتامین و ریکاوری بعد از تمرین کمک می‌کند (این ادعا توسط FDA ارزیابی نشده است)",
    brand: "Rule 1",
    price: 1300000,
    categorySlug: "creatine",
  },
  {
    id: "r1ci",
    name: "سیترولین - Citrulline",
    slug: "rule1-citrulline",
    flavor: "بدون طعم",
    size: "۱۹۸ گرم",
    imageUrl: "/images/products/rule1-citrulline.webp",
    // Unflavored 60 servings: 60 × 3.3 g = 198 g (6.98 oz on the pack).
    description:
      "سیترولین رول وان (سری Essential)؛ ال-سیترولین خالص و بدون طعم، بدون طعم‌دهنده، شیرین‌کننده، رنگ یا پرکننده، که به‌راحتی در نوشیدنی‌های ورزشی یا مکمل‌های تمرینی حل می‌شود. هر وعده (۱ اسکوپ، ۳٫۳ گرم) ۳ گرم ال-سیترولین و ۱۰ کیلوکالری دارد و قوطی ۱۹۸ گرمی ۶۰ وعده است.\nمواد تشکیل‌دهنده: ال-سیترولین؛ کمتر از ۲٪: دی‌اکسید سیلیکون، سیلیکات کلسیم.",
    servingSize: "۳٫۳ گرم (۱ اسکوپ)",
    nutritionFacts: [
      { label: "انرژی", amount: "۱۰ کیلوکالری" },
      { label: "ال-سیترولین", amount: "۳ گرم" },
    ],
    usage:
      "۱ اسکوپ را در شیک پروتئین، نوشیدنی ورزشی، اسموتی یا نوشیدنی دلخواه حل کنید. پیش یا حین تمرین، و در روزهای بدون تمرین بین وعده‌ها مصرف کنید. همراه با رژیم غذایی متعادل و ورزش.",
    warnings:
      "دور از دسترس کودکان نگهداری شود. فقط برای بزرگسالان سالم.\nاگر زیر ۱۸ سال هستید، باردار هستید، اقدام به بارداری دارید یا شیر می‌دهید، مصرف نکنید.\nاگر دارو مصرف می‌کنید، تحت درمان بیماری هستید یا قصد جراحی دارید، پیش از مصرف با پزشک مشورت کنید.\nفقط طبق دستور مصرف کنید. همراه با الکل مصرف نکنید. ورزش نیاز بدن به آب را بیشتر می‌کند؛ هر روز آب کافی بنوشید.\nدر صورت بروز هر عارضه‌ی نامطلوب، فوراً مصرف را قطع کنید.",
    manufacturerClaims:
      "۳ گرم ال-سیترولین در هر وعده\nبدون طعم‌دهنده، شیرین‌کننده، رنگ یا پرکننده\nبه گفته‌ی سازنده: سیترولین به ساخت نیتریک اکسید (NO) کمک می‌کند که با گشاد کردن رگ‌ها رسیدن اکسیژن و مواد مغذی را بهتر می‌کند، و ممکن است خستگی عضله را در تمرین مقاومتی پرشدت به تأخیر بیندازد (این ادعا توسط FDA ارزیابی نشده است)",
    brand: "Rule 1",
    price: 1300000,
    categorySlug: "aminos",
  },
  {
    id: "r1m",
    name: "مس گینر - Mass Gainer",
    slug: "rule1-mass-gainer",
    groupSlug: "rule1-mass-gainer",
    flavor: "شکلات فاج",
    size: "۲٫۶ کیلوگرم",
    imageUrl: "/images/products/rule1-mass-gainer.webp",
    // Chocolate Fudge 8 servings, tub: 8 × 325 g = 2.6 kg (5.73 lb).
    description: `مس گینر رول وان با طعم شکلات فاج (قوطی)؛ گینر پرکالری برای افرادی که به‌سختی وزن می‌گیرند، با نسبت کربوهیدرات به پروتئین ۶ به ۱ و ۱ گرم کراتین مونوهیدرات. هر وعده (۲ اسکوپ پر، ۳۲۵ گرم) ۱۲۶۰ کیلوکالری، ۲۵۴ گرم کربوهیدرات و ۴۰ گرم پروتئین وی دارد و قوطی ۲٫۶ کیلوگرمی ۸ وعده است.\n${rule1MassGainerIngredients}`,
    servingSize: "۳۲۵ گرم (۲ اسکوپ پر)",
    nutritionFacts: rule1MassGainerFacts,
    usage: rule1MassGainerUsage,
    warnings: rule1MassGainerWarnings,
    manufacturerClaims: rule1MassGainerClaims,
    brand: "Rule 1",
    price: 2900000,
    categorySlug: "protein",
  },
  {
    id: "r1mb",
    name: "مس گینر - Mass Gainer",
    slug: "rule1-mass-gainer-5kg",
    groupSlug: "rule1-mass-gainer",
    flavor: "شکلات فاج",
    size: "۵٫۲ کیلوگرم",
    imageUrl: "/images/products/rule1-mass-gainer-5kg.webp",
    // Chocolate Fudge 16 servings, bag: 16 × 325 g = 5.2 kg (11.46 lb).
    description: `مس گینر رول وان با طعم شکلات فاج (کیسه)؛ گینر پرکالری برای افرادی که به‌سختی وزن می‌گیرند، با نسبت کربوهیدرات به پروتئین ۶ به ۱ و ۱ گرم کراتین مونوهیدرات. هر وعده (۲ اسکوپ پر، ۳۲۵ گرم) ۱۲۶۰ کیلوکالری، ۲۵۴ گرم کربوهیدرات و ۴۰ گرم پروتئین وی دارد و کیسه‌ی ۵٫۲ کیلوگرمی ۱۶ وعده است.\n${rule1MassGainerIngredients}`,
    servingSize: "۳۲۵ گرم (۲ اسکوپ پر)",
    nutritionFacts: rule1MassGainerFacts,
    usage: rule1MassGainerUsage,
    warnings: rule1MassGainerWarnings,
    manufacturerClaims: rule1MassGainerClaims,
    brand: "Rule 1",
    price: 5200000,
    categorySlug: "protein",
  },
  // Applied Nutrition
  ...appliedProducts,
  // Zoomad Labs: label and directions from zoomadlabs.com (pack photo and the
  // "Uso del producto" image). The unflavoured tub's panel is only partly
  // legible, so the table has just what the pack and the site both state.
  {
    id: "zl1",
    name: "کراتین وان رای - ONE RAW Creatine",
    slug: "zoomad-labs-one-raw-creatine",
    flavor: "بدون طعم",
    size: "۳۰۰ گرم",
    imageUrl: "/images/products/zoomad-one-raw-creatine.webp",
    // 100 servings × 3 g = 300 g, as the pack says.
    description:
      "کراتین وان رای زومات لب؛ کراتین مونوهیدرات خالص و بدون طعم با درجه‌ی ریزدانگی Ultrapure 200 Mesh (اندازه‌ی ذرات ۰٫۰۷۵ میلی‌متر). هر وعده (۱ اسکوپ، ۳ گرم) ۳ گرم کراتین مونوهیدرات دارد و قوطی ۳۰۰ گرمی ۱۰۰ وعده است.\nمواد تشکیل‌دهنده: کراتین مونوهیدرات (۱۰۰٪). ممکن است حاوی ردپایی از غلات حاوی گلوتن، تخم‌مرغ، شیر، ماهی، بادام‌زمینی و سویا باشد.",
    servingSize: "۳ گرم (۱ اسکوپ)",
    nutritionFacts: [{ label: "کراتین مونوهیدرات", amount: "۳ گرم" }],
    usage:
      "۳ گرم (۱ اسکوپ) را با حدود ۱۵۰ میلی‌لیتر نوشیدنی، ترجیحاً سرشار از کربوهیدرات (گلوکز یا دکستروز)، مخلوط کنید، خوب تکان دهید و روزی یک بار پیش از تمرین مصرف کنید.",
    warnings:
      "مکمل‌های غذایی نباید جایگزین رژیم غذایی متنوع و متعادل و سبک زندگی سالم شوند.\nاز مقدار مصرف روزانه‌ی توصیه‌شده بیشتر مصرف نکنید.\nدور از دسترس کودکان خردسال، در ظرف دربسته و در جای خنک و خشک نگهداری شود.",
    manufacturerClaims:
      "۳ گرم کراتین مونوهیدرات در هر وعده\nبه گفته‌ی سازنده: کراتین عملکرد بدنی را در تمرین‌های کوتاه و پرشدتِ پشت‌سرهم بهبود می‌دهد (این اثر با مصرف روزانه‌ی ۳ گرم حاصل می‌شود)\nمناسب گیاه‌خواران",
    brand: "Zoomad Labs",
    price: 900000,
    categorySlug: "creatine",
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
