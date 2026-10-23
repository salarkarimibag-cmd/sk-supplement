import type { Product } from "@/models/Product";

export type CatalogProduct = Product & { inStock: boolean };

// Seed fixtures leave out the counters: ratings come only from approved
// reviews and sales only from paid orders, so they start at the schema's 0.
// The products themselves are in scripts/seed-brand-products.ts.
export type SeedProduct = Omit<CatalogProduct, "rating" | "reviewCount" | "salesCount">;
