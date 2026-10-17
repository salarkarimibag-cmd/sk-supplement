import type { Metadata } from "next";
import Link from "next/link";
import ResetPasswordForm from "@/components/account/ResetPasswordForm";
import { connectToDatabase } from "@/lib/db";
import { hashResetToken, isResetTokenFormat } from "@/lib/passwordReset";
import { PasswordResetTokenModel } from "@/models/PasswordResetToken";

export const metadata: Metadata = {
  title: "انتخاب رمز عبور جدید",
  robots: { index: false, follow: false },
  // The reset token is in this page's URL; don't send it to other sites in
  // the Referer header if the visitor follows a link from here.
  referrer: "no-referrer",
};

async function isUsableToken(token: string): Promise<boolean> {
  await connectToDatabase();
  const exists = await PasswordResetTokenModel.exists({
    tokenHash: hashResetToken(token),
    expiresAt: { $gt: new Date() },
  });
  return exists !== null;
}

export default async function ResetPasswordPage(props: PageProps<"/account/reset-password">) {
  const { token } = await props.searchParams;
  const usable = isResetTokenFormat(token) && (await isUsableToken(token));

  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold">انتخاب رمز عبور جدید</h1>

      {usable ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="mt-8">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            این لینک نامعتبر است، قبلاً استفاده شده یا منقضی شده است. لینک‌های بازیابی فقط نیم ساعت
            و یک بار معتبرند.
          </p>
          <Link
            href="/account/forgot-password"
            className="mt-6 inline-block rounded bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-500"
          >
            درخواست لینک جدید
          </Link>
        </div>
      )}
    </div>
  );
}
