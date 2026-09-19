import type { Metadata } from "next";
import PaymentResult from "@/components/checkout/PaymentResult";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { verifyZarinPalPayment } from "@/lib/zarinpal";

export const metadata: Metadata = {
  title: "نتیجه پرداخت",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CheckoutCallbackPage(
  props: PageProps<"/checkout/callback">
) {
  const searchParams = await props.searchParams;
  const authority = first(searchParams.Authority);
  const status = first(searchParams.Status);
  const amount = Number(first(searchParams.amount));

  await connectToDatabase();

  // ZarinPal sends Status=OK only when the user completed payment; anything
  // else (NOK, or a missing/incomplete callback) means it was cancelled or invalid.
  if (status !== "OK" || !authority || !amount) {
    if (authority) {
      await OrderModel.updateOne({ paymentAuthority: authority }, { status: "failed" });
    }
    return <PaymentResult success={false} message="پرداخت لغو شد یا اطلاعات آن ناقص بود." />;
  }

  const result = await verifyZarinPalPayment({ amountToman: amount, authority });

  if (!result.ok) {
    await OrderModel.updateOne({ paymentAuthority: authority }, { status: "failed" });
    return <PaymentResult success={false} message={result.message} />;
  }

  await OrderModel.updateOne(
    { paymentAuthority: authority },
    { status: "paid", paymentRefId: result.refId }
  );

  return <PaymentResult success={true} refId={result.refId} />;
}
