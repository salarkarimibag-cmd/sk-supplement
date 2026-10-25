import Skeleton from "@/components/ui/Skeleton";
import ProductGridSkeleton from "@/components/product/ProductGridSkeleton";

export default function Loading() {
  return (
    <div className="flex w-full flex-col gap-12 pb-12">
      <Skeleton className="h-105 w-full rounded-none" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
        <section>
          <Skeleton className="mx-auto mb-10 h-8 w-56" />
          <ProductGridSkeleton count={4} />
        </section>
      </div>
    </div>
  );
}
