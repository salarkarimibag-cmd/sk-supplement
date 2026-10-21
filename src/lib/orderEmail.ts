import { escapeHtml } from "@/lib/escapeHtml";
import { PAYMENT_METHOD_LABELS } from "@/lib/orderStatus";
import type { OrderStatus, PaymentMethod } from "@/models/Order";

/** The order events the customer is emailed about. */
export type OrderEmailKind = "received" | "paid" | "rejected" | "shipped" | "cancelled";

export interface OrderEmailLine {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderEmailInput {
  kind: OrderEmailKind;
  orderId: string;
  firstName: string;
  lastName: string;
  lines: OrderEmailLine[];
  totalPrice: number;
  discountAmount?: number;
  paymentMethod: PaymentMethod;
  /** ZarinPal's reference number, shown on payment confirmations. */
  refId?: number;
  address: { province: string; city: string; address: string; postalCode: string };
  siteUrl: string;
  /** Guests have no account, so they get no "my orders" link. */
  hasAccount: boolean;
}

const CONTENT: Record<OrderEmailKind, { subject: string; title: string; body: string }> = {
  received: {
    subject: "سفارش شما ثبت شد",
    title: "سفارش شما ثبت شد",
    body: "سفارش شما ثبت شد و پس از تأیید واریز کارت به کارت، پردازش و ارسال می‌شود.",
  },
  paid: {
    subject: "پرداخت سفارش شما تأیید شد",
    title: "پرداخت شما تأیید شد",
    body: "سفارش شما با موفقیت پرداخت شد و برای ارسال آماده می‌شود.",
  },
  rejected: {
    subject: "واریز سفارش شما تأیید نشد",
    title: "واریز شما تأیید نشد",
    body: "واریزی که برای این سفارش اعلام کردید در حساب فروشگاه پیدا نشد یا با مبلغ سفارش یکی نبود. اگر مبلغ از حسابتان کم شده، لطفاً با ما تماس بگیرید.",
  },
  shipped: {
    subject: "سفارش شما ارسال شد",
    title: "سفارش شما ارسال شد",
    body: "سفارش شما تحویل پست شد و به‌زودی به دستتان می‌رسد.",
  },
  cancelled: {
    subject: "سفارش شما لغو شد",
    title: "سفارش شما لغو شد",
    body: "این سفارش لغو شد. برای پیگیری بازگشت وجه یا هر سؤالی با ما تماس بگیرید.",
  },
};

/**
 * Which email (if any) an admin's status change sends. Only the changes an
 * admin can actually make are listed (see src/lib/orderStatus.ts): "failed"
 * is reachable only from awaiting_verification, i.e. a rejected card transfer.
 */
const ADMIN_STATUS_EMAILS: Partial<Record<OrderStatus, OrderEmailKind>> = {
  paid: "paid",
  failed: "rejected",
  shipped: "shipped",
  cancelled: "cancelled",
};

export function emailKindForAdminStatus(status: OrderStatus): OrderEmailKind | null {
  return ADMIN_STATUS_EMAILS[status] ?? null;
}

/** "Whey (Chocolate، 2kg)": the flavor and size tell grouped products apart. */
export function formatProductName(product: { name: string; flavor?: string; size?: string }): string {
  const variant = [product.flavor, product.size].filter(Boolean).join("، ");
  return variant ? `${product.name} (${variant})` : product.name;
}

/** A short, readable order number: the last 8 characters of its id. */
export function formatOrderNumber(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

function toman(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

type OrderSummary = Pick<OrderEmailInput, "lines" | "totalPrice" | "discountAmount">;

function formatAddress(address: OrderEmailInput["address"]): string {
  return `${address.province}، ${address.city}، ${address.address} — کد پستی ${address.postalCode}`;
}

function itemsText({ lines, totalPrice, discountAmount }: OrderSummary): string[] {
  return [
    ...lines.map(
      (line) =>
        `${line.name} × ${line.quantity.toLocaleString("fa-IR")}: ${toman(line.unitPrice * line.quantity)}`
    ),
    ...(discountAmount ? [`تخفیف: ${toman(discountAmount)}`] : []),
    `مبلغ کل: ${toman(totalPrice)}`,
  ];
}

// Inline styles and a table layout: most email apps ignore <style> blocks
// and modern CSS such as flexbox. Product names are escaped like any text.
function itemsTableHtml({ lines, totalPrice, discountAmount }: OrderSummary): string {
  const cell = "padding:6px 0;border-bottom:1px solid #e4e4e7";
  const rows = lines
    .map(
      (line) =>
        `<tr><td style="${cell}">${escapeHtml(line.name)} × ${line.quantity.toLocaleString("fa-IR")}</td><td style="${cell};text-align:left">${toman(line.unitPrice * line.quantity)}</td></tr>`
    )
    .join("");
  const discountRow = discountAmount
    ? `<tr><td style="${cell}">تخفیف</td><td style="${cell};text-align:left">− ${toman(discountAmount)}</td></tr>`
    : "";
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}${discountRow}
<tr><td style="padding:8px 0;font-weight:bold">مبلغ کل</td><td style="padding:8px 0;font-weight:bold;text-align:left">${toman(totalPrice)}</td></tr>
</table>`;
}

function buttonHtml(url: string, label: string): string {
  return `<p><a href="${url}" style="display:inline-block;background:#0284c7;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none">${label}</a></p>`;
}

const EMAIL_WRAPPER_STYLE =
  "font-family:Tahoma,Arial,sans-serif;line-height:1.8;color:#18181b;max-width:560px";

export function buildOrderEmail(input: OrderEmailInput) {
  const content = CONTENT[input.kind];
  const orderNumber = formatOrderNumber(input.orderId);
  const name = `${input.firstName} ${input.lastName}`.trim();
  const address = formatAddress(input.address);
  const link = input.hasAccount
    ? { url: `${input.siteUrl}/account/orders`, label: "مشاهده سفارش‌های من" }
    : { url: input.siteUrl, label: "رفتن به فروشگاه" };
  const contactUrl = `${input.siteUrl}/pages/contact-us`;
  const showRefId = input.refId !== undefined && input.kind === "paid";

  const details = [
    `شماره سفارش: ${orderNumber}`,
    `روش پرداخت: ${PAYMENT_METHOD_LABELS[input.paymentMethod]}`,
    ...(showRefId ? [`کد پیگیری پرداخت: ${input.refId}`] : []),
  ];

  const text = [
    `${name} عزیز، سلام`,
    "",
    content.body,
    "",
    ...details,
    "",
    ...itemsText(input),
    "",
    `آدرس ارسال: ${address}`,
    "",
    `${link.label}: ${link.url}`,
    `تماس با ما: ${contactUrl}`,
  ].join("\n");

  const html = `<div dir="rtl" style="${EMAIL_WRAPPER_STYLE}">
<h2 style="margin:0 0 12px">${content.title}</h2>
<p>${escapeHtml(name)} عزیز، سلام</p>
<p>${content.body}</p>
<p style="color:#52525b">${details.map((line) => escapeHtml(line)).join("<br>")}</p>
${itemsTableHtml(input)}
<p style="color:#52525b">آدرس ارسال: ${escapeHtml(address)}</p>
${buttonHtml(link.url, link.label)}
<p style="color:#71717a;font-size:13px">سؤالی دارید؟ <a href="${contactUrl}" style="color:#0284c7">با ما تماس بگیرید</a>.</p>
</div>`;

  return { subject: `${content.subject} | شماره ${orderNumber}`, text, html };
}

/** The new orders the shop's admins are emailed about. */
export type AdminOrderEmailKind = "card_received" | "paid";

export interface AdminOrderEmailInput extends Omit<OrderEmailInput, "kind" | "hasAccount"> {
  kind: AdminOrderEmailKind;
  contact: { email: string; mobile: string };
  /** What the buyer reported for a card-to-card order, to match against the bank. */
  cardTransfer?: { trackingCode: string; cardLast4: string };
}

const ADMIN_CONTENT: Record<AdminOrderEmailKind, { subject: string; body: string }> = {
  card_received: {
    subject: "سفارش کارت به کارت جدید، در انتظار تأیید واریز",
    body: "یک سفارش کارت به کارت ثبت شد. کد پیگیری و ۴ رقم آخر کارت را با صورت‌حساب بانک مقایسه کنید و در پنل مدیریت پرداخت را تأیید یا رد کنید.",
  },
  paid: {
    subject: "سفارش جدید پرداخت‌شده، آماده ارسال",
    body: "یک سفارش از درگاه زرین‌پال پرداخت شد و آماده ارسال است.",
  },
};

export function buildAdminOrderEmail(input: AdminOrderEmailInput) {
  const content = ADMIN_CONTENT[input.kind];
  const orderNumber = formatOrderNumber(input.orderId);
  const adminUrl = `${input.siteUrl}/admin/orders`;

  const details = [
    `شماره سفارش: ${orderNumber}`,
    `روش پرداخت: ${PAYMENT_METHOD_LABELS[input.paymentMethod]}`,
    ...(input.refId !== undefined ? [`کد پیگیری زرین‌پال: ${input.refId}`] : []),
    ...(input.cardTransfer
      ? [
          `کد پیگیری واریز: ${input.cardTransfer.trackingCode}`,
          `۴ رقم آخر کارت واریزکننده: ${input.cardTransfer.cardLast4}`,
        ]
      : []),
    `مشتری: ${input.firstName} ${input.lastName}`.trim(),
    `موبایل: ${input.contact.mobile}`,
    `ایمیل: ${input.contact.email}`,
  ];
  const address = formatAddress(input.address);

  const text = [
    content.body,
    "",
    ...details,
    "",
    ...itemsText(input),
    "",
    `آدرس ارسال: ${address}`,
    "",
    `پنل مدیریت سفارش‌ها: ${adminUrl}`,
  ].join("\n");

  // Every detail here comes from the buyer's checkout form, so all of it is escaped.
  const html = `<div dir="rtl" style="${EMAIL_WRAPPER_STYLE}">
<h2 style="margin:0 0 12px">${content.subject}</h2>
<p>${content.body}</p>
<p style="color:#52525b">${details.map((line) => escapeHtml(line)).join("<br>")}</p>
${itemsTableHtml(input)}
<p style="color:#52525b">آدرس ارسال: ${escapeHtml(address)}</p>
${buttonHtml(adminUrl, "مشاهده در پنل مدیریت")}
</div>`;

  return { subject: `${content.subject} | شماره ${orderNumber}`, text, html };
}
