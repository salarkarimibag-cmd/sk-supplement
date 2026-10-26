"use client";

import Link from "next/link";
import CartLine from "@/components/cart/CartLine";
import Price from "@/components/ui/Price";
import { useCart } from "@/context/CartContext";
import { COMING_SOON_LABEL, SALES_OPEN } from "@/lib/sales";

export default function CartPageClient() {
  const { items, totalPrice } = useCart();

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
            <CartLine key={item.id} item={item} variant="page" />
          ))}
        </ul>

        <div className="h-fit border border-zinc-200 p-6 dark:border-zinc-800">
          <div className="flex items-center justify-between text-sm font-bold">
            <span>مجموع تقریبی</span>
            <span>
              <Price amount={totalPrice} />
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            ارسال به سراسر کشور رایگان است.
          </p>

          {SALES_OPEN ? (
            <Link
              href="/checkout"
              className="mt-4 block rounded bg-sky-600 py-3 text-center text-sm font-bold text-white transition hover:bg-sky-500"
            >
              تسویه حساب
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-4 block w-full cursor-not-allowed rounded bg-zinc-300 py-3 text-center text-sm font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
            >
              {COMING_SOON_LABEL}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
