import { describe, expect, it } from "vitest";
import { salesWindows, stockLabel, summarizeSales } from "./adminDashboard";

describe("salesWindows", () => {
  it("starts each window at midnight Tehran time", () => {
    // 10:00 UTC = 13:30 in Tehran; that day began at 20:30 UTC the day before.
    const [today, week, month] = salesWindows(new Date("2026-11-05T10:00:00Z"));
    expect(today.since.toISOString()).toBe("2026-11-04T20:30:00.000Z");
    expect(week.since.toISOString()).toBe("2026-10-29T20:30:00.000Z");
    expect(month.since.toISOString()).toBe("2026-10-06T20:30:00.000Z");
  });

  it("counts just after Tehran midnight as the new day, though UTC is still on the old one", () => {
    // 21:00 UTC on the 4th = 00:30 on the 5th in Tehran.
    const [today] = salesWindows(new Date("2026-11-04T21:00:00Z"));
    expect(today.since.toISOString()).toBe("2026-11-04T20:30:00.000Z");
  });
});

describe("summarizeSales", () => {
  it("totals the orders placed in each window", () => {
    const windows = salesWindows(new Date("2026-11-05T10:00:00Z"));
    const orders = [
      { createdAt: new Date("2026-11-05T08:00:00Z"), totalPrice: 100 }, // today
      { createdAt: new Date("2026-11-04T20:00:00Z"), totalPrice: 200 }, // yesterday, Tehran
      { createdAt: new Date("2026-10-10T00:00:00Z"), totalPrice: 400 }, // this month
    ];
    expect(summarizeSales(orders, windows)).toEqual([
      { label: "امروز", total: 100, count: 1 },
      { label: "۷ روز اخیر", total: 300, count: 2 },
      { label: "۳۰ روز اخیر", total: 700, count: 3 },
    ]);
  });

  it("reports zero when nothing was sold", () => {
    const windows = salesWindows(new Date("2026-11-05T10:00:00Z"));
    expect(summarizeSales([], windows).map((row) => row.total)).toEqual([0, 0, 0]);
  });
});

describe("stockLabel", () => {
  it("reads out a low stock, an empty one and an oversold one", () => {
    expect(stockLabel(2)).toBe("۲ عدد");
    expect(stockLabel(0)).toBe("تمام شده");
    expect(stockLabel(-3)).toBe("بیش‌فروش: ۳ عدد کم");
  });
});
