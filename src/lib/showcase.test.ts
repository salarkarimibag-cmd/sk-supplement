import { describe, expect, it } from "vitest";
import {
  PLACEHOLDER_IMAGE,
  pickBlurb,
  pickShowcaseProducts,
  shuffle,
  splitProductName,
} from "./showcase";
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

  it("gives each picked product its short text", () => {
    const products = [makeProduct({ id: "a", brand: "A", manufacturerClaims: "۲۵ گرم پروتئین" })];
    expect(pickShowcaseProducts(products, () => true, 1)[0].blurb).toEqual({
      lines: ["۲۵ گرم پروتئین"],
      fromMaker: true,
    });
  });
});

describe("pickBlurb", () => {
  it("shows the maker's first three short claims, marked as the maker's", () => {
    expect(
      pickBlurb({
        manufacturerClaims: "\n  ۲۵ گرم پروتئین  \nبدون قند\nبا ویتامین\nبدون طعم",
        description: "توضیح فروشگاه.",
      })
    ).toEqual({ lines: ["۲۵ گرم پروتئین", "بدون قند", "با ویتامین"], fromMaker: true });
  });

  it("skips legal small print and claims that are too long", () => {
    expect(
      pickBlurb({
        manufacturerClaims: `این ادعا توسط FDA ارزیابی نشده است\n${"کلمه ".repeat(30)}\n۵ گرم کراتین`,
        description: "",
      })
    ).toEqual({ lines: ["۵ گرم کراتین"], fromMaker: true });
  });

  it("falls back to the first sentence of the description", () => {
    expect(pickBlurb({ description: "پروتئین وی خالص. مناسب بعد از تمرین." })).toEqual({
      lines: ["پروتئین وی خالص"],
      fromMaker: false,
    });
  });

  it("falls back to the description when every claim is skipped", () => {
    expect(
      pickBlurb({ manufacturerClaims: "ادعای سلامت مورد تأیید اتحادیه‌ی اروپا", description: "توضیح." })
    ).toEqual({ lines: ["توضیح"], fromMaker: false });
  });

  it("doesn't cut a sentence at a decimal point", () => {
    expect(pickBlurb({ description: "هر اسکوپ ۲.۵ گرم کراتین دارد." })?.lines).toEqual([
      "هر اسکوپ ۲.۵ گرم کراتین دارد",
    ]);
  });

  it("shortens a long description at a word boundary", () => {
    const line = pickBlurb({ description: "کلمه ".repeat(60) })!.lines[0];
    expect(line.endsWith("…")).toBe(true);
    expect(line.length).toBeLessThanOrEqual(111);
  });

  it("returns nothing when there is no text", () => {
    expect(pickBlurb({ description: "  " })).toBeUndefined();
  });
});

describe("splitProductName", () => {
  it("splits the Persian title from the English name", () => {
    expect(splitProductName("مولتی ویتامین آقایان - Opti-Men")).toEqual({
      title: "مولتی ویتامین آقایان",
      subtitle: "Opti-Men",
    });
  });

  it("drops the invisible direction mark before the English name", () => {
    const lrm = String.fromCharCode(0x200e);
    expect(splitProductName(`کراتین مونوهیدرات - ${lrm}100% Creatine Monohydrate`)).toEqual({
      title: "کراتین مونوهیدرات",
      subtitle: "100% Creatine Monohydrate",
    });
  });

  it("splits only at the first separator", () => {
    expect(splitProductName("الف - B - C")).toEqual({ title: "الف", subtitle: "B - C" });
  });

  it("returns a name without a separator whole", () => {
    expect(splitProductName("Opti-Men")).toEqual({ title: "Opti-Men" });
    expect(splitProductName("الف - ")).toEqual({ title: "الف - " });
  });
});
