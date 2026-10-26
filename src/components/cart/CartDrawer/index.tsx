"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import CartLine from "@/components/cart/CartLine";
import Price from "@/components/ui/Price";
import { useCart } from "@/context/CartContext";
import { useOverlay } from "@/hooks/useOverlay";
import { COMING_SOON_LABEL, SALES_OPEN } from "@/lib/sales";

export default function CartDrawer() {
  const { items, isOpen, closeCart, totalPrice } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  // Escape closes it, focus stays inside while it's open, the page behind
  // doesn't scroll.
  useOverlay(isOpen, closeCart, drawerRef);

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
        ref={drawerRef}
        role="dialog"
        // Tells screen readers the page behind is out of reach while it's open.
        aria-modal="true"
        aria-label="سبد خرید"
        // Closed, the drawer stays mounted off-screen; `inert` keeps its
        // buttons and links out of the Tab order and hides it from screen readers.
        inert={!isOpen}
        // right-0 (not start-0) on purpose: it must match translate-x-full,
        // which always slides it out to the right; Tailwind has no logical
        // translate.
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
              <CartLine key={item.id} item={item} variant="drawer" />
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
