import { z } from "zod";

/** The fields of a product needed to offer its group's flavors and sizes. */
export interface VariantProduct {
  id: string;
  flavor?: string;
  size?: string;
  inStock: boolean;
}

export interface VariantOption {
  value: string;
  /** The product to open when this option is picked. */
  productId: string;
  selected: boolean;
  available: boolean;
}

export interface VariantOptions {
  flavors: VariantOption[];
  sizes: VariantOption[];
}

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

/** A group slug: lowercase words joined by hyphens, like "whey-isolate"; "" clears it. */
export const productGroupSchema = z.object({
  groupSlug: z
    .string()
    .trim()
    .max(60)
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/)
    .optional(),
});
