import type { Metadata } from "next";
import ProductCard from "@/components/product/ProductCard";
import FilterDropdown from "@/components/collections/FilterDropdown";
import SortSelect from "@/components/collections/SortSelect";
import Pagination from "@/components/ui/Pagination";
import { getAllProducts } from "@/lib/products";
import { countByAttribute, filterProducts, sortProducts, toParamArray } from "@/lib/catalogFilters";

export const metadata: Metadata = { title: "همه محصولات" };

const PAGE_SIZE = 12;

export default async function ProductsPage(props: PageProps<"/products">) {
  const { page: pageParam, sort, flavor, size } = await props.searchParams;
  const allProducts = await getAllProducts();

  const selectedFlavors = toParamArray(flavor);
  const selectedSizes = toParamArray(size);
  const sortValue = Array.isArray(sort) ? sort[0] : (sort ?? "featured");

  const filteredProducts = filterProducts(allProducts, {
    flavors: selectedFlavors,
    sizes: selectedSizes,
  });
  const sortedProducts = sortProducts(filteredProducts, sortValue);

  const flavorOptions = countByAttribute(allProducts, "flavor");
  const sizeOptions = countByAttribute(allProducts, "size");

  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  const pageProducts = sortedProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function hrefForPage(page: number) {
    const params = new URLSearchParams();
    for (const value of selectedFlavors) params.append("flavor", value);
    for (const value of selectedSizes) params.append("size", value);
    if (sortValue !== "featured") params.set("sort", sortValue);
    if (page !== 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-extrabold sm:text-4xl">همه محصولات</h1>
      <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
        از پروتئین و آمینو اسید گرفته تا پیش‌تمرین و چربی‌سوز، کل محصولات SK Supplement را در
        یک صفحه ببینید و مکملی که برای برنامه‌ی تمرینی‌تان نیاز دارید را پیدا کنید.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">فیلتر:</span>
          <FilterDropdown label="طعم" paramName="flavor" options={flavorOptions} />
          <FilterDropdown label="سایز" paramName="size" options={sizeOptions} />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">مرتب‌سازی:</span>
          <SortSelect />
          <span className="text-sm text-zinc-500">{sortedProducts.length} محصول</span>
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

      <Pagination currentPage={currentPage} totalPages={totalPages} hrefForPage={hrefForPage} />
    </div>
  );
}
