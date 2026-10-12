import type { Metadata } from "next";
import PaymentResult from "@/components/checkout/PaymentResult";
import { connectToDatabase } from "@/lib/db";
import { OrderModel, type Order } from "@/models/Order";
import { verifyZarinPalPayment } from "@/lib/zarinpal";
import { onOrderPaid } from "@/lib/orderPaid";

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
  const order = await OrderModel.findOne({ paymentAuthority: authority }).lean<Order>();
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

  // Every update below filters on `status: "pending"` too, so an order can
  // only leave the pending state once, even if two requests race here.
  const pendingOrder = { paymentAuthority: authority, status: "pending" };

  // ZarinPal sends Status=OK only when the user completed payment; anything
  // else (NOK, or a missing value) means it was cancelled.
  if (status !== "OK") {
    await OrderModel.updateOne(pendingOrder, { status: "failed" });
    return <PaymentResult success={false} message="پرداخت لغو شد." />;
  }

  const result = await verifyZarinPalPayment({ amountToman: order.totalPrice, authority });

  if (!result.ok) {
    await OrderModel.updateOne(pendingOrder, { status: "failed" });
    return <PaymentResult success={false} message={result.message} />;
  }

  const update = await OrderModel.updateOne(pendingOrder, {
    status: "paid",
    paymentRefId: result.refId,
  });

  // Only the request that actually moved the order to "paid" records stock
  // and discount usage, so a refresh or a second concurrent callback can't
  // count it twice.
  if (update.modifiedCount === 1) {
    await onOrderPaid(order);
  }

  return <PaymentResult success={true} refId={result.refId} />;
}
