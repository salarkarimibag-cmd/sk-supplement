import type { Product } from "@/models/Product";
import { MAX_PER_ORDER } from "@/lib/stock";

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface PricedLine {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export type PriceCartResult =
  | { ok: true; items: PricedLine[]; subtotal: number }
  | { ok: false; message: string };

/**
 * Prices a cart from the catalog, never from what the browser sent: the
 * client only says *which* products and *how many*, and every price comes
 * from `products` (loaded from the database by the caller). Without this, a
 * buyer could edit the prices stored in localStorage and pay whatever they like.
 */
export function priceCart(
  lines: CartLine[],
  products: Pick<Product, "id" | "name" | "price" | "stock">[]
): PriceCartResult {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const items: PricedLine[] = [];

  // Each product may appear once: otherwise 2 lines of 3 could slip past a
  // stock of 5, since stock is checked line by line.
  if (new Set(lines.map((line) => line.productId)).size !== lines.length) {
    return { ok: false, message: "سبد خرید نامعتبر است." };
  }

  for (const line of lines) {
    const product = productsById.get(line.productId);
    if (!product) {
      return { ok: false, message: "یکی از محصولات سبد خرید دیگر موجود نیست." };
    }
    if (line.quantity > product.stock) {
      return { ok: false, message: `موجودی «${product.name}» کافی نیست.` };
    }
    if (line.quantity > MAX_PER_ORDER) {
      return {
        ok: false,
        message: `از هر محصول حداکثر ${MAX_PER_ORDER.toLocaleString("fa-IR")} عدد در هر سفارش می‌توان خرید.`,
      };
    }
    items.push({ productId: product.id, quantity: line.quantity, unitPrice: product.price });
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return { ok: true, items, subtotal };
}
