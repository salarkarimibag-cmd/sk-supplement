import { connectToDatabase } from "@/lib/db";
import { PENDING_HOLD_MS } from "@/lib/discounts";
import { DiscountCodeModel } from "@/models/DiscountCode";
import { OrderModel } from "@/models/Order";
import { decrementStock, recordSale, releaseStock, restoreStock } from "@/lib/products";

interface OrderEffects {
  items: { productId: string; quantity: number }[];
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
 */
export async function onOrderPaid(order: OrderEffects): Promise<void> {
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
