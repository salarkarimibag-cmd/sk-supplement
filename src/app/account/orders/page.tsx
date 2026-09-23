import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Types } from "mongoose";
import { getSessionUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { OrderModel, type Order, type OrderStatus } from "@/models/Order";
import { getProductById } from "@/lib/products";

export const metadata: Metadata = {
  title: "سفارش‌های من",
  robots: { index: false, follow: false },
};

const statusLabel: Record<OrderStatus, string> = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  failed: "ناموفق",
  shipped: "ارسال‌شده",
  cancelled: "لغو‌شده",
};

const statusClass: Record<OrderStatus, string> = {
  pending: "text-amber-600",
  paid: "text-emerald-600",
  failed: "text-red-600",
  shipped: "text-sky-600",
  cancelled: "text-zinc-400",
};

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/account/login");

  await connectToDatabase();
  // `Order`'s `id: string` is a type-only convenience for hydrated documents —
  // `.lean()` skips Mongoose virtuals, so the real identifier on these plain
  // objects is still `_id` (an ObjectId).
  const orders = await OrderModel.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .lean<(Order & { _id: Types.ObjectId })[]>();

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await Promise.all(
        order.items.map(async (item) => ({
          ...item,
          product: await getProductById(item.productId),
        }))
      );
      return { ...order, items };
    })
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">سفارش‌های من</h1>
        <Link href="/account/profile" className="text-sm text-sky-600 hover:underline">
          پروفایل کاربری
        </Link>
      </div>

      {ordersWithItems.length === 0 && (
        <p className="mt-8 text-zinc-500">هنوز سفارشی ثبت نکرده‌اید.</p>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {ordersWithItems.map((order) => (
          <div
            key={String(order._id)}
            className="rounded border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-900">
              <span className="text-sm text-zinc-500">
                {new Date(order.createdAt).toLocaleDateString("fa-IR")}
              </span>
              <span className={`text-sm font-bold ${statusClass[order.status as OrderStatus]}`}>
                {statusLabel[order.status as OrderStatus]}
              </span>
            </div>

            <ul className="mt-3 flex flex-col gap-2">
              {order.items.map((item, index) => (
                <li key={index} className="flex justify-between text-sm">
                  <span>
                    {item.product?.name ?? "محصول حذف‌شده"} × {item.quantity}
                  </span>
                  <span className="text-zinc-500">
                    {(item.unitPrice * item.quantity).toLocaleString("fa-IR")} تومان
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex justify-between border-t border-zinc-100 pt-3 text-sm font-bold dark:border-zinc-900">
              <span>مبلغ کل</span>
              <span>{order.totalPrice.toLocaleString("fa-IR")} تومان</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
