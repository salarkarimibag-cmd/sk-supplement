import type { Metadata } from "next";
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import FilterDropdown from "@/components/collections/FilterDropdown";
import ProteinInfoSection from "@/components/collections/ProteinInfoSection";
import AminosInfoSection from "@/components/collections/AminosInfoSection";
import FatBurnerInfoSection from "@/components/collections/FatBurnerInfoSection";
import PreWorkoutInfoSection from "@/components/collections/PreWorkoutInfoSection";
import type { Product } from "@/models/Product";

interface CategoryInfo {
  title: string;
  description: string;
  bannerImage: string;
  /** CSS aspect-ratio value matching the banner image's natural dimensions. */
  bannerAspect: string;
}

// TODO: replace with real category content fetched from the database.
const categoryInfo: Record<string, CategoryInfo> = {
  protein: {
    title: "پروتئین‌ها",
    description:
      "پروتئینی که برای سوخت‌رسانی به تمرین‌هایتان نیاز دارید را از محصولات SK Supplement تهیه کنید. طیف پودرها و شیک‌های پروتئینی ما برای هر برنامه‌ی تمرینی مناسب است.",
    bannerImage: "/images/category-protein.webp",
    bannerAspect: "3 / 1",
  },
  "pre-workout": {
    title: "پیش‌تمرین‌ها",
    description: "انرژی و تمرکز لازم برای بهترین عملکرد در باشگاه را با پیش‌تمرین‌های ما تجربه کنید.",
    bannerImage: "/images/collection-banner-pre-workout.webp",
    bannerAspect: "4.8 / 1",
  },
  "fat-burner": {
    title: "چربی‌سوزها",
    description:
      "چربی بسوزانید و مسیر کاهش وزنتان را با مجموعه‌ی چربی‌سوزهای SK Supplement تقویت کنید. محصولات ما برای همراهی با رژیم غذایی و برنامه‌ی تمرینی‌تان طراحی شده‌اند.",
    bannerImage: "/images/collection-banner-fat-burner.webp",
    bannerAspect: "4.8 / 1",
  },
  aminos: {
    title: "آمینو اسیدها",
    description: "ریکاوری بهتر و عضله‌سازی موثرتر با آمینو اسیدهای ضروری بدن.",
    bannerImage: "/images/collection-banner-aminos.webp",
    bannerAspect: "3 / 1",
  },
};

interface FilterOptions {
  flavors: string[];
  sizes?: string[];
}

const defaultFilterOptions: FilterOptions = {
  flavors: ["شکلاتی", "وانیلی", "موزی", "بدون طعم"],
  sizes: ["۲۱ وعده", "۲۳ وعده", "۵۰ وعده", "۶۹ وعده", "۷۰ وعده"],
};

// TODO: replace with real flavor/size options (and their in-stock counts) fetched with the products.
const filterOptionsBySlug: Record<string, FilterOptions> = {
  "fat-burner": {
    flavors: [
      "فروت پانچ (۲)",
      "لیموناد صورتی (۱)",
      "رینبو آیس (۱)",
      "اسنو کون (۱)",
      "انبه‌ی استوایی (۱)",
      "هندوانه یخی (۱)",
    ],
    sizes: ["۲۵ وعده (۱)"],
  },
  aminos: {
    flavors: [
      "آرکتیک آیس (۱)",
      "بری سیتروس (۱)",
      "بلو راسبری (۱)",
      "بلو راز (۱)",
      "پنبه‌شکری (۱)",
      "فروت پانچ (۳)",
      "انگور (۱)",
      "لیمو بری (۱)",
      "لایم شربت (۱)",
      "پشن فروت (۱)",
      "پلامبری (۱)",
      "رینبو آیس (۱)",
      "ساور پاور (۱)",
    ],
  },
  "pre-workout": {
    flavors: ["بلو راسبری (۲)", "بلو راز (۱)", "فروت پانچ (۳)", "ساور گامی (۲)"],
  },
};

// TODO: fetch products for this category from /api/products?category=<slug>.
const productsBySlug: Record<
  string,
  (Product & { rating: number; reviewCount: number; inStock: boolean })[]
