import type { CatalogProduct } from "@/data/catalog";

/** The stand-in image of a product that has no real photo yet. */
export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

export interface ShowcaseProduct {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * Returns a shuffled copy (Fisher–Yates: every order is equally likely).
 * `random` is injectable so tests can make the order predictable.
 */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Picks the product photos shown on a home-page category tile, from the
 * products that `matches` accepts and that have a real photo, in a random
 * order, so every visit shows a different mix. Brands go first (one product
 * each, so the tile mixes brands); any slots left are filled with other
 * products. Flavors and sizes of one product (same groupSlug) never appear
 * twice.
 *
 * As real photos are added, more products qualify and the tiles fill up
 * on their own.
 */
export function pickShowcaseProducts(
  products: CatalogProduct[],
  matches: (product: CatalogProduct) => boolean,
  limit: number,
  random: () => number = Math.random
): ShowcaseProduct[] {
  const candidates = shuffle(
    products.filter(
      (product) => matches(product) && product.imageUrl && product.imageUrl !== PLACEHOLDER_IMAGE
    ),
    random
  );

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

  // Second pass: fill what's left with other products of any brand.
  for (const product of candidates) {
    if (picked.length === limit) break;
    if (picked.includes(product)) continue;
    if (seenGroups.has(product.groupSlug ?? `id:${product.id}`)) continue;
    take(product);
  }

  return picked.map(({ id, name, imageUrl }) => ({ id, name, imageUrl }));
}
