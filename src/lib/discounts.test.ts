import { afterEach, describe, expect, it, vi } from "vitest";
import {
  calculateDiscountAmount,
  checkDiscount,
  discountInputSchema,
  endOfTehranDay,
  formatDiscountValue,
  heldOrdersFilter,
  PENDING_HOLD_MS,
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

describe("endOfTehranDay", () => {
  it("is 23:59:59.999 Tehran time of the day the date falls on", () => {
    // Midnight UTC is 03:30 in Tehran, the same calendar day.
    expect(endOfTehranDay(new Date("2026-11-01")).toISOString()).toBe("2026-11-01T20:29:59.999Z");
  });

  it("uses the Tehran day, not the UTC day, near midnight", () => {
    // 22:00 UTC on Oct 31 is already 01:30 on Nov 1 in Tehran.
    expect(endOfTehranDay(new Date("2026-10-31T22:00:00Z")).toISOString()).toBe(
      "2026-11-01T20:29:59.999Z"
    );
  });

  it("returns the same instant for the end of the day itself", () => {
    const end = new Date("2026-11-01T20:29:59.999Z");
    expect(endOfTehranDay(end).getTime()).toBe(end.getTime());
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

  describe("expiry date (valid through that whole day in Tehran)", () => {
    // What the admin's "2026-11-01" is saved as: midnight UTC.
    const expiresAt = new Date("2026-11-01");
    const expiring = makeDiscount({ expiresAt });

    afterEach(() => {
      vi.useRealTimers();
    });

    function checkAt(tehranTime: string) {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(`${tehranTime}+03:30`));
      return checkDiscount(expiring, 100_000);
    }

    it("accepts it before the expiry day", () => {
      expect(checkAt("2026-10-31T23:00:00").valid).toBe(true);
    });

    it("accepts it on the expiry day, morning and late evening", () => {
      // 10:00 is past the stored instant (03:30 Tehran), which used to expire it.
      expect(checkAt("2026-11-01T10:00:00").valid).toBe(true);
      expect(checkAt("2026-11-01T23:59:59").valid).toBe(true);
    });

    it("rejects it from the day after", () => {
      expect(checkAt("2026-11-02T00:00:00")).toEqual({
        valid: false,
        message: "کد تخفیف منقضی شده است.",
      });
    });
  });

  it("accepts a discount with no expiry date at all", () => {
    const result = checkDiscount(makeDiscount(), 100_000);
    expect(result).toEqual({ valid: true, code: "TEST10", discountAmount: 10_000 });
  });
});

describe("heldOrdersFilter", () => {
  it("matches card orders awaiting the admin and recent pending orders with the code", () => {
    const now = Date.parse("2026-11-01T12:00:00Z");
    expect(heldOrdersFilter("WELCOME10", now)).toEqual({
      discountCode: "WELCOME10",
      $or: [
        { status: "awaiting_verification" },
        { status: "pending", createdAt: { $gte: new Date(now - PENDING_HOLD_MS) } },
      ],
    });
  });

  it("holds a pending order for 30 minutes", () => {
    expect(PENDING_HOLD_MS).toBe(30 * 60 * 1000);
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

  it("counts unpaid orders that hold the code against the limit", () => {
    const discount = makeDiscount({ maxUses: 5, usedCount: 3 });
    expect(checkDiscount(discount, 100_000, 1).valid).toBe(true);
    expect(checkDiscount(discount, 100_000, 2)).toEqual({
      valid: false,
      message: "ظرفیت استفاده از این کد تخفیف تمام شده است.",
    });
  });

  it("ignores held uses for a code without a limit", () => {
    const result = checkDiscount(makeDiscount({ maxUses: null, usedCount: 0 }), 100_000, 50);
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
