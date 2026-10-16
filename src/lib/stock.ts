/** At or below this many units, the product page tells shoppers stock is running low. */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * How many more units a shopper may add to the cart, given what's already
 * in it. The server re-checks stock when the order is placed (priceCart);
 * this only keeps the page from offering quantities that would fail there.
 */
export function remainingToAdd(stock: number, inCart: number): number {
  return Math.max(0, stock - inCart);
}
