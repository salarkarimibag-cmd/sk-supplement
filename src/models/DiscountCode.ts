import mongoose, { Schema, type InferSchemaType } from "mongoose";

const DiscountCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true },
    active: { type: Boolean, required: true, default: true },
    expiresAt: { type: Date, required: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type DiscountCode = InferSchemaType<typeof DiscountCodeSchema>;

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const DiscountCodeModel =
  mongoose.models.DiscountCode ?? mongoose.model("DiscountCode", DiscountCodeSchema);
