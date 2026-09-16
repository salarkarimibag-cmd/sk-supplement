import type { Metadata } from "next";
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import FilterDropdown from "@/components/collections/FilterDropdown";
import ProteinInfoSection from "@/components/collections/ProteinInfoSection";
import AminosInfoSection from "@/components/collections/AminosInfoSection";
import FatBurnerInfoSection from "@/components/collections/FatBurnerInfoSection";
import PreWorkoutInfoSection from "@/components/collections/PreWorkoutInfoSection";
import { categoryInfo, defaultFilterOptions, filterOptionsBySlug, productsBySlug } from "@/data/catalog";

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
