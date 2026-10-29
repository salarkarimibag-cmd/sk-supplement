import { after } from "next/server";
import type { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { PENDING_HOLD_MS } from "@/lib/discounts";
import { OrderModel, type Order } from "@/models/Order";
import { inquireZarinPalPayment, verifyZarinPalPayment } from "@/lib/zarinpal";
import { onOrderFailed, onOrderPaid } from "@/lib/orderLifecycle";
import { holdsStock } from "@/lib/orderStatus";
import { sendAdminOrderEmail, sendOrderEmail } from "@/lib/orderNotifications";

type StoredOrder = Order & { _id: Types.ObjectId };

// Every update below filters on `status: "pending"` too, so an order can
// only leave the pending state once, even if the callback page and the
// admin's reconcile run on it at the same time. It returns the order as it
// was just before, or null if another request got there first; only the
// winner runs the side effects.
function settle(authority: string, update: { status: "paid" | "failed"; paymentRefId?: number }) {
  return OrderModel.findOneAndUpdate(
    { paymentAuthority: authority, status: "pending" },
    { ...update, stockReserved: holdsStock(update.status) },
    { returnDocument: "before" }
  ).lean<StoredOrder>();
}

/** Marks a pending ZarinPal order failed and gives back the stock it held. */
export async function markZarinPalOrderFailed(authority: string): Promise<void> {
  const before = await settle(authority, { status: "failed" });
  if (before) await onOrderFailed(before);
}

/**
 * Marks a pending ZarinPal order paid, once ZarinPal has verified it:
 * records the sale and the discount use, and emails the buyer and the admin.
 */
export async function markZarinPalOrderPaid(authority: string, refId: number): Promise<void> {
  const before = await settle(authority, { status: "paid", paymentRefId: refId });
  // Only the request that actually moved the order to "paid" records stock
  // and discount usage, so a refresh or a second concurrent request can't
  // count it twice.
  if (!before) return;
  // `before` is from just before the update, so its stockReserved is
  // current (an expired hold may have been released since the order was
  // first read); the new ref id is added here.
  await onOrderPaid(before);
  const paidOrder = { ...before, paymentRefId: refId };
  after(() => sendOrderEmail(paidOrder, "paid"));
  after(() => sendAdminOrderEmail(paidOrder, "paid"));
}

export type ReconcileResult = Record<"paid" | "failed" | "unknown", number>;

// How many orders one reconcile asks ZarinPal about, newest first, and how
// many of those questions are in flight at once (kind to ZarinPal, and
// well within a request's time limit even if each one is slow).
const RECONCILE_LIMIT = 30;
const RECONCILE_PARALLEL = 5;

// ZarinPal keeps reporting a payment the buyer walked away from (even one
// they cancelled) as "in the bank". A gateway session lasts minutes, so one
// still there after a day will never be paid: its order is failed.
const ABANDONED_AFTER_MS = 24 * 60 * 60 * 1000;

type ReconcilableOrder = Pick<StoredOrder, "paymentAuthority" | "totalPrice" | "createdAt">;

async function reconcileOne(order: ReconcilableOrder): Promise<keyof ReconcileResult> {
  const authority = order.paymentAuthority as string;
  const inquiry = await inquireZarinPalPayment(authority);
  const abandoned =
    inquiry === "in_bank" && new Date(order.createdAt).getTime() < Date.now() - ABANDONED_AFTER_MS;
  if (inquiry === "failed" || abandoned) {
    await markZarinPalOrderFailed(authority);
    return "failed";
  }
  if (inquiry !== "paid") return "unknown";

  // "Paid" by the inquiry: the money has left the buyer's account, but only
  // the verify call settles it with ZarinPal (and checks the amount).
  const verified = await verifyZarinPalPayment({ amountToman: order.totalPrice, authority });
  if (!verified.ok) return "unknown";
  await markZarinPalOrderPaid(authority, verified.refId);
  return "paid";
}

/**
 * Settles ZarinPal orders the buyer left pending: someone who paid but
 * never came back to the callback page would otherwise be charged without
 * an order (ZarinPal doesn't refund an unverified payment on its own), and
 * one who never paid would stay "pending" forever. Asks ZarinPal about each
 * order older than PENDING_HOLD_MS (younger ones may still be at the bank),
 * then verifies the paid ones and fails the unpaid ones (and those still
 * "in the bank" after ABANDONED_AFTER_MS). The rest stay pending, to be
 * asked about again next time.
 */
export async function reconcileZarinPalOrders(): Promise<ReconcileResult> {
  await connectToDatabase();
  const orders = await OrderModel.find(
    { status: "pending", createdAt: { $lt: new Date(Date.now() - PENDING_HOLD_MS) } },
    { paymentAuthority: 1, totalPrice: 1, createdAt: 1 }
  )
    .sort({ createdAt: -1 })
    .limit(RECONCILE_LIMIT)
    .lean<ReconcilableOrder[]>();

  const result: ReconcileResult = { paid: 0, failed: 0, unknown: 0 };
  for (let i = 0; i < orders.length; i += RECONCILE_PARALLEL) {
    const outcomes = await Promise.all(orders.slice(i, i + RECONCILE_PARALLEL).map(reconcileOne));
    for (const outcome of outcomes) result[outcome]++;
  }
  return result;
}
