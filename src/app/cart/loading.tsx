import Skeleton from "@/components/ui/Skeleton";

// Mirrors app/cart/CartPageClient.tsx: item rows beside a summary box.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <Skeleton className="h-8 w-32" />

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex gap-4 border-b border-zinc-200 py-6 dark:border-zinc-800"
            >
              <Skeleton className="h-24 w-24 shrink-0 rounded-none" />
              <div className="flex flex-1 flex-col">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="mt-2 h-4 w-24" />
                <Skeleton className="mt-auto h-8 w-28" />
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit border border-zinc-200 p-6 dark:border-zinc-800">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
          <Skeleton className="mt-4 h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
