import { describe, expect, it } from "vitest";
import { calculateDiscountAmount, checkDiscount } from "./discounts";
import type { DiscountCode } from "@/models/DiscountCode";

function makeDiscount(overrides: Partial<DiscountCode> = {}): DiscountCode {
  return {
    code: "TEST10",
    type: "percent",
    value: 10,
    active: true,
    ...overrides,
  } as DiscountCode;
}

describe("calculateDiscountAmount", () => {
  it("computes a rounded percentage of the subtotal", () => {
    expect(calculateDiscountAmount({ type: "percent", value: 10 }, 199_000)).toBe(19_900);
  });

  it("rounds to the nearest whole unit", () => {
    expect(calculateDiscountAmount({ type: "percent", value: 15 }, 100)).toBe(15);
    expect(calculateDiscountAmount({ type: "percent", value: 33 }, 100)).toBe(33);
  });

  it("applies a fixed amount as-is when smaller than the subtotal", () => {
    expect(calculateDiscountAmount({ type: "fixed", value: 50_000 }, 300_000)).toBe(50_000);
  });

  it("caps a fixed discount at the subtotal so the total never goes negative", () => {
    expect(calculateDiscountAmount({ type: "fixed", value: 500_000 }, 100_000)).toBe(100_000);
  });
});

describe("checkDiscount", () => {
  it("rejects a null discount (code not found)", () => {
    const result = checkDiscount(null, 100_000);
    expect(result).toEqual({ valid: false, message: "کد تخفیف نامعتبر است." });
  });

  it("rejects an inactive discount", () => {
    const result = checkDiscount(makeDiscount({ active: false }), 100_000);
    expect(result.valid).toBe(false);
  });

  it("rejects an expired discount", () => {
    const expired = makeDiscount({ expiresAt: new Date(Date.now() - 1000) });
    const result = checkDiscount(expired, 100_000);
    expect(result).toEqual({ valid: false, message: "کد تخفیف منقضی شده است." });
  });

  it("accepts a discount that expires in the future", () => {
    const stillValid = makeDiscount({ expiresAt: new Date(Date.now() + 1000 * 60 * 60) });
    const result = checkDiscount(stillValid, 100_000);
    expect(result.valid).toBe(true);
  });

  it("accepts a discount with no expiry date at all", () => {
    const result = checkDiscount(makeDiscount(), 100_000);
    expect(result).toEqual({ valid: true, code: "TEST10", discountAmount: 10_000 });
  });
});
