import { z } from "zod";

/** The category combo packs belong to; its page is src/app/collections/packs. */
export const PACKS_CATEGORY = {
  slug: "packs",
  title: "پک‌های ترکیبی",
  description: "چند مکمل پرکاربرد را یک‌جا و با قیمتی کمتر از خرید جداگانه‌ی هر کدام تهیه کنید.",
};

/** The most products one pack can list. */
const MAX_PACK_PRODUCTS = 10;

// The same id format as productCreateSchema, since these point at product ids.
export const packContentsSchema = z.object({
  packProductIds: z
    .array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/))
    .max(MAX_PACK_PRODUCTS)
    .optional(),
});

/** The admin form's "on1, on2" text as ids; a Persian comma works too. */
export function parsePackProductIds(text: string): string[] {
  return [
    ...new Set(
      text
        .split(/[,،\s]+/)
        .map((id) => id.trim())
        .filter(Boolean)
    ),
  ];
}

export interface PackSavings {
  /** What the pack's products cost bought separately, in Toman. */
  fullPrice: number;
  /** Rounded down, so the page never promises more than the real saving. */
  percent: number;
}

/**
 * What a pack saves over buying its products separately, from their current
 * prices, so it stays true when an admin changes one. Null when there's
 * nothing honest to show: a product of the pack was deleted (the sum would be
 * too low), or the pack doesn't cost less.
 */
export function packSavings(
  pack: { price: number; packProductIds?: string[] },
  products: { id: string; price: number }[]
): PackSavings | null {
  const ids = pack.packProductIds ?? [];
  const prices = new Map(products.map((product) => [product.id, product.price]));
  if (ids.length === 0 || !ids.every((id) => prices.has(id))) return null;

  const fullPrice = ids.reduce((sum, id) => sum + (prices.get(id) ?? 0), 0);
  if (fullPrice <= pack.price) return null;
  return { fullPrice, percent: Math.floor(((fullPrice - pack.price) / fullPrice) * 100) };
}
