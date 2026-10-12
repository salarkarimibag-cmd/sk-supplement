"use client";

import { useState } from "react";
import type { OrderStatus, PaymentMethod } from "@/models/Order";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  allowedAdminTransitions,
} from "@/lib/orderStatus";

interface OrderItem {
  id: string;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
  email: string;
  mobile: string;
  address: string;
  postalCode: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  discountCode: string | null;
  discountAmount: number;
  totalPrice: number;
  paymentRefId: number | null;
  paymentMethod: PaymentMethod;
  cardTransfer: { trackingCode: string; cardLast4: string } | null;
}

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  paid: "تأیید پرداخت",
  failed: "رد پرداخت",
  shipped: "علامت‌گذاری به‌عنوان ارسال‌شده",
  cancelled: "لغو سفارش",
};

const DESTRUCTIVE_STATUSES: OrderStatus[] = ["failed", "cancelled"];

function formatToman(amount: number) {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

export default function OrderManager({ initialOrders }: { initialOrders: OrderItem[] }) {
  const [orders, setOrders] = useState(initialOrders);

  async function handleStatusChange(order: OrderItem, status: OrderStatus) {
    // Confirming a transfer is the step that can cost money, so the prompt
    // repeats exactly what to look for on the bank statement.
    const question =
      status === "paid" && order.cardTransfer
        ? `واریز ${formatToman(order.totalPrice)} با کد پیگیری ${order.cardTransfer.trackingCode} از کارت ****${order.cardTransfer.cardLast4} را در صورت‌حساب بانک دیدید؟`
        : `وضعیت سفارش «${order.customerName}» به «${ORDER_STATUS_LABELS[status]}» تغییر کند؟`;
    if (!confirm(question)) return;

    const response = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.message ?? "تغییر وضعیت ناموفق بود.");
      return;
    }

    // The list is filtered by status, so an order that changed status no
    // longer belongs on this tab.
    setOrders((current) => current.filter((item) => item.id !== order.id));
  }

  if (orders.length === 0) {
    return <p className="mt-8 text-center text-sm text-zinc-500">سفارشی در این وضعیت وجود ندارد.</p>;
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {orders.map((order) => (
        <article key={order.id} className="rounded border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-900">
            <span className="font-bold">{order.customerName}</span>
            <span className="text-zinc-500">
              {new Date(order.createdAt).toLocaleString("fa-IR")}
              {order.paymentRefId && <> · کد پیگیری: {order.paymentRefId}</>}
            </span>
          </header>

          <dl className="mt-3 grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
            <dt className="text-zinc-500">تماس</dt>
            <dd dir="ltr" className="text-right">
              {order.mobile} · {order.email}
            </dd>
            <dt className="text-zinc-500">روش پرداخت</dt>
            <dd>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</dd>
            {order.cardTransfer && (
              <>
                <dt className="text-zinc-500">اطلاعات واریز</dt>
                <dd>
                  کد پیگیری: <span dir="ltr">{order.cardTransfer.trackingCode}</span> · ۴ رقم آخر
                  کارت: <span dir="ltr">{order.cardTransfer.cardLast4}</span>
                </dd>
              </>
            )}
            <dt className="text-zinc-500">آدرس</dt>
            <dd>
              {order.address} — کد پستی: {order.postalCode}
            </dd>
          </dl>

          <ul className="mt-3 flex flex-col gap-1 border-t border-zinc-100 pt-3 dark:border-zinc-900">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-4">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="whitespace-nowrap text-zinc-500">
                  {formatToman(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
            {order.discountCode && (
              <li className="flex justify-between gap-4 text-emerald-600">
                <span>تخفیف ({order.discountCode})</span>
                <span className="whitespace-nowrap">-{formatToman(order.discountAmount)}</span>
              </li>
            )}
          </ul>

          <footer className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-900">
            <span className="font-bold">مبلغ کل: {formatToman(order.totalPrice)}</span>
            <div className="flex gap-3">
              {allowedAdminTransitions(order.status, order.paymentMethod).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(order, status)}
                  className={`cursor-pointer hover:underline ${
                    DESTRUCTIVE_STATUSES.includes(status) ? "text-red-600" : "text-sky-600"
                  }`}
                >
                  {ACTION_LABELS[status] ?? ORDER_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </footer>
        </article>
      ))}
    </div>
  );
}
