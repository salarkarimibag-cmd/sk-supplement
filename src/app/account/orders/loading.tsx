import Skeleton from "@/components/ui/Skeleton";

// Mirrors app/account/orders/page.tsx: title + profile link, then order cards.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-900">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>

            <div className="mt-3 flex justify-between border-t border-zinc-100 pt-3 dark:border-zinc-900">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
