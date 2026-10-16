import { describe, expect, it } from "vitest";
import { buildVariantOptions, productGroupSchema, type VariantProduct } from "./variants";

const chocSmall: VariantProduct = { id: "p1", flavor: "شکلاتی", size: "۲ کیلو", inStock: true };
const vanSmall: VariantProduct = { id: "p2", flavor: "وانیلی", size: "۲ کیلو", inStock: true };
const chocLarge: VariantProduct = { id: "p3", flavor: "شکلاتی", size: "۵ کیلو", inStock: true };
const group = [chocLarge, vanSmall, chocSmall];

describe("buildVariantOptions", () => {
  it("lists each flavor and size once, sorted, with the current ones selected", () => {
    const { flavors, sizes } = buildVariantOptions(chocSmall, group);
    expect(flavors.map((o) => [o.value, o.selected])).toEqual([
      ["شکلاتی", true],
      ["وانیلی", false],
    ]);
    expect(sizes.map((o) => [o.value, o.selected])).toEqual([
      ["۲ کیلو", true],
      ["۵ کیلو", false],
    ]);
  });

  it("sorts sizes by number, Persian digits included", () => {
    const tenKilo: VariantProduct = { id: "p7", flavor: "شکلاتی", size: "۱۰ کیلو", inStock: true };
    const { sizes } = buildVariantOptions(chocSmall, [tenKilo, chocLarge, chocSmall]);
    expect(sizes.map((o) => o.value)).toEqual(["۲ کیلو", "۵ کیلو", "۱۰ کیلو"]);
  });

  it("keeps the current size when switching flavor", () => {
    const vanilla = buildVariantOptions(chocSmall, group).flavors.find((o) => o.value === "وانیلی");
    expect(vanilla?.productId).toBe("p2");
  });

  it("keeps the current flavor when switching size", () => {
    const large = buildVariantOptions(chocSmall, group).sizes.find((o) => o.value === "۵ کیلو");
    expect(large?.productId).toBe("p3");
  });

  it("falls back to another size when the combination doesn't exist", () => {
    // From chocolate 5 kg, vanilla only exists in 2 kg.
    const vanilla = buildVariantOptions(chocLarge, group).flavors.find((o) => o.value === "وانیلی");
    expect(vanilla?.productId).toBe("p2");
  });

  it("prefers an in-stock product when falling back", () => {
    const vanLargeOut: VariantProduct = { id: "p4", flavor: "وانیلی", size: "۱۰ کیلو", inStock: false };
    const vanMediumIn: VariantProduct = { id: "p5", flavor: "وانیلی", size: "۳ کیلو", inStock: true };
    const vanilla = buildVariantOptions(chocLarge, [chocLarge, vanLargeOut, vanMediumIn]).flavors.find(
      (o) => o.value === "وانیلی"
    );
    expect(vanilla?.productId).toBe("p5");
  });

  it("marks an option unavailable when its product is out of stock", () => {
    const outOfStock = { ...vanSmall, inStock: false };
    const vanilla = buildVariantOptions(chocSmall, [chocSmall, outOfStock]).flavors.find(
      (o) => o.value === "وانیلی"
    );
    expect(vanilla?.available).toBe(false);
  });

  it("ignores products without the attribute", () => {
    const noSize: VariantProduct = { id: "p6", flavor: "موزی", inStock: true };
    expect(buildVariantOptions(chocSmall, [chocSmall, noSize]).sizes.map((o) => o.value)).toEqual(["۲ کیلو"]);
  });
});

describe("productGroupSchema", () => {
  it("accepts lowercase hyphenated slugs and an empty string", () => {
    expect(productGroupSchema.safeParse({ groupSlug: "whey-isolate" }).success).toBe(true);
    expect(productGroupSchema.safeParse({ groupSlug: "" }).success).toBe(true);
    expect(productGroupSchema.safeParse({}).success).toBe(true);
  });

  it("rejects spaces, capitals, stray hyphens and non-strings", () => {
    for (const groupSlug of ["whey isolate", "Whey", "-whey", "whey--iso", "وی", 5]) {
      expect(productGroupSchema.safeParse({ groupSlug }).success).toBe(false);
    }
  });
});
