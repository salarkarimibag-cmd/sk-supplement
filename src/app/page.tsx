import ProductCard from "@/components/ProductCard";
import Newsletter from "@/components/Newsletter";
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
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
      <section className="text-center sm:text-right">
        <h1 className="text-3xl font-bold tracking-tight">SK Supplement</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          مکمل‌های ورزشی با کیفیت، برای اهداف شما.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">محصولات ویژه</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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

      <Newsletter />
    </div>
  );
}
