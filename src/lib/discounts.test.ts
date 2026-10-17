import { describe, expect, it } from "vitest";
import {
  calculateDiscountAmount,
  checkDiscount,
  discountInputSchema,
  formatDiscountValue,
} from "./discounts";
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

describe("checkDiscount usage limit", () => {
  it("accepts a code below its usage limit", () => {
    const result = checkDiscount(makeDiscount({ maxUses: 5, usedCount: 4 }), 100_000);
    expect(result.valid).toBe(true);
  });

  it("rejects a code that has reached its usage limit", () => {
    const result = checkDiscount(makeDiscount({ maxUses: 5, usedCount: 5 }), 100_000);
    expect(result).toEqual({ valid: false, message: "ظرفیت استفاده از این کد تخفیف تمام شده است." });
  });

  it("treats a missing limit as unlimited", () => {
    const result = checkDiscount(makeDiscount({ maxUses: null, usedCount: 1_000 }), 100_000);
    expect(result.valid).toBe(true);
  });
});

describe("calculateDiscountAmount safety cap", () => {
  it("never takes off more than the subtotal, even for a percent over 100", () => {
    expect(calculateDiscountAmount({ type: "percent", value: 150 }, 100_000)).toBe(100_000);
  });
});

describe("discountInputSchema", () => {
  const valid = {
    code: " welcome10 ",
    type: "percent",
    value: 10,
    active: true,
    expiresAt: null,
    maxUses: null,
  };

  it("accepts a valid code and normalizes it to upper case", () => {
    expect(discountInputSchema.parse(valid).code).toBe("WELCOME10");
  });

  it("rejects a percent of 100 or more", () => {
    expect(discountInputSchema.safeParse({ ...valid, value: 100 }).success).toBe(false);
    expect(discountInputSchema.safeParse({ ...valid, value: 99 }).success).toBe(true);
  });

  it("allows a large fixed amount", () => {
    expect(discountInputSchema.safeParse({ ...valid, type: "fixed", value: 500_000 }).success).toBe(true);
  });

  it("rejects zero, negative or fractional values", () => {
    expect(discountInputSchema.safeParse({ ...valid, value: 0 }).success).toBe(false);
    expect(discountInputSchema.safeParse({ ...valid, value: -5 }).success).toBe(false);
    expect(discountInputSchema.safeParse({ ...valid, value: 2.5 }).success).toBe(false);
  });

  it("rejects codes with spaces, symbols or non-English letters", () => {
    expect(discountInputSchema.safeParse({ ...valid, code: "WEL COME" }).success).toBe(false);
    expect(discountInputSchema.safeParse({ ...valid, code: "تخفیف" }).success).toBe(false);
    expect(discountInputSchema.safeParse({ ...valid, code: "AB" }).success).toBe(false);
  });

  it("validates the expiry date and usage limit", () => {
    expect(discountInputSchema.safeParse({ ...valid, expiresAt: "2026-12-31" }).success).toBe(true);
    expect(discountInputSchema.safeParse({ ...valid, expiresAt: "tomorrow" }).success).toBe(false);
    expect(discountInputSchema.safeParse({ ...valid, maxUses: 0 }).success).toBe(false);
  });
});

describe("formatDiscountValue", () => {
  it("shows a percent code with Persian digits and the Persian percent sign", () => {
    expect(formatDiscountValue({ type: "percent", value: 10 })).toBe("۱۰٪");
  });

  it("shows a fixed code as Toman with grouped Persian digits", () => {
    expect(formatDiscountValue({ type: "fixed", value: 50000 })).toBe("۵۰٬۰۰۰ تومان");
  });
});
