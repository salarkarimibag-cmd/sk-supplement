import mongoose, { Schema } from "mongoose";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categorySlug: string;
  imageUrl: string;
  stock: number;
  rating: number;
  reviewCount: number;
  flavor?: string;
  size?: string;
}

const ProductSchema = new Schema<Product>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true, default: "" },
  price: { type: Number, required: true },
  categorySlug: { type: String, required: true, index: true },
  imageUrl: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  rating: { type: Number, required: true, default: 0 },
  reviewCount: { type: Number, required: true, default: 0 },
  flavor: { type: String, required: false },
  size: { type: String, required: false },
});

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const ProductModel = mongoose.models.Product ?? mongoose.model("Product", ProductSchema);
