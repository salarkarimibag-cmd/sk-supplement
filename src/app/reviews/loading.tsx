import Skeleton from "@/components/ui/Skeleton";

// Mirrors app/reviews/page.tsx: a centered title over a three-column grid of reviews.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <Skeleton className="mx-auto h-8 w-48" />

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
