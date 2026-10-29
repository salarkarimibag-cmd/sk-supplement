import type { Schema } from "mongoose";

/**
 * The two indexes isRateLimited (src/lib/rateLimit.ts) needs on a model it
 * counts: recent records per ip, and per device. Without them each count
 * reads the whole collection, so a flood of submissions would make every
 * later check slower. An extra filter (Order's paymentMethod) is applied to
 * the few records the index finds.
 */
export function addRateLimitIndexes(schema: Schema): void {
  schema.index({ ip: 1, createdAt: -1 });
  schema.index({ deviceId: 1, createdAt: -1 });
}
