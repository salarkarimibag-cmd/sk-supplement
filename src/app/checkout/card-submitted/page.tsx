import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "سفارش ثبت شد",
  robots: { index: false, follow: false },
};

export default async function CardSubmittedPage() {
  const user = await getSessionUser();

  return (
    <div className="mx-auto w-full max-w-md px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-emerald-600">سفارش شما ثبت شد</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        پس از اینکه فروشگاه واریز شما را در حساب بانکی بررسی و تأیید کرد، سفارش پردازش و ارسال
        می‌شود. اگر مبلغ واریزی با مبلغ نهایی سفارش یکی نباشد، با شما تماس می‌گیریم.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {user && (
          <Link
            href="/account/orders"
            className="rounded border border-sky-600 px-6 py-3 text-sm font-bold text-sky-600 transition hover:bg-sky-50 dark:hover:bg-sky-950"
          >
            سفارش‌های من
          </Link>
        )}
        <Link
          href="/"
          className="rounded bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-500"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    </div>
  );
}
