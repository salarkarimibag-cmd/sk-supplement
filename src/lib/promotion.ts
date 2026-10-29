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
 * (findAndCheckDiscount), for a cart big enough for any minimum it has: the
 * question is whether the code is usable at all, not for a particular cart.
 */
export async function getHeroPromotion(): Promise<HeroPromotion | null> {
  const { discount, result } = await findAndCheckDiscount(HERO_PROMO_CODE, Infinity);
  if (!discount || !result.valid) return null;
  return { code: discount.code, amount: formatDiscountValue(discount) };
}
