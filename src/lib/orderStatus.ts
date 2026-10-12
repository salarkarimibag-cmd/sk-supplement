import type { OrderStatus } from "@/models/Order";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  failed: "ناموفق",
  shipped: "ارسال‌شده",
  cancelled: "لغو‌شده",
};

// The only status changes an admin may make. "pending", "paid" and "failed"
// are set by the payment flow alone: letting an admin mark an order paid
// would bypass ZarinPal's verification entirely.
const ADMIN_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["shipped", "cancelled"],
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export function allowedAdminTransitions(from: OrderStatus): OrderStatus[] {
  return ADMIN_TRANSITIONS[from] ?? [];
}

/** The statuses an admin may move an order *from* to reach `to`. */
export function adminSourcesFor(to: OrderStatus): OrderStatus[] {
  return ORDER_STATUSES.filter((from) => allowedAdminTransitions(from).includes(to));
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  // Object.hasOwn, not `in`: `"toString" in {}` is true via the prototype.
  return typeof value === "string" && Object.hasOwn(ORDER_STATUS_LABELS, value);
}
