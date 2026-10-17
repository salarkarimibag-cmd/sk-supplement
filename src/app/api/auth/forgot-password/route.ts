import { after } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  RESET_TOKEN_TTL_MS,
  buildPasswordResetEmail,
  buildResetUrl,
  createResetToken,
  forgotPasswordSchema,
} from "@/lib/passwordReset";
import { getClientIp, getOrSetDeviceId, isRateLimited } from "@/lib/rateLimit";
import { SITE_URL } from "@/lib/site";
import { PasswordResetRequestModel } from "@/models/PasswordResetRequest";
import { PasswordResetTokenModel } from "@/models/PasswordResetToken";
import { UserModel } from "@/models/User";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_VISITOR = 5;
// Per address, across all visitors: stops someone flooding a user's inbox.
const MAX_REQUESTS_PER_EMAIL = 3;

// Same reply whether or not the email has an account, so this form can't be
// used to find out who is registered.
const SENT_MESSAGE =
  "اگر حسابی با این ایمیل وجود داشته باشد، لینک بازیابی رمز عبور برایش ارسال شد.";

export async function POST(request: Request) {
  const parsed = forgotPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: "ایمیل نامعتبر است." }, { status: 400 });
  }
  const { email } = parsed.data;

  const ip = getClientIp(request);
  const deviceId = await getOrSetDeviceId();

  await connectToDatabase();

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const [visitorLimited, requestsForEmail] = await Promise.all([
    isRateLimited(PasswordResetRequestModel, {
      ip,
      deviceId,
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: MAX_REQUESTS_PER_VISITOR,
    }),
    PasswordResetRequestModel.countDocuments({ email, createdAt: { $gte: windowStart } }),
  ]);

  if (visitorLimited || requestsForEmail >= MAX_REQUESTS_PER_EMAIL) {
    return Response.json(
      { message: "درخواست‌های زیادی ثبت شده. لطفاً یک ساعت دیگر دوباره تلاش کنید." },
      { status: 429 }
    );
  }

  await PasswordResetRequestModel.create({ email, ip, deviceId });

  const user = await UserModel.findOne({ email });
  if (user) {
    // Only the newest link works; requesting again cancels the older ones.
    await PasswordResetTokenModel.deleteMany({ userId: user._id });
    const { token, tokenHash } = createResetToken();
    await PasswordResetTokenModel.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    // Sent after the response, so the reply takes the same time for
    // registered and unknown emails (a slower reply would give it away).
    after(() =>
      sendEmail({ to: user.email, ...buildPasswordResetEmail(buildResetUrl(SITE_URL, token)) })
    );
  }

  return Response.json({ message: SENT_MESSAGE });
}
