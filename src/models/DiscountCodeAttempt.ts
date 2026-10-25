import mongoose, { Schema } from "mongoose";

/**
 * A discount code entered that wasn't valid, kept briefly so the routes that
 * check codes can throttle someone guessing them (see checkDiscountForVisitor).
 */
export interface DiscountCodeAttempt {
  ip: string;
  // Same visitor cookie the public forms use (see src/lib/rateLimit.ts).
  deviceId: string;
  createdAt: string;
}

const DiscountCodeAttemptSchema = new Schema<DiscountCodeAttempt>(
  {
    ip: { type: String, required: true },
    deviceId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Only the last few minutes matter for throttling, so MongoDB deletes each
// attempt a day after it was made instead of letting the collection grow.
DiscountCodeAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const DiscountCodeAttemptModel =
  mongoose.models.DiscountCodeAttempt ??
  mongoose.model("DiscountCodeAttempt", DiscountCodeAttemptSchema);
