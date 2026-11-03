import { escapeHtml } from "@/lib/escapeHtml";

const ALERT_INTERVAL_MS = 60 * 60 * 1000;

interface ServerError {
  message: string;
  digest?: string;
  /** The requested path; its query string is dropped (it can carry a reset token). */
  path: string;
  method: string;
  /** The route file that failed, e.g. /products/[id]. */
  routePath: string;
  /** Page render, API route, ... */
  routeType: string;
}

export function errorAlertKey(error: ServerError): string {
  return `${error.routePath}:${error.message}`;
}

/**
 * Whether this error is due an email: at most one per hour for each error, so
 * a page failing on every visit can't flood the inbox or use up the daily
 * email allowance that order emails need. Remembers what it allowed in `sent`.
 */
export function shouldSendAlert(key: string, now: number, sent: Map<string, number>): boolean {
  const last = sent.get(key);
  if (last !== undefined && now - last < ALERT_INTERVAL_MS) return false;
  sent.set(key, now);
  return true;
}

export function buildErrorAlert(error: ServerError, siteUrl: string) {
  const fields = [
    ["صفحه", `${error.method} ${error.path.split("?")[0]}`],
    ["مسیر", `${error.routePath} (${error.routeType})`],
    ["خطا", error.message],
    ["شناسه", error.digest ?? "—"],
  ];

  return {
    subject: `خطای سرور در SK Supplement: ${error.routePath}`,
    text: [
      "سایت هنگام پاسخ به یک درخواست با خطا روبه‌رو شد.",
      ...fields.map(([label, value]) => `${label}: ${value}`),
      "جزئیات در Vercel، بخش Logs است. همین خطا تا یک ساعت دوباره ایمیل نمی‌شود.",
      siteUrl,
    ].join("\n"),
    html: `<div dir="rtl">
      <p>سایت هنگام پاسخ به یک درخواست با خطا روبه‌رو شد.</p>
      ${fields
        .map(([label, value]) => `<p><strong>${label}:</strong> <span dir="ltr">${escapeHtml(value)}</span></p>`)
        .join("")}
      <p>جزئیات در Vercel، بخش Logs است. همین خطا تا یک ساعت دوباره ایمیل نمی‌شود.</p>
    </div>`,
  };
}
