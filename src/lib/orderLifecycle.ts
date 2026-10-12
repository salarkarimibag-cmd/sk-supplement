import { DiscountCodeModel } from "@/models/DiscountCode";
import { decrementStock, restoreStock } from "@/lib/products";

interface OrderEffects {
  items: { productId: string; quantity: number }[];
  discountCode?: string | null;
}

// The side effects of an order changing state, kept in one place so every
// payment method and admin action applies the same ones. Callers must run
// these only when *their* conditional update actually changed the order's
// status (modifiedCount === 1, or a non-null findOneAndUpdate result), so
// each one happens exactly once per order.

/**
 * An order was paid, through the ZarinPal callback or an admin confirming a
 * card-to-card transfer: take its items out of stock and count the code.
 */
export async function onOrderPaid(order: OrderEffects): Promise<void> {
  await Promise.all([
    decrementStock(order.items),
    // $inc, not read-then-write, so two orders paid at once both count.
    order.discountCode
      ? DiscountCodeModel.updateOne({ code: order.discountCode }, { $inc: { usedCount: 1 } })
      : null,
  ]);
}

/**
 * A *paid* order was cancelled: undo exactly what onOrderPaid did, so the
 * items can be sold again and the code's use is given back. Only valid for
 * orders that went through onOrderPaid — a pending or failed order never
 * took stock in the first place.
 */
export async function onOrderCancelled(order: OrderEffects): Promise<void> {
  await Promise.all([
    restoreStock(order.items),
    // The usedCount > 0 filter keeps the count from going negative for codes
    // that were used before usage counting existed.
    order.discountCode
      ? DiscountCodeModel.updateOne(
          { code: order.discountCode, usedCount: { $gt: 0 } },
          { $inc: { usedCount: -1 } }
        )
      : null,
  ]);
}
