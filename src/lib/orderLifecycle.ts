import { connectToDatabase } from "@/lib/db";
import { PENDING_HOLD_MS } from "@/lib/discounts";
import { DiscountCodeModel } from "@/models/DiscountCode";
import { OrderModel } from "@/models/Order";
import {
  decrementStock,
  findOversold,
  recordSale,
  releaseStock,
  restoreStock,
  unrecordSale,
} from "@/lib/products";
import { expandStockLines, type StockLine } from "@/lib/stock";

interface OrderEffects {
  items: StockLine[];
  discountCode?: string | null;
  stockReserved?: boolean | null;
}

// The side effects of an order changing state, kept in one place so every
// payment method and admin action applies the same ones. Callers must run
// these only when *their* conditional update actually changed the order's
// status (modifiedCount === 1, or a non-null findOneAndUpdate result), so
// each one happens exactly once per order, and must pass the order as it
// was *before* that update, so stockReserved says what it held.

/**
 * An order was paid, through the ZarinPal callback or an admin confirming a
 * card-to-card transfer: count its items as sold and count the code.
 * Returns the names of any products this left short, for the admin: a
 * payment that finished after its hold ran out can find the last unit
 * already sold to someone else, and the money has been taken either way.
 */
export async function onOrderPaid(order: OrderEffects): Promise<string[]> {
  await Promise.all([
    // A reserved order's stock was taken when it was placed. One without a
    // reservation (placed before reservations existed, or a ZarinPal
    // payment finished after its hold ran out) takes it now.
    order.stockReserved ? recordSale(order.items) : decrementStock(order.items),
    // $inc, not read-then-write, so two orders paid at once both count.
    order.discountCode
      ? DiscountCodeModel.updateOne({ code: order.discountCode }, { $inc: { usedCount: 1 } })
      : null,
  ]);
  // A reservation's units were set aside for this order, so only a late
  // payment can come up short.
  return order.stockReserved
    ? []
    : findOversold(expandStockLines(order.items).map((item) => item.productId));
}

/**
 * An unpaid order failed (ZarinPal cancelled or declined, or the admin
 * rejected a card transfer): give back the stock it reserved, if it still
 * holds it.
 */
export async function onOrderFailed(order: OrderEffects): Promise<void> {
  if (order.stockReserved) await releaseStock(order.items);
}

/**
 * A *paid* order was cancelled: undo exactly what onOrderPaid did, so the
 * items can be sold again and the code's use is given back. Only valid for
 * orders that went through onOrderPaid — an unpaid order is failed instead
 * (see onOrderFailed).
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

/**
 * A shipped or delivered order came back. Its items no longer count as
 * sold; they go back into stock only when the admin says they can be sold
 * again (an opened supplement can't). Unlike a cancellation, the discount
 * code stays used: the buyer did make the purchase, and giving the use back
 * would let a returned order free up a one-time or first-order code.
 */
export async function onOrderReturned(order: OrderEffects, restock: boolean): Promise<void> {
  await (restock ? restoreStock(order.items) : unrecordSale(order.items));
}

/**
 * Gives back the stock of ZarinPal orders left unpaid for longer than
 * PENDING_HOLD_MS: a buyer who leaves the gateway never comes back to mark
 * the order failed, and the stock shouldn't stay held forever. The order
 * itself stays pending, so a payment that does finish later is still
 * verified (onOrderPaid then takes the stock without a reservation).
 *
 * Run before reading stock that a buyer is about to act on. Each order is
 * claimed by a conditional update, so two requests sweeping at once (or
 * the callback paying the order meanwhile) can't release it twice.
 */
export async function releaseExpiredReservations(): Promise<void> {
  await connectToDatabase();
  const expired = {
    status: "pending",
    stockReserved: true,
    createdAt: { $lt: new Date(Date.now() - PENDING_HOLD_MS) },
  };
  for (;;) {
    const order = await OrderModel.findOneAndUpdate(
      expired,
      { stockReserved: false },
      { projection: { items: 1 } }
    ).lean<OrderEffects>();
    if (!order) return;
    await releaseStock(order.items);
  }
}
