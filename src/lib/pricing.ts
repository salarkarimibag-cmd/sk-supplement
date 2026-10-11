import type { Product } from "@/models/Product";

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

  for (const line of lines) {
    const product = productsById.get(line.productId);
    if (!product) {
      return { ok: false, message: "یکی از محصولات سبد خرید دیگر موجود نیست." };
    }
    if (line.quantity > product.stock) {
      return { ok: false, message: `موجودی «${product.name}» کافی نیست.` };
    }
    items.push({ productId: product.id, quantity: line.quantity, unitPrice: product.price });
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return { ok: true, items, subtotal };
}
