// Shipping costs, in Toman. Kept in this one DB-free module so the server
// (which charges it, see buildOrderDraft) and every page that mentions it
// use the same numbers. Changing a number here changes the whole site.

/** What an order below FREE_SHIPPING_MIN pays for shipping. */
export const SHIPPING_FEE = 150_000;

/** From this amount of goods (after the discount) shipping is free. */
export const FREE_SHIPPING_MIN = 5_000_000;

/**
 * The shipping fee for an order whose goods come to `itemsTotal` after the
 * discount. Measured after the discount so a code can't take an order
 * below the threshold and still keep free shipping.
 */
export function shippingFee(itemsTotal: number): number {
  return itemsTotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
}

/** How much more the buyer would have to add for free shipping (0 once it's free). */
export function amountUntilFreeShipping(itemsTotal: number): number {
  return Math.max(0, FREE_SHIPPING_MIN - itemsTotal);
}

/**
 * A stored order's shipping as shown to people: "رایگان" for 0, and for
 * orders from before shipping had a price (no fee stored).
 */
export function formatShippingFee(fee: number | null | undefined): string {
  return fee ? `${fee.toLocaleString("fa-IR")} تومان` : "رایگان";
}

/** The threshold as shown on the site, e.g. "۵٬۰۰۰٬۰۰۰ تومان". */
export const FREE_SHIPPING_MIN_LABEL = `${FREE_SHIPPING_MIN.toLocaleString("fa-IR")} تومان`;

/** The fee as shown on the site, e.g. "۱۵۰٬۰۰۰ تومان". */
export const SHIPPING_FEE_LABEL = `${SHIPPING_FEE.toLocaleString("fa-IR")} تومان`;
