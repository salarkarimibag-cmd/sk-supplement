import { describe, expect, it } from "vitest";
import { amountUntilFreeShipping, FREE_SHIPPING_MIN, SHIPPING_FEE, shippingFee } from "./shipping";

describe("shippingFee", () => {
  it("charges the fee below the threshold", () => {
    expect(shippingFee(FREE_SHIPPING_MIN - 1)).toBe(SHIPPING_FEE);
    expect(shippingFee(1)).toBe(SHIPPING_FEE);
  });

  it("is free from the threshold up", () => {
    expect(shippingFee(FREE_SHIPPING_MIN)).toBe(0);
    expect(shippingFee(FREE_SHIPPING_MIN * 3)).toBe(0);
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
