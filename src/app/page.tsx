import ProductCard from "@/components/product/ProductCard";
import Newsletter from "@/components/home/Newsletter";
import HeroBanner from "@/components/home/HeroBanner";
import PromoBanner from "@/components/home/PromoBanner";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import Testimonials from "@/components/home/Testimonials";
import LatestArticles from "@/components/home/LatestArticles";
import type { Product } from "@/models/Product";

// TODO: fetch featured products from /api/products instead of hardcoding.
const featuredProducts: Product[] = [
  {
    id: "1",
    name: "وی پروتئین ایزوله",
    slug: "whey-protein-isolate",
    description: "",
    price: 1250000,
    categorySlug: "protein",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
  },
  {
    id: "2",
    name: "پری ورکات انرژی‌زا",
    slug: "pre-workout-energy",
    description: "",
    price: 890000,
    categorySlug: "pre-workout",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
  },
  {
    id: "3",
    name: "کراتین مونوهیدرات",
    slug: "creatine-monohydrate",
    description: "",
    price: 650000,
    categorySlug: "creatine",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
  },
  {
    id: "4",
    name: "آمینو اسید BCAA",
    slug: "bcaa-amino",
    description: "",
    price: 720000,
    categorySlug: "aminos",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
  },
];

// TODO: fetch best sellers from /api/products instead of hardcoding.
const bestSellers: (Product & { rating: number; reviewCount: number; inStock: boolean })[] = [
  {
    id: "5",
    name: "کاهش وزن کتو - چربی‌سوز",
    slug: "keto-weight-loss",
    description: "",
    price: 1150000,
    categorySlug: "fat-burner",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    rating: 5,
    reviewCount: 30,
    inStock: true,
  },
  {
    id: "6",
    name: "نایت برن - کاهش وزن و خواب",
    slug: "nite-burn",
    description: "",
    price: 1490000,
    categorySlug: "fat-burner",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    rating: 5,
    reviewCount: 89,
    inStock: true,
  },
  {
    id: "7",
    name: "راکسی‌لین - چربی‌سوز",
    slug: "roxylean",
    description: "",
    price: 1150000,
    categorySlug: "fat-burner",
    imageUrl: "/images/placeholder.svg",
    stock: 10,
    rating: 5,
    reviewCount: 92,
    inStock: true,
  },
  {
    id: "8",
    name: "A-HD الیت / سالید - تستوسترون بوستر",
    slug: "ahd-elite-solid",
    description: "",
    price: 1090000,
    categorySlug: "creatine",
    imageUrl: "/images/placeholder.svg",
    stock: 0,
    rating: 5,
    reviewCount: 46,
    inStock: false,
  },
];

export default function Home() {
  return (
    <div className="flex w-full flex-col gap-12 pb-12">
      <HeroBanner />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <section>
          <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
            آخرین محصولات
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
              />
            ))}
          </div>
        </section>

        <section>
          <CategoryShowcase />
        </section>

        <p className="shine">True Strength</p>
      </div>

      <div>
        <PromoBanner />
        <Newsletter />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <section>
          <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
            پرفروش‌ترین‌ها
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                rating={product.rating}
                reviewCount={product.reviewCount}
                inStock={product.inStock}
              />
            ))}
          </div>
        </section>

        <Testimonials />

        <LatestArticles />
      </div>
    </div>
  );
}
