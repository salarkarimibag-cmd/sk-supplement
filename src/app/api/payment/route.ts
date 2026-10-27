import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { requestZarinPalPayment } from "@/lib/zarinpal";
import { getSessionUser } from "@/lib/auth";
import { buildOrderDraft, orderRequestSchema, reserveDraftStock } from "@/lib/orderDraft";
import { releaseExpiredReservations } from "@/lib/orderLifecycle";
import { releaseStock } from "@/lib/products";
import { getClientIp, getOrSetDeviceId } from "@/lib/rateLimit";
import { SALES_CLOSED_MESSAGE, SALES_OPEN } from "@/lib/sales";
import { SITE_URL } from "@/lib/site";

export async function POST(request: Request) {
  // The UI hides checkout too, but a request can be sent without the UI.
  if (!SALES_OPEN) {
    return Response.json({ message: SALES_CLOSED_MESSAGE }, { status: 503 });
  }

  const parsed = orderRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: "اطلاعات سفارش ناقص یا نامعتبر است." }, { status: 400 });
  }

  await connectToDatabase();
  const sessionUser = await getSessionUser();

  // So stock held by abandoned payments is free again before it's checked.
  await releaseExpiredReservations();

  const built = await buildOrderDraft(parsed.data, {
    ip: getClientIp(request),
    deviceId: await getOrSetDeviceId(),
  });
  if (!built.ok) {
    return Response.json({ message: built.message }, { status: built.status });
  }
  const { draft } = built;

  const reserved = await reserveDraftStock(draft);
  if (!reserved.ok) {
    return Response.json({ message: reserved.message }, { status: reserved.status });
  }

  // Until the order is saved, nothing else knows about this reservation, so
  // any way out before then (a gateway error, a thrown exception) gives the
  // stock back here.
  let orderSaved = false;
  try {
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
      stockReserved: true,
    });
    orderSaved = true;

    return Response.json({ url: result.paymentUrl });
  } finally {
    if (!orderSaved) await releaseStock(draft.items);
  }
}
