// Pages whose query string carries a secret: the password reset token, and
// ZarinPal's payment Authority on the callback. Analytics records each page
// view's full URL, so these are sent without their query string.
const PATHS_WITH_SECRET_QUERY = ["/account/reset-password", "/checkout/callback"];

/**
 * What analytics records for a page view: the URL with secrets removed, or
 * null to record nothing. Admin pages are skipped so the shop owner's own
 * browsing doesn't count as customer traffic.
 */
export function sanitizeAnalyticsUrl(url: string): string | null {
  const parsed = new URL(url);

  if (parsed.pathname === "/admin" || parsed.pathname.startsWith("/admin/")) {
    return null;
  }
  if (PATHS_WITH_SECRET_QUERY.includes(parsed.pathname)) {
    parsed.search = "";
  }
  return parsed.toString();
}
