import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Pagination from "@/components/ui/Pagination";
import StarRating from "@/components/ui/StarRating";
import Testimonials from "@/components/home/Testimonials";
import ProductCard from "@/components/product/ProductCard";
import ProductDetailPanel from "@/components/product/ProductDetailPanel";
import ProductInfo from "@/components/product/ProductInfo";
import TrustBadges from "@/components/product/TrustBadges";
import VariantPicker from "@/components/product/VariantPicker";
import ReviewForm from "@/components/reviews/ReviewForm";
import { getSessionUser } from "@/lib/auth";
import { getCategoryContent } from "@/lib/categoryContent";
import { getProductById, getProductGroup, getRelatedProducts } from "@/lib/products";
import { getProductReviewsPage } from "@/lib/reviews";
import { buildVariantOptions, formatVariantSummary } from "@/lib/variants";

const REVIEWS_PAGE_SIZE = 6;

export async function generateMetadata(
  props: PageProps<"/products/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const product = await getProductById(id);
  return { title: product?.name ?? "محصول یافت نشد" };
}

export default async function ProductPage(props: PageProps<"/products/[id]">) {
  const { id } = await props.params;
  const { reviews: reviewsPageParam } = await props.searchParams;
  const product = await getProductById(id);

  if (!product) notFound();

  const requestedReviewsPage =
    Number(Array.isArray(reviewsPageParam) ? reviewsPageParam[0] : reviewsPageParam) || 1;

  const [category, relatedProducts, reviewsPage, user, group] = await Promise.all([
    getCategoryContent(product.categorySlug),
    getRelatedProducts(product, 4),
    getProductReviewsPage(product.id, requestedReviewsPage, REVIEWS_PAGE_SIZE),
    getSessionUser(),
    product.groupSlug ? getProductGroup(product.groupSlug) : [],
  ]);

  // The #reviews anchor brings the shopper back to the reviews after the page loads.
  const productPath = `/products/${product.id}`;
  function reviewsHref(page: number) {
    return page === 1 ? `${productPath}#reviews` : `${productPath}?reviews=${page}#reviews`;
  }

  const variants = buildVariantOptions(product, group);
  const hasVariantChoice = variants.flavors.length > 1 || variants.sizes.length > 1;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <Link href="/" className="hover:underline">
          خانه
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/collections/${product.categorySlug}`} className="hover:underline">
              {category.title}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square bg-white">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            preload
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain"
          />
          {!product.inStock && (
            <span className="absolute bottom-3 right-3 rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
              ناموجود
            </span>
          )}
        </div>

        <div>
          {product.brand && (
            <p className="mb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              {product.brand}
            </p>
          )}
          <h1 className="text-2xl font-extrabold sm:text-3xl">{product.name}</h1>

          <StarRating rating={product.rating} reviewCount={product.reviewCount} className="mt-3" />

          <p className="mt-4 text-2xl font-bold">{product.price.toLocaleString("fa-IR")} تومان</p>

          {hasVariantChoice ? (
            <div className="mt-5">
              <VariantPicker flavors={variants.flavors} sizes={variants.sizes} />
            </div>
          ) : (product.flavor || product.size) && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              {product.flavor && (
                <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700">
                  طعم: {product.flavor}
                </span>
              )}
              {product.size && (
                <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700">
                  سایز: {product.size}
                </span>
              )}
            </div>
          )}

          <p className="mt-6 leading-relaxed whitespace-pre-line text-zinc-600 dark:text-zinc-400">
            {product.description ||
              `${product.name} یکی از محصولات ${category ? `دسته‌ی ${category.title}` : "SK Supplement"} است که کیفیت و اثربخشی آن مورد تایید مشتریان است.`}
          </p>

          <div className="mt-8">
            <ProductDetailPanel
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                inStock: product.inStock,
                stock: product.stock,
              }}
            />
          </div>

          <div className="mt-8">
            <TrustBadges />
          </div>

          <div className="mt-8">
            <ProductInfo
              servingSize={product.servingSize}
              nutritionFacts={product.nutritionFacts}
              usage={product.usage}
              warnings={product.warnings}
            />
          </div>
        </div>
      </div>

      <section id="reviews" aria-labelledby="reviews-heading" className="mt-20 scroll-mt-28">
        <h2
          id="reviews-heading"
          className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl"
        >
          نظرات خریداران
        </h2>

        {product.reviewCount > 0 ? (
          <>
            <StarRating
              rating={product.rating}
              reviewCount={product.reviewCount}
              className="mt-3 justify-center"
            />
            <div className="mt-10">
              <Testimonials reviews={reviewsPage.reviews} />
            </div>
            <Pagination
              currentPage={reviewsPage.currentPage}
              totalPages={reviewsPage.totalPages}
              hrefForPage={reviewsHref}
            />
          </>
        ) : (
          <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
            هنوز نظری برای این محصول ثبت نشده است. اولین نفر باشید!
          </p>
        )}

        {!user && (
          <p className="mx-auto mt-10 max-w-xl text-center text-sm text-zinc-500 dark:text-zinc-400">
            این محصول را خریده‌اید؟{" "}
            <Link
              href={`/account/login?next=${encodeURIComponent(`/products/${product.id}`)}`}
              className="font-semibold text-sky-600 hover:underline"
            >
              وارد حسابتان شوید
            </Link>{" "}
            تا نظرتان با برچسب «خریدار این محصول» نمایش داده شود.
          </p>
        )}

        <ReviewForm productId={product.id} />
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-10 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            محصولات مرتبط
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.id}
                id={related.id}
                name={related.name}
                price={related.price}
                imageUrl={related.imageUrl}
                brand={related.brand}
                rating={related.rating}
                reviewCount={related.reviewCount}
                inStock={related.inStock}
                variantLabel={related.variantSummary && formatVariantSummary(related.variantSummary)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
