// How customers reach the shop, shown on the contact page and given to
// search engines in the home page's structured data. eNamad checks these
// against the shop's registration, so they must match it exactly.

export const CONTACT_EMAIL = "info@sksupplement.shop";

/** As dialled inside Iran. */
export const CONTACT_PHONE = "09185569614";

export const CONTACT_HOURS = "شنبه تا پنج‌شنبه، ساعت ۹ تا ۱۷";

export const CONTACT_ADDRESS = {
  region: "البرز",
  street: "شهرک بعثت (مهندسی زراعی)، بلوار ملاصدرا، کوچه زنبق ۷، ساختمان ستیا",
};

/** "09…" as "+989…", which works from any country (tel: links, structured data). */
export function toInternationalPhone(phone: string): string {
  return `+98${phone.replace(/^0/, "")}`;
}

/** Latin digits as Persian ones, keeping a leading zero that a number would drop. */
export function toPersianDigits(text: string): string {
  return text.replace(/\d/g, (digit) => Number(digit).toLocaleString("fa-IR"));
}
