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

describe("pickShowcaseProducts", () => {
  it("keeps only products of the category that have a real photo", () => {
    const products = [
      makeProduct({ id: "a", brand: "A" }),
      makeProduct({ id: "b", brand: "B", imageUrl: PLACEHOLDER_IMAGE }),
      makeProduct({ id: "c", brand: "C", categorySlug: "aminos" }),
    ];
    expect(pickShowcaseProducts(products, "protein", 3).map((p) => p.id)).toEqual(["a"]);
  });

  it("takes one product per brand, best sellers first", () => {
    const products = [
      makeProduct({ id: "a1", brand: "A", salesCount: 5 }),
      makeProduct({ id: "a2", brand: "A", salesCount: 9 }),
      makeProduct({ id: "b1", brand: "B", salesCount: 7 }),
    ];
    expect(pickShowcaseProducts(products, "protein", 3).map((p) => p.id)).toEqual(["a2", "b1"]);
  });

  it("stops at the limit and looks at every category when given null", () => {
    const products = [
      makeProduct({ id: "a", brand: "A", salesCount: 3 }),
      makeProduct({ id: "b", brand: "B", salesCount: 2, categorySlug: "aminos" }),
      makeProduct({ id: "c", brand: "C", salesCount: 1, categorySlug: "vitamins" }),
    ];
    expect(pickShowcaseProducts(products, null, 2).map((p) => p.id)).toEqual(["a", "b"]);
  });
});
