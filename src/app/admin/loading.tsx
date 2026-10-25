import Skeleton from "@/components/ui/Skeleton";

// Shown inside the admin layout (its title and tab bar stay on screen), in
// place of whichever admin page is loading: a section title and a list of rows.
export default function Loading() {
  return (
    <div>
      <Skeleton className="h-6 w-32" />

      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}
