/**
 * Persian names for the brands, as Iranian shops write them. Products store
 * the brand in English (that's what's on the label and in the ?brand= filter),
 * so this is only used where the name is shown to the customer.
 */
const PERSIAN_BRAND_NAMES: Record<string, string> = {
  "Applied Nutrition": "اپلاید نوتریشن",
  "BPI Sports": "بی‌پی‌آی اسپورتس",
  BSN: "بی‌اس‌ان",
  Cellucor: "سلوکور",
  Dymatize: "دایماتیز",
  Evogen: "ایووژن",
  MuscleTech: "ماسل‌تک",
  MyProtein: "مای‌پروتئین",
  Nutrex: "ناترکس",
  "Optimum Nutrition": "اپتیموم نوتریشن",
  "Rule 1": "رول وان",
  "Scitec Nutrition": "سایتک نوتریشن",
  "Universal Nutrition": "یونیورسال نوتریشن",
  "Zoomad Labs": "زومات لب",
};

/** The brand's Persian name, or the English one for a brand not in the list yet. */
export function brandLabel(brand: string): string {
  return PERSIAN_BRAND_NAMES[brand] ?? brand;
}
