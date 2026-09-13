import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/ui/StarRating";

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
        </div>
        <h3 className="mt-4 text-sm font-bold underline-offset-4 transition-colors group-hover:text-sky-600 group-has-[button:hover]/card:underline">
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
          className="mt-3 w-full border border-sky-600 py-3 text-sm font-semibold text-sky-600 transition-shadow hover:shadow-[0_0_0_1px_var(--color-sky-600)]"
        >
          افزودن به سبد
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="mt-3 w-full cursor-not-allowed border border-zinc-300 py-3 text-sm font-semibold text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
        >
          ناموجود
        </button>
      )}
    </div>
  );
}
