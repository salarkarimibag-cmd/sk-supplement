import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { checkDiscountForVisitor } from "@/lib/discountLookup";
import { contactSchema } from "@/lib/checkoutFields";
import { orderRequestSchema } from "@/lib/orderDraft";
import { discountableSubtotal } from "@/lib/pricing";
import { getClientIp, getOrSetDeviceId } from "@/lib/rateLimit";
import { ProductModel, type Product } from "@/models/Product";

// z.string(), so a non-string code (e.g. {"$ne": null}) can neither crash
// .toUpperCase() nor reach the query as an operator. The cart comes as
// products and quantities, the same as an order: the amount off is worked out
// from the catalog's prices, not from a total the browser sent.
const validateSchema = z.object({
  code: z.string().trim().min(1),
  items: orderRequestSchema.shape.items,
  contact: z.unknown().optional(),
});

export async function POST(request: Request) {
  const parsed = validateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ valid: false, message: "کد تخفیف یا سبد خرید نامعتبر است." }, { status: 400 });
  }
  const { code, items } = parsed.data;

  // The buyer's email and mobile, once filled in, so a first-purchase-only
  // code is turned down here rather than only when they pay. Optional: a
  // missing or half-typed contact just leaves that check to placing the order.
  const contact = contactSchema.safeParse(parsed.data.contact);

  await connectToDatabase();
  const products = await ProductModel.find(
    { id: { $in: items.map((item) => item.productId) } },
    { _id: 0, id: 1, price: 1, packProductIds: 1 }
  ).lean<Pick<Product, "id" | "price" | "packProductIds">[]>();

  const { result, rateLimited } = await checkDiscountForVisitor(
    code,
    discountableSubtotal(items, products),
    { ip: getClientIp(request), deviceId: await getOrSetDeviceId() },
    contact.success ? contact.data : undefined
  );

  // CheckoutView shows `message` for any response without `valid: true`.
  // `packsExcluded` lets it say why the amount off is less than expected.
  return Response.json(
    { ...result, packsExcluded: products.some((product) => product.packProductIds?.length) },
    { status: rateLimited ? 429 : 200 }
  );
}
