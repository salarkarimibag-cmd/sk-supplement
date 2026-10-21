import { connectToDatabase } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  buildAdminOrderEmail,
  buildOrderEmail,
  formatProductName,
  type AdminOrderEmailKind,
  type OrderEmailKind,
} from "@/lib/orderEmail";
import { SITE_URL } from "@/lib/site";
import type { Order, PaymentMethod } from "@/models/Order";
import { ProductModel, type Product } from "@/models/Product";
import { UserModel } from "@/models/User";

type NotifiableOrder = Pick<
  Order,
  | "items"
  | "contact"
  | "shippingAddress"
  | "totalPrice"
  | "discountAmount"
  | "paymentRefId"
  | "userId"
  | "cardTransfer"
> & { _id: unknown; paymentMethod?: PaymentMethod | null };

// The fields both the customer and the admin email need, with product names
// loaded in one query.
async function loadEmailBase(order: NotifiableOrder) {
  await connectToDatabase();
  const products = await ProductModel.find({
    id: { $in: order.items.map((item) => item.productId) },
  }).lean<Product[]>();
  const productsById = new Map(products.map((product) => [product.id, product]));

  return {
    orderId: String(order._id),
    firstName: order.shippingAddress.firstName,
    lastName: order.shippingAddress.lastName,
    lines: order.items.map((item) => {
      const product = productsById.get(item.productId);
      return {
        name: product ? formatProductName(product) : "محصول حذف‌شده",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      };
    }),
    totalPrice: order.totalPrice,
    discountAmount: order.discountAmount ?? undefined,
    paymentMethod: order.paymentMethod ?? "zarinpal",
    refId: order.paymentRefId ?? undefined,
    address: order.shippingAddress,
    siteUrl: SITE_URL,
  };
}

/**
 * Emails the customer about their order. Callers run this inside `after()`
 * and only once their own conditional status update succeeded, the same rule
 * as onOrderPaid, so each email goes out once. A failed email is logged and
 * never undoes or blocks the order change itself.
 */
export async function sendOrderEmail(order: NotifiableOrder, kind: OrderEmailKind): Promise<void> {
  try {
    const base = await loadEmailBase(order);
    const email = buildOrderEmail({ ...base, kind, hasAccount: Boolean(order.userId) });
    await sendEmail({ to: order.contact.email, ...email });
  } catch (error) {
    console.error(`Could not send the "${kind}" email for order ${String(order._id)}:`, error);
  }
}

/**
 * Tells every admin (users with isAdmin) about a new order that needs them:
 * a card transfer to check, or a paid order to ship. Same rules as
 * sendOrderEmail: run in `after()`, once per order, failures only logged.
 * Each admin gets their own email, so no one sees the others' addresses.
 */
export async function sendAdminOrderEmail(
  order: NotifiableOrder,
  kind: AdminOrderEmailKind
): Promise<void> {
  try {
    const base = await loadEmailBase(order);
    const admins = await UserModel.find({ isAdmin: true }, { email: 1 }).lean<{ email: string }[]>();
    if (admins.length === 0) return;

    const email = buildAdminOrderEmail({
      ...base,
      kind,
      contact: order.contact,
      cardTransfer: order.cardTransfer ?? undefined,
    });
    await Promise.all(admins.map((admin) => sendEmail({ to: admin.email, ...email })));
  } catch (error) {
    console.error(`Could not send the admin "${kind}" email for order ${String(order._id)}:`, error);
  }
}
