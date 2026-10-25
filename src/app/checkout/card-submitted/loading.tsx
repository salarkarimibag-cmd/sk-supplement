import Skeleton from "@/components/ui/Skeleton";

// Mirrors app/checkout/card-submitted/page.tsx: a centered confirmation card.
export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-20">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-3 h-4 w-64" />
      <Skeleton className="mt-8 h-11 w-40" />
    </div>
  );
}
