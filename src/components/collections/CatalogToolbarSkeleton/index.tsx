import Skeleton from "@/components/ui/Skeleton";

/**
 * Placeholder for the filter dropdowns and sort select above a product grid
 * (products page and category pages).
 */
export default function CatalogToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
