import Skeleton from "@/components/ui/Skeleton";
import ProductGridSkeleton from "@/components/product/ProductGridSkeleton";

// Mirrors app/products/[id]/page.tsx: breadcrumb, photo + details, reviews, related products.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <Skeleton className="h-4 w-64" />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full" />

        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-8 w-4/5" />
          <Skeleton className="mt-4 h-5 w-36" />
          <Skeleton className="mt-4 h-8 w-40" />

          <div className="mt-5 flex gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>

          <Skeleton className="mt-6 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />

          {/* ProductDetailPanel: quantity stepper beside the add-to-cart button. */}
          <div className="mt-8 flex items-center gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 flex-1" />
          </div>

          {/* TrustBadges: four claims in two columns under a divider. */}
          <div className="mt-8 grid gap-3 border-t border-zinc-200 pt-6 sm:grid-cols-2 dark:border-zinc-800">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>

          {/* ProductInfo: collapsed accordion rows. */}
          <div className="mt-8 flex flex-col gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>

      <section className="mt-20">
        <Skeleton className="mx-auto h-8 w-48" />
        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Skeleton className="mx-auto mb-10 h-8 w-48" />
        <ProductGridSkeleton count={4} />
      </section>
    </div>
  );
}
