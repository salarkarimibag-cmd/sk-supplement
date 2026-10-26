"use client";

import Image from "next/image";
import Price from "@/components/ui/Price";
import { useCart, type CartItem } from "@/context/CartContext";

// The drawer is narrower than the cart page, so its rows are a little tighter.
const VARIANTS = {
  drawer: { row: "border-zinc-100 py-5", image: "h-20 w-20", imageSizes: "80px" },
  page: { row: "border-zinc-200 py-6", image: "h-24 w-24", imageSizes: "96px" },
} as const;

interface CartLineProps {
  item: CartItem;
  variant: keyof typeof VARIANTS;
}

/**
 * One product row of the cart: photo, name, price, quantity buttons and
 * remove. Shared by the cart drawer and the cart page, so a change to the
 * row (a label, the stock limit) only has to be made once.
 */
export default function CartLine({ item, variant }: CartLineProps) {
  const { removeItem, setQuantity } = useCart();
  const styles = VARIANTS[variant];

  return (
    <li className={`flex gap-4 border-b dark:border-zinc-800 ${styles.row}`}>
      <div className={`relative shrink-0 bg-zinc-100 dark:bg-zinc-800 ${styles.image}`}>
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes={styles.imageSizes}
          className="object-contain"
        />
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
            <span className="min-w-8 px-1 text-center text-sm">
              {item.quantity.toLocaleString("fa-IR")}
            </span>
            <button
              type="button"
              aria-label="زیاد کردن تعداد"
              disabled={item.stock !== undefined && item.quantity >= item.stock}
              onClick={() => setQuantity(item.id, item.quantity + 1)}
              className="cursor-pointer px-2.5 py-1 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-zinc-800"
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
  );
}
