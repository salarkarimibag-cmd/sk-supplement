import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/product/AddToCartButton";
import PackContents from "@/components/product/PackContents";
import PackSavingsNote from "@/components/product/PackSavingsNote";
import Price from "@/components/ui/Price";
import StarRating from "@/components/ui/StarRating";
import type { CatalogProduct } from "@/data/catalog";
import { packSavings } from "@/lib/packs";
import type { PackProduct } from "@/lib/products";

interface PackCardProps {
  pack: CatalogProduct;
  /** Any products that include this pack's. */
  products: PackProduct[];
}

/**
 * A wider card than ProductCard: a pack sells on what's in it and what it
 * saves, so both are on the card rather than one click away.
 */
export default function PackCard({ pack, products }: PackCardProps) {
  const href = `/products/${pack.id}`;

  return (
    <article className="flex flex-col gap-5 border border-zinc-200 p-5 sm:flex-row md:flex-col lg:flex-row dark:border-zinc-800">
      <Link
        href={href}
        className="relative mx-auto aspect-square w-full max-w-64 shrink-0 sm:w-52 md:w-full lg:w-52"
      >
        <Image
          src={pack.imageUrl}
          alt={pack.name}
          fill
          // Matches the widths above: full width up to 16rem, then fixed.
          sizes="(min-width: 640px) 13rem, 16rem"
          className="object-contain"
        />
        {!pack.inStock && (
          <span className="absolute bottom-0 start-0 rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
            ناموجود
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="text-lg font-extrabold">
          <Link href={href} className="transition-colors hover:text-sky-600">
            {pack.name}
          </Link>
        </h2>
        <StarRating rating={pack.rating} reviewCount={pack.reviewCount} className="mt-1.5" />

        <div className="mt-4 flex-1">
          <PackContents productIds={pack.packProductIds ?? []} products={products} />
        </div>

        <div className="mt-5">
          <PackSavingsNote savings={packSavings(pack, products)} />
          <p className="mt-1 text-lg font-bold">
            <Price amount={pack.price} />
          </p>
        </div>

        <AddToCartButton
          id={pack.id}
          name={pack.name}
          price={pack.price}
          imageUrl={pack.imageUrl}
          stock={pack.stock}
        />
      </div>
    </article>
  );
}
