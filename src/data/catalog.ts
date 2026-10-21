import type { Product } from "@/models/Product";

export type CatalogProduct = Product & { inStock: boolean };

// Seed fixtures leave out the counters: ratings come only from approved
// reviews and sales only from paid orders, so they start at the schema's 0.
export type SeedProduct = Omit<CatalogProduct, "rating" | "reviewCount" | "salesCount">;

// Fixture data for scripts/seed-products.ts only — every live page fetches
// products from MongoDB via src/lib/products.ts, not from this file.
// Only brandless products that no brand product covers yet live here; the
// brand products are in scripts/seed-brand-products.ts.
export const productsBySlug: Record<string, SeedProduct[]> = {
  aminos: [
    {
      id: "a5",
      name: "گلوتامین خالص",
      slug: "pure-glutamine",
      description: "",
      price: 690000,
      categorySlug: "aminos",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      inStock: true,
      flavor: "بدون طعم",
    },
    {
      id: "a7",
      name: "سیترولین مالات",
      slug: "citrulline-malate",
      description: "",
      price: 850000,
      categorySlug: "aminos",
      imageUrl: "/images/placeholder.svg",
      stock: 10,
      inStock: true,
      flavor: "بدون طعم",
    },
  ],
};
