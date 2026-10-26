import { findAndCheckDiscount } from "@/lib/discountLookup";
import { formatDiscountValue } from "@/lib/discounts";

/** The discount code the home hero advertises. */
const HERO_PROMO_CODE = "WELCOME10";

export interface HeroPromotion {
  code: string;
  /** How much it takes off, ready to show: "۱۰٪" or "۵۰٬۰۰۰ تومان". */
  amount: string;
}

/**
 * The hero's advertised code, or null if it can't be used right now
 * (missing, deactivated, expired or used up), so the page never promotes a
 * code that checkout would reject. Uses the same check as checkout
 * (findAndCheckDiscount); the subtotal doesn't matter for whether a code is usable.
 */
export async function getHeroPromotion(): Promise<HeroPromotion | null> {
  const { discount, result } = await findAndCheckDiscount(HERO_PROMO_CODE, 0);
  if (!discount || !result.valid) return null;
  return { code: discount.code, amount: formatDiscountValue(discount) };
}
