import { endOfTehranDay } from "@/lib/discounts";

const DAY_MS = 24 * 60 * 60 * 1000;

/** At or below this, a product shows up in the dashboard's low-stock list. */
export const LOW_STOCK_THRESHOLD = 3;

export interface SalesWindow {
  label: string;
  since: Date;
}

/**
 * The periods the dashboard totals sales over, each starting at midnight
 * Tehran time (the shop's day, not the server's UTC one) and running to now.
 * "Last 7 days" is today plus the 6 days before it. Longest last, so its
 * start is the earliest date the orders need to be read from.
 */
export function salesWindows(now: Date): SalesWindow[] {
  const startOfToday = endOfTehranDay(now).getTime() + 1 - DAY_MS;
  return [
    { label: "امروز", since: new Date(startOfToday) },
    { label: "۷ روز اخیر", since: new Date(startOfToday - 6 * DAY_MS) },
    { label: "۳۰ روز اخیر", since: new Date(startOfToday - 29 * DAY_MS) },
  ];
}

export interface SalesSummary {
  label: string;
  total: number;
  count: number;
}

/** Adds up the orders placed in each window: their total in Toman and how many. */
export function summarizeSales(
  orders: { createdAt: Date; totalPrice: number }[],
  windows: SalesWindow[]
): SalesSummary[] {
  return windows.map(({ label, since }) => {
    const inWindow = orders.filter((order) => order.createdAt >= since);
    return {
      label,
      total: inWindow.reduce((sum, order) => sum + order.totalPrice, 0),
      count: inWindow.length,
    };
  });
}

/**
 * How a low stock level reads in the list. Below zero means more units were
 * paid for than exist (a payment that finished after its hold ran out, see
 * onOrderPaid): the admin has to find them or refund.
 */
export function stockLabel(stock: number): string {
  if (stock < 0) return `بیش‌فروش: ${(-stock).toLocaleString("fa-IR")} عدد کم`;
  if (stock === 0) return "تمام شده";
  return `${stock.toLocaleString("fa-IR")} عدد`;
}
