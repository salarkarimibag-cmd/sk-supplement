import type { CartItem } from "@/context/CartContext";

/** A product as the catalog has it now: what a cart line shows and charges. */
export interface CartCatalogEntry {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

/**
 * Brings a saved cart up to date with the catalog. The cart lives in
 * localStorage, so its prices are whatever they were when each product was
 * added; checkout must show (and the buyer transfer) what the server will
 * actually charge. Products no longer in the catalog are dropped.
 * `pricesChanged` is true when a price changed or a line was dropped, i.e.
 * when the buyer should be told that the totals moved.
 */
export function syncCartItems(
  items: CartItem[],
  catalog: CartCatalogEntry[]
): { items: CartItem[]; pricesChanged: boolean } {
  const catalogById = new Map(catalog.map((product) => [product.id, product]));
  let pricesChanged = false;
  const synced: CartItem[] = [];

  for (const item of items) {
    const product = catalogById.get(item.id);
    if (!product) {
      pricesChanged = true;
      continue;
    }
    if (product.price !== item.price) pricesChanged = true;
    synced.push({
      ...item,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  }

  return { items: synced, pricesChanged };
}
