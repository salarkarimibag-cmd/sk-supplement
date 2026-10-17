import { connectToDatabase } from "@/lib/db";
import { createSessionCookie, hashPassword } from "@/lib/auth";
import { hashResetToken, resetPasswordSchema } from "@/lib/passwordReset";
import { PasswordResetTokenModel } from "@/models/PasswordResetToken";
import { UserModel } from "@/models/User";

export async function POST(request: Request) {
  const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { message: "لینک نامعتبر است یا رمز عبور بین ۸ تا ۷۲ کاراکتر نیست." },
      { status: 400 }
    );
  }
  const { token, password } = parsed.data;

  await connectToDatabase();

  // findOneAndDelete is atomic, so even two requests sent at the same moment
  // can't both use the same link.
  const resetToken = await PasswordResetTokenModel.findOneAndDelete({
    tokenHash: hashResetToken(token),
    expiresAt: { $gt: new Date() },
  });
  if (!resetToken) {
    return Response.json(
      { message: "این لینک نامعتبر است یا منقضی شده. دوباره درخواست بازیابی بدهید." },
      { status: 400 }
    );
  }

  const user = await UserModel.findByIdAndUpdate(resetToken.userId, {
    passwordHash: await hashPassword(password),
    // Signs out every existing session (see isSessionStale in getSessionUser).
    passwordChangedAt: new Date(),
  });
  if (!user) {
    return Response.json({ message: "حساب کاربری پیدا نشد." }, { status: 404 });
  }

  // Any other pending links for this account are now pointless.
  await PasswordResetTokenModel.deleteMany({ userId: user._id });

  // Signs this browser in with a fresh session, issued after the change.
  await createSessionCookie(user.id);

  return Response.json({ message: "رمز عبور شما تغییر کرد." });
}
