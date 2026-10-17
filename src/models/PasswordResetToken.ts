import mongoose, { Schema, Types } from "mongoose";

/** A pending password reset link; see src/lib/passwordReset.ts. */
export interface PasswordResetToken {
  userId: Types.ObjectId;
  // SHA-256 of the token in the emailed link; the token itself is never stored.
  tokenHash: string;
  expiresAt: Date;
}

const PasswordResetTokenSchema = new Schema<PasswordResetToken>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// MongoDB deletes each token once its expiresAt has passed. The TTL monitor
// runs about once a minute, so queries still check expiresAt themselves.
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const PasswordResetTokenModel =
  mongoose.models.PasswordResetToken ??
  mongoose.model("PasswordResetToken", PasswordResetTokenSchema);
