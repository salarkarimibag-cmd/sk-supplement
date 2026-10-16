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
  stock: number;
  /** Average of approved reviews; 0 while there are none. Not set by hand. */
  rating: number;
  reviewCount: number;
  /** Units sold in paid orders, kept by onOrderPaid / onOrderCancelled. */
  salesCount: number;
  flavor?: string;
  size?: string;
  /** Label details, shown on the product page only when filled in. */
  servingSize?: string;
  nutritionFacts?: NutritionFact[];
  usage?: string;
  warnings?: string;
}

const NutritionFactSchema = new Schema<NutritionFact>(
  {
    label: { type: String, required: true },
    amount: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<Product>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: false, default: "" },
  price: { type: Number, required: true },
  categorySlug: { type: String, required: true, index: true },
  imageUrl: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  rating: { type: Number, required: true, default: 0 },
  reviewCount: { type: Number, required: true, default: 0 },
  salesCount: { type: Number, required: true, default: 0, index: true },
  flavor: { type: String, required: false },
  size: { type: String, required: false },
  servingSize: { type: String, required: false },
  // Mongoose gives array paths a [] default; undefined keeps the field off
  // products that have no nutrition table.
  nutritionFacts: { type: [NutritionFactSchema], default: undefined },
  usage: { type: String, required: false },
  warnings: { type: String, required: false },
});

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const ProductModel = mongoose.models.Product ?? mongoose.model("Product", ProductSchema);
