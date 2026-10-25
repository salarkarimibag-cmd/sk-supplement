import { ARABIC_ZERO, PERSIAN_ZERO, toEnglishDigits } from "@/lib/digits";
import { escapeRegex } from "@/lib/escapeRegex";

// Persian text can be typed in ways that look the same but are different
// characters, so a search for one wouldn't find the other:
// - an Arabic keyboard types ي and ك instead of the Persian ی and ک;
// - many people type a space where names use a half-space (ZWNJ), as in
//   «سی فور» for «سی‌فور»;
// - names mix Persian and English digits («۴» and «4»).
const ZWNJ = "‌";

/**
 * Lowercases `text` and brings those variants to one form, one character
 * for one character, so positions in the result are positions in `text`.
 */
export function normalizeSearchText(text: string): string {
  return toEnglishDigits(text.toLowerCase())
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(new RegExp(ZWNJ, "g"), " ");
}

/**
 * Where `query` first appears in `text`, ignoring upper/lower case and the
 * variants above (so "whey" finds "Gold Standard Whey" and «سی فور» finds
 * «سی‌فور»), or -1.
 */
export function findMatch(text: string, query: string): number {
  return normalizeSearchText(text).indexOf(normalizeSearchText(query));
}

/** Whether `text` contains `query`, ignoring case and the variants above. */
export function matchesQuery(text: string, query: string): boolean {
  return findMatch(text, query) !== -1;
}

// For the database search: each normalized character becomes a class that
// matches every way it may be stored. The characters are written literally,
// not as \u escapes, which MongoDB's regex engine doesn't understand.
const VARIANT_CLASSES: Record<string, string> = {
  "ی": "[یيى]",
  "ک": "[کك]",
  // One or more spaces or half-spaces.
  " ": `[\\s${ZWNJ}]+`,
  // "4" → "[4۴٤]": English, Persian and Arabic-Indic.
  ...Object.fromEntries(
    [..."0123456789"].map((digit, value) => [
      digit,
      `[${digit}${String.fromCharCode(PERSIAN_ZERO + value)}${String.fromCharCode(ARABIC_ZERO + value)}]`,
    ])
  ),
};

/**
 * A regex pattern (for MongoDB's $regex, with the "i" option) that finds
 * `query` the way findMatch does. Everything else is escaped, so the query
 * is matched literally and can't run as a regex of its own.
 */
export function searchPattern(query: string): string {
  return [...normalizeSearchText(query.trim()).replace(/\s+/g, " ")]
    .map((char) => VARIANT_CLASSES[char] ?? escapeRegex(char))
    .join("");
}
