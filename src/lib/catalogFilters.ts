import type { CatalogProduct } from "@/data/catalog";

export interface SortOption {
  value: string;
  label: string;
}

export const sortOptions: SortOption[] = [
  { value: "featured", label: "پرفروش‌ترین" },
  { value: "newest", label: "جدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
  { value: "name-asc", label: "الفبا (آ-ی)" },
  { value: "name-desc", label: "الفبا (ی-آ)" },
];

export function sortProducts(products: CatalogProduct[], sort: string): CatalogProduct[] {
  const sorted = [...products];
  switch (sort) {
    case "newest":
      return sorted.reverse();
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "fa"));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name, "fa"));
    case "featured":
    default:
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
  }
}

export function filterProducts(
  products: CatalogProduct[],
  { flavors, sizes }: { flavors: string[]; sizes: string[] }
): CatalogProduct[] {
  return products.filter((product) => {
    const matchesFlavor = flavors.length === 0 || (!!product.flavor && flavors.includes(product.flavor));
    const matchesSize = sizes.length === 0 || (!!product.size && sizes.includes(product.size));
    return matchesFlavor && matchesSize;
  });
}

/** Normalizes a Next.js searchParams entry (string | string[] | undefined) to a string array. */
export function toParamArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export interface FilterOptionCount {
  value: string;
  count: number;
}

/** Distinct flavor/size values present in a product list, each with how many products have it. */
export function countByAttribute(
  products: CatalogProduct[],
  key: "flavor" | "size"
): FilterOptionCount[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    const value = product[key];
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value, "fa"));
}
