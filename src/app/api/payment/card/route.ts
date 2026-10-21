import { after } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { sendAdminOrderEmail, sendOrderEmail } from "@/lib/orderNotifications";
import { getSessionUser } from "@/lib/auth";
import { buildOrderDraft, orderRequestSchema } from "@/lib/orderDraft";
import { cardTransferSchema, getShopCard } from "@/lib/cardPayment";
import { getClientIp, getOrSetDeviceId, isRateLimited } from "@/lib/rateLimit";

const cardOrderSchema = orderRequestSchema.extend({ cardTransfer: cardTransferSchema });

const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

export async function POST(request: Request) {
  if (!getShopCard()) {
    return Response.json({ message: "پرداخت کارت به کارت فعال نیست." }, { status: 404 });
  }

  const parsed = cardOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { message: "اطلاعات سفارش یا واریز ناقص یا نامعتبر است." },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const deviceId = await getOrSetDeviceId();

  await connectToDatabase();

  // Unlike ZarinPal, submitting a card order costs nothing, so a script
  // could flood the admin's verification queue with fake ones.
  const limited = await isRateLimited(OrderModel, {
    ip,
    deviceId,
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
  });
  if (limited) {
    return Response.json(
      { message: "تعداد سفارش‌های شما زیاد بوده. لطفاً بعداً دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  const built = await buildOrderDraft(parsed.data);
  if (!built.ok) {
    return Response.json({ message: built.message }, { status: 400 });
  }

  const sessionUser = await getSessionUser();

  const order = await OrderModel.create({
    ...built.draft,
    userId: sessionUser?.id,
    paymentMethod: "card",
    status: "awaiting_verification",
    cardTransfer: parsed.data.cardTransfer,
    ip,
    deviceId,
  });

  after(() => sendOrderEmail(order, "received"));
  after(() => sendAdminOrderEmail(order, "card_received"));

  return Response.json({ orderId: String(order._id) }, { status: 201 });
}
