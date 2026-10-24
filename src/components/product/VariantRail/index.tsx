import VariantLink from "@/components/product/VariantLink";
import VariantRailPanel, { type RailTab } from "@/components/product/VariantRailPanel";
import { photoSources } from "@/components/product/VariantPicker";
import type { VariantOption, VariantOptions } from "@/lib/variants";

function RailOptions({ options }: { options: VariantOption[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {options.map((option) => (
        <li key={option.value}>
          <VariantLink
            href={`/products/${option.productId}`}
            photo={option.selected ? undefined : photoSources(option.imageUrl)}
            aria-current={option.selected ? "page" : undefined}
            className={`block rounded-xl px-2.5 py-1.5 text-start text-[11px] leading-snug transition-colors ${
              option.selected
                ? "bg-gradient-to-b from-sky-500 to-sky-700 font-bold text-white shadow-md shadow-sky-700/30"
                : "text-zinc-900 active:bg-black/10 dark:text-zinc-100 dark:active:bg-white/15"
            } ${option.available ? "" : "line-through opacity-60"}`}
          >
            {option.value}
            {!option.available && <span className="sr-only"> (ناموجود)</span>}
          </VariantLink>
        </li>
      ))}
    </ul>
  );
}

/**
 * Mobile-only flavor and size choices on one glass strip over the right edge
 * of the product photo, so the photo stays in view while the shopper
 * switches. Render it inside a VariantPhotoFrame.
 */
export default function VariantRail({ flavors, sizes }: VariantOptions) {
  const tabs: RailTab[] = [];
  if (flavors.length > 1) tabs.push({ id: "flavors", label: "طعم", content: <RailOptions options={flavors} /> });
  if (sizes.length > 1) tabs.push({ id: "sizes", label: "وزن", content: <RailOptions options={sizes} /> });

  return tabs.length > 0 ? <VariantRailPanel tabs={tabs} /> : null;
}
