import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { getSessionAdmin } from "@/lib/auth";
import { adminSourcesFor, isOrderStatus } from "@/lib/orderStatus";

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

  // The update only applies if the order is currently in a status that may
  // move to `status`. Checking and writing in one query keeps two admins
  // clicking at once from both succeeding.
  const order = await OrderModel.findOneAndUpdate(
    { _id: id, status: { $in: adminSourcesFor(status) } },
    { status },
    { returnDocument: "after" }
  );

  if (!order) {
    const exists = await OrderModel.exists({ _id: id });
    return exists
      ? Response.json({ message: "این تغییر وضعیت برای این سفارش مجاز نیست." }, { status: 409 })
      : Response.json({ message: "سفارش پیدا نشد." }, { status: 404 });
  }

  return Response.json({ id: String(order._id), status: order.status });
}
