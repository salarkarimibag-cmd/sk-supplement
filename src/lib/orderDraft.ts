import { z } from "zod";
import { ProductModel, type Product } from "@/models/Product";
import { DiscountCodeModel } from "@/models/DiscountCode";
import { checkDiscount } from "@/lib/discounts";
import { priceCart, type PricedLine } from "@/lib/pricing";

// Only what the buyer actually chooses: who they are, where to ship, which
// products and how many. Prices, the discount amount and the total are
// deliberately absent — the server computes them (see priceCart). Shared by
// every payment method's route, which extend it with their own fields.
export const orderRequestSchema = z.object({
  contact: z.object({
    email: z.email(),
    mobile: z.string().trim().min(10),
  }),
  shippingAddress: z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    province: z.string().trim().min(1),
    city: z.string().trim().min(1),
    address: z.string().trim().min(1),
    postalCode: z.string().trim().min(1),
  }),
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

export type BuildOrderDraftResult = { ok: true; draft: OrderDraft } | { ok: false; message: string };

/**
 * Prices the cart from the database and re-checks the discount code. The
 * caller must already be connected to the database.
 */
export async function buildOrderDraft(body: OrderRequest): Promise<BuildOrderDraftResult> {
  const products = await ProductModel.find({
    id: { $in: body.items.map((item) => item.productId) },
  }).lean<Product[]>();

  const priced = priceCart(body.items, products);
  if (!priced.ok) {
    return { ok: false, message: priced.message };
  }

  // The code is re-checked here even though checkout already validated it:
  // that earlier check only drives what the page displays, and its result
  // can't be trusted once it has round-tripped through the browser.
  let discountCode: string | undefined;
  let discountAmount = 0;
  if (body.discountCode) {
    const discount = await DiscountCodeModel.findOne({ code: body.discountCode.toUpperCase() });
    const result = checkDiscount(discount, priced.subtotal);
    if (!result.valid) {
      return { ok: false, message: result.message };
    }
    discountCode = result.code;
    discountAmount = result.discountAmount;
  }

  const totalPrice = priced.subtotal - discountAmount;
  if (totalPrice <= 0) {
    return { ok: false, message: "مبلغ نامعتبر است." };
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
