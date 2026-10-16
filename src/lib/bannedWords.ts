// Words that get a review rejected outright. Matched as whole words after
// normalizing, so they don't hit innocent words that contain them (the
// "Scunthorpe problem"): for that reason ambiguous short words such as
// "کس" (as in "هیچ‌کس") are deliberately left out. Add entries in their
// plain form; normalizeForMatching handles Arabic letters, half-spaces and
// diacritics.
const BANNED_WORDS = [
  "کیر",
  "کیری",
  "کون",
  "کونی",
  "کسکش",
  "کصکش",
  "کص",
  "کسخل",
  "کصخل",
  "جنده",
  "مادرجنده",
  "جاکش",
  "قرمساق",
  "دیوث",
  "حرومزاده",
  "حرامزاده",
  "پدرسگ",
  "تخمی",
  "گه",
  "گوه",
  "لاشی",
];

/**
 * Brings different spellings of the same word together before matching:
 * Arabic ي/ك to Persian ی/ک, removes zero-width non-joiners ("کس‌کش" →
 * "کسکش"), tatweel (ـ) and Arabic diacritics, and lowercases Latin text.
 */
export function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[‌‍ـً-ٰٟ]/g, "");
}

const bannedSet = new Set(BANNED_WORDS.map(normalizeForMatching));

/** Whether any whole word of the text is on the banned list. */
export function containsBannedWord(text: string): boolean {
  // Split on anything that isn't a letter or a digit, in any script.
  return normalizeForMatching(text)
    .split(/[^\p{L}\p{N}]+/u)
    .some((word) => bannedSet.has(word));
}
