import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { OrderModel, type OrderStatus } from "@/models/Order";
import { ProductModel, type Product } from "@/models/Product";
import { ReviewModel } from "@/models/Review";
import { ContactMessageModel } from "@/models/ContactMessage";
import { SOLD_ORDER_STATUSES } from "@/lib/orderStatus";
import { formatProductName } from "@/lib/orderEmail";
import {
  LOW_STOCK_THRESHOLD,
  salesWindows,
  stockLabel,
  summarizeSales,
} from "@/lib/adminDashboard";

export const metadata: Metadata = {
  title: "داشبورد مدیریت",
  robots: { index: false, follow: false },
};

// The order statuses that wait on the admin, in the order they come up.
const ACTION_STATUSES = ["awaiting_verification", "paid", "shipped"] as const;
const ACTION_LABELS: Record<(typeof ACTION_STATUSES)[number], string> = {
  awaiting_verification: "واریز در انتظار تأیید",
  paid: "آماده ارسال",
  shipped: "در راه مشتری",
};

const LOW_STOCK_LIMIT = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function Card({
  href,
  label,
  value,
  alert = false,
}: {
  href: string;
  label: string;
  value: number;
  /** Colors a non-zero value, for counts that are waiting on the admin. */
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      // A column with the number pushed to the bottom, so the numbers in a
      // row line up even when one label wraps onto two lines on a phone.
      className="flex flex-col justify-between rounded border border-zinc-200 p-3 hover:border-sky-600 sm:p-4 dark:border-zinc-800 dark:hover:border-sky-600"
    >
      <span className="block text-sm text-zinc-500">{label}</span>
      <span
        className={`mt-1 block text-2xl font-bold ${
          alert && value > 0 ? "text-amber-600 dark:text-amber-500" : ""
        }`}
      >
        {value.toLocaleString("fa-IR")}
      </span>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  await connectToDatabase();

  const now = new Date();
  const windows = salesWindows(now);

  // Independent reads, so they run at once.
  const [statusCounts, soldOrders, pendingReviews, recentMessages, lowStock] = await Promise.all([
    OrderModel.aggregate<{ _id: OrderStatus; count: number }>([
      { $match: { status: { $in: ACTION_STATUSES } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    // Only the two fields the totals need, over the longest window. Sales
    // are counted on the day the order was placed; returned and cancelled
    // orders aren't sales, so SOLD_ORDER_STATUSES leaves them out.
    OrderModel.find(
      { status: { $in: SOLD_ORDER_STATUSES }, createdAt: { $gte: windows[windows.length - 1].since } },
      { _id: 0, createdAt: 1, totalPrice: 1 }
    ).lean<{ createdAt: Date; totalPrice: number }[]>(),
    ReviewModel.countDocuments({ approved: false }),
    ContactMessageModel.countDocuments({ createdAt: { $gte: new Date(now.getTime() - 7 * DAY_MS) } }),
    // A combo pack's stock is worked out from the products inside it (see
    // withPackStock), so only real products are listed; a short pack shows
    // up through its contents.
    ProductModel.find(
      { stock: { $lte: LOW_STOCK_THRESHOLD }, "packProductIds.0": { $exists: false } },
      { _id: 0, id: 1, name: 1, flavor: 1, size: 1, stock: 1 }
    )
      .sort({ stock: 1, name: 1 })
      .limit(LOW_STOCK_LIMIT)
      .lean<Pick<Product, "id" | "name" | "flavor" | "size" | "stock">[]>(),
  ]);

  const countOf = new Map(statusCounts.map((row) => [row._id, row.count]));
  const sales = summarizeSales(soldOrders, windows);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="text-lg font-bold">نیاز به اقدام</h2>
        {/* Orders on one row and the rest on another, each filling its row:
            five cards in one grid would leave a hole on the second row. */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {ACTION_STATUSES.map((status) => (
            <Card
              key={status}
              href={`/admin/orders?status=${status}`}
              label={ACTION_LABELS[status]}
              value={countOf.get(status) ?? 0}
              alert={status !== "shipped"}
            />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Card href="/admin/reviews" label="نظر در انتظار تأیید" value={pendingReviews} alert />
          <Card href="/admin/messages" label="پیام‌های ۷ روز اخیر" value={recentMessages} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">فروش</h2>
        <p className="mt-1 text-xs text-zinc-500">
          سفارش‌های پرداخت‌شده، ارسال‌شده و تحویل‌شده، به تاریخ ثبت سفارش (به وقت تهران). سفارش‌های
          مرجوع‌شده و لغو‌شده حساب نمی‌شوند.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {sales.map((row) => (
            <div key={row.label} className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
              <span className="block text-sm text-zinc-500">{row.label}</span>
              <span className="mt-1 block text-xl font-bold">
                {row.total.toLocaleString("fa-IR")} تومان
              </span>
              <span className="block text-sm text-zinc-500">
                {row.count.toLocaleString("fa-IR")} سفارش
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">موجودی کم</h2>
        <p className="mt-1 text-xs text-zinc-500">
          محصولاتی با {LOW_STOCK_THRESHOLD.toLocaleString("fa-IR")} عدد یا کمتر. موجودی را از صفحه‌ی{" "}
          <Link href="/admin/products" className="text-sky-600 hover:underline">
            محصولات
          </Link>{" "}
          تغییر دهید.
        </p>
        {lowStock.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">همه‌ی محصولات موجودی کافی دارند.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100 rounded border border-zinc-200 text-sm dark:divide-zinc-900 dark:border-zinc-800">
            {lowStock.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-4 px-4 py-2">
                <Link href={`/products/${product.id}`} className="hover:text-sky-600 hover:underline">
                  {formatProductName(product)}
                </Link>
                <span
                  className={`shrink-0 font-bold ${
                    product.stock < 0
                      ? "text-red-600"
                      : product.stock === 0
                        ? "text-zinc-400"
                        : "text-amber-600 dark:text-amber-500"
                  }`}
                >
                  {stockLabel(product.stock)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {lowStock.length === LOW_STOCK_LIMIT && (
          <p className="mt-2 text-xs text-zinc-500">
            فقط {LOW_STOCK_LIMIT.toLocaleString("fa-IR")} مورد اول (کمترین موجودی) نشان داده شده است.
          </p>
        )}
      </section>
    </div>
  );
}
