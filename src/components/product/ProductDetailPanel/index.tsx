"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import type { CatalogProduct } from "@/data/catalog";

interface ProductDetailPanelProps {
  product: CatalogProduct;
}

export default function ProductDetailPanel({ product }: ProductDetailPanelProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timeout = setTimeout(() => setJustAdded(false), 2000);
    return () => clearTimeout(timeout);
  }, [justAdded]);

  if (!product.inStock) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed border border-zinc-300 py-3.5 text-sm font-semibold text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
      >
        ناموجود
      </button>
    );
  }

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }
    setJustAdded(true);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border border-zinc-300 dark:border-zinc-700">
        <button
          type="button"
          aria-label="کم کردن تعداد"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          className="cursor-pointer px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          −
        </button>
        <span className="min-w-10 px-1 text-center text-sm">{quantity}</span>
        <button
          type="button"
          aria-label="زیاد کردن تعداد"
          onClick={() => setQuantity((current) => current + 1)}
          className="cursor-pointer px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        className="flex-1 cursor-pointer border border-sky-600 py-3.5 text-sm font-semibold text-sky-600 transition-shadow hover:shadow-[0_0_0_1px_var(--color-sky-600)]"
      >
        {justAdded ? "به سبد اضافه شد ✓" : "افزودن به سبد"}
      </button>
    </div>
  );
}
