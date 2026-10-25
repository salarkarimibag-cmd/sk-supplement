import CatalogToolbarSkeleton from "@/components/collections/CatalogToolbarSkeleton";
import ProductGridSkeleton from "@/components/product/ProductGridSkeleton";

// Mirrors app/collections/[slug]/page.tsx: the dark hero, then toolbar and grid.
// The hero is black in both themes, so its placeholders use plain dark blocks
// instead of <Skeleton>, whose light-mode color would stand out against it.
export default function Loading() {
  return (
    <div>
      <section className="bg-black">
        <div className="mx-auto flex max-w-6xl animate-pulse flex-col-reverse items-center gap-4 px-6 pt-6 pb-10 md:min-h-96 md:flex-row md:justify-between md:gap-10 md:py-10">
          <div className="w-full md:max-w-xl">
            <div className="h-12 w-2/3 rounded bg-zinc-800" />
            <div className="mt-4 h-4 w-full rounded bg-zinc-800" />
            <div className="mt-2 h-4 w-4/5 rounded bg-zinc-800" />
          </div>

          <div className="aspect-square w-56 shrink-0 rounded bg-zinc-800 sm:w-64 md:w-[32%] md:max-w-sm" />
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <CatalogToolbarSkeleton />
        <ProductGridSkeleton count={8} className="mt-10" />
      </div>
    </div>
  );
}
