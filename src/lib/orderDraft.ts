import { z } from "zod";
import { ProductModel, type Product } from "@/models/Product";
import { contactSchema, shippingAddressSchema } from "@/lib/checkoutFields";
import { checkDiscountForVisitor, type Visitor } from "@/lib/discountLookup";
import { priceCart, type PricedLine } from "@/lib/pricing";
import { reserveStock } from "@/lib/products";

// Only what the buyer actually chooses: who they are, where to ship, which
// products and how many. Prices, the discount amount and the total are
// deliberately absent — the server computes them (see priceCart). Shared by
// every payment method's route, which extend it with their own fields.
export const orderRequestSchema = z.object({
  // The same rules the checkout form checks (src/lib/checkoutFields.ts).
  contact: contactSchema,
  shippingAddress: shippingAddressSchema,
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1)
    .max(50),
  discountCode: z.string().trim().optional(),
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;

/** The fields of a new order that don't depend on how it's paid. */
export interface OrderDraft {
  items: PricedLine[];
  contact: OrderRequest["contact"];
  shippingAddress: OrderRequest["shippingAddress"];
  totalPrice: number;
  discountCode?: string;
  discountAmount?: number;
}

export type BuildOrderDraftResult =
  | { ok: true; draft: OrderDraft }
  // 429 when the visitor has entered too many invalid discount codes.
  | { ok: false; message: string; status: 400 | 429 };

/**
 * Prices the cart from the database and re-checks the discount code. The
 * caller must already be connected to the database. `visitor` throttles
 * discount code guessing (see checkDiscountForVisitor).
 */
export async function buildOrderDraft(
  body: OrderRequest,
  visitor: Visitor
): Promise<BuildOrderDraftResult> {
  const products = await ProductModel.find({
    id: { $in: body.items.map((item) => item.productId) },
  }).lean<Product[]>();

  const priced = priceCart(body.items, products);
  if (!priced.ok) {
    return { ok: false, message: priced.message, status: 400 };
  }

  // The code is re-checked here even though checkout already validated it:
  // that earlier check only drives what the page displays, and its result
  // can't be trusted once it has round-tripped through the browser.
  let discountCode: string | undefined;
  let discountAmount = 0;
  if (body.discountCode) {
    const { result, rateLimited } = await checkDiscountForVisitor(
      body.discountCode,
      priced.subtotal,
      visitor
    );
    if (!result.valid) {
      return { ok: false, message: result.message, status: rateLimited ? 429 : 400 };
    }
    discountCode = result.code;
    discountAmount = result.discountAmount;
  }

  const totalPrice = priced.subtotal - discountAmount;
  if (totalPrice <= 0) {
    return { ok: false, message: "مبلغ نامعتبر است.", status: 400 };
  }

  return {
    ok: true,
    draft: {
      items: priced.items,
      contact: body.contact,
      shippingAddress: body.shippingAddress,
      totalPrice,
      discountCode,
      discountAmount: discountCode ? discountAmount : undefined,
    },
  };
}

/**
 * Takes the draft's items out of stock for the order about to be saved (see
 * reserveStock). priceCart already checked the stock, but only by reading
 * it: this is the step that decides, atomically, who gets the last unit.
 * If the order then isn't saved, the caller must give the stock back with
 * releaseStock.
 */
export async function reserveDraftStock(
  draft: OrderDraft
): Promise<{ ok: true } | { ok: false; message: string; status: 409 }> {
  const shortProductId = await reserveStock(draft.items);
  if (shortProductId === null) return { ok: true };
  const product = await ProductModel.findOne({ id: shortProductId }, { name: 1 }).lean<
    Pick<Product, "name">
  >();
  return {
    ok: false,
    message: product
      ? `موجودی «${product.name}» کافی نیست.`
      : "یکی از محصولات سبد خرید دیگر موجود نیست.",
    status: 409,
  };
}
