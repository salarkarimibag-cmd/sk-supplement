import mongoose, { Schema } from "mongoose";

export interface Review {
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  ip: string;
  createdAt: string;
}

const ReviewSchema = new Schema<Review>(
  {
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    approved: { type: Boolean, required: true, default: false },
    ip: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Auto-deletes unapproved (pending) reviews 30 days after submission, so an
// unmoderated spam queue doesn't pile up forever. Approved reviews are
// excluded via the partial filter and kept indefinitely.
ReviewSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { approved: false } }
);

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const ReviewModel = mongoose.models.Review ?? mongoose.model("Review", ReviewSchema);
