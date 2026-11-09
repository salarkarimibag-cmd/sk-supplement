"use client";

import { useState, type FormEvent } from "react";
import type { OrderStatus, PaymentMethod } from "@/models/Order";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  allowedAdminTransitions,
} from "@/lib/orderStatus";
import { formatShippingFee } from "@/lib/shipping";

interface OrderItem {
  id: string;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
  email: string;
  mobile: string;
  address: string;
  postalCode: string;
  items: { name: string; quantity: number; unitPrice: number; packContents: string[] }[];
  discountCode: string | null;
  discountAmount: number;
  shippingFee: number;
  totalPrice: number;
  paymentRefId: number | null;
  paymentMethod: PaymentMethod;
  cardTransfer: { trackingCode: string; cardLast4: string } | null;
  shipmentTrackingCode: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
  returnRestocked: boolean | null;
  returnRequest: {
    reason: string;
    details: string;
    requestedAt: string;
    rejectedAt: string | null;
    rejectionNote: string | null;
  } | null;
}

// These two need more from the admin than a yes, so their button opens a
// small form under the order instead of a confirm() prompt.
type FormStatus = "shipped" | "returned";
// Turning down a return request takes a reason, so it has a form too.
type FormKind = FormStatus | "reject_return";

function needsForm(status: OrderStatus): status is FormStatus {
  return status === "shipped" || status === "returned";
}

/** A return request still waiting on the admin: asked for, not turned down, not yet returned. */
function hasPendingReturnRequest(order: OrderItem): boolean {
  return order.status === "delivered" && order.returnRequest !== null && !order.returnRequest.rejectedAt;
}

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  paid: "تأیید پرداخت",
  failed: "رد پرداخت",
  shipped: "علامت‌گذاری به‌عنوان ارسال‌شده",
  delivered: "تحویل داده شد",
  returned: "ثبت مرجوعی",
  cancelled: "لغو سفارش",
};

const DESTRUCTIVE_STATUSES: OrderStatus[] = ["failed", "cancelled", "returned"];

function formatToman(amount: number) {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fa-IR");
}

