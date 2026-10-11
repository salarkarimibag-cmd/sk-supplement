import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { ProductModel, type Product } from "@/models/Product";
import { DiscountCodeModel } from "@/models/DiscountCode";
import { requestZarinPalPayment } from "@/lib/zarinpal";
import { getSessionUser } from "@/lib/auth";
import { checkDiscount } from "@/lib/discounts";
import { priceCart } from "@/lib/pricing";
import { SITE_URL } from "@/lib/site";

// Only what the buyer actually chooses: who they are, where to ship, which
// products and how many. Prices, the discount amount and the total are
// deliberately absent — the server computes them (see priceCart).
const paymentRequestSchema = z.object({
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

export async function POST(request: Request) {
  const parsed = paymentRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: "اطلاعات سفارش ناقص یا نامعتبر است." }, { status: 400 });
  }
  const body = parsed.data;

  await connectToDatabase();
  const sessionUser = await getSessionUser();

  const products = await ProductModel.find({
    id: { $in: body.items.map((item) => item.productId) },
  }).lean<Product[]>();

  const priced = priceCart(body.items, products);
  if (!priced.ok) {
    return Response.json({ message: priced.message }, { status: 400 });
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
      return Response.json({ message: result.message }, { status: 400 });
    }
    discountCode = result.code;
    discountAmount = result.discountAmount;
  }

  const totalPrice = priced.subtotal - discountAmount;
  if (totalPrice <= 0) {
    return Response.json({ message: "مبلغ نامعتبر است." }, { status: 400 });
  }

  // Built from SITE_URL rather than request.url: behind a reverse proxy,
  // request.url can carry the internal address (e.g. http://localhost:3000)
  // instead of the public domain ZarinPal must redirect the buyer back to.
  // No amount in the URL: the callback reads it from the saved order.
  const callbackUrl = `${SITE_URL}/checkout/callback`;

  const result = await requestZarinPalPayment({
    amountToman: totalPrice,
    description: "خرید از SK Supplement",
    callbackUrl,
    email: body.contact.email,
    mobile: body.contact.mobile,
  });

  if (!result.ok) {
    return Response.json({ message: result.message }, { status: 502 });
  }

  // Persisted now, before the redirect, since the checkout callback route
  // (called by ZarinPal, not the browser) never sees the cart or this form
  // data again — only `authority` links it back to this order.
  await OrderModel.create({
    userId: sessionUser?.id,
    items: priced.items,
    contact: body.contact,
    shippingAddress: body.shippingAddress,
    totalPrice,
    discountCode,
    discountAmount: discountCode ? discountAmount : undefined,
    status: "pending",
    paymentAuthority: result.authority,
  });

  return Response.json({ url: result.paymentUrl });
}
