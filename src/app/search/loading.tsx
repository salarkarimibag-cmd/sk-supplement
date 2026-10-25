import Skeleton from "@/components/ui/Skeleton";
import ProductGridSkeleton from "@/components/product/ProductGridSkeleton";

// Mirrors app/search/page.tsx; 12 cards is its PAGE_SIZE.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-3 h-4 w-56" />

      <ProductGridSkeleton count={12} className="mt-10" />
    </div>
  );
}
