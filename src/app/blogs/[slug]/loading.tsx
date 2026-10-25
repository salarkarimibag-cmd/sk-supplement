import Skeleton from "@/components/ui/Skeleton";

// Mirrors app/blogs/[slug]/page.tsx: cover, title, date line, then paragraphs.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <Skeleton className="aspect-video w-full rounded-none" />

      <Skeleton className="mt-8 h-8 w-4/5 sm:h-9" />
      <Skeleton className="mt-3 h-3 w-40" />

      <div className="mt-6 flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
