import type { Metadata } from "next";
import Link from "next/link";
import type { Types } from "mongoose";
import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { OrderModel, type Order, type OrderStatus, type PaymentMethod } from "@/models/Order";
import { getProductNames } from "@/lib/products";
import { ORDER_STATUS_LABELS, isOrderStatus } from "@/lib/orderStatus";
import { PENDING_RETURN_REQUEST_FILTER, RETURN_REASONS, type ReturnReason } from "@/lib/returnRequest";
import OrderManager from "@/components/admin/OrderManager";
import ReconcileButton from "@/components/admin/ReconcileButton";
import Pagination from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "سفارش‌ها",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;

// One tab per status, plus one for delivered orders whose customer asked to
// return them: those wait on the admin, unlike the other delivered ones.
type Tab = OrderStatus | "return_requests";

const TAB_LABELS: Record<Tab, string> = {
  ...ORDER_STATUS_LABELS,
  return_requests: "درخواست‌های مرجوعی",
};

function isTab(value: unknown): value is Tab {
  return value === "return_requests" || isOrderStatus(value);
}

// Paid orders are the ones waiting on the admin (to ship), so they're shown by default.
const DEFAULT_STATUS: Tab = "paid";
// Tabs in order of how much they need the admin: transfers to verify, then
// orders to ship, return requests, parcels on the way, then history.
const STATUS_TABS: Tab[] = [
  "awaiting_verification",
  "paid",
  "return_requests",
  "shipped",
  "delivered",
  "pending",
  "failed",
  "cancelled",
  "returned",
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOrdersPage(props: PageProps<"/admin/orders">) {
  await requireAdmin();
  const searchParams = await props.searchParams;
  const statusParam = first(searchParams.status);
  const status = isTab(statusParam) ? statusParam : DEFAULT_STATUS;
  const filter = status === "return_requests" ? PENDING_RETURN_REQUEST_FILTER : { status };
  const requestedPage = Number(first(searchParams.page)) || 1;

  await connectToDatabase();

  const [totalCount, awaitingCount, returnRequestCount] = await Promise.all([
    OrderModel.countDocuments(filter),
    OrderModel.countDocuments({ status: "awaiting_verification" }),
    OrderModel.countDocuments(PENDING_RETURN_REQUEST_FILTER),
  ]);
  // The tabs that show how many orders are waiting on the admin.
  const badges: Partial<Record<Tab, number>> = {
    awaiting_verification: awaitingCount,
    return_requests: returnRequestCount,
  };
  const badgeOf = (tab: Tab) => badges[tab] ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  const orders = await OrderModel.find(filter)
    .sort({ createdAt: -1 })
    .skip((currentPage - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean<(Order & { _id: Types.ObjectId })[]>();

  // One query for every product on this page, instead of one per order item.
  const productNames = await getProductNames(
    orders.flatMap((order) =>
      order.items.flatMap((item) => [item.productId, ...(item.packProductIds ?? [])])
    )
  );
  const nameOf = (productId: string) =>
    productNames.get(productId) ?? `محصول حذف‌شده (${productId})`;

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
      name: nameOf(item.productId),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      packContents: (item.packProductIds ?? []).map(nameOf),
    })),
    discountCode: order.discountCode ?? null,
    discountAmount: order.discountAmount ?? 0,
    totalPrice: order.totalPrice,
    paymentRefId: order.paymentRefId ?? null,
    paymentMethod: (order.paymentMethod ?? "zarinpal") as PaymentMethod,
    cardTransfer: order.cardTransfer
      ? { trackingCode: order.cardTransfer.trackingCode, cardLast4: order.cardTransfer.cardLast4 }
      : null,
    shipmentTrackingCode: order.shipmentTrackingCode ?? null,
    // Dates go to the client component as ISO strings, like createdAt.
    shippedAt: order.shippedAt ? new Date(order.shippedAt).toISOString() : null,
    deliveredAt: order.deliveredAt ? new Date(order.deliveredAt).toISOString() : null,
    returnedAt: order.returnedAt ? new Date(order.returnedAt).toISOString() : null,
    returnRestocked: order.returnRestocked ?? null,
    returnRequest: order.returnRequest
      ? {
          reason: RETURN_REASONS[order.returnRequest.reason as ReturnReason],
          details: order.returnRequest.details ?? "",
          requestedAt: new Date(order.returnRequest.requestedAt).toISOString(),
          rejectedAt: order.returnRequest.rejectedAt
            ? new Date(order.returnRequest.rejectedAt).toISOString()
            : null,
          rejectionNote: order.returnRequest.rejectionNote ?? null,
        }
      : null,
  }));

  function hrefFor(targetStatus: Tab, page = 1) {
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
            {TAB_LABELS[option]}
            {badgeOf(option) > 0 && (
              <span className="ms-1.5 rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white">
                {badgeOf(option).toLocaleString("fa-IR")}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {status === "pending" && <ReconcileButton />}
      {/* The count is in the key so the list starts over when it changes
          under it, as after a reconcile (its own changes it applies itself). */}
      <OrderManager key={`${status}-${currentPage}-${totalCount}`} initialOrders={initialOrders} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        hrefForPage={(page) => hrefFor(status, page)}
      />
    </div>
  );
}
