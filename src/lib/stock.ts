/** At or below this many units, the product page tells shoppers stock is running low. */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * The most units of one product a single order may have. Placing an order
 * reserves its stock, so without a cap one order (real or scripted) could
 * hold a product's whole stock. priceCart enforces it on the server; the
 * cart and product pages stop at it too.
 */
export const MAX_PER_ORDER = 10;

/** A cart or order line, as far as stock is concerned. */
export interface StockLine {
  productId: string;
  quantity: number;
  /** On a combo pack: what the line contains, as saved on the order. */
  packProductIds?: string[] | null;
}

/**
 * The units a set of lines really moves: each line's own product, plus one of
 * each product inside a pack per pack, added up per product. Works from the
 * ids saved on the line, not the pack as it is now, so cancelling an old order
 * gives back exactly what it took even if the pack has changed since.
 */
export function expandStockLines(lines: StockLine[]): { productId: string; quantity: number }[] {
  const units = new Map<string, number>();
  for (const { productId, quantity, packProductIds } of lines) {
    for (const id of [productId, ...(packProductIds ?? [])]) {
      units.set(id, (units.get(id) ?? 0) + quantity);
    }
  }
  return [...units].map(([productId, quantity]) => ({ productId, quantity }));
}

/**
 * How many units of a product one order may have: its stock, up to
 * MAX_PER_ORDER. `stock` is undefined for cart lines saved before the cart
 * kept it; those are only held to MAX_PER_ORDER until checkout loads the
 * current stock (see syncCartItems).
 */
export function orderLimit(stock: number | undefined): number {
  return Math.min(stock ?? MAX_PER_ORDER, MAX_PER_ORDER);
}

/**
 * How many more units a shopper may add to the cart, given what's already
 * in it. The server re-checks stock when the order is placed (priceCart);
 * this only keeps the page from offering quantities that would fail there.
 */
export function remainingToAdd(stock: number, inCart: number): number {
  return Math.max(0, orderLimit(stock) - inCart);
}

/** A cart quantity limited to what one order may have (see orderLimit). */
export function capQuantity(quantity: number, stock: number | undefined): number {
  return Math.min(quantity, orderLimit(stock));
}
