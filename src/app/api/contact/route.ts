import { connectToDatabase } from "@/lib/db";
import { ContactMessageModel } from "@/models/ContactMessage";
import { getClientIp, getOrSetDeviceId, isRateLimited } from "@/lib/rateLimit";
import { CONTACT_MESSAGE_MAX_LENGTH, contactMessageSchema } from "@/lib/publicForms";

const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

export async function POST(request: Request) {
  const parsed = contactMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const maxLength = CONTACT_MESSAGE_MAX_LENGTH.toLocaleString("fa-IR");
    return Response.json(
      { message: `نام، ایمیل معتبر و متن پیام (حداکثر ${maxLength} کاراکتر) الزامی هستند.` },
      { status: 400 }
    );
  }
  const { name, email, message } = parsed.data;

  const ip = getClientIp(request);
  const deviceId = await getOrSetDeviceId();

  await connectToDatabase();

  const limited = await isRateLimited(ContactMessageModel, {
    ip,
    deviceId,
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
  });

  if (limited) {
    return Response.json(
      { message: "شما به تازگی پیام ارسال کرده‌اید. لطفاً بعداً دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  await ContactMessageModel.create({ name, email, message, ip, deviceId });

  return Response.json({ message: "پیام شما با موفقیت ارسال شد. به‌زودی با شما تماس می‌گیریم." });
}
