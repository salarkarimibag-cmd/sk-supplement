import Image from "next/image";
import Link from "next/link";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function ProductCard({ id, name, price, imageUrl }: ProductCardProps) {
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
        <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
          {price.toLocaleString("fa-IR")} تومان
        </p>
      </Link>

      <button
        type="button"
        className="mt-3 w-full border border-sky-600 py-3 text-sm font-semibold text-sky-600 transition-shadow hover:shadow-[0_0_0_1px_var(--color-sky-600)]"
      >
        افزودن به سبد
      </button>
    </div>
  );
}
