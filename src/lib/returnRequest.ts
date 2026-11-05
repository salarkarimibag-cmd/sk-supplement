import { z } from "zod";
import { endOfTehranDay } from "@/lib/discounts";

const DAY_MS = 24 * 60 * 60 * 1000;
const TEHRAN_OFFSET_MS = 3.5 * 60 * 60 * 1000;

/** How long after delivery a customer may ask to return an order (see the refund policy). */
export const RETURN_WINDOW_WORKING_DAYS = 7;

export const RETURN_REASONS = {
  changed_mind: "از خرید منصرف شدم",
  damaged: "کالا آسیب‌دیده یا معیوب است",
  wrong_item: "کالای اشتباه ارسال شده",
  other: "دلیل دیگر",
} as const;

export type ReturnReason = keyof typeof RETURN_REASONS;

const RETURN_REASON_KEYS = Object.keys(RETURN_REASONS) as [ReturnReason, ...ReturnReason[]];

/** What a customer sends to ask for a return. "Other" has to say what. */
export const returnRequestSchema = z
  .object({
    reason: z.enum(RETURN_REASON_KEYS, "دلیل مرجوعی را انتخاب کنید."),
    details: z.string().trim().max(1000, "توضیحات حداکثر ۱۰۰۰ کاراکتر است.").default(""),
  })
  .refine((body) => body.reason !== "other" || body.details.length >= 5, {
    path: ["details"],
    message: "لطفاً دلیل را توضیح دهید.",
  });

export type ReturnRequestInput = z.infer<typeof returnRequestSchema>;

/** The admin's reason for turning a request down; the customer is emailed it. */
export const rejectReturnSchema = z.object({
  note: z.string().trim().min(3).max(500),
});

/**
 * The last moment a return can be requested: the end (Tehran time) of the
 * 7th working day after the delivery day. Fridays, the Iranian weekend,
 * aren't counted; official holidays aren't known to the site, so in a week
 * with one the window is a day short of the law's and the customer can
 * still ask through the contact form.
 */
export function returnDeadline(deliveredAt: Date): Date {
  // Midnight of the delivery day on a clock shifted to Tehran time, so
  // getUTCDay() below gives the Tehran weekday.
  let day = Math.floor((deliveredAt.getTime() + TEHRAN_OFFSET_MS) / DAY_MS) * DAY_MS;
  let counted = 0;
  while (counted < RETURN_WINDOW_WORKING_DAYS) {
    day += DAY_MS;
    if (new Date(day).getUTCDay() !== 5) counted++;
  }
  return endOfTehranDay(new Date(day - TEHRAN_OFFSET_MS));
}

export interface ReturnableOrder {
  status: string;
  deliveredAt?: Date | null;
  returnRequest?: { requestedAt: Date } | null;
}

/**
 * Why a customer can't ask to return this order, or null when they can: it
 * must be delivered, still inside the window, and not asked about already
 * (one request per order; a turned-down one isn't reopened).
 */
export function returnRequestBlocker(order: ReturnableOrder, now: Date): string | null {
  if (order.status !== "delivered" || !order.deliveredAt) {
    return "فقط برای سفارش‌های تحویل‌شده می‌توان درخواست مرجوعی داد.";
  }
  if (order.returnRequest) return "برای این سفارش قبلاً درخواست مرجوعی ثبت شده است.";
  if (now > returnDeadline(order.deliveredAt)) {
    return "مهلت درخواست مرجوعی این سفارش تمام شده است. برای پیگیری با ما تماس بگیرید.";
  }
  return null;
}

/** Delivered orders whose return request is still waiting on the admin. */
export const PENDING_RETURN_REQUEST_FILTER = {
  status: "delivered",
  "returnRequest.requestedAt": { $exists: true },
  "returnRequest.rejectedAt": { $exists: false },
};
