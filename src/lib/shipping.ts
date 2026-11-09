// Shipping costs, in Toman. Kept in this one DB-free module so the server
// (which charges it, see buildOrderDraft) and every page that mentions it
// use the same numbers. Changing a number here changes the whole site.

/** Shipping to an address in Tehran province, for orders below FREE_SHIPPING_MIN. */
export const TEHRAN_SHIPPING_FEE = 250_000;

/** Shipping to every other province, for orders below FREE_SHIPPING_MIN. */
export const PROVINCE_SHIPPING_FEE = 700_000;

/** From this amount of goods (after the discount) shipping is free. */
export const FREE_SHIPPING_MIN = 10_000_000;

/** The province the lower fee applies to; its spelling in IRAN_PROVINCES. */
export const TEHRAN_PROVINCE = "تهران";

/**
 * Iran's 31 provinces, for the checkout's province list. A fixed list (not
 * free text) so the server can tell a Tehran address apart for certain.
 */
export const IRAN_PROVINCES = [
  "آذربایجان شرقی",
  "آذربایجان غربی",
  "اردبیل",
  "اصفهان",
  "البرز",
  "ایلام",
  "بوشهر",
  "تهران",
  "چهارمحال و بختیاری",
  "خراسان جنوبی",
  "خراسان رضوی",
  "خراسان شمالی",
  "خوزستان",
  "زنجان",
  "سمنان",
  "سیستان و بلوچستان",
  "فارس",
  "قزوین",
  "قم",
  "کردستان",
  "کرمان",
  "کرمانشاه",
  "کهگیلویه و بویراحمد",
  "گلستان",
  "گیلان",
  "لرستان",
  "مازندران",
  "مرکزی",
  "هرمزگان",
  "همدان",
  "یزد",
] as const;

/**
 * The shipping fee for an order whose goods come to `itemsTotal` after the
 * discount, sent to `province`. Measured after the discount so a code can't
 * take an order below the threshold and still keep free shipping.
 */
export function shippingFee(itemsTotal: number, province: string): number {
  if (itemsTotal >= FREE_SHIPPING_MIN) return 0;
  return province === TEHRAN_PROVINCE ? TEHRAN_SHIPPING_FEE : PROVINCE_SHIPPING_FEE;
}

/** How much more the buyer would have to add for free shipping (0 once it's free). */
export function amountUntilFreeShipping(itemsTotal: number): number {
  return Math.max(0, FREE_SHIPPING_MIN - itemsTotal);
}

/**
 * A stored order's shipping as shown to people: "رایگان" for 0, and for
 * orders from before shipping had a price (no fee stored).
 */
export function formatShippingFee(fee: number | null | undefined): string {
  return fee ? `${fee.toLocaleString("fa-IR")} تومان` : "رایگان";
}

/** The threshold as shown on the site, e.g. "۱۰٬۰۰۰٬۰۰۰ تومان". */
export const FREE_SHIPPING_MIN_LABEL = `${FREE_SHIPPING_MIN.toLocaleString("fa-IR")} تومان`;

/** Both fees as shown on the site. */
export const SHIPPING_FEES_LABEL = `تهران ${TEHRAN_SHIPPING_FEE.toLocaleString("fa-IR")} و سایر استان‌ها ${PROVINCE_SHIPPING_FEE.toLocaleString("fa-IR")} تومان`;
