import { describe, expect, it } from "vitest";
import { priceCart } from "./pricing";

const products = [
  { id: "whey", name: "Whey", price: 100_000, stock: 5 },
  { id: "creatine", name: "Creatine", price: 40_000, stock: 1 },
];

describe("priceCart", () => {
  it("prices every line from the catalog and sums the subtotal", () => {
    const result = priceCart(
      [
        { productId: "whey", quantity: 2 },
        { productId: "creatine", quantity: 1 },
      ],
      products
    );

    expect(result).toEqual({
      ok: true,
      items: [
        { productId: "whey", quantity: 2, unitPrice: 100_000 },
        { productId: "creatine", quantity: 1, unitPrice: 40_000 },
      ],
      subtotal: 240_000,
    });
  });

  it("rejects a product that no longer exists", () => {
    const result = priceCart([{ productId: "deleted", quantity: 1 }], products);
    expect(result.ok).toBe(false);
  });

  it("rejects a quantity larger than the stock", () => {
    const result = priceCart([{ productId: "creatine", quantity: 2 }], products);
    expect(result).toEqual({ ok: false, message: "موجودی «Creatine» کافی نیست." });
  });
});
