import type { CatalogProduct } from "@/data/catalog";

/** The stand-in image of a product that has no real photo yet. */
export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

export interface ShowcaseProduct {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * Picks the product photos shown on a home-page category tile, from the
 * products that `matches` accepts and that have a real photo, best sellers
 * first. Brands go first (one product each, so the tile mixes brands); any
 * slots left are filled with the next best sellers. Flavors and sizes of one
 * product (same groupSlug) never appear twice.
 *
 * As real photos are added, more products qualify and the tiles fill up
 * on their own.
 */
export function pickShowcaseProducts(
  products: CatalogProduct[],
  matches: (product: CatalogProduct) => boolean,
  limit: number
): ShowcaseProduct[] {
  const candidates = products
    .filter((product) => matches(product) && product.imageUrl && product.imageUrl !== PLACEHOLDER_IMAGE)
    .sort((a, b) => b.salesCount - a.salesCount);

  const picked: CatalogProduct[] = [];
  const seenBrands = new Set<string>();
  const seenGroups = new Set<string>();

  function take(product: CatalogProduct) {
    picked.push(product);
    // A brandless product counts as its own brand, so it never blocks others.
    seenBrands.add(product.brand ?? `id:${product.id}`);
    seenGroups.add(product.groupSlug ?? `id:${product.id}`);
  }

  // First pass: one product per brand.
  for (const product of candidates) {
    if (picked.length === limit) break;
    if (seenBrands.has(product.brand ?? `id:${product.id}`)) continue;
    if (seenGroups.has(product.groupSlug ?? `id:${product.id}`)) continue;
    take(product);
  }

  // Second pass: fill what's left with the next best sellers of any brand.
  for (const product of candidates) {
    if (picked.length === limit) break;
    if (picked.includes(product)) continue;
    if (seenGroups.has(product.groupSlug ?? `id:${product.id}`)) continue;
    take(product);
  }

  return picked.map(({ id, name, imageUrl }) => ({ id, name, imageUrl }));
}
