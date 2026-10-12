import type { Metadata } from "next";
import Link from "next/link";
import type { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { OrderModel, type Order, type OrderStatus, type PaymentMethod } from "@/models/Order";
import { ProductModel, type Product } from "@/models/Product";
import { ORDER_STATUS_LABELS, isOrderStatus } from "@/lib/orderStatus";
import OrderManager from "@/components/admin/OrderManager";
import Pagination from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "سفارش‌ها",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;
// Paid orders are the ones waiting on the admin (to ship), so they're shown by default.
const DEFAULT_STATUS: OrderStatus = "paid";
// Tabs in order of how much they need the admin: transfers to verify, then
// orders to ship, then history.
const STATUS_TABS: OrderStatus[] = [
  "awaiting_verification",
  "paid",
  "shipped",
  "pending",
  "failed",
  "cancelled",
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage(props: PageProps<"/admin/orders">) {
  const searchParams = await props.searchParams;
  const statusParam = first(searchParams.status);
  const status = isOrderStatus(statusParam) ? statusParam : DEFAULT_STATUS;
  const requestedPage = Number(first(searchParams.page)) || 1;

  await connectToDatabase();

  const [totalCount, awaitingCount] = await Promise.all([
    OrderModel.countDocuments({ status }),
    OrderModel.countDocuments({ status: "awaiting_verification" }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  const orders = await OrderModel.find({ status })
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean<(Order & { _id: Types.ObjectId })[]>();

  // One query for every product on this page, instead of one per order item.
  const productIds = [...new Set(orders.flatMap((order) => order.items.map((item) => item.productId)))];
  const products = await ProductModel.find({ id: { $in: productIds } }, { id: 1, name: 1 }).lean<
    Pick<Product, "id" | "name">[]
  >();
  const productNames = new Map(products.map((product) => [product.id, product.name]));

  const initialOrders = orders.map((order) => ({
    id: String(order._id),
    status: order.status as OrderStatus,
    createdAt: new Date(order.createdAt).toISOString(),
    customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
    email: order.contact.email,
    mobile: order.contact.mobile,
    address: `${order.shippingAddress.province}، ${order.shippingAddress.city}، ${order.shippingAddress.address}`,
    postalCode: order.shippingAddress.postalCode,
    items: order.items.map((item) => ({
      name: productNames.get(item.productId) ?? `محصول حذف‌شده (${item.productId})`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    discountCode: order.discountCode ?? null,
    discountAmount: order.discountAmount ?? 0,
    totalPrice: order.totalPrice,
    paymentRefId: order.paymentRefId ?? null,
    paymentMethod: (order.paymentMethod ?? "zarinpal") as PaymentMethod,
    cardTransfer: order.cardTransfer
      ? { trackingCode: order.cardTransfer.trackingCode, cardLast4: order.cardTransfer.cardLast4 }
      : null,
  }));

  function hrefFor(targetStatus: OrderStatus, page = 1) {
    const params = new URLSearchParams();
    if (targetStatus !== DEFAULT_STATUS) params.set("status", targetStatus);
    if (page > 1) params.set("page", String(page));
    const query = params.toString();
    return query ? `/admin/orders?${query}` : "/admin/orders";
  }

  return (
    <div>
      <h2 className="text-lg font-bold">سفارش‌ها</h2>

      <nav className="mt-4 flex flex-wrap gap-2 text-sm">
        {STATUS_TABS.map((option) => (
          <Link
            key={option}
            href={hrefFor(option)}
            aria-current={option === status ? "page" : undefined}
            className={`rounded-full border px-3 py-1 ${
              option === status
                ? "border-sky-600 bg-sky-600 text-white"
                : "border-zinc-300 text-zinc-600 hover:border-sky-600 hover:text-sky-600 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {ORDER_STATUS_LABELS[option]}
            {option === "awaiting_verification" && awaitingCount > 0 && (
              <span className="ms-1.5 rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                {awaitingCount.toLocaleString("fa-IR")}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <OrderManager key={`${status}-${currentPage}`} initialOrders={initialOrders} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        hrefForPage={(page) => hrefFor(status, page)}
      />
    </div>
  );
}
