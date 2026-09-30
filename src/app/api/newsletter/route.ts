import { connectToDatabase } from "@/lib/db";
import { SubscriberModel } from "@/models/Subscriber";
import { getClientIp, getOrSetDeviceId, isRateLimited } from "@/lib/rateLimit";

interface NewsletterBody {
  email?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

export async function POST(request: Request) {
  const body: NewsletterBody = await request.json();
  const email = body.email?.trim().toLowerCase();

  if (!email || !EMAIL_PATTERN.test(email)) {
    return Response.json({ message: "ایمیل نامعتبر است." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const deviceId = await getOrSetDeviceId();

  await connectToDatabase();

  const limited = await isRateLimited(SubscriberModel, {
    ip,
    deviceId,
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
  });

  if (limited) {
    return Response.json(
      { message: "تعداد درخواست‌های شما زیاد بوده. لطفاً بعداً دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  // Upsert instead of create: re-submitting an already-subscribed email
  // should succeed quietly rather than fail on the unique index.
  await SubscriberModel.findOneAndUpdate(
    { email },
    { email, ip, deviceId },
    { upsert: true, setDefaultsOnInsert: true }
  );

  return Response.json({ message: "عضویت شما در خبرنامه با موفقیت ثبت شد." });
}
