import mongoose, { Schema } from "mongoose";

/** A failed login, kept briefly so /api/auth/login can throttle password guessing. */
export interface LoginAttempt {
  email: string;
  ip: string;
  // Same visitor cookie the public forms use (see src/lib/rateLimit.ts).
  deviceId: string;
  createdAt: string;
}

const LoginAttemptSchema = new Schema<LoginAttempt>(
  {
    email: { type: String, required: true, index: true },
    ip: { type: String, required: true },
    deviceId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Only the last few minutes matter for throttling, so MongoDB deletes each
// attempt a day after it was made instead of letting the collection grow.
LoginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const LoginAttemptModel =
  mongoose.models.LoginAttempt ?? mongoose.model("LoginAttempt", LoginAttemptSchema);
