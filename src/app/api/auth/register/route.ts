import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { hashPassword, createSessionCookie } from "@/lib/auth";
import { isDuplicateKeyError } from "@/lib/mongoErrors";
import { getClientIp, getOrSetDeviceId, isRateLimited } from "@/lib/rateLimit";
import { RegistrationAttemptModel } from "@/models/RegistrationAttempt";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
// A household or office sharing one IP can still sign up a few people.
const RATE_LIMIT_MAX = 5;

const registerSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  // Stored lowercased so "Ali@x.com" and "ali@x.com" are the same account.
  email: z.string().trim().toLowerCase().pipe(z.email()),
  phone: z.string().trim().min(10).max(20),
  // bcrypt only uses the first 72 bytes of a password, so anything longer
  // would silently be cut short.
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      {
        message:
          "همه‌ی فیلدها الزامی هستند؛ ایمیل باید معتبر و رمز عبور بین ۸ تا ۷۲ کاراکتر باشد.",
      },
      { status: 400 }
    );
  }
  const body = parsed.data;

  const ip = getClientIp(request);
  const deviceId = await getOrSetDeviceId();

  await connectToDatabase();

  const limited = await isRateLimited(RegistrationAttemptModel, {
    ip,
    deviceId,
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
  });
  if (limited) {
    return Response.json(
      { message: "تعداد ثبت‌نام‌ها زیاد بوده. لطفاً یک ساعت دیگر دوباره تلاش کنید." },
      { status: 429 }
    );
  }
  // Logged before the email check, so trying many emails to see which have
  // accounts counts against the limit too.
  await RegistrationAttemptModel.create({ ip, deviceId });

  const existing = await UserModel.findOne({ email: body.email });
  if (existing) {
    return Response.json({ message: "این ایمیل قبلاً ثبت شده است." }, { status: 409 });
  }

  const passwordHash = await hashPassword(body.password);

  let user;
  try {
    user = await UserModel.create({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      passwordHash,
    });
  } catch (error) {
    // Two sign-ups with the same email can both pass the findOne check
    // above; the unique index on `email` rejects the second one here.
    if (isDuplicateKeyError(error)) {
      return Response.json({ message: "این ایمیل قبلاً ثبت شده است." }, { status: 409 });
    }
    throw error;
  }

  await createSessionCookie(user.id);

  return Response.json(
    { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone },
    { status: 201 }
  );
}
