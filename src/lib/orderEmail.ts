import { escapeHtml } from "@/lib/escapeHtml";
import { PAYMENT_METHOD_LABELS } from "@/lib/orderStatus";
import type { OrderStatus, PaymentMethod } from "@/models/Order";

/** The order events the customer is emailed about. */
export type OrderEmailKind =
  | "received"
  | "paid"
  | "rejected"
  | "shipped"
  | "returned"
  | "cancelled"
  | "return_requested"
  | "return_rejected";

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
  /** The carrier's tracking number, shown on the shipping email. */
  shipmentTrackingCode?: string;
  /** The admin's reason for turning a return request down, shown on that email. */
  rejectionNote?: string;
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
  returned: {
    subject: "مرجوعی سفارش شما ثبت شد",
    title: "مرجوعی سفارش شما ثبت شد",
    body: "کالاهای این سفارش به فروشگاه برگشت و مرجوعی آن ثبت شد. مبلغ طبق سیاست بازگشت کالا به حساب شما برگردانده می‌شود. برای پیگیری با ما تماس بگیرید.",
  },
  cancelled: {
    subject: "سفارش شما لغو شد",
    title: "سفارش شما لغو شد",
    body: "این سفارش لغو شد. برای پیگیری بازگشت وجه یا هر سؤالی با ما تماس بگیرید.",
  },
  return_requested: {
    subject: "درخواست مرجوعی شما دریافت شد",
    title: "درخواست مرجوعی شما دریافت شد",
    body: "درخواست مرجوعی این سفارش ثبت شد و آن را بررسی می‌کنیم. به‌زودی برای هماهنگی بازگرداندن کالا با شما تماس می‌گیریم.",
  },
  return_rejected: {
    subject: "درخواست مرجوعی شما پذیرفته نشد",
    title: "درخواست مرجوعی شما پذیرفته نشد",
    body: "درخواست مرجوعی این سفارش پذیرفته نشد. اگر سؤالی دارید با ما تماس بگیرید.",
  },
};

/**
 * Which email (if any) an admin's status change sends. Only the changes an
 * admin can actually make are listed (see src/lib/orderStatus.ts): "failed"
 * is reachable only from awaiting_verification, i.e. a rejected card transfer.
 * "delivered" sends nothing: the customer is the one who just received it.
 */
const ADMIN_STATUS_EMAILS: Partial<Record<OrderStatus, OrderEmailKind>> = {
  paid: "paid",
  failed: "rejected",
  shipped: "shipped",
  returned: "returned",
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
  const showTrackingCode = Boolean(input.shipmentTrackingCode) && input.kind === "shipped";

  const details = [
    `شماره سفارش: ${orderNumber}`,
    `روش پرداخت: ${PAYMENT_METHOD_LABELS[input.paymentMethod]}`,
    ...(showRefId ? [`کد پیگیری پرداخت: ${input.refId}`] : []),
    ...(showTrackingCode ? [`کد رهگیری مرسوله: ${input.shipmentTrackingCode}`] : []),
    ...(input.kind === "return_rejected" && input.rejectionNote
      ? [`دلیل: ${input.rejectionNote}`]
      : []),
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

/** The order events the shop's admins are emailed about. */
export type AdminOrderEmailKind = "card_received" | "paid" | "return_requested";

export interface AdminOrderEmailInput extends Omit<OrderEmailInput, "kind" | "hasAccount"> {
  kind: AdminOrderEmailKind;
  contact: { email: string; mobile: string };
  /** What the buyer reported for a card-to-card order, to match against the bank. */
  cardTransfer?: { trackingCode: string; cardLast4: string };
  /** Products this order left short: it was paid after its stock was sold on. */
  oversold?: string[];
  /** The customer's return request: the reason as a label, and their own words. */
  returnRequest?: { reason: string; details?: string };
}

// Where each email's button leads in the admin.
const ADMIN_PATHS: Record<AdminOrderEmailKind, string> = {
  card_received: "/admin/orders",
  paid: "/admin/orders",
  return_requested: "/admin/orders?status=return_requests",
};

const ADMIN_CONTENT: Record<AdminOrderEmailKind, { subject: string; body: string }> = {
  card_received: {
    subject: "سفارش کارت به کارت جدید، در انتظار تأیید واریز",
    body: "یک سفارش کارت به کارت ثبت شد. کد پیگیری و ۴ رقم آخر کارت را با صورت‌حساب بانک مقایسه کنید و در پنل مدیریت پرداخت را تأیید یا رد کنید.",
  },
  paid: {
    subject: "سفارش جدید پرداخت‌شده، آماده ارسال",
    body: "یک سفارش از درگاه زرین‌پال پرداخت شد و آماده ارسال است.",
  },
  return_requested: {
    subject: "درخواست مرجوعی جدید",
    body: "مشتری برای یک سفارش تحویل‌شده درخواست مرجوعی ثبت کرد. با مشتری برای بازگرداندن کالا هماهنگ کنید و بعد از رسیدن کالا، مرجوعی را در پنل مدیریت ثبت کنید؛ یا درخواست را با ذکر دلیل رد کنید.",
  },
};

export function buildAdminOrderEmail(input: AdminOrderEmailInput) {
  const content = ADMIN_CONTENT[input.kind];
  const oversold = input.oversold ?? [];
  const subject = oversold.length > 0 ? `موجودی کافی نیست: ${content.subject}` : content.subject;
  const shortage =
    oversold.length > 0
      ? `هشدار: این سفارش بعد از پایان مهلت رزرو پرداخت شد و موجودی این محصولات کافی نیست: ${oversold.join("، ")}. مبلغ از مشتری کسر شده است؛ کالا را تهیه کنید یا با مشتری تماس بگیرید و مبلغ را برگردانید.`
      : "";
  const orderNumber = formatOrderNumber(input.orderId);
  const adminUrl = `${input.siteUrl}${ADMIN_PATHS[input.kind]}`;

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
    ...(input.returnRequest
      ? [
          `دلیل مرجوعی: ${input.returnRequest.reason}`,
          ...(input.returnRequest.details
            ? [`توضیحات مشتری: ${input.returnRequest.details}`]
            : []),
        ]
      : []),
    `مشتری: ${input.firstName} ${input.lastName}`.trim(),
    `موبایل: ${input.contact.mobile}`,
    `ایمیل: ${input.contact.email}`,
  ];
  const address = formatAddress(input.address);

  const text = [
    ...(shortage ? [shortage, ""] : []),
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
<h2 style="margin:0 0 12px">${subject}</h2>
${shortage ? `<p style="color:#b91c1c;font-weight:bold">${escapeHtml(shortage)}</p>` : ""}
<p>${content.body}</p>
<p style="color:#52525b">${details.map((line) => escapeHtml(line)).join("<br>")}</p>
${itemsTableHtml(input)}
<p style="color:#52525b">آدرس ارسال: ${escapeHtml(address)}</p>
${buttonHtml(adminUrl, "مشاهده در پنل مدیریت")}
</div>`;

  return { subject: `${subject} | شماره ${orderNumber}`, text, html };
}
