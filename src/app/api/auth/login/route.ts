import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { LoginAttemptModel } from "@/models/LoginAttempt";
import { verifyPassword, createSessionCookie } from "@/lib/auth";
import { isPasswordGuessLimited, PASSWORD_GUESS_LIMIT_MESSAGE } from "@/lib/passwordGuessLimit";
import { getClientIp, getOrSetDeviceId } from "@/lib/rateLimit";

// z.string() first, so a JSON object such as {"$ne": null} is rejected here
// instead of reaching the MongoDB query as an operator.
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: "ایمیل و رمز عبور الزامی هستند." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const ip = getClientIp(request);
  const deviceId = await getOrSetDeviceId();

  await connectToDatabase();

  if (await isPasswordGuessLimited(email, ip, deviceId)) {
    return Response.json({ message: PASSWORD_GUESS_LIMIT_MESSAGE }, { status: 429 });
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
