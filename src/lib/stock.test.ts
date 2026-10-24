import { describe, expect, it } from "vitest";
import { capToStock, remainingToAdd } from "./stock";

describe("remainingToAdd", () => {
  it("is the stock minus what's already in the cart", () => {
    expect(remainingToAdd(10, 3)).toBe(7);
  });

  it("is the whole stock when none is in the cart", () => {
    expect(remainingToAdd(4, 0)).toBe(4);
  });

  it("never goes below zero, even if the cart holds more than the stock", () => {
    expect(remainingToAdd(2, 2)).toBe(0);
    expect(remainingToAdd(2, 5)).toBe(0);
    expect(remainingToAdd(-1, 0)).toBe(0);
  });
});

describe("capToStock", () => {
  it("keeps a quantity within the stock", () => {
    expect(capToStock(3, 5)).toBe(3);
    expect(capToStock(5, 5)).toBe(5);
  });

  it("lowers a quantity above the stock to the stock", () => {
    expect(capToStock(6, 5)).toBe(5);
  });

  it("leaves the quantity alone when the stock isn't known", () => {
    expect(capToStock(6, undefined)).toBe(6);
  });
});
