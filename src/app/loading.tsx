import Skeleton from "@/components/ui/Skeleton";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";

export default function Loading() {
  return (
    <div className="flex w-full flex-col gap-12 pb-12">
      <Skeleton className="h-[420px] w-full rounded-none" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <section>
          <Skeleton className="mx-auto mb-10 h-8 w-56" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
