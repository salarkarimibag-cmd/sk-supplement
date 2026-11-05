import { isValidObjectId } from "mongoose";
import { after } from "next/server";
import { getSessionAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { OrderModel, type Order } from "@/models/Order";
import { PENDING_RETURN_REQUEST_FILTER, rejectReturnSchema } from "@/lib/returnRequest";
import { sendOrderEmail } from "@/lib/orderNotifications";

/**
 * The admin turns a customer's return request down, with a reason the
 * customer is emailed. The order itself stays delivered.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = rejectReturnSchema.safeParse(await request.json().catch(() => null));
  if (!isValidObjectId(id) || !parsed.success) {
    return Response.json({ message: "دلیل رد درخواست را بنویسید." }, { status: 400 });
  }

  await connectToDatabase();

  // Only a request still waiting on the admin: not one already turned down,
  // nor one whose order was meanwhile recorded as returned.
  const updated = await OrderModel.findOneAndUpdate(
    { _id: id, ...PENDING_RETURN_REQUEST_FILTER },
    {
      "returnRequest.rejectedAt": new Date(),
      "returnRequest.rejectionNote": parsed.data.note,
    },
    { returnDocument: "after" }
  ).lean<Order & { _id: unknown }>();
  if (!updated) {
    return Response.json(
      { message: "درخواست مرجوعی در انتظاری برای این سفارش نیست." },
      { status: 409 }
    );
  }

  after(() => sendOrderEmail(updated, "return_rejected"));

  return Response.json({ id });
}
