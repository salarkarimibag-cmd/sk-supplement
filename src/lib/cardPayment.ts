import { z } from "zod";

export interface ShopCard {
  number: string;
  holder: string;
  bank?: string;
}

/**
 * The shop's bank card that buyers transfer to, from the host's environment
 * variables. Returns null when it isn't configured, in which case checkout
 * hides the card-to-card option instead of showing an empty card number.
 * Server-only: these aren't NEXT_PUBLIC_ variables, so the browser bundle
 * never sees them.
 */
export function getShopCard(): ShopCard | null {
  const number = process.env.CARD_NUMBER?.replace(/\D/g, "");
  const holder = process.env.CARD_HOLDER?.trim();
  if (!number || number.length !== 16 || !holder) return null;
  return { number, holder, bank: process.env.CARD_BANK?.trim() || undefined };
}

/** "6037991234567890" → "6037 9912 3456 7890", for reading the number aloud or copying it by eye. */
export function formatCardNumber(number: string): string {
  return number.replace(/(\d{4})(?=\d)/g, "$1 ");
}

const PERSIAN_ZERO = "۰".charCodeAt(0);
const ARABIC_ZERO = "٠".charCodeAt(0);

/**
 * Converts Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII 0-9. A
 * Persian keyboard types the former, so without this "۱۲۳۴" would fail a
 * /^\d{4}$/ check even though it's exactly what the buyer meant.
 */
export function toEnglishDigits(text: string): string {
  return text.replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.charCodeAt(0);
    const zero = code >= PERSIAN_ZERO ? PERSIAN_ZERO : ARABIC_ZERO;
    return String(code - zero);
  });
}

// Bank receipts call this «کد پیگیری» or «شماره مرجع»; it's digits on most
// receipts, but some banks include letters, so both are accepted.
export const cardTransferSchema = z.object({
  trackingCode: z
    .string()
    .transform((value) => toEnglishDigits(value).replace(/\s/g, ""))
    .pipe(z.string().regex(/^[0-9A-Za-z]{4,30}$/)),
  cardLast4: z
    .string()
    .transform((value) => toEnglishDigits(value).trim())
    .pipe(z.string().regex(/^\d{4}$/)),
});
