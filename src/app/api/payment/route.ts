import { requestZarinPalPayment } from "@/lib/zarinpal";

interface PaymentRequestBody {
  amount?: number;
  email?: string;
  mobile?: string;
}

export async function POST(request: Request) {
  const body: PaymentRequestBody = await request.json();

  if (!body.amount || body.amount <= 0) {
    return Response.json({ message: "مبلغ نامعتبر است." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const callbackUrl = `${origin}/checkout/callback?amount=${body.amount}`;

  const result = await requestZarinPalPayment({
    amountToman: body.amount,
    description: "خرید از SK Supplement",
    callbackUrl,
    email: body.email,
    mobile: body.mobile,
  });

  if (!result.ok) {
    return Response.json({ message: result.message }, { status: 502 });
  }

  return Response.json({ url: result.paymentUrl });
}
