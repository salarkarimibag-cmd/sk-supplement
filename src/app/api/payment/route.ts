import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { requestZarinPalPayment } from "@/lib/zarinpal";
import { getSessionUser } from "@/lib/auth";

interface PaymentRequestBody {
  amount?: number;
  contact?: { email?: string; mobile?: string };
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    province?: string;
    city?: string;
    address?: string;
    postalCode?: string;
  };
  items?: { productId?: string; quantity?: number; unitPrice?: number }[];
}

export async function POST(request: Request) {
  const body: PaymentRequestBody = await request.json();

  if (!body.amount || body.amount <= 0) {
    return Response.json({ message: "مبلغ نامعتبر است." }, { status: 400 });
  }
  if (!body.contact?.email || !body.contact?.mobile) {
    return Response.json({ message: "اطلاعات تماس ناقص است." }, { status: 400 });
  }
  if (!body.shippingAddress) {
    return Response.json({ message: "اطلاعات ارسال ناقص است." }, { status: 400 });
  }
  if (!body.items?.length) {
    return Response.json({ message: "سبد خرید خالی است." }, { status: 400 });
  }

  await connectToDatabase();
  const sessionUser = await getSessionUser();

  const origin = new URL(request.url).origin;
  const callbackUrl = `${origin}/checkout/callback?amount=${body.amount}`;

  const result = await requestZarinPalPayment({
    amountToman: body.amount,
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
    items: body.items,
    contact: body.contact,
    shippingAddress: body.shippingAddress,
    totalPrice: body.amount,
    status: "pending",
    paymentAuthority: result.authority,
  });

  return Response.json({ url: result.paymentUrl });
}
