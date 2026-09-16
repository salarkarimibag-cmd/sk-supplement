"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPageClient() {
  const { items, removeItem, setQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-bold">سبد خرید</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">سبد خرید شما خالی است.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded bg-sky-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-500"
        >
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold">سبد خرید</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <ul className="lg:col-span-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 border-b border-zinc-200 py-6 dark:border-zinc-800"
            >
              <div className="relative h-24 w-24 shrink-0 bg-zinc-100 dark:bg-zinc-800">
                <Image src={item.imageUrl} alt={item.name} fill className="object-contain" />
              </div>

              <div className="flex flex-1 flex-col">
                <p className="text-sm font-bold">{item.name}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {item.price.toLocaleString("fa-IR")} تومان
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center border border-zinc-300 dark:border-zinc-700">
                    <button
                      type="button"
                      aria-label="کم کردن تعداد"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      className="cursor-pointer px-2.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      −
                    </button>
                    <span className="min-w-8 px-1 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="زیاد کردن تعداد"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      className="cursor-pointer px-2.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label="حذف از سبد خرید"
                    onClick={() => removeItem(item.id)}
                    className="cursor-pointer text-zinc-400 hover:text-red-600"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      className="h-5 w-5"
                    >
                      <path
                        d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0h10l-.7 12.6a1 1 0 01-1 .94H8.7a1 1 0 01-1-.94L7 7z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit border border-zinc-200 p-6 dark:border-zinc-800">
          <div className="flex items-center justify-between text-sm font-bold">
            <span>مجموع تقریبی</span>
            <span>{totalPrice.toLocaleString("fa-IR")} تومان</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            مالیات و هزینه‌ی ارسال در تسویه‌حساب محاسبه می‌شود.
          </p>

          <Link
            href="/checkout"
            className="mt-4 block rounded bg-sky-600 py-3 text-center text-sm font-bold text-white transition hover:bg-sky-500"
          >
            تسویه حساب
          </Link>
        </div>
      </div>
    </div>
  );
}
