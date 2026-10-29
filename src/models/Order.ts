import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { addRateLimitIndexes } from "@/models/rateLimitIndexes";

export type OrderStatus =
  | "pending"
  | "awaiting_verification"
  | "paid"
  | "failed"
  | "shipped"
  | "cancelled";

export type PaymentMethod = "zarinpal" | "card";

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const ContactSchema = new Schema(
  {
    email: { type: String, required: true },
    mobile: { type: String, required: true },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false }
);

// What the buyer reports after a card-to-card transfer; the admin matches it
// against the bank statement before confirming the order.
const CardTransferSchema = new Schema(
  {
    trackingCode: { type: String, required: true },
    cardLast4: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    // Set once a user is logged in (Phase 3); absent for guest checkout.
    userId: { type: String, required: false },
    items: { type: [OrderItemSchema], required: true },
    contact: { type: ContactSchema, required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "awaiting_verification", "paid", "failed", "shipped", "cancelled"],
      default: "pending",
    },
    totalPrice: { type: Number, required: true },
    discountCode: { type: String, required: false },
    discountAmount: { type: Number, required: false },
    // Orders created before card-to-card existed have no value stored and
    // read back as "zarinpal" through this default.
    paymentMethod: { type: String, enum: ["zarinpal", "card"], default: "zarinpal" },
    // ZarinPal's payment authority, set before redirecting to the gateway;
    // used to look the order back up when ZarinPal calls the callback URL.
    // Card-to-card orders never go through the gateway, so they have none.
    paymentAuthority: {
      type: String,
      required: function (this: { paymentMethod?: PaymentMethod }) {
        return this.paymentMethod !== "card";
      },
      index: true,
    },
    // ZarinPal's ref_id, set only after a successful verification.
    paymentRefId: { type: Number, required: false },
    cardTransfer: { type: CardTransferSchema, required: false },
    // Whether this order's items are currently out of stock on its account:
    // set when it's placed (see reserveStock) and kept once it's paid; false
    // once it fails, is cancelled or, for an abandoned ZarinPal payment, its
    // hold runs out (see releaseExpiredReservations). Orders placed before
    // reservations existed don't have it: their stock was taken when paid.
    stockReserved: { type: Boolean, required: false },
    // Placing an order reserves stock, so both payment routes rate-limit it
    // per visitor like the other public forms (see src/lib/rateLimit.ts).
    // ZarinPal orders placed before that limit existed have neither.
    ip: { type: String, required: false },
    deviceId: { type: String, required: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type Order = InferSchemaType<typeof OrderSchema> & { id: string };

// One per kind of lookup, each matching its query: equality fields first,
// then the field sorted or ranged on.
// A customer's own orders, newest first (/account/orders), and whether
// they bought a product (canReview).
OrderSchema.index({ userId: 1, createdAt: -1 });
// The admin's orders per status, newest first, and the counts per status;
// also pending ZarinPal orders past their hold (releaseExpiredReservations).
OrderSchema.index({ status: 1, createdAt: -1 });
// Unpaid orders holding a discount code (heldOrdersFilter). Partial: most
// orders have no code, and only those with one are ever looked up by it.
OrderSchema.index(
  { discountCode: 1, status: 1 },
  { partialFilterExpression: { discountCode: { $exists: true } } }
);
addRateLimitIndexes(OrderSchema);

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const OrderModel = mongoose.models.Order ?? mongoose.model("Order", OrderSchema);
