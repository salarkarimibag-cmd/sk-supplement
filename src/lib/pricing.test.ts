import { describe, expect, it } from "vitest";
import { discountableSubtotal, priceCart } from "./pricing";
import { MAX_PER_ORDER } from "./stock";

const products = [
  { id: "whey", name: "Whey", price: 100_000, stock: 5 },
  { id: "creatine", name: "Creatine", price: 40_000, stock: 1 },
];

describe("discountableSubtotal", () => {
  const catalog = [...products, { id: "pack", price: 120_000, packProductIds: ["whey"] }];

  it("adds up ordinary products, by quantity", () => {
    const lines = [
      { productId: "whey", quantity: 2 },
      { productId: "creatine", quantity: 1 },
    ];
    expect(discountableSubtotal(lines, catalog)).toBe(240_000);
  });

  it("leaves combo packs out", () => {
    const lines = [
      { productId: "pack", quantity: 3 },
      { productId: "whey", quantity: 1 },
    ];
    expect(discountableSubtotal(lines, catalog)).toBe(100_000);
  });

  it("is zero for a cart of only packs, or of products that are gone", () => {
    expect(discountableSubtotal([{ productId: "pack", quantity: 1 }], catalog)).toBe(0);
    expect(discountableSubtotal([{ productId: "deleted", quantity: 1 }], catalog)).toBe(0);
  });
});

describe("priceCart", () => {
  it("saves what a combo pack contains on its line", () => {
    const pack = { id: "pack", name: "Pack", price: 120_000, stock: 2, packProductIds: ["whey"] };
    const result = priceCart([{ productId: "pack", quantity: 1 }], [pack]);
    expect(result.ok && result.items).toEqual([
      { productId: "pack", quantity: 1, unitPrice: 120_000, packProductIds: ["whey"] },
    ]);
  });

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

  it("rejects the same product split across lines to dodge the stock check", () => {
    const result = priceCart(
      [
        { productId: "whey", quantity: 3 },
        { productId: "whey", quantity: 3 },
      ],
      products
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a quantity larger than the stock", () => {
    const result = priceCart([{ productId: "creatine", quantity: 2 }], products);
    expect(result).toEqual({ ok: false, message: "موجودی «Creatine» کافی نیست." });
  });

  it("rejects more than MAX_PER_ORDER of one product, even when stock allows it", () => {
    const plenty = [{ id: "whey", name: "Whey", price: 100_000, stock: 50 }];
    expect(priceCart([{ productId: "whey", quantity: MAX_PER_ORDER }], plenty).ok).toBe(true);
    expect(priceCart([{ productId: "whey", quantity: MAX_PER_ORDER + 1 }], plenty)).toEqual({
      ok: false,
      message: "از هر محصول حداکثر ۱۰ عدد در هر سفارش می‌توان خرید.",
    });
  });
});
