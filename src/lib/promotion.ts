import { connectToDatabase } from "@/lib/db";
import { checkDiscount, formatDiscountValue } from "@/lib/discounts";
import { DiscountCodeModel, type DiscountCode } from "@/models/DiscountCode";

/** The discount code the home hero advertises. */
export const HERO_PROMO_CODE = "WELCOME10";

export interface HeroPromotion {
  code: string;
  /** How much it takes off, ready to show: "۱۰٪" or "۵۰٬۰۰۰ تومان". */
  amount: string;
}

/**
 * The hero's advertised code, or null if it can't be used right now
 * (missing, deactivated, expired or used up), so the page never promotes a
 * code that checkout would reject. Uses the same checkDiscount rules as
 * checkout; the subtotal doesn't matter for whether a code is usable.
 */
export async function getHeroPromotion(): Promise<HeroPromotion | null> {
  await connectToDatabase();
  const discount = await DiscountCodeModel.findOne({ code: HERO_PROMO_CODE }).lean<DiscountCode>();
  if (!discount || !checkDiscount(discount, 0).valid) return null;
  return { code: discount.code, amount: formatDiscountValue(discount) };
}
