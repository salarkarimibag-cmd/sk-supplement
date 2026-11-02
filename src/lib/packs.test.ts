import { describe, expect, it } from "vitest";
import { packContentsSchema, packSavings, parsePackProductIds } from "@/lib/packs";

describe("packSavings", () => {
  const products = [
    { id: "whey", price: 2000 },
    { id: "creatine", price: 1000 },
    { id: "other", price: 9000 },
  ];

  it("compares the pack with its products' prices", () => {
    expect(packSavings({ price: 2700, packProductIds: ["whey", "creatine"] }, products)).toEqual({
      fullPrice: 3000,
      percent: 10,
    });
  });

  it("rounds the percent down", () => {
    expect(
      packSavings({ price: 2701, packProductIds: ["whey", "creatine"] }, products)?.percent
    ).toBe(9);
  });

  it("shows nothing when a product of the pack is gone", () => {
    expect(packSavings({ price: 1500, packProductIds: ["whey", "deleted"] }, products)).toBeNull();
  });

  it("shows nothing when the pack doesn't cost less", () => {
    expect(packSavings({ price: 3000, packProductIds: ["whey", "creatine"] }, products)).toBeNull();
  });

  it("shows nothing for a product that isn't a pack", () => {
    expect(packSavings({ price: 100 }, products)).toBeNull();
    expect(packSavings({ price: 100, packProductIds: [] }, products)).toBeNull();
  });
});

describe("parsePackProductIds", () => {
  it("accepts commas, Persian commas and spaces", () => {
    expect(parsePackProductIds("on1, on2،mt3  dy1")).toEqual(["on1", "on2", "mt3", "dy1"]);
  });

  it("drops repeats and turns an empty box into no ids", () => {
    expect(parsePackProductIds("on1, on1")).toEqual(["on1"]);
    expect(parsePackProductIds("  ")).toEqual([]);
  });
});

describe("packContentsSchema", () => {
  it("accepts ids, an empty list, or nothing", () => {
    expect(packContentsSchema.safeParse({ packProductIds: ["on1", "mt-3"] }).success).toBe(true);
    expect(packContentsSchema.safeParse({ packProductIds: [] }).success).toBe(true);
    expect(packContentsSchema.safeParse({}).success).toBe(true);
  });

  it("rejects anything that isn't a list of ids", () => {
    for (const packProductIds of ["on1", [5], ["وی"], [{ $ne: null }], Array(11).fill("on1")]) {
      expect(packContentsSchema.safeParse({ packProductIds }).success).toBe(false);
    }
  });
});
