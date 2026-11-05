import { z } from "zod";
import { toEnglishDigits } from "@/lib/digits";
import { holdsStock, isOrderStatus } from "@/lib/orderStatus";
import type { OrderStatus } from "@/models/Order";

// A Post tracking number is 24 digits and a Tipax one is shorter; some
// carriers mix in letters or dashes. Spaces from copying are dropped and
// Persian digits converted, like the card-transfer tracking code.
const shipmentTrackingCodeSchema = z
  .string()
  .transform((value) => toEnglishDigits(value).replace(/\s/g, ""))
  .pipe(z.union([z.literal(""), z.string().regex(/^[0-9A-Za-z-]{4,40}$/)]));

/**
 * What the admin sends to change an order's status. Shipping may carry the
 * parcel's tracking number (optional: the admin may not have it yet, or
 * deliver by hand); a return must say whether its items go back into stock.
 */
export const adminOrderUpdateSchema = z
  .object({
    status: z.custom<OrderStatus>(isOrderStatus),
    trackingCode: shipmentTrackingCodeSchema.optional(),
    restock: z.boolean().optional(),
  })
  .refine((body) => body.status !== "returned" || body.restock !== undefined, {
    path: ["restock"],
  });

export type AdminOrderUpdate = z.infer<typeof adminOrderUpdateSchema>;

/**
 * The fields written together with the new status, in the same conditional
 * update, so an order never has a status without its date (or the other
 * way around). `now` is passed in so tests can fix it.
 */
export function orderStatusUpdate(update: AdminOrderUpdate, now: Date) {
  const { status } = update;
  return {
    status,
    stockReserved: holdsStock(status),
    ...(status === "shipped" && {
      shippedAt: now,
      // An empty code is left out instead of being stored as "".
      ...(update.trackingCode && { shipmentTrackingCode: update.trackingCode }),
    }),
    ...(status === "delivered" && { deliveredAt: now }),
    ...(status === "returned" && { returnedAt: now, returnRestocked: update.restock }),
  };
}
