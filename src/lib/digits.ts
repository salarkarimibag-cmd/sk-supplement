// Its own module (no imports), so client code such as the header search can
// use it without pulling in zod along with the rest of cardPayment.

export const PERSIAN_ZERO = "۰".charCodeAt(0);
export const ARABIC_ZERO = "٠".charCodeAt(0);

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
