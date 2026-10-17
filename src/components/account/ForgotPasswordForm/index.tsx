"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "ایمیل الزامی است.").email("ایمیل نامعتبر است."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordValues) {
    setServerError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message ?? "ارسال درخواست ناموفق بود.");
        return;
      }

      setSentMessage(data.message);
    } catch {
      setServerError("خطایی رخ داد. دوباره تلاش کنید.");
    }
  }

  if (sentMessage) {
    return (
      <div className="mt-8">
        <p className="rounded border border-emerald-600/40 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {sentMessage} لینک تا نیم ساعت معتبر است. اگر ایمیل را نمی‌بینید، پوشه‌ی اسپم را هم نگاه
          کنید.
        </p>
        <p className="mt-6 text-center text-sm">
          <Link href="/account/login" className="text-sky-600 hover:underline">
            بازگشت به ورود
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 flex flex-col gap-4">
        <div>
          <input
            type="email"
            placeholder="ایمیل"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded bg-sky-600 py-3.5 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "در حال ارسال..." : "ارسال لینک بازیابی"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        رمز عبورتان یادتان آمد؟{" "}
        <Link href="/account/login" className="text-sky-600 hover:underline">
          ورود
        </Link>
      </p>
    </>
  );
}
