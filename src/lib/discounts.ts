import { z } from "zod";
import type { DiscountCode } from "@/models/DiscountCode";

export type DiscountCheckResult =
  | { valid: true; code: string; discountAmount: number }
  | { valid: false; message: string };

// Iran Standard Time is UTC+03:30 all year (daylight saving ended in 2022).
const TEHRAN_OFFSET_MS = 3.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The last millisecond of the Tehran calendar day that `date` falls on.
 *
 * The admin picks an expiry *date* ("2026-11-01"), which is saved as
 * midnight UTC, i.e. 03:30 that morning in Tehran. Comparing against that
 * instant ended the code early on its last day; the admin means it can be
 * used all through that day.
 */
export function endOfTehranDay(date: Date): Date {
  const tehranMs = date.getTime() + TEHRAN_OFFSET_MS;
  const startOfTehranDayMs = Math.floor(tehranMs / DAY_MS) * DAY_MS;
  return new Date(startOfTehranDayMs + DAY_MS - 1 - TEHRAN_OFFSET_MS);
}

/**
 * Checks a discount code against a cart subtotal and computes the amount to
 * take off, without touching the database — the caller looks up the
 * DiscountCode document and passes it in.
 *
 * `heldUses` is how many orders using the code are placed but not yet paid
 * (see countHeldUses). They count against `maxUses` too: usedCount only
 * grows once an order is paid, so without them several buyers checking out
 * at once could all pass the limit.
 *
 * `isReturningCustomer` is whether the buyer has bought before (see
 * previousOrdersFilter); it only matters for a firstOrderOnly code.
 */
export function checkDiscount(
  discount: DiscountCode | null,
  subtotal: number,
  heldUses = 0,
  isReturningCustomer = false
): DiscountCheckResult {
  if (!discount || !discount.active) {
    return { valid: false, message: "کد تخفیف نامعتبر است." };
  }

  // Valid through the whole expiry day, Tehran time (see endOfTehranDay).
  if (discount.expiresAt && endOfTehranDay(discount.expiresAt).getTime() < Date.now()) {
    return { valid: false, message: "کد تخفیف منقضی شده است." };
  }

  if (discount.maxUses != null && (discount.usedCount ?? 0) + heldUses >= discount.maxUses) {
    return { valid: false, message: "ظرفیت استفاده از این کد تخفیف تمام شده است." };
  }

  if (discount.minSubtotal != null && subtotal < discount.minSubtotal) {
    return {
      valid: false,
      message: `این کد برای خریدهای ${discount.minSubtotal.toLocaleString("fa-IR")} تومان به بالاست.`,
    };
  }

  if (discount.firstOrderOnly && isReturningCustomer) {
    return { valid: false, message: "این کد فقط برای اولین خرید است." };
  }

  const discountAmount = calculateDiscountAmount(discount, subtotal);

  return { valid: true, code: discount.code, discountAmount };
}

/** How long an unpaid ZarinPal order holds its discount code and its reserved stock. */
export const PENDING_HOLD_MS = 30 * 60 * 1000;

/**
 * The orders that hold a use of `code` without having paid yet: card
 * transfers waiting for the admin, and ZarinPal orders sent to the gateway in
 * the last PENDING_HOLD_MS. A buyer who leaves the gateway without paying
 * never comes back to mark the order failed, so a pending order stops
 * holding the code after that time instead of blocking it forever.
 */
export function heldOrdersFilter(code: string, now: number) {
  return {
    discountCode: code,
    $or: [
      { status: "awaiting_verification" },
      { status: "pending", createdAt: { $gte: new Date(now - PENDING_HOLD_MS) } },
    ],
  };
}

/** Who is buying, as the checkout form identifies them. */
export interface Customer {
  email: string;
  mobile: string;
}

/**
 * The orders that make a buyer a returning customer, for firstOrderOnly
 * codes: any earlier purchase under the same email or the same mobile (so a
 * new email alone doesn't make someone new), paid or a card transfer sent.
 * Unpaid ZarinPal orders don't count, so a buyer who left the gateway can
 * try again with the code; nor do failed or cancelled ones.
 */
export function previousOrdersFilter(customer: Customer) {
  return {
    $or: [{ "contact.email": customer.email }, { "contact.mobile": customer.mobile }],
    status: { $in: ["awaiting_verification", "paid", "shipped"] },
  };
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

/** How much a code takes off, for display: "۱۰٪" or "۵۰٬۰۰۰ تومان". */
export function formatDiscountValue(discount: Pick<DiscountCode, "type" | "value">): string {
  return discount.type === "percent"
    ? `${discount.value.toLocaleString("fa-IR")}٪`
    : `${discount.value.toLocaleString("fa-IR")} تومان`;
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
    // Defaults, so an edit that doesn't mention them reads as "no condition".
    minSubtotal: z
      .number()
      .int("حداقل مبلغ خرید باید عدد صحیح باشد.")
      .positive("حداقل مبلغ خرید باید بیشتر از صفر باشد.")
      .nullable()
      .default(null),
    firstOrderOnly: z.boolean().default(false),
  })
  .refine((input) => input.type !== "percent" || input.value <= 99, {
    message: "تخفیف درصدی باید بین ۱ تا ۹۹ درصد باشد.",
    path: ["value"],
  })
  // A fixed amount at least as large as the minimum could make a qualifying
  // cart free, which ZarinPal can't charge.
  .refine(
    (input) => input.type !== "fixed" || input.minSubtotal == null || input.minSubtotal > input.value,
    { message: "حداقل مبلغ خرید باید از مبلغ تخفیف بیشتر باشد.", path: ["minSubtotal"] }
  );

export type DiscountInput = z.infer<typeof discountInputSchema>;