export default function OrderManager({ initialOrders }: { initialOrders: OrderItem[] }) {
  const [orders, setOrders] = useState(initialOrders);
  // The order whose shipping, return or rejection form is open, if any; one at a time.
  const [openForm, setOpenForm] = useState<{ orderId: string; kind: FormKind } | null>(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [restock, setRestock] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function openFormFor(order: OrderItem, kind: FormKind) {
    setOpenForm({ orderId: order.id, kind });
    setTrackingCode("");
    setRestock(false);
    setRejectionNote("");
  }

  async function sendReturnRejection(order: OrderItem) {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/reject-return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: rejectionNote }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message ?? "رد درخواست ناموفق بود.");
        return;
      }
      // The order keeps its status, so it stays on the list, now showing
      // the request as turned down.
      const rejectedAt = new Date().toISOString();
      setOrders((current) =>
        current.map((item) =>
          item.id === order.id && item.returnRequest
            ? {
                ...item,
                returnRequest: { ...item.returnRequest, rejectedAt, rejectionNote: rejectionNote.trim() },
              }
            : item
        )
      );
      setOpenForm(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function sendStatusChange(
    order: OrderItem,
    status: OrderStatus,
    extra: { trackingCode?: string; restock?: boolean } = {}
  ) {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message ?? "تغییر وضعیت ناموفق بود.");
        return;
      }

      // The list is filtered by status, so an order that changed status no
      // longer belongs on this tab.
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setOpenForm(null);
    } finally {
      setSubmitting(false);
    }
  }

  // The form itself is the admin's confirmation, so no confirm() here.
  function handleFormSubmit(event: FormEvent<HTMLFormElement>, order: OrderItem) {
    event.preventDefault();
    if (!openForm) return;
    if (openForm.kind === "reject_return") {
      void sendReturnRejection(order);
      return;
    }
    void sendStatusChange(
      order,
      openForm.kind,
      openForm.kind === "shipped" ? { trackingCode } : { restock }
    );
  }

  async function handleStatusChange(order: OrderItem, status: OrderStatus) {
    if (needsForm(status)) {
      openFormFor(order, status);
      return;
    }

    // Confirming a transfer is the step that can cost money, so the prompt
    // repeats exactly what to look for on the bank statement.
    // Cancelling a paid order puts its items back in stock, but the money has
    // to be refunded by hand, so the prompt says so.
    const question =
      status === "paid" && order.cardTransfer
        ? `واریز ${formatToman(order.totalPrice)} با کد پیگیری ${order.cardTransfer.trackingCode} از کارت ****${order.cardTransfer.cardLast4} را در صورت‌حساب بانک دیدید؟`
        : status === "cancelled"
          ? `سفارش «${order.customerName}» لغو شود؟ کالاها به موجودی برمی‌گردند، ولی مبلغ ${formatToman(order.totalPrice)} را باید خودتان به مشتری برگردانید.`
          : `وضعیت سفارش «${order.customerName}» به «${ORDER_STATUS_LABELS[status]}» تغییر کند؟`;
    if (!confirm(question)) return;
    await sendStatusChange(order, status);
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
            {/* Left-to-right so the phone and email read correctly, but
                right-aligned like the rest of the RTL list: text-start
                would follow the ltr and put it on the left. */}
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
            {order.shippedAt && (
              <>
                <dt className="text-zinc-500">ارسال</dt>
                <dd>
                  {formatDate(order.shippedAt)}
                  {order.shipmentTrackingCode && (
                    <>
                      {" "}
                      · کد رهگیری: <span dir="ltr">{order.shipmentTrackingCode}</span>
                    </>
                  )}
                </dd>
              </>
            )}
            {order.deliveredAt && (
              <>
                <dt className="text-zinc-500">تحویل</dt>
                <dd>{formatDate(order.deliveredAt)}</dd>
              </>
            )}
            {order.returnedAt && (
              <>
                <dt className="text-zinc-500">مرجوعی</dt>
                <dd>
                  {formatDate(order.returnedAt)} ·{" "}
                  {order.returnRestocked ? "به موجودی برگشت" : "به موجودی برنگشت"}
                </dd>
              </>
            )}
            {order.returnRequest && (
              <>
                <dt className="text-zinc-500">درخواست مرجوعی</dt>
                <dd>
                  <span
                    className={
                      hasPendingReturnRequest(order)
                        ? "font-bold text-amber-600 dark:text-amber-500"
                        : undefined
                    }
                  >
                    {formatDate(order.returnRequest.requestedAt)} · {order.returnRequest.reason}
                  </span>
                  {order.returnRequest.details && (
                    <span className="block whitespace-pre-line text-zinc-600 dark:text-zinc-400">
                      {order.returnRequest.details}
                    </span>
                  )}
                  {order.returnRequest.rejectedAt && (
                    <span className="block text-zinc-500">
                      رد شد ({formatDate(order.returnRequest.rejectedAt)}):{" "}
                      {order.returnRequest.rejectionNote}
                    </span>
                  )}
                </dd>
              </>
            )}
          </dl>

          <ul className="mt-3 flex flex-col gap-1 border-t border-zinc-100 pt-3 dark:border-zinc-900">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-4">
                <div>
                  {item.name} × {item.quantity.toLocaleString("fa-IR")}
                  {/* What to put in the box, as it was when the order was placed. */}
                  {item.packContents.length > 0 && (
                    <ul className="mt-1 list-inside list-disc text-xs text-zinc-500">
                      {item.packContents.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  )}
                </div>
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
            <li className="flex justify-between gap-4">
              <span>ارسال</span>
              <span className="whitespace-nowrap text-zinc-500">
                {formatShippingFee(order.shippingFee)}
              </span>
            </li>
          </ul>

          <footer className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-900">
            <span className="font-bold">مبلغ کل: {formatToman(order.totalPrice)}</span>
            <div className="flex flex-wrap gap-3">
              {hasPendingReturnRequest(order) && (
                <button
                  type="button"
                  onClick={() => openFormFor(order, "reject_return")}
                  className="cursor-pointer text-red-600 hover:underline"
                >
                  رد درخواست مرجوعی
                </button>
              )}
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

          {openForm?.orderId === order.id && (
            <form
              onSubmit={(event) => handleFormSubmit(event, order)}
              className="mt-3 flex flex-col gap-3 rounded bg-zinc-50 p-3 dark:bg-zinc-900"
            >
              {openForm.kind === "reject_return" ? (
                <label className="flex flex-col gap-1">
                  <span>دلیل رد درخواست (برای مشتری ایمیل می‌شود)</span>
                  <textarea
                    value={rejectionNote}
                    onChange={(event) => setRejectionNote(event.target.value)}
                    rows={3}
                    maxLength={500}
                    required
                    autoFocus
                    className="rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
              ) : openForm.kind === "shipped" ? (
                <label className="flex flex-col gap-1">
                  <span>کد رهگیری مرسوله (اختیاری؛ برای مشتری ایمیل می‌شود)</span>
                  <input
                    type="text"
                    dir="ltr"
                    value={trackingCode}
                    onChange={(event) => setTrackingCode(event.target.value)}
                    maxLength={60}
                    autoComplete="off"
                    autoFocus
                    className="rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
              ) : (
                <>
                  <p>
                    مرجوعی سفارش «{order.customerName}» ثبت شود؟ مبلغ{" "}
                    {formatToman(order.totalPrice)} را باید خودتان به مشتری برگردانید.
                  </p>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={restock}
                      onChange={(event) => setRestock(event.target.checked)}
                    />
                    کالاها سالم و باز نشده‌اند؛ به موجودی برگردند
                  </label>
                </>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer rounded bg-sky-600 px-4 py-1.5 text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {openForm.kind === "reject_return"
                    ? "رد درخواست"
                    : openForm.kind === "shipped"
                      ? "ثبت ارسال"
                      : "ثبت مرجوعی"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenForm(null)}
                  className="cursor-pointer text-zinc-500 hover:underline"
                >
                  انصراف
                </button>
              </div>
            </form>
          )}
        </article>
      ))}
    </div>
  );
}
