import VariantLink from "@/components/product/VariantLink";
import VariantRailPanel, { type RailTab } from "@/components/product/VariantRailPanel";
import { photoSources } from "@/components/product/VariantPicker";
import { LIST_FADE_MS, PICK_SHOW_MS, type VariantOption, type VariantOptions } from "@/lib/variants";


function RailOptions({ options }: { options: VariantOption[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {options.map((option) => (
        <li key={option.value}>
          <VariantLink
            href={`/products/${option.productId}`}
            photo={option.selected ? undefined : photoSources(option.imageUrl)}
            // Picking another option shows the pick, fades the list, then switches.
            holdMs={option.selected ? 0 : PICK_SHOW_MS + LIST_FADE_MS}
            isCurrent={option.selected}
            aria-current={option.selected ? "page" : undefined}
            className={`block rounded-xl px-2.5 py-1.5 text-start text-[11px] leading-snug transition-colors ${
              option.selected
                ? "bg-gradient-to-b from-sky-500 to-sky-700 font-bold text-white shadow-md shadow-sky-700/30 group-data-[picking]/list:bg-none group-data-[picking]/list:font-normal group-data-[picking]/list:text-zinc-900 group-data-[picking]/list:shadow-none dark:group-data-[picking]/list:text-zinc-100"
                : "text-zinc-900 active:bg-black/10 dark:text-zinc-100 dark:active:bg-white/15"
            } data-[picked]:bg-sky-600 data-[picked]:font-bold data-[picked]:text-white data-[picked]:shadow-md data-[picked]:shadow-sky-700/30 ${option.available ? "" : "line-through opacity-60"}`}
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
