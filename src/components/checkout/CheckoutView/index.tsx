"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

function CheckoutLogo() {
  return (
    <div className="pb-6">
      <Link href="/" className="inline-flex items-center">
        <Image src="/images/logo-checkout.webp" alt="SK Supplement" width={746} height={424} className="h-24 w-auto" />
      </Link>
    </div>
  );
}

export default function CheckoutView() {
  const { items, totalPrice } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          email: formData.get("email"),
          mobile: formData.get("mobile"),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.url) {
        setError(data.message ?? "اتصال به درگاه پرداخت زرین‌پال ناموفق بود.");
        setIsSubmitting(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("خطایی در اتصال به درگاه پرداخت رخ داد.");
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
        <CheckoutLogo />
        <h1 className="mt-10 text-2xl font-bold">تسویه حساب</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">سبد خرید شما خالی است.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded bg-sky-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-500"
        >
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-2">
      <h1 className="sr-only">تسویه حساب</h1>

      <div className="bg-[rgb(255_255_255)] px-6 py-12 dark:bg-zinc-950">
      <div className="mx-auto max-w-xl">
      <CheckoutLogo />
      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-8">
        <div>
          <h2 className="text-lg font-bold">اطلاعات تماس</h2>
          <input
            type="email"
            name="email"
            required
            placeholder="ایمیل"
            className="mt-3 w-full rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <div>
          <h2 className="text-lg font-bold">اطلاعات ارسال</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="نام"
              className="rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="text"
              required
              placeholder="نام خانوادگی"
              className="rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="text"
              required
              placeholder="استان"
              className="rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="text"
              required
              placeholder="شهر"
              className="rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="text"
              required
              placeholder="آدرس"
              className="col-span-2 rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="text"
              required
              placeholder="کد پستی"
              className="rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="tel"
              name="mobile"
              required
              placeholder="شماره موبایل"
              className="rounded border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold">روش پرداخت</h2>
          <div className="mt-3 flex items-center gap-2 rounded border border-sky-600 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-400">
            <span className="h-3 w-3 rounded-full bg-sky-600" />
            پرداخت آنلاین با درگاه زرین‌پال
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded bg-sky-600 py-3.5 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "در حال انتقال..." : "پرداخت و تکمیل خرید"}
        </button>
      </form>
      </div>
      </div>

      <div className="bg-[rgb(248_248_248)] px-6 py-12 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:border-r lg:border-zinc-200 dark:bg-zinc-900 dark:lg:border-zinc-800">
      <div className="mx-auto max-w-xl">
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className="relative h-16 w-16 shrink-0 rounded bg-white">
                <Image src={item.imageUrl} alt={item.name} fill className="object-contain" />
                <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                  {item.quantity}
                </span>
              </div>
              <div className="flex flex-1 items-center justify-between">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-sm">
                  {(item.price * item.quantity).toLocaleString("fa-IR")} تومان
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex gap-2">
          <input
            type="text"
            placeholder="کد تخفیف"
            className="flex-1 rounded border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-sky-600 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {/* TODO: validate against /api/discounts once discount codes exist. */}
          <button
            type="button"
            className="cursor-pointer rounded border border-zinc-300 px-4 text-sm font-semibold dark:border-zinc-700"
          >
            اعمال
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">جمع جزء</span>
            <span>{totalPrice.toLocaleString("fa-IR")} تومان</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">ارسال</span>
            <span className="text-zinc-500">در مرحله‌ی بعد محاسبه می‌شود</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-bold dark:border-zinc-800">
            <span>جمع کل</span>
            <span>{totalPrice.toLocaleString("fa-IR")} تومان</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
