import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { OrderModel, type PaymentMethod } from "@/models/Order";
import { getSessionAdmin } from "@/lib/auth";
import { adminSourcesFor, isOrderStatus } from "@/lib/orderStatus";
import { decrementStock } from "@/lib/products";

interface UpdateOrderBody {
  status?: unknown;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const { id } = await params;
  const body: UpdateOrderBody | null = await request.json().catch(() => null);
  const status = body?.status;

  if (!isValidObjectId(id) || !isOrderStatus(status)) {
    return Response.json({ message: "درخواست نامعتبر است." }, { status: 400 });
  }

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
  // clicking at once from both succeeding.
  const order = await OrderModel.findOneAndUpdate(
    { _id: id, status: { $in: adminSourcesFor(status, paymentMethod) } },
    { status },
    { returnDocument: "after" }
  );

  if (!order) {
    return Response.json(
      { message: "این تغییر وضعیت برای این سفارش مجاز نیست." },
      { status: 409 }
    );
  }

  // A confirmed card-to-card transfer is this order's moment of payment, the
  // same as a verified ZarinPal callback, so stock is taken out here. The
  // conditional update above succeeds only once, so this runs only once.
  if (status === "paid") {
    await decrementStock(order.items);
  }

  return Response.json({ id: String(order._id), status: order.status });
}
