import type { OrderStatus, PaymentMethod } from "@/models/Order";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار پرداخت",
  awaiting_verification: "در انتظار تأیید پرداخت",
  paid: "پرداخت‌شده",
  failed: "ناموفق",
  shipped: "ارسال‌شده",
  delivered: "تحویل‌شده",
  returned: "مرجوع‌شده",
  cancelled: "لغو‌شده",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  zarinpal: "درگاه زرین‌پال",
  card: "کارت به کارت",
};

// The only status changes an admin may make, per payment method. For a
// ZarinPal order, "pending", "paid" and "failed" are set by the payment flow
// alone: letting an admin mark one paid would bypass the gateway's
// verification. A card-to-card order is different — the admin *is* the
// verification, comparing the reported transfer with the bank statement.
// After shipping, a parcel is either delivered or comes back: refused at
// the door (from shipped) or returned within the refund policy's window
// (from delivered).
const AFTER_PAYMENT: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
};

const ADMIN_TRANSITIONS: Record<PaymentMethod, Partial<Record<OrderStatus, OrderStatus[]>>> = {
  zarinpal: AFTER_PAYMENT,
  card: { ...AFTER_PAYMENT, awaiting_verification: ["paid", "failed"] },
};

const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

/**
 * The statuses an order can be in after onOrderPaid ran and before any
 * onOrderCancelled or onOrderReturned undid it: the orders whose items
 * count as sold.
 */
export const SOLD_ORDER_STATUSES: OrderStatus[] = ["paid", "shipped", "delivered"];

/**
 * Every status an order can reach only by being paid: the sold ones, plus a
 * returned order, whose payment did go through even though the sale was
 * later undone.
 */
export const PAID_ORDER_STATUSES: OrderStatus[] = [...SOLD_ORDER_STATUSES, "returned"];

/**
 * The stockReserved value for an order moving to `status`, written in the
 * same update as the status so the two never disagree: a failed, cancelled
 * or returned order no longer holds its items (a return puts them back in
 * stock or writes them off, see onOrderReturned), a paid, shipped or
 * delivered one keeps them. (An order only becomes pending or awaiting
 * verification when it's placed, with its reservation.)
 */
export function holdsStock(status: OrderStatus): boolean {
  return status !== "failed" && status !== "cancelled" && status !== "returned";
}

export function allowedAdminTransitions(
  from: OrderStatus,
  paymentMethod: PaymentMethod
): OrderStatus[] {
  return ADMIN_TRANSITIONS[paymentMethod][from] ?? [];
}

/** The statuses an admin may move an order of this payment method *from* to reach `to`. */
export function adminSourcesFor(to: OrderStatus, paymentMethod: PaymentMethod): OrderStatus[] {
  return ORDER_STATUSES.filter((from) =>
    allowedAdminTransitions(from, paymentMethod).includes(to)
  );
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  // Object.hasOwn, not `in`: `"toString" in {}` is true via the prototype.
  return typeof value === "string" && Object.hasOwn(ORDER_STATUS_LABELS, value);
}
