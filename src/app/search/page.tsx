import type { Metadata } from "next";
import ProductCard from "@/components/product/ProductCard";
import Pagination from "@/components/ui/Pagination";
import { productsBySlug } from "@/data/catalog";

export const metadata: Metadata = { title: "نتایج جستجو" };

// TODO: fetch the full catalog from /api/products instead of flattening the local mock data.
const allProducts = Object.values(productsBySlug).flat();

const PAGE_SIZE = 12;

export default async function SearchPage(props: PageProps<"/search">) {
  const { q, page: pageParam } = await props.searchParams;
  const query = (Array.isArray(q) ? q[0] : (q ?? "")).trim();

  const results = query
    ? allProducts.filter((product) => product.name.includes(query))
    : [];

  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  const pageResults = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function hrefForPage(page: number) {
    const params = new URLSearchParams({ q: query });
    if (page !== 1) params.set("page", String(page));
    return `/search?${params.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold">نتایج جستجو</h1>
      {query ? (
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {results.length} نتیجه برای «{query}»
        </p>
      ) : (
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          عبارتی برای جستجو وارد کنید.
        </p>
      )}

      {query && pageResults.length === 0 ? (
        <p className="mt-10 text-zinc-600 dark:text-zinc-400">محصولی پیدا نشد.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
          {pageResults.map((product) => (
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
