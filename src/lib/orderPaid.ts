import { DiscountCodeModel } from "@/models/DiscountCode";
import { decrementStock } from "@/lib/products";

interface PaidOrder {
  items: { productId: string; quantity: number }[];
  discountCode?: string | null;
}

/**
 * Everything that happens once an order is actually paid, whether through
 * the ZarinPal callback or an admin confirming a card-to-card transfer.
 * Keeping it in one place means a new payment method can't forget a step.
 *
 * Callers must run this only when *their* update moved the order to "paid"
 * (modifiedCount === 1), so it happens exactly once per order.
 */
export async function onOrderPaid(order: PaidOrder): Promise<void> {
  await Promise.all([
    decrementStock(order.items),
    // $inc, not read-then-write, so two orders paid at once both count.
    order.discountCode
      ? DiscountCodeModel.updateOne({ code: order.discountCode }, { $inc: { usedCount: 1 } })
      : null,
  ]);
}
