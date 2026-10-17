import { createHash, randomBytes } from "crypto";
import { z } from "zod";

/** How long a reset link stays valid. */
export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

// 32 random bytes, hex-encoded.
const RESET_TOKEN_PATTERN = /^[0-9a-f]{64}$/;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

export const resetPasswordSchema = z.object({
  token: z.string().regex(RESET_TOKEN_PATTERN),
  // Same limits as registration: bcrypt only uses the first 72 bytes.
  password: z.string().min(8).max(72),
});

export function isResetTokenFormat(token: unknown): token is string {
  return typeof token === "string" && RESET_TOKEN_PATTERN.test(token);
}

// Only the hash is stored, so someone who can read the database can't use
// the links. Unlike passwords, the token is 256 random bits, so a fast hash
// is enough (there is nothing to brute-force) and lets us look it up directly.
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createResetToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashResetToken(token) };
}

export function buildResetUrl(siteUrl: string, token: string): string {
  return `${siteUrl}/account/reset-password?token=${token}`;
}

export function buildPasswordResetEmail(resetUrl: string) {
  const minutes = (RESET_TOKEN_TTL_MS / 60_000).toLocaleString("fa-IR");
  const intro = "برای انتخاب رمز عبور جدید حساب SK Supplement روی لینک زیر بزنید:";
  const expiry = `این لینک تا ${minutes} دقیقه و فقط یک بار قابل استفاده است.`;
  const ignore = "اگر شما درخواست بازیابی رمز نداده‌اید، این ایمیل را نادیده بگیرید.";

  return {
    subject: "بازیابی رمز عبور SK Supplement",
    text: `${intro}\n${resetUrl}\n\n${expiry}\n${ignore}`,
    html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.8">
<p>${intro}</p>
<p><a href="${resetUrl}" style="display:inline-block;background:#0284c7;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none">انتخاب رمز جدید</a></p>
<p>${expiry}</p>
<p style="color:#71717a">${ignore}</p>
</div>`,
  };
}

/**
 * A session token issued before the password was last changed is no longer
 * valid, so resetting the password signs out every other device. JWT `iat`
 * is in whole seconds, so the change time is rounded down to match; a login
 * in the same second as the reset still counts as newer.
 */
export function isSessionStale(
  issuedAtSeconds: number | undefined,
  passwordChangedAt: Date | string | undefined
): boolean {
  if (!passwordChangedAt) return false;
  if (issuedAtSeconds === undefined) return true;
  const changedAtSeconds = Math.floor(new Date(passwordChangedAt).getTime() / 1000);
  return issuedAtSeconds < changedAtSeconds;
}
