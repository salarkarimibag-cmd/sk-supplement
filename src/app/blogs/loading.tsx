import Skeleton from "@/components/ui/Skeleton";

// Mirrors app/blogs/page.tsx: a two-column grid of cover + title + date + excerpt.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <Skeleton className="h-8 w-24" />

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="aspect-video w-full rounded-none" />
            <Skeleton className="mt-4 h-6 w-4/5" />
            <Skeleton className="mt-2 h-3 w-40" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
