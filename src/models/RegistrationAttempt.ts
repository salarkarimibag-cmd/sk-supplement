import mongoose, { Schema } from "mongoose";

/**
 * One sign-up attempt, kept briefly so /api/auth/register can be
 * rate-limited. Logged whether or not the account gets created, so the form
 * can neither mass-create accounts nor be used to check many emails for
 * existing accounts ("این ایمیل قبلاً ثبت شده است").
 */
export interface RegistrationAttempt {
  ip: string;
  // Same visitor cookie the public forms use (see src/lib/rateLimit.ts).
  deviceId: string;
  createdAt: string;
}

const RegistrationAttemptSchema = new Schema<RegistrationAttempt>(
  {
    ip: { type: String, required: true },
    deviceId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Only the last hour matters for throttling, so MongoDB deletes each attempt
// a day after it was made instead of letting the collection grow.
RegistrationAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const RegistrationAttemptModel =
  mongoose.models.RegistrationAttempt ??
  mongoose.model("RegistrationAttempt", RegistrationAttemptSchema);
