import { SALES_OPEN } from "@/lib/sales";
import {
  amountUntilFreeShipping,
  FREE_SHIPPING_MIN,
  FREE_SHIPPING_MIN_LABEL,
  SHIPPING_FEES_LABEL,
} from "@/lib/shipping";

/**
 * The shipping line under the cart total: how far the cart is from free
 * shipping. The cart doesn't know about discount codes, so this is a hint;
 * checkout shows the real fee. While sales are closed prices are hidden,
 * so only the rule is shown, not how much is missing.
 */
export default function FreeShippingNote({ itemsTotal }: { itemsTotal: number }) {
  let text: string;
  if (!SALES_OPEN) {
    text = `ارسال رایگان برای خریدهای بالای ${FREE_SHIPPING_MIN_LABEL}.`;
  } else if (itemsTotal >= FREE_SHIPPING_MIN) {
    text = "ارسال این سفارش رایگان است.";
  } else {
    // The province is only known at checkout, so both fees are given.
    const missing = amountUntilFreeShipping(itemsTotal).toLocaleString("fa-IR");
    text = `هزینه‌ی ارسال: ${SHIPPING_FEES_LABEL}. با ${missing} تومان خرید بیشتر، ارسال رایگان می‌شود.`;
  }
  return <p className="mt-1 text-xs text-zinc-500">{text}</p>;
}
