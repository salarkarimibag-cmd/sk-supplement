import type { CartItem } from "@/context/CartContext";
import { capToStock } from "@/lib/stock";

/** A product as the catalog has it now: what a cart line shows and charges. */
export interface CartCatalogEntry {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
}

export interface CartSyncResult {
  items: CartItem[];
  /** A price is different from the one saved in the cart. */
  pricesChanged: boolean;
  /** A line was removed (deleted or sold out) or cut down to what's in stock. */
  quantitiesChanged: boolean;
}

/**
 * Brings a saved cart up to date with the catalog. The cart lives in
 * localStorage, so its prices and stock are whatever they were when each
 * product was added; checkout must show (and the buyer transfer) what the
 * server will actually charge, for quantities it will actually accept.
 * Products that were deleted or sold out are dropped, and quantities above
 * the stock are lowered to it. The two flags tell the buyer what moved.
 */
export function syncCartItems(items: CartItem[], catalog: CartCatalogEntry[]): CartSyncResult {
  const catalogById = new Map(catalog.map((product) => [product.id, product]));
  let pricesChanged = false;
  let quantitiesChanged = false;
  const synced: CartItem[] = [];

  for (const item of items) {
    const product = catalogById.get(item.id);
    if (!product || product.stock <= 0) {
      quantitiesChanged = true;
      continue;
    }
    if (product.price !== item.price) pricesChanged = true;
    const quantity = capToStock(item.quantity, product.stock);
    if (quantity !== item.quantity) quantitiesChanged = true;
    synced.push({
      ...item,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      quantity,
    });
  }

  return { items: synced, pricesChanged, quantitiesChanged };
}
