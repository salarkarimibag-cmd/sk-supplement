"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { COMING_SOON_LABEL, SALES_OPEN } from "@/lib/sales";
import { LOW_STOCK_THRESHOLD, remainingToAdd } from "@/lib/stock";

interface ProductDetailPanelProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    inStock: boolean;
    stock: number;
  };
}

export default function ProductDetailPanel({ product }: ProductDetailPanelProps) {
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!justAdded) return;
    const timeout = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(timeout);
  }, [justAdded]);

  // Shows the mobile sticky bar once the main button has scrolled up out of
  // view, and hides it again over the footer so it doesn't cover the links.
  useEffect(() => {
    const addButton = addButtonRef.current;
    const footer = document.querySelector("footer");
    if (!addButton) return;

    let buttonScrolledPast = false;
    let footerVisible = false;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === addButton) {
          buttonScrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        } else {
          footerVisible = entry.isIntersecting;
        }
      }
      setShowStickyBar(buttonScrolledPast && !footerVisible);
    });

    observer.observe(addButton);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (!product.inStock || !SALES_OPEN) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed border border-zinc-300 py-3.5 text-sm font-semibold text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
      >
        {SALES_OPEN ? "ناموجود" : COMING_SOON_LABEL}
      </button>
    );
  }

  // What's already in the cart counts against the stock. The chosen quantity
  // is capped while rendering rather than kept in sync with an effect, so it
  // follows the cart without an extra render.
  const inCart = items.find((item) => item.id === product.id)?.quantity ?? 0;
  const remaining = remainingToAdd(product.stock, inCart);
  const canAdd = remaining > 0;
  const shownQuantity = Math.max(1, Math.min(quantity, remaining));

  function handleAddToCart() {
    if (!canAdd) return;
    for (let i = 0; i < shownQuantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }
    setQuantity(1);
    setJustAdded(true);
  }

  const quantityButtonClassName =
    "cursor-pointer px-4 py-3 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-zinc-800";

  const addButtonClassName =`flex h-12 cursor-pointer items-center justify-center gap-1.5 bg-sky-600 text-sm font-bold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-300 ${
    justAdded ? "animate-[add-to-cart-pop_300ms_ease-out]" : ""
  }`;

  const addButtonLabel = justAdded ? (
    <>
      <Check aria-hidden="true" className="h-4 w-4" /> افزوده شد
    </>
  ) : canAdd ? (
    "افزودن به سبد"
  ) : (
    "همه‌ی موجودی در سبد شماست"
  );

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-zinc-300 dark:border-zinc-700">
          <button
            type="button"
            aria-label="کم کردن تعداد"
            disabled={shownQuantity <= 1}
            onClick={() => setQuantity(shownQuantity - 1)}
            className={quantityButtonClassName}
          >
            −
          </button>
          <span aria-live="polite" className="min-w-10 px-1 text-center text-sm">
            {shownQuantity.toLocaleString("fa-IR")}
          </span>
          <button
            type="button"
            aria-label="زیاد کردن تعداد"
            disabled={shownQuantity >= remaining}
            onClick={() => setQuantity(shownQuantity + 1)}
            className={quantityButtonClassName}
          >
            +
          </button>
        </div>

        <button
          ref={addButtonRef}
          type="button"
          disabled={!canAdd}
          onClick={handleAddToCart}
          className={`flex-1 ${addButtonClassName}`}
        >
          {addButtonLabel}
        </button>
      </div>

      {product.stock <= LOW_STOCK_THRESHOLD && (
        <p className="mt-3 text-sm font-semibold text-amber-600 dark:text-amber-500">
          تنها {product.stock.toLocaleString("fa-IR")} عدد در انبار باقی مانده است.
        </p>
      )}

      <div
        inert={!showStickyBar}
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-sm transition-transform duration-300 ease-out lg:hidden dark:border-zinc-800 dark:bg-zinc-900/95 ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{product.name}</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {product.price.toLocaleString("fa-IR")} تومان
            </p>
          </div>
          <button
            type="button"
            disabled={!canAdd}
            onClick={handleAddToCart}
            className={`px-6 ${addButtonClassName}`}
          >
            {addButtonLabel}
          </button>
        </div>
      </div>
    </>
  );
}
