import type { DiscountCode } from "@/models/DiscountCode";

export type DiscountCheckResult =
  | { valid: true; code: string; discountAmount: number }
  | { valid: false; message: string };

/**
 * Checks a discount code against a cart subtotal and computes the amount to
 * take off, without touching the database — the caller looks up the
 * DiscountCode document and passes it in.
 */
export function checkDiscount(
  discount: DiscountCode | null,
  subtotal: number
): DiscountCheckResult {
  if (!discount || !discount.active) {
    return { valid: false, message: "کد تخفیف نامعتبر است." };
  }

  if (discount.expiresAt && discount.expiresAt.getTime() < Date.now()) {
    return { valid: false, message: "کد تخفیف منقضی شده است." };
  }

  const discountAmount = calculateDiscountAmount(discount, subtotal);

  return { valid: true, code: discount.code, discountAmount };
}

/** The raw amount-off calculation: percent of subtotal, or a fixed amount capped at the subtotal. */
export function calculateDiscountAmount(
  discount: Pick<DiscountCode, "type" | "value">,
  subtotal: number
): number {
  return discount.type === "percent"
    ? Math.round((subtotal * discount.value) / 100)
    : Math.min(discount.value, subtotal);
}
