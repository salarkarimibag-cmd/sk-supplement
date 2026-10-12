import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { LoginAttemptModel } from "@/models/LoginAttempt";
import { verifyPassword, createSessionCookie } from "@/lib/auth";
import { getClientIp, getOrSetDeviceId, isRateLimited } from "@/lib/rateLimit";

// z.string() first, so a JSON object such as {"$ne": null} is rejected here
// instead of reaching the MongoDB query as an operator.
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
});

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
// Per visitor (ip or device cookie): enough for genuine typos, too few to guess passwords.
const MAX_FAILURES_PER_VISITOR = 10;
// Per account, across all visitors: stops guessing one account from many
// addresses. Kept higher than the per-visitor limit, since an attacker could
// otherwise lock a real user out just by failing logins with their email.
const MAX_FAILURES_PER_EMAIL = 20;

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: "ایمیل و رمز عبور الزامی هستند." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const ip = getClientIp(request);
  const deviceId = await getOrSetDeviceId();

  await connectToDatabase();

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const [visitorLimited, failuresForEmail] = await Promise.all([
    isRateLimited(LoginAttemptModel, {
      ip,
      deviceId,
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: MAX_FAILURES_PER_VISITOR,
    }),
    LoginAttemptModel.countDocuments({ email, createdAt: { $gte: windowStart } }),
  ]);

  if (visitorLimited || failuresForEmail >= MAX_FAILURES_PER_EMAIL) {
    return Response.json(
      { message: "تعداد تلاش‌های ناموفق زیاد بوده. لطفاً ۱۵ دقیقه‌ی دیگر دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  const user = await UserModel.findOne({ email });
  const passwordMatches = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !passwordMatches) {
    await LoginAttemptModel.create({ email, ip, deviceId });
    return Response.json({ message: "ایمیل یا رمز عبور اشتباه است." }, { status: 401 });
  }

  await createSessionCookie(user.id);

  return Response.json({ id: user.id, fullName: user.fullName, email: user.email, phone: user.phone });
}
