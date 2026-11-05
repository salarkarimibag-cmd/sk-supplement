import { isValidObjectId } from "mongoose";
import { after } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OrderModel, type PaymentMethod } from "@/models/Order";
import { getSessionAdmin } from "@/lib/auth";
import { adminSourcesFor } from "@/lib/orderStatus";
import { adminOrderUpdateSchema, orderStatusUpdate } from "@/lib/orderStatusUpdate";
import {
  onOrderCancelled,
  onOrderFailed,
  onOrderPaid,
  onOrderReturned,
} from "@/lib/orderLifecycle";
import { emailKindForAdminStatus } from "@/lib/orderEmail";
import { sendOrderEmail } from "@/lib/orderNotifications";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = adminOrderUpdateSchema.safeParse(await request.json().catch(() => null));

  if (!isValidObjectId(id) || !parsed.success) {
    return Response.json({ message: "درخواست نامعتبر است." }, { status: 400 });
  }
  const { status } = parsed.data;
  const update = orderStatusUpdate(parsed.data, new Date());

  await connectToDatabase();

  // Which transitions are allowed depends on how the order was paid, so the
  // method is read first. It never changes after creation, so reading it
  // separately from the update below is safe.
  const existing = await OrderModel.findById(id, { paymentMethod: 1 }).lean<{
    paymentMethod?: PaymentMethod;
  }>();
  if (!existing) {
    return Response.json({ message: "سفارش پیدا نشد." }, { status: 404 });
  }
  const paymentMethod = existing.paymentMethod ?? "zarinpal";

  // The update only applies if the order is currently in a status that may
  // move to `status`. Checking and writing in one query keeps two admins
  // clicking at once from both succeeding. The document *before* the update
  // is returned, so the side effects below can see which status it left and
  // whether it held reserved stock.
  const before = await OrderModel.findOneAndUpdate(
    { _id: id, status: { $in: adminSourcesFor(status, paymentMethod) } },
    update,
    { returnDocument: "before" }
  );

  if (!before) {
    return Response.json(
      { message: "این تغییر وضعیت برای این سفارش مجاز نیست." },
      { status: 409 }
    );
  }

  // The conditional update above succeeds only once per transition, so each
  // of these runs only once.
  if (status === "paid") {
    // A confirmed card-to-card transfer is this order's moment of payment,
    // the same as a verified ZarinPal callback.
    await onOrderPaid(before);
  } else if (status === "failed") {
    // A rejected card transfer gives back the stock its order reserved.
    await onOrderFailed(before);
  } else if (status === "cancelled" && before.status === "paid") {
    // Checked against the previous status, not just the target: only an
    // order that was paid ever had its stock taken, so only that is undone.
    await onOrderCancelled(before);
  } else if (status === "returned") {
    // Only reachable from shipped or delivered, both sold, so this undoes a sale.
    await onOrderReturned(before, parsed.data.restock === true);
  }

  // Sent after the response, so the admin isn't kept waiting on the email
  // service and a failed email can't turn a successful change into an error.
  const emailKind = emailKindForAdminStatus(status);
  if (emailKind) {
    // `before` lacks what this update just wrote (the tracking number),
    // so the email gets both.
    const order = { ...before.toObject(), ...update };
    after(() => sendOrderEmail(order, emailKind));
  }

  return Response.json({ id: String(before._id), status });
}
