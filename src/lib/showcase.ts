import type { CatalogProduct } from "@/data/catalog";

/** The stand-in image of a product that has no real photo yet. */
export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

export interface ShowcaseProduct {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * Picks the products shown on a home-page category tile: only ones with a
 * real photo, at most one per brand (so the tile mixes brands), best sellers
 * first. Pass `null` as the category for the "all products" tile.
 *
 * As real photos are added, more products qualify and the tiles fill up
 * on their own.
 */
export function pickShowcaseProducts(
  products: CatalogProduct[],
  categorySlug: string | null,
  limit: number
): ShowcaseProduct[] {
  const seenBrands = new Set<string>();
  const picked: ShowcaseProduct[] = [];

  const candidates = products
    .filter((product) => categorySlug === null || product.categorySlug === categorySlug)
    .filter((product) => product.imageUrl && product.imageUrl !== PLACEHOLDER_IMAGE)
    .sort((a, b) => b.salesCount - a.salesCount);

  for (const product of candidates) {
    // A brandless product counts as its own brand, so it never blocks others.
    const brandKey = product.brand ?? `id:${product.id}`;
    if (seenBrands.has(brandKey)) continue;
    seenBrands.add(brandKey);
    picked.push({ id: product.id, name: product.name, imageUrl: product.imageUrl });
    if (picked.length === limit) break;
  }

  return picked;
}
