import Skeleton from "@/components/ui/Skeleton";

// Same vertical rhythm as ProductCard (brand, two-line name, stars, price,
// button) so the grid doesn't jump when the real cards replace these.
export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="mt-4 h-3 w-1/4" />
      <div className="mt-1 flex min-h-10 flex-col gap-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="mt-1.5 h-4 w-1/3" />
      <Skeleton className="mt-1.5 h-4 w-2/5" />
      <Skeleton className="mt-3 h-11 w-full" />
    </div>
  );
}
