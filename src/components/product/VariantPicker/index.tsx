import Link from "next/link";
import type { VariantOption, VariantOptions } from "@/lib/variants";

function OptionRow({ label, options }: { label: string; options: VariantOption[] }) {
  const selected = options.find((option) => option.selected);

  return (
    <div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {label}: <span className="font-bold text-zinc-900 dark:text-zinc-100">{selected?.value}</span>
      </p>

      {options.length > 1 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {options.map((option) => (
            <li key={option.value}>
              <Link
                href={`/products/${option.productId}`}
                // Switching flavor or size shouldn't jump back to the top of the page.
                scroll={false}
                aria-current={option.selected ? "page" : undefined}
                className={`inline-block rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  option.selected
                    ? "border-sky-600 bg-sky-50 font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                    : "border-zinc-300 hover:border-sky-600 dark:border-zinc-700"
                } ${option.available ? "" : "text-zinc-400 line-through dark:text-zinc-500"}`}
              >
                {option.value}
                {!option.available && <span className="sr-only"> (ناموجود)</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Flavor and size choices for a product that belongs to a group. */
export default function VariantPicker({ flavors, sizes }: VariantOptions) {
  return (
    <div className="flex flex-col gap-4">
      {flavors.length > 0 && <OptionRow label="طعم" options={flavors} />}
      {sizes.length > 0 && <OptionRow label="سایز" options={sizes} />}
    </div>
  );
}
