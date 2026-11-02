import Link from "next/link";
import { Check } from "lucide-react";
import type { PackProduct } from "@/lib/products";
import { splitProductName } from "@/lib/showcase";

interface PackContentsProps {
  /** The ids saved on the pack, in the order to list them. */
  productIds: string[];
  /** Any products that include these; a deleted one is left off the list. */
  products: PackProduct[];
}

/** What's in a combo pack, each product linking to its own page. */
export default function PackContents({ productIds, products }: PackContentsProps) {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const contents = productIds.flatMap((id) => productsById.get(id) ?? []);

  return (
    <ul className="space-y-2.5">
      {contents.map((product) => (
        <li key={product.id} className="flex gap-2 text-sm">
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
          <span>
            <Link href={`/products/${product.id}`} className="font-semibold hover:underline">
              {/* The Persian part alone: mixing in the English name scrambles the line. */}
              {splitProductName(product.name).title}
            </Link>
            {(product.flavor || product.size) && (
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                {[product.flavor, product.size].filter(Boolean).join(" · ")}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
