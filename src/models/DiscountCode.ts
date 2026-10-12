import mongoose, { Schema, type InferSchemaType } from "mongoose";

const DiscountCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 1 },
    active: { type: Boolean, required: true, default: true },
    expiresAt: { type: Date, required: false },
    // How many paid orders may use this code; absent/null means unlimited.
    maxUses: { type: Number, required: false, min: 1 },
    // Paid orders that used this code so far, counted when an order becomes
    // paid (not when it's created), so abandoned checkouts don't use it up.
    usedCount: { type: Number, required: true, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type DiscountCode = InferSchemaType<typeof DiscountCodeSchema>;

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const DiscountCodeModel =
  mongoose.models.DiscountCode ?? mongoose.model("DiscountCode", DiscountCodeSchema);
