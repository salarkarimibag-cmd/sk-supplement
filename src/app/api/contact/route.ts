import { connectToDatabase } from "@/lib/db";
import { ContactMessageModel } from "@/models/ContactMessage";
import { getClientIp, getOrSetDeviceId, isRateLimited } from "@/lib/rateLimit";

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

export async function POST(request: Request) {
  const body: ContactBody = await request.json();
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const message = body.message?.trim();

  if (!name || !email || !message || !EMAIL_PATTERN.test(email)) {
    return Response.json(
      { message: "نام، ایمیل معتبر و متن پیام الزامی هستند." },
      { status: 400 }
    );
  }

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
