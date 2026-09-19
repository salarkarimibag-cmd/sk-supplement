"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import StarRating from "@/components/ui/StarRating";
import { useCart } from "@/context/CartContext";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  rating,
  reviewCount,
  inStock = true,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timeout = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timeout);
  }, [justAdded]);

  function handleAddToCart() {
    addItem({ id, name, price, imageUrl });
    setJustAdded(true);
  }

  return (
    <div className="group/card flex flex-col">
      <Link href={`/products/${id}`} className="group block">
        <div className="relative aspect-square bg-white">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain"
          />
          {!inStock && (
            <span className="absolute bottom-3 right-3 rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
              ناموجود
            </span>
          )}
        </div>
        <h3
          className={`mt-4 line-clamp-2 text-sm font-bold underline-offset-4 transition-colors group-hover:text-sky-600 group-has-[button:hover]/card:underline ${
            rating !== undefined ? "min-h-10" : ""
          }`}
        >
          {name}
        </h3>
        {rating !== undefined && reviewCount !== undefined && (
          <div className="mt-1.5">
            <StarRating rating={rating} reviewCount={reviewCount} />
          </div>
        )}
        <p className="mt-1.5 text-sm text-zinc-900 dark:text-zinc-100">
          {price.toLocaleString("fa-IR")} تومان
        </p>
      </Link>

      {inStock ? (
        <button
          type="button"
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
      ) : (
        <button
          type="button"
          disabled
          className="mt-3 flex h-11 w-full cursor-not-allowed items-center justify-center border border-zinc-300 text-sm font-semibold text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
        >
          ناموجود
        </button>
      )}
    </div>
  );
}
