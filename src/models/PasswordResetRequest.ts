import mongoose, { Schema } from "mongoose";

/**
 * One "forgot password" form submission, kept briefly so
 * /api/auth/forgot-password can be rate-limited. Logged for every request,
 * whether or not the email belongs to an account, so the limits behave the
 * same either way and don't reveal which emails are registered.
 */
export interface PasswordResetRequest {
  email: string;
  ip: string;
  // Same visitor cookie the public forms use (see src/lib/rateLimit.ts).
  deviceId: string;
  createdAt: string;
}

const PasswordResetRequestSchema = new Schema<PasswordResetRequest>(
  {
    email: { type: String, required: true, index: true },
    ip: { type: String, required: true },
    deviceId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Only the last hour matters for throttling, so MongoDB deletes each request
// a day after it was made instead of letting the collection grow.
PasswordResetRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const PasswordResetRequestModel =
  mongoose.models.PasswordResetRequest ??
  mongoose.model("PasswordResetRequest", PasswordResetRequestSchema);
