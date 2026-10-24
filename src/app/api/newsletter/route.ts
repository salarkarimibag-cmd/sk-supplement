import { connectToDatabase } from "@/lib/db";
import { SubscriberModel } from "@/models/Subscriber";
import { getClientIp, getOrSetDeviceId, isRateLimited } from "@/lib/rateLimit";
import { newsletterSchema } from "@/lib/publicForms";

const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

export async function POST(request: Request) {
  const parsed = newsletterSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: "ایمیل نامعتبر است." }, { status: 400 });
  }
  const { email } = parsed.data;

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
