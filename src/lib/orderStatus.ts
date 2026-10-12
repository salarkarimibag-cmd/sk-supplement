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

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

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
