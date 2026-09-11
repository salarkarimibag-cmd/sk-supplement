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
    <Link
      href={`/products/${id}`}
      className="group block overflow-hidden rounded-lg border border-black/[.08] dark:border-white/[.145]"
    >
      <div className="relative aspect-square bg-zinc-50 dark:bg-zinc-900">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium">{name}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {price.toLocaleString("fa-IR")} تومان
        </p>
      </div>
    </Link>
  );
}
