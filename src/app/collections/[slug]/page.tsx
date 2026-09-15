import type { Metadata } from "next";
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import FilterDropdown from "@/components/collections/FilterDropdown";
import ProteinInfoSection from "@/components/collections/ProteinInfoSection";
import type { Product } from "@/models/Product";

interface CategoryInfo {
  title: string;
  description: string;
  bannerImage: string;
}

// TODO: replace with real category content fetched from the database.
const categoryInfo: Record<string, CategoryInfo> = {
  protein: {
    title: "پروتئین‌ها",
    description:
      "پروتئینی که برای سوخت‌رسانی به تمرین‌هایتان نیاز دارید را از محصولات SK Supplement تهیه کنید. طیف پودرها و شیک‌های پروتئینی ما برای هر برنامه‌ی تمرینی مناسب است.",
    bannerImage: "/images/category-protein.webp",
  },
  "pre-workout": {
    title: "پیش‌تمرین‌ها",
    description: "انرژی و تمرکز لازم برای بهترین عملکرد در باشگاه را با پیش‌تمرین‌های ما تجربه کنید.",
    bannerImage: "/images/category-pre-workout.webp",
  },
  "fat-burner": {
    title: "چربی‌سوزها",
    description: "به هدف کاهش وزن خود با چربی‌سوزهای باکیفیت SK Supplement سریع‌تر برسید.",
    bannerImage: "/images/category-fat-burner.webp",
  },
  aminos: {
    title: "آمینو اسیدها",
    description: "ریکاوری بهتر و عضله‌سازی موثرتر با آمینو اسیدهای ضروری بدن.",
    bannerImage: "/images/category-aminos.webp",
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
      <div className="relative aspect-[4.6/1] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Image src={info.bannerImage} alt={info.title} fill className="object-cover" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{info.title}</h1>
        <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">{info.description}</p>

        {/* TODO: wire up real filtering/sorting once products carry flavor/size options and come from the API. */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">فیلتر:</span>
            <FilterDropdown label="طعم" options={["شکلاتی", "وانیلی", "موزی", "بدون طعم"]} />
            <FilterDropdown
              label="سایز"
              options={["۲۱ وعده", "۲۳ وعده", "۵۰ وعده", "۶۹ وعده", "۷۰ وعده"]}
            />
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
    </div>
  );
}
