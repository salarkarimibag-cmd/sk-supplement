import { describe, expect, it } from "vitest";
import {
  amountUntilFreeShipping,
  FREE_SHIPPING_MIN,
  IRAN_PROVINCES,
  PROVINCE_SHIPPING_FEE,
  shippingFee,
  TEHRAN_PROVINCE,
  TEHRAN_SHIPPING_FEE,
} from "./shipping";

describe("shippingFee", () => {
  it("charges Tehran's fee below the threshold", () => {
    expect(shippingFee(FREE_SHIPPING_MIN - 1, TEHRAN_PROVINCE)).toBe(TEHRAN_SHIPPING_FEE);
  });

  it("charges the other provinces' fee below the threshold", () => {
    expect(shippingFee(FREE_SHIPPING_MIN - 1, "اصفهان")).toBe(PROVINCE_SHIPPING_FEE);
    expect(shippingFee(1, "سیستان و بلوچستان")).toBe(PROVINCE_SHIPPING_FEE);
  });

  it("is free from the threshold up, wherever it goes", () => {
    expect(shippingFee(FREE_SHIPPING_MIN, TEHRAN_PROVINCE)).toBe(0);
    expect(shippingFee(FREE_SHIPPING_MIN * 3, "یزد")).toBe(0);
  });
});

describe("IRAN_PROVINCES", () => {
  it("has Iran's 31 provinces, once each, Tehran among them", () => {
    expect(IRAN_PROVINCES).toHaveLength(31);
    expect(new Set(IRAN_PROVINCES).size).toBe(31);
    expect(IRAN_PROVINCES).toContain(TEHRAN_PROVINCE);
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
