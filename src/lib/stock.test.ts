import { describe, expect, it } from "vitest";
import {
  capQuantity,
  expandStockLines,
  MAX_PER_ORDER,
  orderLimit,
  remainingToAdd,
} from "./stock";

describe("expandStockLines", () => {
  it("leaves ordinary lines as they are", () => {
    expect(
      expandStockLines([
        { productId: "whey", quantity: 2 },
        { productId: "bcaa", quantity: 1, packProductIds: null },
      ])
    ).toEqual([
      { productId: "whey", quantity: 2 },
      { productId: "bcaa", quantity: 1 },
    ]);
  });

  it("moves a pack and one of each product inside it, per pack", () => {
    expect(
      expandStockLines([{ productId: "pack", quantity: 2, packProductIds: ["whey", "creatine"] }])
    ).toEqual([
      { productId: "pack", quantity: 2 },
      { productId: "whey", quantity: 2 },
      { productId: "creatine", quantity: 2 },
    ]);
  });

  it("adds up a product that's both in a pack and bought on its own", () => {
    expect(
      expandStockLines([
        { productId: "pack", quantity: 1, packProductIds: ["whey"] },
        { productId: "whey", quantity: 3 },
      ])
    ).toEqual([
      { productId: "pack", quantity: 1 },
      { productId: "whey", quantity: 4 },
    ]);
  });
});

describe("orderLimit", () => {
  it("is the stock when it's below MAX_PER_ORDER", () => {
    expect(orderLimit(3)).toBe(3);
  });

  it("is MAX_PER_ORDER when the stock is larger", () => {
    expect(orderLimit(50)).toBe(MAX_PER_ORDER);
  });

  it("is MAX_PER_ORDER when the stock isn't known", () => {
    expect(orderLimit(undefined)).toBe(MAX_PER_ORDER);
  });
});

describe("remainingToAdd", () => {
  it("is the stock minus what's already in the cart", () => {
    expect(remainingToAdd(8, 3)).toBe(5);
  });

  it("is the whole stock when none is in the cart", () => {
    expect(remainingToAdd(4, 0)).toBe(4);
  });

  it("counts against MAX_PER_ORDER when the stock is larger", () => {
    expect(remainingToAdd(50, 0)).toBe(MAX_PER_ORDER);
    expect(remainingToAdd(50, MAX_PER_ORDER - 3)).toBe(3);
    expect(remainingToAdd(50, MAX_PER_ORDER)).toBe(0);
  });

  it("never goes below zero, even if the cart holds more than the stock", () => {
    expect(remainingToAdd(2, 2)).toBe(0);
    expect(remainingToAdd(2, 5)).toBe(0);
    expect(remainingToAdd(-1, 0)).toBe(0);
  });
});

describe("capQuantity", () => {
  it("keeps a quantity within the stock", () => {
    expect(capQuantity(3, 5)).toBe(3);
    expect(capQuantity(5, 5)).toBe(5);
  });

  it("lowers a quantity above the stock to the stock", () => {
    expect(capQuantity(6, 5)).toBe(5);
  });

  it("lowers a quantity above MAX_PER_ORDER to it, even when stock allows more", () => {
    expect(capQuantity(25, 50)).toBe(MAX_PER_ORDER);
  });

  it("holds an unknown stock to MAX_PER_ORDER only", () => {
    expect(capQuantity(6, undefined)).toBe(6);
    expect(capQuantity(25, undefined)).toBe(MAX_PER_ORDER);
  });
});
