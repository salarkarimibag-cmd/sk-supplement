import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import Newsletter from "@/components/home/Newsletter";
import HeroBanner from "@/components/home/HeroBanner";
import PromoBanner from "@/components/home/PromoBanner";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import Testimonials from "@/components/home/Testimonials";
import ReviewForm from "@/components/reviews/ReviewForm";
import LatestArticles from "@/components/home/LatestArticles";
import { getBestSellers, getLatestProducts } from "@/lib/products";
import { getHomepageReviews } from "@/lib/reviews";
import { formatVariantSummary } from "@/lib/variants";

export default async function Home() {
  const [latestProducts, bestSellers, { reviews, totalCount: reviewsCount }] = await Promise.all([
    getLatestProducts(4),
    getBestSellers(4),
    getHomepageReviews(),
  ]);

  return (
    <div className="flex w-full flex-col gap-12 pb-12">
      <HeroBanner />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <section>
          <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
            آخرین محصولات
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {latestProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                rating={product.rating}
                reviewCount={product.reviewCount}
                inStock={product.inStock}
                variantLabel={product.variantSummary && formatVariantSummary(product.variantSummary)}
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
        {bestSellers.length > 0 && (
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
                  variantLabel={product.variantSummary && formatVariantSummary(product.variantSummary)}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight uppercase sm:text-4xl">
            نظرات مشتریان
          </h2>
          <Testimonials reviews={reviews} />

          {reviewsCount > reviews.length && (
            <div className="mt-8 text-center">
              <Link
                href="/reviews"
                className="inline-block rounded border border-sky-600 px-6 py-2.5 text-sm font-semibold text-sky-600 transition hover:bg-sky-600 hover:text-white"
              >
                مشاهده همه نظرات
              </Link>
            </div>
          )}

          <ReviewForm />
        </section>

        <LatestArticles />
      </div>
    </div>
  );
}
