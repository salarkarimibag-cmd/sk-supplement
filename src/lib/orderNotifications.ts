import { connectToDatabase } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { buildOrderEmail, formatProductName, type OrderEmailKind } from "@/lib/orderEmail";
import { SITE_URL } from "@/lib/site";
import type { Order, PaymentMethod } from "@/models/Order";
import { ProductModel, type Product } from "@/models/Product";

type NotifiableOrder = Pick<
  Order,
  "items" | "contact" | "shippingAddress" | "totalPrice" | "discountAmount" | "paymentRefId" | "userId"
> & { _id: unknown; paymentMethod?: PaymentMethod | null };

/**
 * Emails the customer about their order. Callers run this inside `after()`
 * and only once their own conditional status update succeeded, the same rule
 * as onOrderPaid, so each email goes out once. A failed email is logged and
 * never undoes or blocks the order change itself.
 */
export async function sendOrderEmail(order: NotifiableOrder, kind: OrderEmailKind): Promise<void> {
  const orderId = String(order._id);
  try {
    await connectToDatabase();
    const products = await ProductModel.find({
      id: { $in: order.items.map((item) => item.productId) },
    }).lean<Product[]>();
    const productsById = new Map(products.map((product) => [product.id, product]));

    const email = buildOrderEmail({
      kind,
      orderId,
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
      hasAccount: Boolean(order.userId),
    });

    await sendEmail({ to: order.contact.email, ...email });
  } catch (error) {
    console.error(`Could not send the "${kind}" email for order ${orderId}:`, error);
  }
}
