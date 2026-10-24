import { describe, expect, it } from "vitest";
import {
  productCreateSchema,
  productInputErrorMessage,
  productUpdateSchema,
} from "./productInput";

const validProduct = {
  id: "on-whey-2lb",
  name: "وی گلد استاندارد",
  slug: "on-gold-standard-whey",
  description: "",
  price: 2_450_000,
  categorySlug: "protein",
  imageUrl: "/images/products/on-whey.webp",
  stock: 0,
  flavor: "",
  size: "",
};

function errorFor(input: unknown) {
  const result = productCreateSchema.safeParse(input);
  return result.success ? null : productInputErrorMessage(result.error);
}

describe("productCreateSchema", () => {
  it("accepts a valid product, with stock 0 allowed", () => {
    expect(productCreateSchema.safeParse(validProduct).success).toBe(true);
  });

  it("rejects a missing, zero, negative, fractional or non-number price", () => {
    for (const price of [undefined, 0, -1000, 99.5, "1000", null]) {
      expect(errorFor({ ...validProduct, price })).toContain("قیمت");
    }
  });

  it("rejects a negative, fractional or non-number stock", () => {
    for (const stock of [-1, 1.5, "5"]) {
      expect(errorFor({ ...validProduct, stock })).toContain("موجودی");
    }
  });

  it("rejects an id or slug that isn't lowercase-hyphenated", () => {
    expect(errorFor({ ...validProduct, id: "On Whey" })).toContain("شناسه");
    expect(errorFor({ ...validProduct, slug: "وی-گلد" })).toContain("اسلاگ");
    expect(errorFor({ ...validProduct, slug: { $ne: null } })).toContain("اسلاگ");
  });

  it("rejects an image path that doesn't start with /", () => {
    expect(errorFor({ ...validProduct, imageUrl: "images/x.webp" })).toContain("تصویر");
    expect(errorFor({ ...validProduct, imageUrl: "https://example.com/x.webp" })).toContain("تصویر");
  });

  it("gives a general message for a body that isn't an object", () => {
    expect(errorFor(null)).toBe("اطلاعات محصول نامعتبر است.");
  });
});

describe("productUpdateSchema", () => {
  it("accepts any subset of the fields and leaves the rest out", () => {
    const result = productUpdateSchema.safeParse({ price: 3_000_000 });
    expect(result.success && result.data).toEqual({ price: 3_000_000 });
  });

  it("still checks the fields that are sent", () => {
    expect(productUpdateSchema.safeParse({ price: -5 }).success).toBe(false);
    expect(productUpdateSchema.safeParse({ name: "" }).success).toBe(false);
  });
});
