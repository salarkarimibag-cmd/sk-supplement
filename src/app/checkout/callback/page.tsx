import type { Metadata } from "next";
import { after } from "next/server";
import type { Types } from "mongoose";
import PaymentResult from "@/components/checkout/PaymentResult";
import { connectToDatabase } from "@/lib/db";
import { OrderModel, type Order } from "@/models/Order";
import { verifyZarinPalPayment } from "@/lib/zarinpal";
import { onOrderFailed, onOrderPaid } from "@/lib/orderLifecycle";
import { holdsStock } from "@/lib/orderStatus";
import { sendAdminOrderEmail, sendOrderEmail } from "@/lib/orderNotifications";

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

  // Every update below filters on `status: "pending"` too, so an order can
  // only leave the pending state once, even if two requests race here. It
  // returns the order as it was just before, or null if another request got
  // there first; only the winner runs the side effects.
  const pendingOrder = { paymentAuthority: authority, status: "pending" };
  const settle = (update: { status: "paid" | "failed"; paymentRefId?: number }) =>
    OrderModel.findOneAndUpdate(
      pendingOrder,
      { ...update, stockReserved: holdsStock(update.status) },
      { returnDocument: "before" }
    ).lean<Order & { _id: Types.ObjectId }>();

  async function markFailed() {
    const before = await settle({ status: "failed" });
    if (before) await onOrderFailed(before);
  }

  // ZarinPal sends Status=OK only when the user completed payment; anything
  // else (NOK, or a missing value) means it was cancelled.
  if (status !== "OK") {
    await markFailed();
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
    await markFailed();
    return <PaymentResult success={false} message={result.message} />;
  }

  const before = await settle({ status: "paid", paymentRefId: result.refId });

  // Only the request that actually moved the order to "paid" records stock
  // and discount usage, so a refresh or a second concurrent callback can't
  // count it twice.
  if (before) {
    // `before` is from just before the update, so its stockReserved is
    // current (an expired hold may have been released since `order` was
    // read); the new ref id is added here.
    await onOrderPaid(before);
    const paidOrder = { ...before, paymentRefId: result.refId };
    after(() => sendOrderEmail(paidOrder, "paid"));
    after(() => sendAdminOrderEmail(paidOrder, "paid"));
  }

  return <PaymentResult success={true} refId={result.refId} />;
}
