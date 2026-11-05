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
    // A repeated id would move that product's stock twice per pack sold.
    .transform((ids) => [...new Set(ids)])
    .optional(),
});

/** What packContentsError needs to know about a product a pack lists. */
export interface PackContentCandidate {
  id: string;
  packProductIds?: string[] | null;
}

/**
 * Why a pack can't list these products, or null when it can. Stock only
 * moves one level deep (see expandStockLines), so a pack must list plain
 * products that exist: not itself, not another pack, and it can't become a
 * pack while another pack lists it. Pure, so the routes pass in what they
 * loaded: `found` is the listed products found in the database, and
 * `listedByAnotherPack` whether some other pack already lists this one.
 */
export function packContentsError(
  packId: string,
  packProductIds: string[],
  found: PackContentCandidate[],
  listedByAnotherPack: boolean
): string | null {
  if (packProductIds.length === 0) return null;
  if (packProductIds.includes(packId)) {
    return "پک نمی‌تواند خودش را در محتویاتش داشته باشد.";
  }
  const foundIds = new Set(found.map((product) => product.id));
  const missing = packProductIds.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    return `این شناسه‌ها پیدا نشدند: ${missing.join("، ")}`;
  }
  const nested = found.filter((product) => product.packProductIds?.length);
  if (nested.length > 0) {
    return `پک نمی‌تواند پک دیگری را در خود داشته باشد: ${nested.map((p) => p.id).join("، ")}`;
  }
  if (listedByAnotherPack) {
    return "این محصول در یک پک دیگر آمده، پس خودش نمی‌تواند پک باشد.";
  }
  return null;
}

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

/**
 * How many of a product can be sold: its own stock, and for a combo pack no
 * more than the scarcest product inside it, or none if one of them was
 * deleted. Oversold products have negative stock, which counts as none.
 */
export function packStock(
  pack: { stock: number; packProductIds?: string[] },
  products: { id: string; stock: number }[]
): number {
  const ids = pack.packProductIds ?? [];
  const stockById = new Map(products.map((product) => [product.id, product.stock]));
  return ids.reduce(
    (lowest, id) => Math.max(0, Math.min(lowest, stockById.get(id) ?? 0)),
    pack.stock
  );
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
