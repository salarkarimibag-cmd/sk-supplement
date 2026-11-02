import { z } from "zod";
import { clearSessionCookie, getSessionUser, verifyPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { isPasswordGuessLimited, PASSWORD_GUESS_LIMIT_MESSAGE } from "@/lib/passwordGuessLimit";
import { getClientIp, getOrSetDeviceId } from "@/lib/rateLimit";
import { LoginAttemptModel } from "@/models/LoginAttempt";
import { OrderModel } from "@/models/Order";
import { PasswordResetTokenModel } from "@/models/PasswordResetToken";
import { ReviewModel } from "@/models/Review";
import { SubscriberModel } from "@/models/Subscriber";
import { UserModel } from "@/models/User";

const deleteAccountSchema = z.object({ password: z.string().min(1).max(200) });

export async function DELETE(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return Response.json({ message: "ابتدا وارد حساب خود شوید." }, { status: 401 });
  }
  // The shop must keep someone who can run it; removing an admin is a
  // decision for the database, not one click in a profile.
  if (sessionUser.isAdmin) {
    return Response.json({ message: "حساب مدیر از این راه حذف نمی‌شود." }, { status: 403 });
  }

  const parsed = deleteAccountSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ message: "رمز عبور الزامی است." }, { status: 400 });
  }

  const { email } = sessionUser;
  const ip = getClientIp(request);
  const deviceId = await getOrSetDeviceId();

  await connectToDatabase();

  if (await isPasswordGuessLimited(email, ip, deviceId)) {
    return Response.json({ message: PASSWORD_GUESS_LIMIT_MESSAGE }, { status: 429 });
  }

  const user = await UserModel.findById(sessionUser.id);
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    await LoginAttemptModel.create({ email, ip, deviceId });
    return Response.json({ message: "رمز عبور اشتباه است." }, { status: 400 });
  }

  // The account goes first: if the cleanup below is cut short, what's left is
  // an id nothing can log in to, rather than an account that's half deleted.
  await UserModel.deleteOne({ _id: user._id });

  // Orders stay for the shop's financial records, and published reviews stay
  // with the product's rating; both just stop pointing at the account. The
  // order's own contact details are kept, so its emails still reach the buyer.
  await Promise.all([
    OrderModel.updateMany({ userId: sessionUser.id }, { $unset: { userId: "" } }),
    ReviewModel.updateMany({ userId: sessionUser.id }, { $unset: { userId: "" } }),
    PasswordResetTokenModel.deleteMany({ userId: user._id }),
    SubscriberModel.deleteOne({ email }),
  ]);

  await clearSessionCookie();
  return Response.json({ ok: true });
}
