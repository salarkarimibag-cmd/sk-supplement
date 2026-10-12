import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { requestZarinPalPayment } from "@/lib/zarinpal";
import { getSessionUser } from "@/lib/auth";
import { buildOrderDraft, orderRequestSchema } from "@/lib/orderDraft";
import { SITE_URL } from "@/lib/site";

export async function POST(request: Request) {
  const parsed = orderRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: "اطلاعات سفارش ناقص یا نامعتبر است." }, { status: 400 });
  }

  await connectToDatabase();
  const sessionUser = await getSessionUser();

  const built = await buildOrderDraft(parsed.data);
  if (!built.ok) {
    return Response.json({ message: built.message }, { status: 400 });
  }
  const { draft } = built;

  // Built from SITE_URL rather than request.url: behind a reverse proxy,
  // request.url can carry the internal address (e.g. http://localhost:3000)
  // instead of the public domain ZarinPal must redirect the buyer back to.
  // No amount in the URL: the callback reads it from the saved order.
  const callbackUrl = `${SITE_URL}/checkout/callback`;

  const result = await requestZarinPalPayment({
    amountToman: draft.totalPrice,
    description: "خرید از SK Supplement",
    callbackUrl,
    email: draft.contact.email,
    mobile: draft.contact.mobile,
  });

  if (!result.ok) {
    return Response.json({ message: result.message }, { status: 502 });
  }

  // Persisted now, before the redirect, since the checkout callback route
  // (called by ZarinPal, not the browser) never sees the cart or this form
  // data again — only `authority` links it back to this order.
  await OrderModel.create({
    ...draft,
    userId: sessionUser?.id,
    paymentMethod: "zarinpal",
    status: "pending",
    paymentAuthority: result.authority,
  });

  return Response.json({ url: result.paymentUrl });
}
