import VariantLink from "@/components/product/VariantLink";
import VariantRailPanel from "@/components/product/VariantRailPanel";
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
                ? "bg-sky-600 font-bold text-white"
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
 * Mobile-only flavor and size choices that hang over the sides of the product
 * photo, so the photo stays in view while the shopper switches. Flavors sit on
 * the reading-start edge and sizes on the other. Render it inside the photo's
 * relatively positioned box.
 */
export default function VariantRail({ flavors, sizes }: VariantOptions) {
  return (
    <>
      {flavors.length > 1 && (
        <VariantRailPanel label="طعم" side="start" viewTransitionName="variant-rail-flavors">
          <RailOptions options={flavors} />
        </VariantRailPanel>
      )}
      {sizes.length > 1 && (
        <VariantRailPanel label="وزن / سایز" side="end" viewTransitionName="variant-rail-sizes">
          <RailOptions options={sizes} />
        </VariantRailPanel>
      )}
    </>
  );
}
