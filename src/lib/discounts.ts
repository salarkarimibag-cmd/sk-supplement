import { z } from "zod";
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

  if (discount.maxUses != null && (discount.usedCount ?? 0) >= discount.maxUses) {
    return { valid: false, message: "ظرفیت استفاده از این کد تخفیف تمام شده است." };
  }

  const discountAmount = calculateDiscountAmount(discount, subtotal);

  return { valid: true, code: discount.code, discountAmount };
}

/** The raw amount-off calculation: percent of subtotal, or a fixed amount capped at the subtotal. */
export function calculateDiscountAmount(
  discount: Pick<DiscountCode, "type" | "value">,
  subtotal: number
): number {
  // Both results are capped at the subtotal, so even a code saved before
  // admin input was validated (e.g. 150%) can't push the total below zero.
  return discount.type === "percent"
    ? Math.round((subtotal * Math.min(discount.value, 100)) / 100)
    : Math.min(discount.value, subtotal);
}

// What an admin may save as a discount code. A 100% (or larger) discount is
// rejected because it makes the total zero, which ZarinPal can't charge.
export const discountInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,30}$/, "کد باید ۳ تا ۳۰ حرف انگلیسی، عدد، - یا _ باشد."),
    type: z.enum(["percent", "fixed"]),
    value: z.number().int("مقدار باید عدد صحیح باشد.").positive("مقدار باید بیشتر از صفر باشد."),
    active: z.boolean(),
    // "YYYY-MM-DD" from the date input, or null for no expiry.
    expiresAt: z.iso.date("تاریخ انقضا نامعتبر است.").nullable(),
    maxUses: z.number().int().positive("حداکثر استفاده باید بیشتر از صفر باشد.").nullable(),
  })
  .refine((input) => input.type !== "percent" || input.value <= 99, {
    message: "تخفیف درصدی باید بین ۱ تا ۹۹ درصد باشد.",
    path: ["value"],
  });

export type DiscountInput = z.infer<typeof discountInputSchema>;
