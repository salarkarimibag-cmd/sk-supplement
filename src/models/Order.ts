import mongoose, { Schema, type InferSchemaType } from "mongoose";

export type OrderStatus = "pending" | "paid" | "failed" | "shipped" | "cancelled";

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

const OrderSchema = new Schema(
  {
    // Set once a user is logged in (Phase 3); absent for guest checkout.
    userId: { type: String, required: false },
    items: { type: [OrderItemSchema], required: true },
    contact: { type: ContactSchema, required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "shipped", "cancelled"],
      default: "pending",
    },
    totalPrice: { type: Number, required: true },
    // ZarinPal's payment authority, set before redirecting to the gateway;
    // used to look the order back up when ZarinPal calls the callback URL.
    paymentAuthority: { type: String, required: true, index: true },
    // ZarinPal's ref_id, set only after a successful verification.
    paymentRefId: { type: Number, required: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type Order = InferSchemaType<typeof OrderSchema> & { id: string };

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const OrderModel = mongoose.models.Order ?? mongoose.model("Order", OrderSchema);
