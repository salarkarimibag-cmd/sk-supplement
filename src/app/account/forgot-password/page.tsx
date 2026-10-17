import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/account/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "فراموشی رمز عبور",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="text-2xl font-bold">فراموشی رمز عبور</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        ایمیل حساب کاربری‌تان را وارد کنید تا لینک انتخاب رمز جدید برایتان ارسال شود.
      </p>
      <ForgotPasswordForm />
    </div>
  );
}