> = {
  protein: [
    {
      id: "p1",
      name: "وی پروتئین ایزوله",
      slug: "whey-protein-isolate",
      description: "",
      price: 1250000,
      categorySlug: "protein",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 5,
      reviewCount: 64,
      inStock: true,
    },
    {
      id: "p2",
      name: "پروتئین گیاهی وگان",
      slug: "vegan-protein",
      description: "",
      price: 980000,
      categorySlug: "protein",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 4,
      reviewCount: 22,
      inStock: true,
    },
    {
      id: "p3",
      name: "کازئین شبانه",
      slug: "casein-night",
      description: "",
      price: 1090000,
      categorySlug: "protein",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 5,
      reviewCount: 41,
      inStock: true,
    },
    {
      id: "p4",
      name: "پروتئین وی کنسانتره",
      slug: "whey-concentrate",
      description: "",
      price: 890000,
      categorySlug: "protein",
      imageUrl: "/images/placeholder.svg",
      stock: 0,
      rating: 4,
      reviewCount: 17,
      inStock: false,
    },
    {
      id: "p5",
      name: "بست پروتئین - ترکیبی",
      slug: "best-protein-blend",
      description: "",
      price: 2270000,
      categorySlug: "protein",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 5,
      reviewCount: 38,
      inStock: true,
    },
    {
      id: "p6",
      name: "بالک ماسل XL - گینر حجم‌ساز",
      slug: "bulk-muscle-xl",
      description: "",
      price: 1990000,
      categorySlug: "protein",
      imageUrl: "/images/placeholder.svg",
      stock: 0,
      rating: 4,
      reviewCount: 12,
      inStock: false,
    },
  ],
  aminos: [
    {
      id: "a1",
      name: "بست EAA - آمینو اسید ضروری",
      slug: "best-eaa",
      description: "",
      price: 1290000,
      categorySlug: "aminos",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 5,
      reviewCount: 33,
      inStock: true,
    },
    {
      id: "a2",
      name: "بست BCAA شردد - ریکاوری و کاهش وزن",
      slug: "best-bcaa-shredded",
      description: "",
      price: 1150000,
      categorySlug: "aminos",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 4,
      reviewCount: 19,
      inStock: true,
    },
    {
      id: "a3",
      name: "بست BCAA - آمینو اسید شاخه‌دار",
      slug: "best-bcaa",
      description: "",
      price: 1220000,
      categorySlug: "aminos",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 5,
      reviewCount: 27,
      inStock: true,
    },
    {
      id: "a4",
      name: "بست آمینوز - مکمل ریکاوری عضلانی",
      slug: "best-aminos",
      description: "",
      price: 770000,
      categorySlug: "aminos",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 4,
      reviewCount: 15,
      inStock: true,
    },
    {
      id: "a5",
      name: "گلوتامین خالص",
      slug: "pure-glutamine",
      description: "",
      price: 690000,
      categorySlug: "aminos",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 5,
      reviewCount: 21,
      inStock: true,
    },
    {
      id: "a6",
      name: "آمینو انرژی - EAA انرژی‌زا",
      slug: "amino-energy",
      description: "",
      price: 990000,
      categorySlug: "aminos",
      imageUrl: "/images/placeholder.svg",
      stock: 0,
      rating: 4,
      reviewCount: 9,
      inStock: false,
    },
  ],
  "fat-burner": [
    {
      id: "f1",
      name: "راکسی‌لین - چربی‌سوز و تمرکز",
      slug: "roxylean",
      description: "",
      price: 1490000,
      categorySlug: "fat-burner",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 5,
      reviewCount: 46,
      inStock: true,
    },
    {
      id: "f2",
      name: "کاهش وزن کتو - چربی‌سوز",
      slug: "keto-weight-loss",
      description: "",
      price: 1150000,
      categorySlug: "fat-burner",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 4,
      reviewCount: 30,
      inStock: true,
    },
    {
      id: "f3",
      name: "نایت برن - چربی‌سوز شبانه",
      slug: "nite-burn",
      description: "",
      price: 1290000,
      categorySlug: "fat-burner",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 5,
      reviewCount: 89,
      inStock: true,
    },
    {
      id: "f4",
      name: "CLA + کارنیتین",
      slug: "cla-carnitine",
      description: "",
      price: 890000,
      categorySlug: "fat-burner",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 4,
      reviewCount: 24,
      inStock: true,
    },
    {
      id: "f5",
      name: "ترموژنیک اکستریم",
      slug: "thermogenic-extreme",
      description: "",
      price: 1350000,
      categorySlug: "fat-burner",
      imageUrl: "/images/placeholder.svg",
      stock: 0,
      rating: 4,
      reviewCount: 11,
      inStock: false,
    },
    {
      id: "f6",
      name: "کافئین بدون قند - انرژی‌زا",
      slug: "sugar-free-caffeine",
      description: "",
      price: 590000,
      categorySlug: "fat-burner",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 5,
      reviewCount: 18,
      inStock: true,
    },
  ],
  "pre-workout": [
    {
      id: "pw1",
      name: "پیش‌تمرین OG - فرمول کلاسیک",
      slug: "og-pre-workout",
      description: "",
      price: 1390000,
      categorySlug: "pre-workout",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 5,
      reviewCount: 52,
      inStock: true,
    },
    {
      id: "pw2",
      name: "ورتکس - پشتیبان انرژی",
      slug: "vortex-energy",
      description: "",
      price: 790000,
      categorySlug: "pre-workout",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      rating: 4,
      reviewCount: 28,
      inStock: true,
    },
    {
      id: "pw3",
      name: "هپی پیلز - فرمول احساس خوب",
      slug: "happy-pills",
      description: "",
      price: 920000,
      categorySlug: "pre-workout",
      imageUrl: "/images/placeholder.svg",
      stock: 0,
      rating: 4,
      reviewCount: 14,
      inStock: false,
    },
  ],
};

