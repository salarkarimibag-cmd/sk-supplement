// Shipping costs, in Toman. Kept in this one DB-free module so the server
// (which charges it, see buildOrderDraft) and every page that mentions it
// use the same numbers. Changing a number here changes the whole site.

/** From this amount of goods (after the discount) shipping is free. */
export const FREE_SHIPPING_MIN = 10_000_000;

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

export type Province = (typeof IRAN_PROVINCES)[number];

/**
 * Shipping to each province, for orders below FREE_SHIPPING_MIN. Parcels
 * leave from Tehran, so the fee rises with the road distance from Tehran to
 * the province's capital, in steps (approximate distances in the comments).
 * Typed over every Province, so a province left out or misspelled here is a
 * type error rather than a silently wrong fee.
 */
export const SHIPPING_FEES: Readonly<Record<Province, number>> = {
  // Same province.
  تهران: 250_000,
  // Next door (Karaj ~45 km).
  البرز: 300_000,
  // Up to ~300 km.
  قم: 350_000,
  قزوین: 350_000,
  سمنان: 350_000,
  مازندران: 350_000,
  مرکزی: 350_000,
  // ~300–550 km.
  گیلان: 450_000,
  زنجان: 450_000,
  همدان: 450_000,
  گلستان: 450_000,
  اصفهان: 450_000,
  لرستان: 450_000,
  کردستان: 450_000,
  کرمانشاه: 450_000,
  "چهارمحال و بختیاری": 450_000,
  // ~550–850 km.
  اردبیل: 550_000,
  یزد: 550_000,
  "آذربایجان شرقی": 550_000,
  "آذربایجان غربی": 550_000,
  "خراسان شمالی": 550_000,
  ایلام: 550_000,
  خوزستان: 550_000,
  "کهگیلویه و بویراحمد": 550_000,
  // Over ~850 km.
  "خراسان رضوی": 700_000,
  فارس: 700_000,
  بوشهر: 700_000,
  کرمان: 700_000,
  "خراسان جنوبی": 700_000,
  هرمزگان: 700_000,
  "سیستان و بلوچستان": 700_000,
};

const FEES = Object.values(SHIPPING_FEES);
/** The cheapest and dearest shipping, for texts that can't name the province. */
export const MIN_SHIPPING_FEE = Math.min(...FEES);
export const MAX_SHIPPING_FEE = Math.max(...FEES);

/**
 * The shipping fee for an order whose goods come to `itemsTotal` after the
 * discount, sent to `province`. Measured after the discount so a code can't
 * take an order below the threshold and still keep free shipping.
 */
export function shippingFee(itemsTotal: number, province: string): number {
  if (itemsTotal >= FREE_SHIPPING_MIN) return 0;
  // Object.hasOwn, not `in` or a plain lookup: "toString" must not count.
  // A province not on the list (the order API rejects those anyway) pays
  // the most, so a fee is never undercharged.
  return Object.hasOwn(SHIPPING_FEES, province)
    ? SHIPPING_FEES[province as Province]
    : MAX_SHIPPING_FEE;
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

/** The fee range as shown on the site, e.g. "بسته به استان، ۲۵۰٬۰۰۰ تا ۷۰۰٬۰۰۰ تومان". */
export const SHIPPING_FEES_LABEL = `بسته به استان، ${MIN_SHIPPING_FEE.toLocaleString("fa-IR")} تا ${MAX_SHIPPING_FEE.toLocaleString("fa-IR")} تومان`;

/**
 * The provinces grouped by fee, cheapest first, for the shipping policy
 * page: [[250000, ["تهران"]], [300000, ["البرز"]], …].
 */
export function shippingFeeTiers(): [number, Province[]][] {
  const tiers = new Map<number, Province[]>();
  for (const province of IRAN_PROVINCES) {
    const fee = SHIPPING_FEES[province];
    tiers.set(fee, [...(tiers.get(fee) ?? []), province]);
  }
  return [...tiers.entries()].sort(([a], [b]) => a - b);
}
