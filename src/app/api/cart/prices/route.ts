import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import type { CartCatalogEntry } from "@/lib/cartSync";
import { ProductModel } from "@/models/Product";

// z.string() items, so a JSON object such as {"$ne": null} is rejected here
// instead of reaching the query as an operator. Same 50-line limit as an order.
const cartPricesSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(50),
});

// The current name, price and photo of the products in a cart, so checkout
// can replace the prices saved in the browser with the ones the order will
// actually be charged (see syncCartItems). Read-only; the order routes still
// price every order themselves.
export async function POST(request: Request) {
  const parsed = cartPricesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: "سبد خرید نامعتبر است." }, { status: 400 });
  }

  await connectToDatabase();
  const products = await ProductModel.find(
    { id: { $in: parsed.data.productIds } },
    { _id: 0, id: 1, name: 1, price: 1, imageUrl: 1 }
  ).lean<CartCatalogEntry[]>();

  return Response.json({ products });
}
