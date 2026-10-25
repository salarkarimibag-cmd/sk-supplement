import Skeleton from "@/components/ui/Skeleton";

// Mirrors app/account/profile/page.tsx: title, three detail rows, two buttons.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <Skeleton className="h-8 w-44" />

      <div className="mt-6 flex max-w-md flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}
