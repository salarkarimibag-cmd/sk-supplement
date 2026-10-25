import Skeleton from "@/components/ui/Skeleton";

// Shared by every page under /pages (about, FAQ, policies, contact...): they
// all open with the same gradient banner, then a narrow column of text.
export default function Loading() {
  return (
    <div>
      <Skeleton className="h-48 w-full rounded-none sm:h-60" />

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
