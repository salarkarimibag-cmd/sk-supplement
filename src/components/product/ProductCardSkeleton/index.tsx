import Skeleton from "@/components/ui/Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="mt-4 h-4 w-4/5" />
      <Skeleton className="mt-2 h-4 w-1/3" />
      <Skeleton className="mt-2 h-4 w-2/5" />
      <Skeleton className="mt-3 h-11 w-full" />
    </div>
  );
}
