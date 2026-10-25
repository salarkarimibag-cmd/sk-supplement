import Skeleton from "@/components/ui/Skeleton";
import CatalogToolbarSkeleton from "@/components/collections/CatalogToolbarSkeleton";
import ProductGridSkeleton from "@/components/product/ProductGridSkeleton";

// Mirrors app/products/page.tsx; 12 cards is its PAGE_SIZE.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <Skeleton className="h-9 w-48 sm:h-10" />
      <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
      <Skeleton className="mt-2 h-4 w-2/3 max-w-xl" />

      <div className="mt-8">
        <CatalogToolbarSkeleton />
      </div>

      <ProductGridSkeleton count={12} className="mt-10" />
    </div>
  );
}
