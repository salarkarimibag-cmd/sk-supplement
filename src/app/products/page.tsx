import type { Metadata } from "next";
import ProductCard from "@/components/product/ProductCard";
import FilterDropdown from "@/components/collections/FilterDropdown";
import Pagination from "@/components/ui/Pagination";
import { defaultFilterOptions, filterOptionsBySlug, productsBySlug } from "@/data/catalog";

export const metadata: Metadata = { title: "همه محصولات" };

// TODO: fetch the full catalog from /api/products instead of flattening the local mock data.
const allProducts = Object.values(productsBySlug).flat();

const allFlavors = [
  ...new Set([
    ...defaultFilterOptions.flavors,
    ...Object.values(filterOptionsBySlug).flatMap((options) => options.flavors),
  ]),
];

const allSizes = [
  ...new Set([
    ...(defaultFilterOptions.sizes ?? []),
    ...Object.values(filterOptionsBySlug).flatMap((options) => options.sizes ?? []),
  ]),
];

const PAGE_SIZE = 12;

export default async function ProductsPage(props: PageProps<"/products">) {
  const { page: pageParam } = await props.searchParams;
  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;

  const totalPages = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  const pageProducts = allProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-extrabold sm:text-4xl">همه محصولات</h1>
      <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
        از پروتئین و آمینو اسید گرفته تا پیش‌تمرین و چربی‌سوز، کل محصولات SK Supplement را در
        یک صفحه ببینید و مکملی که برای برنامه‌ی تمرینی‌تان نیاز دارید را پیدا کنید.
      </p>

      {/* TODO: wire up real filtering/sorting once products carry flavor/size options and come from the API. */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">فیلتر:</span>
          <FilterDropdown label="طعم" options={allFlavors} />
          <FilterDropdown label="سایز" options={allSizes} />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">مرتب‌سازی:</span>
          <select aria-label="مرتب‌سازی" className="cursor-pointer bg-transparent text-sm">
            <option>پرفروش‌ترین</option>
            <option>جدیدترین</option>
            <option>ارزان‌ترین</option>
            <option>گران‌ترین</option>
            <option>الفبا (آ-ی)</option>
            <option>الفبا (ی-آ)</option>
          </select>
          <span className="text-sm text-zinc-500">{allProducts.length} محصول</span>
        </div>
      </div>

      {pageProducts.length === 0 ? (
        <p className="mt-10 text-zinc-600 dark:text-zinc-400">محصولی پیدا نشد.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
          {pageProducts.map((product) => (
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        hrefForPage={(page) => (page === 1 ? "/products" : `/products?page=${page}`)}
      />
    </div>
  );
}
