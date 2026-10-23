import { describe, expect, it } from "vitest";
import { PLACEHOLDER_IMAGE, pickShowcaseProducts } from "./showcase";
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

describe("pickShowcaseProducts", () => {
  it("keeps only matching products that have a real photo", () => {
    const products = [
      makeProduct({ id: "a", brand: "A" }),
      makeProduct({ id: "b", brand: "B", imageUrl: PLACEHOLDER_IMAGE }),
      makeProduct({ id: "c", brand: "C", categorySlug: "aminos" }),
    ];
    expect(pickShowcaseProducts(products, isProtein, 3).map((p) => p.id)).toEqual(["a"]);
  });

  it("shows each brand's best seller before a second product of any brand", () => {
    const products = [
      makeProduct({ id: "a1", brand: "A", salesCount: 9 }),
      makeProduct({ id: "a2", brand: "A", salesCount: 8 }),
      makeProduct({ id: "b1", brand: "B", salesCount: 1 }),
    ];
    expect(pickShowcaseProducts(products, isProtein, 3).map((p) => p.id)).toEqual([
      "a1",
      "b1",
      "a2",
    ]);
  });

  it("never shows two flavors of the same product", () => {
    const products = [
      makeProduct({ id: "a1", brand: "A", groupSlug: "whey", salesCount: 9 }),
      makeProduct({ id: "a2", brand: "A", groupSlug: "whey", salesCount: 8 }),
      makeProduct({ id: "a3", brand: "A", salesCount: 1 }),
    ];
    expect(pickShowcaseProducts(products, isProtein, 3).map((p) => p.id)).toEqual(["a1", "a3"]);
  });

  it("stops at the limit", () => {
    const products = ["a", "b", "c"].map((id) => makeProduct({ id, brand: id }));
    expect(pickShowcaseProducts(products, () => true, 2)).toHaveLength(2);
  });
});
