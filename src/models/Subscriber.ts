import mongoose, { Schema } from "mongoose";

export interface Subscriber {
  email: string;
  createdAt: string;
}

const SubscriberSchema = new Schema<Subscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const SubscriberModel =
  mongoose.models.Subscriber ?? mongoose.model("Subscriber", SubscriberSchema);
