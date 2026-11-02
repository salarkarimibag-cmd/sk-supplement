"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { COMING_SOON_LABEL, SALES_OPEN } from "@/lib/sales";
import { remainingToAdd } from "@/lib/stock";

interface AddToCartButtonProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  /** Units in stock; the button never adds more than this to the cart. */
  stock: number;
}

/** A card's button: adds one unit, or says why it can't. */
export default function AddToCartButton({ id, name, price, imageUrl, stock }: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const inStock = stock > 0;
  // What's already in the cart counts against the stock, as on the product page.
  const inCart = items.find((item) => item.id === id)?.quantity ?? 0;
  const canAdd = remainingToAdd(stock, inCart) > 0;

  useEffect(() => {
    if (!justAdded) return;
    const timeout = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timeout);
  }, [justAdded]);

  function handleAddToCart() {
    addItem({ id, name, price, imageUrl, stock });
    setJustAdded(true);
  }

  if (inStock && SALES_OPEN && (canAdd || justAdded)) {
    return (
      <button
        type="button"
        // Stays enabled while "افزوده شد" shows, so the button doesn't flicker
        // when that click used up the last unit; addItem caps it anyway.
        onClick={handleAddToCart}
        className={`mt-3 flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 text-sm font-semibold transition-shadow ${
          justAdded
            ? "animate-[add-to-cart-pop_300ms_ease-out] border border-sky-600 bg-sky-600 text-white"
            : "border border-sky-600 text-sky-600 hover:shadow-[0_0_0_1px_var(--color-sky-600)]"
        }`}
      >
        {justAdded ? (
          <>
            <Check className="h-4 w-4" /> افزوده شد
          </>
        ) : (
          "افزودن به سبد"
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled
      className="mt-3 flex h-11 w-full cursor-not-allowed items-center justify-center border border-zinc-300 px-2 text-center text-sm leading-tight font-semibold text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
    >
      {!SALES_OPEN ? COMING_SOON_LABEL : inStock ? "همه‌ی موجودی در سبد شماست" : "ناموجود"}
    </button>
  );
}
