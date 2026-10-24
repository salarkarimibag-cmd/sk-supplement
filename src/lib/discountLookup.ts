import { connectToDatabase } from "@/lib/db";
import { checkDiscount, heldOrdersFilter, type DiscountCheckResult } from "@/lib/discounts";
import { DiscountCodeModel, type DiscountCode } from "@/models/DiscountCode";
import { OrderModel } from "@/models/Order";

/**
 * Looks up a discount code and checks it, counting the unpaid orders that
 * already hold it against its usage limit (see heldOrdersFilter). Every
 * place that decides whether a code can be used goes through here, so the
 * code box at checkout, placing the order and the home hero all agree.
 */
export async function findAndCheckDiscount(
  code: string,
  subtotal: number
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

  return { discount, result: checkDiscount(discount, subtotal, heldUses) };
}
