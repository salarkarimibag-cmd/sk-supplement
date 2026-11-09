import { describe, expect, it } from "vitest";
import {
  amountUntilFreeShipping,
  FREE_SHIPPING_MIN,
  IRAN_PROVINCES,
  NEARBY_SHIPPING_FEES,
  PROVINCE_SHIPPING_FEE,
  SHIPPING_FEES_LABEL,
  shippingFee,
} from "./shipping";

describe("shippingFee", () => {
  it("charges the nearby provinces' own fees below the threshold", () => {
    expect(shippingFee(FREE_SHIPPING_MIN - 1, "تهران")).toBe(250_000);
    expect(shippingFee(FREE_SHIPPING_MIN - 1, "البرز")).toBe(300_000);
  });

  it("doesn't treat inherited object keys as provinces", () => {
    expect(shippingFee(1, "toString")).toBe(PROVINCE_SHIPPING_FEE);
  });

  it("charges the other provinces' fee below the threshold", () => {
    expect(shippingFee(FREE_SHIPPING_MIN - 1, "اصفهان")).toBe(PROVINCE_SHIPPING_FEE);
    expect(shippingFee(1, "سیستان و بلوچستان")).toBe(PROVINCE_SHIPPING_FEE);
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

  it("spells every nearby province the way the checkout list does", () => {
    // A typo here would silently charge that province the full fee.
    for (const name of Object.keys(NEARBY_SHIPPING_FEES)) {
      expect(IRAN_PROVINCES).toContain(name);
    }
  });
});

describe("SHIPPING_FEES_LABEL", () => {
  it("lists every fee", () => {
    expect(SHIPPING_FEES_LABEL).toBe(
      "تهران ۲۵۰٬۰۰۰، البرز ۳۰۰٬۰۰۰ و سایر استان‌ها ۷۰۰٬۰۰۰ تومان"
    );
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
