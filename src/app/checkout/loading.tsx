import Skeleton from "@/components/ui/Skeleton";

// Mirrors CheckoutView: the form on one side, the order summary on the other
// (stacked below lg). Its card-submitted and callback children set their own.
export default function Loading() {
  return (
    <div className="lg:grid lg:grid-cols-2">
      <div className="bg-white px-6 py-12 dark:bg-zinc-950">
        <div className="mx-auto max-w-xl">
          <Skeleton className="mx-auto h-10 w-32" />

          <div className="mt-10 flex flex-col gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            ))}
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>

      <div className="bg-[rgb(248_248_248)] px-6 py-12 dark:bg-zinc-900">
        <div className="mx-auto max-w-xl">
          <ul className="flex flex-col gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <li key={index} className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 shrink-0" />
                <Skeleton className="h-4 w-1/2" />
              </li>
            ))}
          </ul>
          <Skeleton className="mt-8 h-5 w-full" />
        </div>
      </div>
    </div>
  );
}