// TODO: replace with the real category name once categories are fetched from the database.
export async function generateMetadata(
  props: PageProps<"/collections/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: categoryInfo[slug]?.title ?? `دسته‌بندی: ${slug}` };
}

export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;
  const info = categoryInfo[slug];
  const products = productsBySlug[slug] ?? [];
  const filterOptions = filterOptionsBySlug[slug] ?? defaultFilterOptions;

  if (!info) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-bold">دسته‌بندی: {slug}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          محصولات این دسته به‌زودی نمایش داده می‌شوند.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900"
        style={{ aspectRatio: info.bannerAspect }}
      >
        <Image src={info.bannerImage} alt={info.title} fill className="object-cover" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{info.title}</h1>
        <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">{info.description}</p>

        {/* TODO: wire up real filtering/sorting once products carry flavor/size options and come from the API. */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">فیلتر:</span>
            <FilterDropdown label="طعم" options={filterOptions.flavors} />
            {filterOptions.sizes && <FilterDropdown label="سایز" options={filterOptions.sizes} />}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">مرتب‌سازی:</span>
            <select
              aria-label="مرتب‌سازی"
              className="cursor-pointer bg-transparent text-sm"
            >
              <option>پرفروش‌ترین</option>
              <option>مرتبط‌ترین</option>
              <option>جدیدترین</option>
              <option>ارزان‌ترین</option>
              <option>گران‌ترین</option>
              <option>الفبا (آ-ی)</option>
              <option>الفبا (ی-آ)</option>
            </select>
            <span className="text-sm text-zinc-500">{products.length} محصول</span>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="mt-10 text-zinc-600 dark:text-zinc-400">
            محصولی در این دسته پیدا نشد.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                inStock={product.inStock}
              />
            ))}
          </div>
        )}
      </div>

      {/* TODO: generalize this long-form content per category once every slug has its own copy. */}
      {slug === "protein" && <ProteinInfoSection />}
      {slug === "aminos" && <AminosInfoSection />}
      {slug === "fat-burner" && <FatBurnerInfoSection />}
      {slug === "pre-workout" && <PreWorkoutInfoSection />}
    </div>
  );
}
