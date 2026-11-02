"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/ui/PasswordInput";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "رمز عبور الزامی است."),
});

type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;

export default function DeleteAccountSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeleteAccountValues>({ resolver: zodResolver(deleteAccountSchema) });

  async function onSubmit({ password }: DeleteAccountValues) {
    setServerError(null);

    try {
      const response = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message ?? "حذف حساب ناموفق بود.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setServerError("خطایی رخ داد. دوباره تلاش کنید.");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-10 block cursor-pointer text-sm text-red-600 hover:underline"
      >
        حذف حساب کاربری
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-10 flex max-w-md flex-col gap-4 rounded-xl border border-red-200 p-5 dark:border-red-900"
    >
      <h2 className="text-base font-bold">حذف حساب کاربری</h2>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        با حذف حساب، اطلاعات حساب و عضویت خبرنامه‌ی شما برای همیشه پاک می‌شود و دیگر نمی‌توانید
        سفارش‌هایتان را در سایت ببینید. سوابق سفارش‌های ثبت‌شده برای امور مالی و ارسال نزد ما می‌ماند
        و نظرهای منتشرشده هم حذف نمی‌شوند. این کار قابل بازگشت نیست.
      </p>

      <div>
        <label htmlFor="delete-account-password" className="mb-1.5 block text-sm">
          برای تأیید، رمز عبور خود را وارد کنید
        </label>
        <PasswordInput
          id="delete-account-password"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "در حال حذف..." : "حذف همیشگی حساب"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer text-sm font-semibold text-zinc-600 hover:underline dark:text-zinc-400"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
