import mongoose, { Schema } from "mongoose";

export interface Category {
  slug: string;
  title: string;
  description: string;
}

const CategorySchema = new Schema<Category>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const CategoryModel =
  mongoose.models.Category ?? mongoose.model("Category", CategorySchema);
