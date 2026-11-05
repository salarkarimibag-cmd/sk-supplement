import { isValidObjectId } from "mongoose";
import { after } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { OrderModel, type Order } from "@/models/Order";
import { returnRequestBlocker, returnRequestSchema } from "@/lib/returnRequest";
import { sendAdminOrderEmail, sendOrderEmail } from "@/lib/orderNotifications";

/**
 * A logged-in customer asks to return one of their delivered orders. Guests
 * have no account to do this from; they use the contact form.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ message: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  const { id } = await params;
  const parsed = returnRequestSchema.safeParse(await request.json().catch(() => null));
  if (!isValidObjectId(id) || !parsed.success) {
    return Response.json({ message: "درخواست نامعتبر است." }, { status: 400 });
  }

  await connectToDatabase();

  // Filtering on userId as well means someone else's order reads as missing:
  // the reply doesn't even say whether that order exists.
  const order = await OrderModel.findOne({ _id: id, userId: user.id }).lean<Order>();
  if (!order) {
    return Response.json({ message: "سفارش پیدا نشد." }, { status: 404 });
  }

  const blocker = returnRequestBlocker(order, new Date());
  if (blocker) {
    return Response.json({ message: blocker }, { status: 409 });
  }

  const returnRequest = { ...parsed.data, requestedAt: new Date() };

  // Conditional on the same things checked above, so two clicks (or two tabs)
  // can't both add a request, and an order the admin changed in between
  // isn't touched. The deadline is the one check left out: it was true a
  // moment ago and can't have become false in a way that matters.
  const updated = await OrderModel.findOneAndUpdate(
    { _id: id, userId: user.id, status: "delivered", returnRequest: { $exists: false } },
    { returnRequest },
    { returnDocument: "after" }
  ).lean<Order & { _id: unknown }>();
  if (!updated) {
    return Response.json(
      { message: "برای این سفارش قبلاً درخواست مرجوعی ثبت شده است." },
      { status: 409 }
    );
  }

  // After the response, so a slow or failed email can't fail the request.
  after(() =>
    Promise.all([
      sendOrderEmail(updated, "return_requested"),
      sendAdminOrderEmail(updated, "return_requested"),
    ])
  );

  return Response.json({ requestedAt: returnRequest.requestedAt.toISOString() });
}
