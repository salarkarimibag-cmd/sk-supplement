import { connectToDatabase } from "@/lib/db";
import {
  checkDiscount,
  heldOrdersFilter,
  previousOrdersFilter,
  type Customer,
  type DiscountCheckResult,
} from "@/lib/discounts";
import { isRateLimited } from "@/lib/rateLimit";
import { DiscountCodeModel, type DiscountCode } from "@/models/DiscountCode";
import { DiscountCodeAttemptModel } from "@/models/DiscountCodeAttempt";
import { OrderModel } from "@/models/Order";

/** Who is entering a code: the same two signals every rate limit uses. */
export interface Visitor {
  ip: string;
  deviceId: string;
}

// Enough for a few typos, far too few to find a code by trying many.
const CODE_GUESS_WINDOW_MS = 15 * 60 * 1000;
const MAX_INVALID_CODES = 10;
const TOO_MANY_CODES_MESSAGE =
  "کدهای تخفیف نامعتبرِ زیادی وارد شده. لطفاً ۱۵ دقیقه‌ی دیگر دوباره تلاش کنید.";

/**
 * Looks up a discount code and checks it, counting the unpaid orders that
 * already hold it against its usage limit (see heldOrdersFilter). Every
 * place that decides whether a code can be used goes through here, so the
 * code box at checkout, placing the order and the home hero all agree.
 *
 * `customer` is checked against a firstOrderOnly code. Without it (the
 * buyer hasn't filled in the contact form yet) such a code is accepted for
 * now; placing the order always passes it, so that's where it's enforced.
 */
export async function findAndCheckDiscount(
  code: string,
  subtotal: number,
  customer?: Customer
): Promise<{ discount: DiscountCode | null; result: DiscountCheckResult }> {
  await connectToDatabase();
  const discount = await DiscountCodeModel.findOne({
    code: code.trim().toUpperCase(),
  }).lean<DiscountCode>();

  // Only a code with a limit needs the count.
  const heldUses =
    discount?.maxUses != null
      ? await OrderModel.countDocuments(heldOrdersFilter(discount.code, Date.now()))
      : 0;

  const isReturningCustomer =
    discount?.firstOrderOnly && customer
      ? (await OrderModel.exists(previousOrdersFilter(customer))) !== null
      : false;

  return { discount, result: checkDiscount(discount, subtotal, heldUses, isReturningCustomer) };
}

/**
 * findAndCheckDiscount for a code a visitor typed in, throttled so codes
 * can't be found by guessing: each invalid code is logged, and after
 * MAX_INVALID_CODES in CODE_GUESS_WINDOW_MS the visitor gets
 * `rateLimited: true` (the route answers 429) without the code being looked
 * up at all. Every route that accepts a code from a visitor must use this,
 * or the guessing would simply move to the one that doesn't.
 */
export async function checkDiscountForVisitor(
  code: string,
  subtotal: number,
  visitor: Visitor,
  customer?: Customer
): Promise<{ result: DiscountCheckResult; rateLimited: boolean }> {
  await connectToDatabase();

  const limited = await isRateLimited(DiscountCodeAttemptModel, {
    ...visitor,
    windowMs: CODE_GUESS_WINDOW_MS,
    max: MAX_INVALID_CODES,
  });
  if (limited) {
    return { result: { valid: false, message: TOO_MANY_CODES_MESSAGE }, rateLimited: true };
  }

  const { result } = await findAndCheckDiscount(code, subtotal, customer);
  if (!result.valid) await DiscountCodeAttemptModel.create(visitor);
  return { result, rateLimited: false };
}
