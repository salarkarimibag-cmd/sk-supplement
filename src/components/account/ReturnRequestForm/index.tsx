"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { RETURN_REASONS, returnRequestSchema, type ReturnReason } from "@/lib/returnRequest";

// The form's own values before zod fills in defaults (details may be absent).
type ReturnRequestValues = z.input<typeof returnRequestSchema>;

/**
 * Lets a customer ask to return a delivered order, from «سفارش‌های من».
 * Starts as a single link so the order list stays compact.
 */
export default function ReturnRequestForm({
  orderId,
  deadline,
}: {
  orderId: string;
  /** Formatted for display; the server checks the real deadline. */
  deadline: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReturnRequestValues>({
    resolver: zodResolver(returnRequestSchema),
    defaultValues: { details: "" },
  });

  async function onSubmit(values: ReturnRequestValues) {
    setServerError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/return-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        setServerError(data.message ?? "ثبت درخواست ناموفق بود.");
        return;
      }
      // The page is a Server Component: refreshing re-renders it with the
      // saved request in place of this form.
      router.refresh();
    } catch {
      setServerError("خطایی رخ داد. دوباره تلاش کنید.");
    }
  }

  if (!open) {
    return (
      <p className="text-sm text-zinc-500">
        تا {deadline} می‌توانید{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer font-semibold text-sky-600 hover:underline"
        >
          درخواست مرجوعی
        </button>{" "}
        ثبت کنید.
      </p>
    );
  }

  const reasonId = `return-reason-${orderId}`;
  const detailsId = `return-details-${orderId}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3 text-sm">
      <p className="text-zinc-600 dark:text-zinc-400">
        شرایط بازگشت کالا را در{" "}
        <Link href="/pages/refund-policy" className="text-sky-600 hover:underline">
          قوانین بازگشت وجه
        </Link>{" "}
        ببینید. پس از ثبت درخواست، برای هماهنگی ارسال کالا با شما تماس می‌گیریم.
      </p>

      <div>
        <label htmlFor={reasonId} className="mb-1.5 block">
          دلیل مرجوعی
        </label>
        <select
          id={reasonId}
          defaultValue=""
          {...register("reason")}
          className="w-full rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="" disabled>
            انتخاب کنید
          </option>
          {(Object.keys(RETURN_REASONS) as ReturnReason[]).map((reason) => (
            <option key={reason} value={reason}>
              {RETURN_REASONS[reason]}
            </option>
          ))}
        </select>
        {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>}
      </div>

      <div>
        <label htmlFor={detailsId} className="mb-1.5 block">
          توضیحات (اختیاری؛ برای «دلیل دیگر» لازم است)
        </label>
        <textarea
          id={detailsId}
          rows={3}
          maxLength={1000}
          {...register("details")}
          className="w-full rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
        {errors.details && <p className="mt-1 text-xs text-red-600">{errors.details.message}</p>}
      </div>

      {serverError && <p className="text-red-600">{serverError}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded bg-sky-600 px-5 py-2 font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "در حال ثبت..." : "ثبت درخواست مرجوعی"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer font-semibold text-zinc-600 hover:underline dark:text-zinc-400"
        >
          انصراف
        </button>
      </div>
    </form>
  );
}
