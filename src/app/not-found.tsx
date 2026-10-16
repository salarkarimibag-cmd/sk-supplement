import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
};

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-20 text-center">
      <p className="text-6xl font-black text-sky-600">{(404).toLocaleString("fa-IR")}</p>
      <h1 className="mt-4 text-2xl font-bold">صفحه‌ای که دنبالش بودید پیدا نشد</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه یا محصول دیگر وجود نداشته باشد.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/products"
          className="rounded border border-sky-600 px-6 py-3 text-sm font-bold text-sky-600 transition hover:bg-sky-50 dark:hover:bg-sky-950"
        >
          مشاهده محصولات
        </Link>
        <Link
          href="/"
          className="rounded bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-500"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
