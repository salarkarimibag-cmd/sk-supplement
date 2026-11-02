import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/product/AddToCartButton";
import Price from "@/components/ui/Price";
import StarRating from "@/components/ui/StarRating";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  brand?: string;
  /** Required, so every product list shows the same card (stars appear once it has reviews). */
  rating: number;
  reviewCount: number;
  /** Units in stock; the card never adds more than this to the cart. */
  stock: number;
  /** e.g. "۳ طعم · ۲ سایز" when this card stands for a whole flavor/size group. */
  variantLabel?: string;
}

export default function ProductCard({
  id,
  name,
  price,
  imageUrl,
  brand,
  rating,
  reviewCount,
  stock,
  variantLabel,
}: ProductCardProps) {
  const inStock = stock > 0;

  return (
    <div className="group/card flex flex-col">
      <Link href={`/products/${id}`} className="group block flex-1">
        <div className="relative aspect-square bg-white dark:bg-zinc-900">
          <Image
            src={imageUrl}
            alt={name}
            fill
            // Matches the product grids: 2 columns, then 3 from sm, then 4 from md.
            sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain"
          />
          {!inStock && (
            <span className="absolute bottom-3 start-3 rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
              ناموجود
            </span>
          )}
        </div>
        {brand && (
          <p className="mt-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{brand}</p>
        )}
        <h3
          className={`${brand ? "mt-1" : "mt-4"} line-clamp-2 min-h-10 text-sm font-bold text-balance underline-offset-4 transition-colors group-hover:text-sky-600 group-has-[button:hover]/card:underline`}
        >
          {name}
        </h3>
        <StarRating rating={rating} reviewCount={reviewCount} className="mt-1.5" />
        {variantLabel && (
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">{variantLabel}</p>
        )}
        <p className="mt-1.5 text-sm text-zinc-900 dark:text-zinc-100">
          <Price amount={price} />
        </p>
      </Link>

      {variantLabel ? (
        // A card that stands for several flavors/sizes can't know which one
        // the shopper wants, so it sends them to the product page to choose.
        <Link
          href={`/products/${id}`}
          className="mt-3 flex h-11 w-full items-center justify-center border border-sky-600 text-sm font-semibold text-sky-600 transition-shadow hover:shadow-[0_0_0_1px_var(--color-sky-600)]"
        >
          انتخاب گزینه‌ها
        </Link>
      ) : (
        <AddToCartButton id={id} name={name} price={price} imageUrl={imageUrl} stock={stock} />
      )}
    </div>
  );
}
