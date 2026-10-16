import { describe, expect, it } from "vitest";
import { remainingToAdd } from "./stock";

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
