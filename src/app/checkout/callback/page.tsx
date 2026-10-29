import type { Metadata } from "next";
import type { Types } from "mongoose";
import PaymentResult from "@/components/checkout/PaymentResult";
import { connectToDatabase } from "@/lib/db";
import { OrderModel, type Order } from "@/models/Order";
import { verifyZarinPalPayment } from "@/lib/zarinpal";
import { markZarinPalOrderFailed, markZarinPalOrderPaid } from "@/lib/zarinpalOrders";

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

  if (!authority) {
    return <PaymentResult success={false} message="اطلاعات پرداخت ناقص بود." />;
  }

  await connectToDatabase();

  // Everything about the payment (its amount above all) comes from the order
  // saved by /api/payment, never from this URL: the buyer can edit any query
  // parameter before ZarinPal's redirect lands here.
  const order = await OrderModel.findOne({ paymentAuthority: authority }).lean<
    Order & { _id: Types.ObjectId }
  >();
  if (!order) {
    return <PaymentResult success={false} message="سفارشی برای این پرداخت پیدا نشد." />;
  }

  // Already settled (e.g. the buyer refreshed this page): show the stored
  // outcome instead of verifying again or letting a crafted Status=NOK undo it.
  if (order.status !== "pending") {
    return order.status === "paid" || order.status === "shipped" ? (
      <PaymentResult success={true} refId={order.paymentRefId ?? undefined} />
    ) : (
      <PaymentResult success={false} message="این پرداخت ناموفق بوده یا لغو شده است." />
    );
  }

  // ZarinPal sends Status=OK only when the user completed payment; anything
  // else (NOK, or a missing value) means it was cancelled.
  if (status !== "OK") {
    await markZarinPalOrderFailed(authority);
    return <PaymentResult success={false} message="پرداخت لغو شد." />;
  }

  const result = await verifyZarinPalPayment({ amountToman: order.totalPrice, authority });

  if (!result.ok) {
    // If ZarinPal couldn't be reached, the buyer may have paid: the order
    // stays pending so reloading this page can still verify it. Only a real
    // "not paid" answer from ZarinPal marks it failed.
    if (result.retryable) {
      return (
        <PaymentResult
          success={false}
          failureTitle="وضعیت پرداخت هنوز مشخص نیست"
          message={result.message}
        />
      );
    }
    await markZarinPalOrderFailed(authority);
    return <PaymentResult success={false} message={result.message} />;
  }

  // Only one request can move the order out of pending (see
  // zarinpalOrders.ts), so a refresh, a second concurrent callback or the
  // admin's reconcile can't record the sale twice.
  await markZarinPalOrderPaid(authority, result.refId);

  return <PaymentResult success={true} refId={result.refId} />;
}
