import { describe, expect, it } from "vitest";
import {
  buildVariantOptions,
  collapseGroups,
  formatVariantSummary,
  productGroupSchema,
  type VariantProduct,
} from "./variants";

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

describe("collapseGroups", () => {
  const whey1 = { id: "w1", groupSlug: "whey", flavor: "شکلاتی", size: "۲ کیلو" };
  const whey2 = { id: "w2", groupSlug: "whey", flavor: "وانیلی", size: "۲ کیلو" };
  const whey3 = { id: "w3", groupSlug: "whey", flavor: "شکلاتی", size: "۵ کیلو" };
  const solo = { id: "s1", flavor: "موزی" };
  const lonely = { id: "l1", groupSlug: "bcaa", flavor: "لیمو" };

  it("keeps the first member of each group, in the list's order", () => {
    expect(collapseGroups([solo, whey2, whey1, whey3]).map((p) => p.id)).toEqual(["s1", "w2"]);
  });

  it("summarizes the group's flavors and sizes on the kept card", () => {
    expect(collapseGroups([whey1, whey2, whey3])[0].variantSummary).toEqual({ flavorCount: 2, sizeCount: 2 });
  });

  it("leaves ungrouped products and one-member groups without a summary", () => {
    const result = collapseGroups([solo, lonely]);
    expect(result.map((p) => p.id)).toEqual(["s1", "l1"]);
    expect(result.every((p) => p.variantSummary === undefined)).toBe(true);
  });

  it("only summarizes the members present in the list it gets (after filtering)", () => {
    expect(collapseGroups([whey2])[0].variantSummary).toBeUndefined();
  });
});

describe("formatVariantSummary", () => {
  it("lists only the attributes with more than one choice, in Persian digits", () => {
    expect(formatVariantSummary({ flavorCount: 3, sizeCount: 2 })).toBe("۳ طعم · ۲ سایز");
    expect(formatVariantSummary({ flavorCount: 4, sizeCount: 1 })).toBe("۴ طعم");
    expect(formatVariantSummary({ flavorCount: 1, sizeCount: 1 })).toBe("");
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
