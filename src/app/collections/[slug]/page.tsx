import type { Metadata } from "next";
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import FilterDropdown from "@/components/collections/FilterDropdown";
import SortSelect from "@/components/collections/SortSelect";
import ProteinInfoSection from "@/components/collections/ProteinInfoSection";
import AminosInfoSection from "@/components/collections/AminosInfoSection";
import FatBurnerInfoSection from "@/components/collections/FatBurnerInfoSection";
import PreWorkoutInfoSection from "@/components/collections/PreWorkoutInfoSection";
import { categoryInfo } from "@/data/catalog";
import { getProductsByCategory } from "@/lib/products";
import { countByAttribute, filterProducts, sortProducts, toParamArray } from "@/lib/catalogFilters";

// TODO: replace with the real category name once categories are fetched from the database.
export async function generateMetadata(
  props: PageProps<"/collections/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: categoryInfo[slug]?.title ?? `دسته‌بندی: ${slug}` };
}

export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;
  const { sort, flavor, size } = await props.searchParams;
  const info = categoryInfo[slug];
  const categoryProducts = await getProductsByCategory(slug);

  const selectedFlavors = toParamArray(flavor);
  const selectedSizes = toParamArray(size);
  const sortValue = Array.isArray(sort) ? sort[0] : (sort ?? "featured");

  const products = sortProducts(
    filterProducts(categoryProducts, { flavors: selectedFlavors, sizes: selectedSizes }),
    sortValue
  );
  const flavorOptions = countByAttribute(categoryProducts, "flavor");
  const sizeOptions = countByAttribute(categoryProducts, "size");

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

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">فیلتر:</span>
            <FilterDropdown label="طعم" paramName="flavor" options={flavorOptions} />
            {sizeOptions.length > 0 && (
              <FilterDropdown label="سایز" paramName="size" options={sizeOptions} />
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">مرتب‌سازی:</span>
            <SortSelect />
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
