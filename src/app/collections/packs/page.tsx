import CollectionHero from "@/components/collections/CollectionHero";
import PackCard from "@/components/product/PackCard";
import { PACKS_CATEGORY } from "@/lib/packs";
import { getPackProducts, getProductsByCategory } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";
import { pickShowcaseProducts } from "@/lib/showcase";

/** How many packs take turns in the hero. */
const HERO_PRODUCTS = 6;

// Its own page rather than the [slug] one (Next.js tries a fixed folder name
// first): packs need wider cards, and with so few, no filters or sorting. The
// title lives in the code, not the category, so the page still works before
// the packs are seeded.
export const metadata = pageMetadata({
  title: PACKS_CATEGORY.title,
  description: PACKS_CATEGORY.description,
  path: `/collections/${PACKS_CATEGORY.slug}`,
});

// No request-time data, so it's prerendered; rebuilt every minute for prices
// and stock, as on the home page, or at once after an admin change.
export const revalidate = 60;

export default async function PacksPage() {
  const packs = (await getProductsByCategory(PACKS_CATEGORY.slug)).sort(
    (a, b) => a.price - b.price
  );
  const products = await getPackProducts(packs.flatMap((pack) => pack.packProductIds ?? []));

  return (
    <div>
      <CollectionHero
        title={PACKS_CATEGORY.title}
        description={PACKS_CATEGORY.description}
        products={pickShowcaseProducts(packs, () => true, HERO_PRODUCTS)}
      />

      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        {packs.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">پک‌های ترکیبی به زودی اضافه می‌شوند.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {packs.map((pack) => (
              <PackCard key={pack.id} pack={pack} products={products} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
