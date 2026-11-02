import { isRateLimited } from "@/lib/rateLimit";
import { LoginAttemptModel } from "@/models/LoginAttempt";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
// Per visitor (ip or device cookie): enough for genuine typos, too few to guess passwords.
const MAX_FAILURES_PER_VISITOR = 10;
// Per account, across all visitors: stops guessing one account from many
// addresses. Kept higher than the per-visitor limit, since an attacker could
// otherwise lock a real user out just by failing logins with their email.
const MAX_FAILURES_PER_EMAIL = 20;

export const PASSWORD_GUESS_LIMIT_MESSAGE =
  "تعداد تلاش‌های ناموفق زیاد بوده. لطفاً ۱۵ دقیقه‌ی دیگر دوباره تلاش کنید.";

/**
 * Whether too many wrong passwords were entered lately, by this visitor or
 * for this account. Every route that checks a password records a failure as
 * a LoginAttempt and asks here first, so they share one budget of guesses.
 * The caller must already be connected to the database.
 */
export async function isPasswordGuessLimited(
  email: string,
  ip: string,
  deviceId: string
): Promise<boolean> {
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
  return visitorLimited || failuresForEmail >= MAX_FAILURES_PER_EMAIL;
}
