import mongoose, { Schema } from "mongoose";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: string;
}

const UserSchema = new Schema<User>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const UserModel = mongoose.models.User ?? mongoose.model("User", UserSchema);
