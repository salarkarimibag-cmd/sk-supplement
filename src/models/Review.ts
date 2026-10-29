import mongoose, { Schema } from "mongoose";
import { addRateLimitIndexes } from "@/models/rateLimitIndexes";

export interface Review {
  /** The product's `id` for a product review; absent for a review of the store. */
  productId?: string;
  /** The author's account, when they were logged in. */
  userId?: string;
  /**
   * Set by the server when the logged-in author has a paid order for the
   * product. Never read from the request.
   */
  verifiedPurchase: boolean;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  ip: string;
  deviceId: string;
  createdAt: string;
}

const ReviewSchema = new Schema<Review>(
  {
    productId: { type: String, required: false },
    userId: { type: String, required: false },
    verifiedPurchase: { type: Boolean, required: true, default: false },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    approved: { type: Boolean, required: true, default: false },
    ip: { type: String, required: true },
    // A random id stored in a cookie on the visitor's browser. Used as a
    // second rate-limit signal alongside `ip`, since `ip` alone is read from
    // the client-controllable X-Forwarded-For header and can be spoofed
    // per-request unless a trusted reverse proxy sanitizes it.
    deviceId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Serves a product page's approved reviews, newest first, and the rating
// recount for one product.
ReviewSchema.index({ productId: 1, approved: 1, createdAt: -1 });

// Auto-deletes unapproved (pending) reviews 30 days after submission, so an
// unmoderated spam queue doesn't pile up forever. Approved reviews are
// excluded via the partial filter and kept indefinitely.
ReviewSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { approved: false } }
);

addRateLimitIndexes(ReviewSchema);

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const ReviewModel = mongoose.models.Review ?? mongoose.model("Review", ReviewSchema);
