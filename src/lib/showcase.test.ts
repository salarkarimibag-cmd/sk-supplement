import { describe, expect, it } from "vitest";
import { PLACEHOLDER_IMAGE, pickShowcaseProducts, shuffle } from "./showcase";
import type { CatalogProduct } from "@/data/catalog";

function makeProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: "p1",
    slug: "p1",
    name: "محصول",
    description: "",
    price: 100,
    categorySlug: "protein",
    imageUrl: "/images/products/p1.webp",
    stock: 1,
    inStock: true,
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    ...overrides,
  } as CatalogProduct;
}

const isProtein = (product: CatalogProduct) => product.categorySlug === "protein";

// With random() just under 1, the shuffle swaps every item with itself, so
// the products keep their given order and the picking rules can be checked.
const keepOrder = () => 0.999999;

describe("shuffle", () => {
  it("keeps every item exactly once", () => {
    expect(shuffle([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("reorders the items depending on the random numbers", () => {
    expect(shuffle([1, 2, 3], keepOrder)).toEqual([1, 2, 3]);
    expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
  });

  it("doesn't change the original array", () => {
    const items = [1, 2, 3];
    shuffle(items, () => 0);
    expect(items).toEqual([1, 2, 3]);
  });
});

describe("pickShowcaseProducts", () => {
  it("keeps only matching products that have a real photo", () => {
    const products = [
      makeProduct({ id: "a", brand: "A" }),
      makeProduct({ id: "b", brand: "B", imageUrl: PLACEHOLDER_IMAGE }),
      makeProduct({ id: "c", brand: "C", categorySlug: "aminos" }),
    ];
    expect(pickShowcaseProducts(products, isProtein, 3, keepOrder).map((p) => p.id)).toEqual(["a"]);
  });

  it("shows one product of each brand before a second product of any brand", () => {
    const products = [
      makeProduct({ id: "a1", brand: "A" }),
      makeProduct({ id: "a2", brand: "A" }),
      makeProduct({ id: "b1", brand: "B" }),
    ];
    expect(pickShowcaseProducts(products, isProtein, 3, keepOrder).map((p) => p.id)).toEqual([
      "a1",
      "b1",
      "a2",
    ]);
  });

  it("never shows two flavors of the same product", () => {
    const products = [
      makeProduct({ id: "a1", brand: "A", groupSlug: "whey" }),
      makeProduct({ id: "a2", brand: "A", groupSlug: "whey" }),
      makeProduct({ id: "a3", brand: "A" }),
    ];
    expect(pickShowcaseProducts(products, isProtein, 3, keepOrder).map((p) => p.id)).toEqual([
      "a1",
      "a3",
    ]);
  });

  it("stops at the limit", () => {
    const products = ["a", "b", "c"].map((id) => makeProduct({ id, brand: id }));
    expect(pickShowcaseProducts(products, () => true, 2)).toHaveLength(2);
  });
});
