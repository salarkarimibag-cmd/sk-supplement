import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import CollectionHero from "@/components/collections/CollectionHero";
import FilterDropdown from "@/components/collections/FilterDropdown";
import SortSelect from "@/components/collections/SortSelect";
import ProteinInfoSection from "@/components/collections/ProteinInfoSection";
import AminosInfoSection from "@/components/collections/AminosInfoSection";
import FatBurnerInfoSection from "@/components/collections/FatBurnerInfoSection";
import PreWorkoutInfoSection from "@/components/collections/PreWorkoutInfoSection";
import CreatineInfoSection from "@/components/collections/CreatineInfoSection";
import VitaminsInfoSection from "@/components/collections/VitaminsInfoSection";
import { getCategoryContent } from "@/lib/categoryContent";
import { getProductsByCategory } from "@/lib/products";
import { countByAttribute, filterProducts, sortProducts, toParamArray } from "@/lib/catalogFilters";
import { pickShowcaseProducts } from "@/lib/showcase";
import { collapseGroups, formatVariantSummary } from "@/lib/variants";

/** How many of the category's products take turns in the hero. */
const HERO_PRODUCTS = 6;

// Long-form explanatory content shown below the product grid, keyed by category slug.
const infoSectionBySlug: Record<string, ComponentType> = {
  protein: ProteinInfoSection,
  aminos: AminosInfoSection,
  "fat-burner": FatBurnerInfoSection,
  "pre-workout": PreWorkoutInfoSection,
  creatine: CreatineInfoSection,
  vitamins: VitaminsInfoSection,
};

export async function generateMetadata(
  props: PageProps<"/collections/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const info = await getCategoryContent(slug);
  return { title: info?.title ?? "دسته‌بندی یافت نشد" };
}

export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const { slug } = await props.params;
  const { sort, flavor, size, brand } = await props.searchParams;
  const info = await getCategoryContent(slug);
  // Every category lives in the database, so an unknown or removed slug
  // (an old link to a deleted category) gets a real 404, not an empty page.
  if (!info) notFound();
  const categoryProducts = await getProductsByCategory(slug);

  const selectedFlavors = toParamArray(flavor);
  const selectedSizes = toParamArray(size);
  const selectedBrands = toParamArray(brand);
  const sortValue = Array.isArray(sort) ? sort[0] : (sort ?? "featured");

  // One card per flavor/size group (see collapseGroups).
  const products = collapseGroups(
    sortProducts(
      filterProducts(categoryProducts, {
        flavors: selectedFlavors,
        sizes: selectedSizes,
        brands: selectedBrands,
      }),
      sortValue
    )
  );
  const flavorOptions = countByAttribute(categoryProducts, "flavor");
  const sizeOptions = countByAttribute(categoryProducts, "size");
  const brandOptions = countByAttribute(categoryProducts, "brand");
  const InfoSection = infoSectionBySlug[slug];

  return (
    <div>
      <CollectionHero
        title={info.title}
        description={info.description}
        // Photos from the whole category, not just the filtered ones, in a
        // new random order on every visit with a different brand each turn
        // while there are brands left.
        products={pickShowcaseProducts(categoryProducts, () => true, HERO_PRODUCTS)}
      />

      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">فیلتر:</span>
            {brandOptions.length > 0 && (
              <FilterDropdown label="برند" paramName="brand" options={brandOptions} />
            )}
            <FilterDropdown label="طعم" paramName="flavor" options={flavorOptions} />
            {sizeOptions.length > 0 && (
              <FilterDropdown label="سایز" paramName="size" options={sizeOptions} />
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-500">مرتب‌سازی:</span>
            <SortSelect />
            <span className="text-sm text-zinc-500">{products.length.toLocaleString("fa-IR")} محصول</span>
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
                brand={product.brand}
                rating={product.rating}
                reviewCount={product.reviewCount}
                stock={product.stock}
                variantLabel={product.variantSummary && formatVariantSummary(product.variantSummary)}
              />
            ))}
          </div>
        )}
      </div>

      {InfoSection && <InfoSection />}
    </div>
  );
}
