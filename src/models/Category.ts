import mongoose, { Schema } from "mongoose";

export interface Category {
  slug: string;
  title: string;
  description: string;
  /** Banner image path; when missing, the collection page shows an empty frame. */
  bannerImage?: string;
  /**
   * Optional taller crop (3:2) shown on phones instead of bannerImage, because
   * a wide 4:1 banner is only a thin strip on a narrow screen.
   */
  bannerImageMobile?: string;
  /** CSS aspect-ratio value matching the banner image's natural dimensions. */
  bannerAspect: string;
}

const CategorySchema = new Schema<Category>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  bannerImage: { type: String },
  bannerImageMobile: { type: String },
  bannerAspect: { type: String, required: true },
});

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const CategoryModel =
  mongoose.models.Category ?? mongoose.model("Category", CategorySchema);
