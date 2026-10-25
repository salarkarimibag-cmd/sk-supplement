import { z } from "zod";
import { toEnglishDigits } from "@/lib/cardPayment";
import { EMAIL_MAX_LENGTH } from "@/lib/publicForms";

// The buyer's contact and shipping fields, shared by the checkout form and
// the order API (orderRequestSchema), so the two can't drift apart. The
// Persian messages are what the form shows under each field.

// Length limits, also used as the inputs' maxLength.
export const NAME_MAX_LENGTH = 100;
export const PLACE_MAX_LENGTH = 100;
export const ADDRESS_MAX_LENGTH = 500;

/**
 * Brings the ways people write an Iranian mobile number to one form:
 * "۰۹۱۲ ۳۴۵ ۶۷۸۹", "+98 912 345 6789", "00989123456789" and "9123456789"
 * all become "09123456789". Anything else is returned as typed (digits
 * converted, spaces removed) for mobileSchema to reject.
 */
export function normalizeMobile(value: string): string {
  const digits = toEnglishDigits(value).replace(/[\s()-]/g, "");
  if (digits.startsWith("+98")) return `0${digits.slice(3)}`;
  if (digits.startsWith("0098")) return `0${digits.slice(4)}`;
  if (digits.startsWith("98") && digits.length === 12) return `0${digits.slice(2)}`;
  if (digits.startsWith("9") && digits.length === 10) return `0${digits}`;
  return digits;
}

/** "۱۲۳۴۵-۶۷۸۹۰" → "1234567890": Persian digits converted, spaces and dashes removed. */
export function normalizePostalCode(value: string): string {
  return toEnglishDigits(value).replace(/[\s-]/g, "");
}

// z.string() first, so a non-string value is a validation error, not a crash.
function requiredText(maxLength: number, requiredMessage: string, tooLongMessage: string) {
  return z.string().trim().min(1, requiredMessage).max(maxLength, tooLongMessage);
}

export const contactSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "ایمیل الزامی است.")
    .max(EMAIL_MAX_LENGTH, "ایمیل نامعتبر است.")
    .pipe(z.email("ایمیل نامعتبر است.")),
  mobile: z
    .string()
    .transform(normalizeMobile)
    .pipe(z.string().regex(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.")),
});

export const shippingAddressSchema = z.object({
  firstName: requiredText(NAME_MAX_LENGTH, "نام الزامی است.", "نام بیش از حد طولانی است."),
  lastName: requiredText(
    NAME_MAX_LENGTH,
    "نام خانوادگی الزامی است.",
    "نام خانوادگی بیش از حد طولانی است."
  ),
  province: requiredText(PLACE_MAX_LENGTH, "استان الزامی است.", "نام استان بیش از حد طولانی است."),
  city: requiredText(PLACE_MAX_LENGTH, "شهر الزامی است.", "نام شهر بیش از حد طولانی است."),
  address: requiredText(ADDRESS_MAX_LENGTH, "آدرس الزامی است.", "آدرس بیش از حد طولانی است."),
  // Iranian postal codes are 10 digits.
  postalCode: z
    .string()
    .transform(normalizePostalCode)
    .pipe(z.string().regex(/^\d{10}$/, "کد پستی باید ۱۰ رقم باشد.")),
});
