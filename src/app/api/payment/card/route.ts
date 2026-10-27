import { after } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { sendAdminOrderEmail, sendOrderEmail } from "@/lib/orderNotifications";
import { getSessionUser } from "@/lib/auth";
import { buildOrderDraft, orderRequestSchema, reserveDraftStock } from "@/lib/orderDraft";
import { releaseExpiredReservations } from "@/lib/orderLifecycle";
import { releaseStock } from "@/lib/products";
import { cardTransferSchema, getShopCard } from "@/lib/cardPayment";
import { getClientIp, getOrSetDeviceId, isRateLimited } from "@/lib/rateLimit";
import { SALES_CLOSED_MESSAGE, SALES_OPEN } from "@/lib/sales";

const cardOrderSchema = orderRequestSchema.extend({ cardTransfer: cardTransferSchema });

const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

export async function POST(request: Request) {
  // The UI hides checkout too, but a request can be sent without the UI.
  if (!SALES_OPEN) {
    return Response.json({ message: SALES_CLOSED_MESSAGE }, { status: 503 });
  }

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

  // Submitting a card order costs nothing, so a script could flood the
  // admin's verification queue with fake ones (and hold their stock). Only
  // card orders count: a buyer whose gateway attempts failed can still pay
  // by card.
  const limited = await isRateLimited(OrderModel, {
    ip,
    deviceId,
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    where: { paymentMethod: "card" },
  });
  if (limited) {
    return Response.json(
      { message: "تعداد سفارش‌های شما زیاد بوده. لطفاً بعداً دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  // So stock held by abandoned ZarinPal payments is free again before it's checked.
  await releaseExpiredReservations();

  const built = await buildOrderDraft(parsed.data, { ip, deviceId });
  if (!built.ok) {
    return Response.json({ message: built.message }, { status: built.status });
  }

  const sessionUser = await getSessionUser();

  // Held until the admin confirms the transfer (the stock is then sold) or
  // rejects it (given back), however long that takes.
  const reserved = await reserveDraftStock(built.draft);
  if (!reserved.ok) {
    return Response.json({ message: reserved.message }, { status: reserved.status });
  }

  let order;
  try {
    order = await OrderModel.create({
      ...built.draft,
      userId: sessionUser?.id,
      paymentMethod: "card",
      status: "awaiting_verification",
      cardTransfer: parsed.data.cardTransfer,
      ip,
      deviceId,
      stockReserved: true,
    });
  } catch (error) {
    // Nothing else knows about the reservation until the order is saved.
    await releaseStock(built.draft.items);
    throw error;
  }

  after(() => sendOrderEmail(order, "received"));
  after(() => sendAdminOrderEmail(order, "card_received"));

  return Response.json({ orderId: String(order._id) }, { status: 201 });
}
