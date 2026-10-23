import { z } from "zod";

/** The fields of a product needed to offer its group's flavors and sizes. */
export interface VariantProduct {
  id: string;
  flavor?: string;
  size?: string;
  inStock: boolean;
  imageUrl?: string;
}

export interface VariantOption {
  value: string;
  /** The product to open when this option is picked. */
  productId: string;
  /** That product's photo, loaded before switching so it can animate in. */
  imageUrl?: string;
  selected: boolean;
  available: boolean;
}

export interface VariantOptions {
  flavors: VariantOption[];
  sizes: VariantOption[];
}

/**
 * The view-transition type of a flavor or size switch. The variant links tag
 * their navigation with it, and only then does the product photo animate
 * (the `variant-photo` rules in globals.css).
 */
export const VARIANT_SWITCH = "variant-switch";

/** The `sizes` of a product page's photo, shared with the variant links that preload it. */
export const PRODUCT_PHOTO_SIZES = "(min-width: 1024px) 50vw, 100vw";

type Axis = "flavor" | "size";

function optionsFor(axis: Axis, current: VariantProduct, group: VariantProduct[]): VariantOption[] {
  const other: Axis = axis === "flavor" ? "size" : "flavor";
  const values = [...new Set(group.flatMap((product) => product[axis] ?? []))].sort((a, b) =>
    a.localeCompare(b, "fa", { numeric: true })
  );

  return values.map((value) => {
    const candidates = group.filter((product) => product[axis] === value);
    // Changing the flavor should keep the size the shopper already chose
    // (and vice versa); only when that combination doesn't exist does the
    // other attribute change too, preferring one that's in stock.
    const target =
      candidates.find((product) => product[other] === current[other]) ??
      candidates.find((product) => product.inStock) ??
      candidates[0];

    return {
      value,
      productId: target.id,
      imageUrl: target.imageUrl,
      selected: value === current[axis],
      available: target.inStock,
    };
  });
}

/**
 * The flavor and size choices for a product page: every value found in the
 * product's group, each linking to the group member that best matches it.
 * `group` should include the current product.
 */
export function buildVariantOptions(current: VariantProduct, group: VariantProduct[]): VariantOptions {
  return {
    flavors: optionsFor("flavor", current, group),
    sizes: optionsFor("size", current, group),
  };
}

export interface VariantSummary {
  flavorCount: number;
  sizeCount: number;
}

type Groupable = { groupSlug?: string; flavor?: string; size?: string };

function countDistinct(values: (string | undefined)[]): number {
  return new Set(values.filter(Boolean)).size;
}

/**
 * Keeps one card per group in a product list: the first member in the
 * list's order, so it's the best match for the current sort and the one
 * that passed the current filters. The kept card gets a variantSummary
 * when the list held more than one member of its group. Ungrouped
 * products pass through unchanged.
 */
export function collapseGroups<T extends Groupable>(products: T[]): (T & { variantSummary?: VariantSummary })[] {
  const members = new Map<string, T[]>();
  for (const product of products) {
    if (!product.groupSlug) continue;
    const list = members.get(product.groupSlug) ?? [];
    list.push(product);
    members.set(product.groupSlug, list);
  }

  const seen = new Set<string>();
  const result: (T & { variantSummary?: VariantSummary })[] = [];
  for (const product of products) {
    if (!product.groupSlug) {
      result.push(product);
      continue;
    }
    if (seen.has(product.groupSlug)) continue;
    seen.add(product.groupSlug);

    const group = members.get(product.groupSlug) ?? [product];
    result.push(
      group.length > 1
        ? {
            ...product,
            variantSummary: {
              flavorCount: countDistinct(group.map((member) => member.flavor)),
              sizeCount: countDistinct(group.map((member) => member.size)),
            },
          }
        : product
    );
  }
  return result;
}

/** "۳ طعم · ۲ سایز" — only the attributes with more than one choice; "" if none. */
export function formatVariantSummary({ flavorCount, sizeCount }: VariantSummary): string {
  return [
    flavorCount > 1 ? `${flavorCount.toLocaleString("fa-IR")} طعم` : "",
    sizeCount > 1 ? `${sizeCount.toLocaleString("fa-IR")} سایز` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

/** A group slug: lowercase words joined by hyphens, like "whey-isolate"; "" clears it. */
export const productGroupSchema = z.object({
  groupSlug: z
    .string()
    .trim()
    .max(60)
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/)
    .optional(),
});
