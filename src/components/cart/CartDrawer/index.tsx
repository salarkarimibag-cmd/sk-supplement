"use client";

import Image from "next/image";
import Link from "next/link";
import Price from "@/components/ui/Price";
import { useCart } from "@/context/CartContext";
import { COMING_SOON_LABEL, SALES_OPEN } from "@/lib/sales";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQuantity, totalPrice } = useCart();

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-label="سبد خرید"
        // Closed, the drawer stays mounted off-screen; `inert` keeps its
        // buttons and links out of the Tab order and hides it from screen readers.
        inert={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}
      >
        <Image
          src="/images/cart-drawer-bg.webp"
          alt=""
          fill
          sizes="(min-width: 448px) 448px, 100vw"
          className="object-cover opacity-70"
        />

        <div className="relative z-10 flex h-full flex-col bg-white/60 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
          <h2 className="text-lg font-bold">سبد خرید شما</h2>
          <button
            type="button"
            aria-label="بستن"
            onClick={closeCart}
            className="cursor-pointer text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6 text-sm text-zinc-500">
            سبد خرید شما خالی است.
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto px-6">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 border-b border-zinc-100 py-5 dark:border-zinc-800">
                <div className="relative h-20 w-20 shrink-0 bg-zinc-100 dark:bg-zinc-800">
                  <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-contain" />
                </div>

                <div className="flex flex-1 flex-col">
                  <p className="text-sm font-bold">{item.name}</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <Price amount={item.price} />
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
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                        <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0h10l-.7 12.6a1 1 0 01-1 .94H8.7a1 1 0 01-1-.94L7 7z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <div className="border-t border-zinc-200 px-6 py-5 dark:border-zinc-800">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>مجموع تقریبی</span>
              <span>
                <Price amount={totalPrice} />
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">ارسال به سراسر کشور رایگان است.</p>

            {SALES_OPEN ? (
              <Link
                href="/checkout"
                onClick={closeCart}
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
        )}
        </div>
      </div>
    </>
  );
}
