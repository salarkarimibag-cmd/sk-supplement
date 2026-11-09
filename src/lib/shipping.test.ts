import { describe, expect, it } from "vitest";
import {
  amountUntilFreeShipping,
  FREE_SHIPPING_MIN,
  IRAN_PROVINCES,
  MAX_SHIPPING_FEE,
  MIN_SHIPPING_FEE,
  SHIPPING_FEES,
  SHIPPING_FEES_LABEL,
  shippingFee,
  shippingFeeTiers,
} from "./shipping";

describe("shippingFee", () => {
  it("charges each province its own fee below the threshold", () => {
    expect(shippingFee(FREE_SHIPPING_MIN - 1, "تهران")).toBe(250_000);
    expect(shippingFee(FREE_SHIPPING_MIN - 1, "البرز")).toBe(300_000);
    expect(shippingFee(FREE_SHIPPING_MIN - 1, "اصفهان")).toBe(450_000);
    expect(shippingFee(1, "سیستان و بلوچستان")).toBe(700_000);
  });

  it("charges the most for a province not on the list, never less", () => {
    expect(shippingFee(1, "Tehran")).toBe(MAX_SHIPPING_FEE);
    // Inherited object keys aren't provinces either.
    expect(shippingFee(1, "toString")).toBe(MAX_SHIPPING_FEE);
  });

  it("is free from the threshold up, wherever it goes", () => {
    expect(shippingFee(FREE_SHIPPING_MIN, "تهران")).toBe(0);
    expect(shippingFee(FREE_SHIPPING_MIN * 3, "یزد")).toBe(0);
  });
});

describe("IRAN_PROVINCES", () => {
  it("has Iran's 31 provinces, once each", () => {
    expect(IRAN_PROVINCES).toHaveLength(31);
    expect(new Set(IRAN_PROVINCES).size).toBe(31);
  });

  it("has a fee for exactly the provinces on the checkout list", () => {
    expect(Object.keys(SHIPPING_FEES).sort()).toEqual([...IRAN_PROVINCES].sort());
  });

  it("keeps every fee between 250,000 and 700,000 Toman", () => {
    expect(MIN_SHIPPING_FEE).toBe(250_000);
    expect(MAX_SHIPPING_FEE).toBe(700_000);
  });
});

describe("shippingFeeTiers", () => {
  it("groups all 31 provinces by fee, cheapest first", () => {
    const tiers = shippingFeeTiers();
    expect(tiers[0]).toEqual([250_000, ["تهران"]]);
    expect(tiers.map(([fee]) => fee)).toEqual([...tiers.map(([fee]) => fee)].sort((a, b) => a - b));
    expect(tiers.flatMap(([, provinces]) => provinces)).toHaveLength(31);
  });
});

describe("SHIPPING_FEES_LABEL", () => {
  it("gives the range", () => {
    expect(SHIPPING_FEES_LABEL).toBe("بسته به استان، ۲۵۰٬۰۰۰ تا ۷۰۰٬۰۰۰ تومان");
  });
});

describe("amountUntilFreeShipping", () => {
  it("is the gap to the threshold", () => {
    expect(amountUntilFreeShipping(FREE_SHIPPING_MIN - 250_000)).toBe(250_000);
  });

  it("is never negative", () => {
    expect(amountUntilFreeShipping(FREE_SHIPPING_MIN)).toBe(0);
    expect(amountUntilFreeShipping(FREE_SHIPPING_MIN + 1)).toBe(0);
  });
});
