import mongoose, { Schema } from "mongoose";
import type { NutritionFact } from "@/lib/productDetails";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categorySlug: string;
  imageUrl: string;
  /** Shown on cards and the product page; collections can be filtered by it. */
  brand?: string;
  stock: number;
  /** Average of approved reviews; 0 while there are none. Not set by hand. */
  rating: number;
  reviewCount: number;
  /** Units sold in paid orders, kept by onOrderPaid / onOrderCancelled. */
  salesCount: number;
  flavor?: string;
  size?: string;
  /**
   * Products sharing a groupSlug are the flavors and sizes of one product;
   * the product page lets shoppers switch between them.
   */
  groupSlug?: string;
  /** Label details, shown on the product page only when filled in. */
  servingSize?: string;
  nutritionFacts?: NutritionFact[];
  usage?: string;
  warnings?: string;
  /** What the maker claims on the pack, one per line; shown in its own labelled box. */
  manufacturerClaims?: string;
  /**
   * When the product last changed (an edit, its stock or its rating), kept
   * by Mongoose's timestamps option. Products saved before it existed don't
   * have it; the sitemap then falls back to when the document was created
   * (see lastModifiedOf in src/lib/sitemapEntries.ts).
   */
  updatedAt?: Date;
}

const NutritionFactSchema = new Schema<NutritionFact>(
  {
    label: { type: String, required: true },
    amount: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<Product>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: false, default: "" },
    price: { type: Number, required: true },
    categorySlug: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true },
    brand: { type: String, required: false, index: true },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    reviewCount: { type: Number, required: true, default: 0 },
    salesCount: { type: Number, required: true, default: 0, index: true },
    flavor: { type: String, required: false },
    size: { type: String, required: false },
    groupSlug: { type: String, required: false, index: true },
    servingSize: { type: String, required: false },
    // Mongoose gives array paths a [] default; undefined keeps the field off
    // products that have no nutrition table.
    nutritionFacts: { type: [NutritionFactSchema], default: undefined },
    usage: { type: String, required: false },
    warnings: { type: String, required: false },
    manufacturerClaims: { type: String, required: false },
  },
  // updatedAt only: a createdAt would add nothing the document's _id doesn't
  // already say. Mongoose applies it to updateOne, findOneAndUpdate and
  // bulkWrite too, so every existing write path keeps it current.
  { timestamps: { createdAt: false, updatedAt: true } }
);

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const ProductModel = mongoose.models.Product ?? mongoose.model("Product", ProductSchema);
