import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";

interface ProductGridSkeletonProps {
  /** How many placeholder cards to show; match the page's real page size. */
  count: number;
  className?: string;
}

/** The same grid the real pages use, filled with product card placeholders. */
export default function ProductGridSkeleton({ count, className = "" }: ProductGridSkeletonProps) {
  return (
    <div
      className={`grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
