import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import StarRating from "@/components/ui/StarRating";
import ProductDetailPanel from "@/components/product/ProductDetailPanel";
import { categoryInfo } from "@/data/catalog";
import { getProductById } from "@/lib/products";

export async function generateMetadata(
  props: PageProps<"/products/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const product = await getProductById(id);
  return { title: product?.name ?? "محصول یافت نشد" };
}

export default async function ProductPage(props: PageProps<"/products/[id]">) {
  const { id } = await props.params;
  const product = await getProductById(id);

  if (!product) notFound();

  const category = categoryInfo[product.categorySlug];

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
            priority
            className="object-contain"
          />
          {!product.inStock && (
            <span className="absolute bottom-3 right-3 rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
              ناموجود
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{product.name}</h1>

          <div className="mt-3">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>

          <p className="mt-4 text-2xl font-bold">{product.price.toLocaleString("fa-IR")} تومان</p>

          {(product.flavor || product.size) && (
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

          <p className="mt-6 leading-relaxed text-zinc-600 dark:text-zinc-400">
            {product.description ||
              `${product.name} یکی از محصولات ${category ? `دسته‌ی ${category.title}` : "SK Supplement"} است که کیفیت و اثربخشی آن مورد تایید مشتریان است.`}
          </p>

          <div className="mt-8">
            <ProductDetailPanel product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
