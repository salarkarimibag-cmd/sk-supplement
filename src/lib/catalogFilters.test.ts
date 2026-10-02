import { describe, expect, it } from "vitest";
import { countByAttribute, filterProducts, sortProducts, toParamArray } from "./catalogFilters";
import type { CatalogProduct } from "@/data/catalog";

function makeProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: "p1",
    slug: "p1",
    name: "محصول",
    description: "",
    price: 100,
    categorySlug: "protein",
    imageUrl: "/images/p1.webp",
    stock: 1,
    inStock: true,
    rating: 0,
    reviewCount: 0,
    ...overrides,
  } as CatalogProduct;
}

describe("sortProducts", () => {
  const products = [
    makeProduct({ id: "a", name: "ب", price: 300, reviewCount: 1 }),
    makeProduct({ id: "b", name: "آ", price: 100, reviewCount: 5 }),
    makeProduct({ id: "c", name: "پ", price: 200, reviewCount: 3 }),
  ];

  it("sorts by price ascending", () => {
    expect(sortProducts(products, "price-asc").map((p) => p.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts by price descending", () => {
    expect(sortProducts(products, "price-desc").map((p) => p.id)).toEqual(["a", "c", "b"]);
  });

  it("sorts featured (default) by review count descending", () => {
    expect(sortProducts(products, "featured").map((p) => p.id)).toEqual(["b", "c", "a"]);
  });

  it("falls back to featured ordering for an unknown sort value", () => {
    expect(sortProducts(products, "bogus").map((p) => p.id)).toEqual(["b", "c", "a"]);
  });

  it("does not mutate the original array", () => {
    const original = [...products];
    sortProducts(products, "price-asc");
    expect(products).toEqual(original);
  });
});

describe("filterProducts", () => {
  const products = [
    makeProduct({ id: "a", flavor: "شکلاتی", size: "1kg" }),
    makeProduct({ id: "b", flavor: "وانیلی", size: "2kg" }),
    makeProduct({ id: "c", flavor: "شکلاتی", size: "2kg" }),
  ];

  it("returns everything when no filters are given", () => {
    expect(filterProducts(products, { flavors: [], sizes: [] })).toHaveLength(3);
  });

  it("filters by flavor", () => {
    const result = filterProducts(products, { flavors: ["شکلاتی"], sizes: [] });
    expect(result.map((p) => p.id)).toEqual(["a", "c"]);
  });

  it("filters by flavor AND size together", () => {
    const result = filterProducts(products, { flavors: ["شکلاتی"], sizes: ["2kg"] });
    expect(result.map((p) => p.id)).toEqual(["c"]);
  });

  it("excludes products missing the filtered attribute", () => {
    const noFlavor = [makeProduct({ id: "d", flavor: undefined })];
    expect(filterProducts(noFlavor, { flavors: ["شکلاتی"], sizes: [] })).toHaveLength(0);
  });
});

describe("toParamArray", () => {
  it("wraps a single string in an array", () => {
    expect(toParamArray("a")).toEqual(["a"]);
  });

  it("passes an array through unchanged", () => {
    expect(toParamArray(["a", "b"])).toEqual(["a", "b"]);
  });

  it("returns an empty array for undefined", () => {
    expect(toParamArray(undefined)).toEqual([]);
  });
});

describe("countByAttribute", () => {
  it("counts distinct flavor values", () => {
    const products = [
      makeProduct({ flavor: "شکلاتی" }),
      makeProduct({ flavor: "شکلاتی" }),
      makeProduct({ flavor: "وانیلی" }),
    ];
    expect(countByAttribute(products, "flavor")).toEqual([
      { value: "شکلاتی", count: 2 },
      { value: "وانیلی", count: 1 },
    ]);
  });

  it("ignores products without the attribute", () => {
    const products = [makeProduct({ flavor: undefined }), makeProduct({ flavor: "وانیلی" })];
    expect(countByAttribute(products, "flavor")).toEqual([{ value: "وانیلی", count: 1 }]);
  });
});
