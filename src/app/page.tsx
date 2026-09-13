import ProductCard from "@/components/ProductCard";
import Newsletter from "@/components/Newsletter";
import HeroBanner from "@/components/HeroBanner";
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
    <div className="flex w-full flex-col gap-12 pb-12">
      <HeroBanner />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <section>
          <h2 className="mb-4 text-xl font-semibold">آخرین محصولات</h2>
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
    </div>
  );
}
