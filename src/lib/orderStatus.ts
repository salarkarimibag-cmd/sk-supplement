import type { OrderStatus, PaymentMethod } from "@/models/Order";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار پرداخت",
  awaiting_verification: "در انتظار تأیید پرداخت",
  paid: "پرداخت‌شده",
  failed: "ناموفق",
  shipped: "ارسال‌شده",
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
const AFTER_PAYMENT: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["shipped", "cancelled"],
};

const ADMIN_TRANSITIONS: Record<PaymentMethod, Partial<Record<OrderStatus, OrderStatus[]>>> = {
  zarinpal: AFTER_PAYMENT,
  card: { ...AFTER_PAYMENT, awaiting_verification: ["paid", "failed"] },
};

const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

/**
 * The statuses an order can be in after onOrderPaid ran and before any
 * onOrderCancelled undid it: the orders whose items count as sold.
 */
export const SOLD_ORDER_STATUSES: OrderStatus[] = ["paid", "shipped"];

/**
 * The stockReserved value for an order moving to `status`, written in the
 * same update as the status so the two never disagree: a failed or
 * cancelled order has given its items back, a paid or shipped one keeps
 * them. (An order only becomes pending or awaiting verification when it's
 * placed, with its reservation.)
 */
export function holdsStock(status: OrderStatus): boolean {
  return status !== "failed" && status !== "cancelled";
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
