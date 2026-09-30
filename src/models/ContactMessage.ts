import mongoose, { Schema } from "mongoose";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  ip: string;
  deviceId: string;
  createdAt: string;
}

const ContactMessageSchema = new Schema<ContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    ip: { type: String, required: true },
    deviceId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const ContactMessageModel =
  mongoose.models.ContactMessage ?? mongoose.model("ContactMessage", ContactMessageSchema);
