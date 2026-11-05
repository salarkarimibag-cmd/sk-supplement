import { describe, expect, it } from "vitest";
import {
  rejectReturnSchema,
  returnDeadline,
  returnRequestBlocker,
  returnRequestSchema,
} from "./returnRequest";

describe("returnDeadline", () => {
  it("counts 7 working days after the delivery day, skipping Fridays", () => {
    // Delivered Thursday 2026-11-05: Sat 7 … Thu 12 is 6 days, Friday 13 is
    // skipped, Saturday 14 is the 7th. Ends at midnight Tehran (20:30 UTC).
    expect(returnDeadline(new Date("2026-11-05T09:00:00Z")).toISOString()).toBe(
      "2026-11-14T20:29:59.999Z"
    );
    // Delivered Saturday 2026-11-07: Sun 8 … Thu 12, Sat 14, Sun 15.
    expect(returnDeadline(new Date("2026-11-07T09:00:00Z")).toISOString()).toBe(
      "2026-11-15T20:29:59.999Z"
    );
  });

  it("uses the Tehran day of delivery, not the UTC one", () => {
    // 21:00 UTC on Wednesday the 4th is 00:30 on Thursday the 5th in Tehran.
    expect(returnDeadline(new Date("2026-11-04T21:00:00Z")).toISOString()).toBe(
      "2026-11-14T20:29:59.999Z"
    );
  });
});

describe("returnRequestBlocker", () => {
  const deliveredAt = new Date("2026-11-05T09:00:00Z");
  const delivered = { status: "delivered", deliveredAt };

  it("allows a delivered order inside the window", () => {
    expect(returnRequestBlocker(delivered, new Date("2026-11-14T20:00:00Z"))).toBeNull();
  });

  it("refuses after the window", () => {
    expect(returnRequestBlocker(delivered, new Date("2026-11-14T20:30:00Z"))).toContain("مهلت");
  });

  it("refuses an order that isn't delivered", () => {
    expect(returnRequestBlocker({ status: "shipped" }, deliveredAt)).toContain("تحویل‌شده");
    expect(returnRequestBlocker({ status: "returned", deliveredAt }, deliveredAt)).toContain(
      "تحویل‌شده"
    );
  });

  it("refuses a second request", () => {
    const asked = { ...delivered, returnRequest: { requestedAt: deliveredAt } };
    expect(returnRequestBlocker(asked, deliveredAt)).toContain("قبلاً");
  });
});

describe("returnRequestSchema", () => {
  it("accepts a known reason, trimming the details", () => {
    expect(returnRequestSchema.parse({ reason: "damaged", details: "  شکسته  " })).toEqual({
      reason: "damaged",
      details: "شکسته",
    });
    expect(returnRequestSchema.parse({ reason: "changed_mind" })).toEqual({
      reason: "changed_mind",
      details: "",
    });
  });

  it("rejects an unknown reason and over-long details", () => {
    expect(returnRequestSchema.safeParse({ reason: "toString" }).success).toBe(false);
    expect(returnRequestSchema.safeParse({ reason: "" }).success).toBe(false);
    expect(
      returnRequestSchema.safeParse({ reason: "damaged", details: "x".repeat(1001) }).success
    ).toBe(false);
  });

  it("needs details when the reason is «other»", () => {
    expect(returnRequestSchema.safeParse({ reason: "other", details: " " }).success).toBe(false);
    expect(returnRequestSchema.safeParse({ reason: "other", details: "سایز اشتباه" }).success).toBe(
      true
    );
  });
});

describe("rejectReturnSchema", () => {
  it("needs a short note", () => {
    expect(rejectReturnSchema.safeParse({ note: "  " }).success).toBe(false);
    expect(rejectReturnSchema.safeParse({ note: "x".repeat(501) }).success).toBe(false);
    expect(rejectReturnSchema.parse({ note: " مهلت تمام شده " }).note).toBe("مهلت تمام شده");
  });
});
