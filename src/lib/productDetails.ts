import { z } from "zod";

export interface NutritionFact {
  label: string;
  amount: string;
}

/**
 * Reads the admin's nutrition-facts textarea: one "label: amount" per line,
 * e.g. "پروتئین: ۲۵ گرم". Blank lines are skipped; lines without a colon (or
 * with an empty side) are returned in `invalidLines` so the form can say
 * which ones to fix instead of silently dropping them.
 */
export function parseNutritionFacts(text: string): {
  facts: NutritionFact[];
  invalidLines: string[];
} {
  const facts: NutritionFact[] = [];
  const invalidLines: string[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const colon = line.indexOf(":");
    const label = colon === -1 ? "" : line.slice(0, colon).trim();
    const amount = colon === -1 ? "" : line.slice(colon + 1).trim();

    if (label && amount) facts.push({ label, amount });
    else invalidLines.push(line);
  }

  return { facts, invalidLines };
}

/** The inverse of parseNutritionFacts, to fill the textarea when editing a product. */
export function formatNutritionFacts(facts: NutritionFact[]): string {
  return facts.map((fact) => `${fact.label}: ${fact.amount}`).join("\n");
}

const nutritionFactSchema = z.object({
  label: z.string().trim().min(1).max(60),
  amount: z.string().trim().min(1).max(40),
});

/** The optional label-and-usage fields an admin can send when creating or editing a product. */
export const productDetailsSchema = z.object({
  servingSize: z.string().trim().max(100).optional(),
  nutritionFacts: z.array(nutritionFactSchema).max(40).optional(),
  usage: z.string().trim().max(2000).optional(),
  warnings: z.string().trim().max(2000).optional(),
});

export type ProductDetails = z.infer<typeof productDetailsSchema>;

/**
 * Maps cleared fields ("" or []) to undefined, so saving an empty textarea
 * removes the field (and the product page hides that section) instead of
 * storing an empty value. Keys that weren't sent stay absent, so a partial
 * update never clears fields it didn't mention.
 */
export function withoutEmptyDetails(details: ProductDetails): ProductDetails {
  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => [
      key,
      value === "" || (Array.isArray(value) && value.length === 0) ? undefined : value,
    ])
  );
}
