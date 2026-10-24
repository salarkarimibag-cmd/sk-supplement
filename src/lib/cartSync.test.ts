import { describe, expect, it } from "vitest";
import { syncCartItems } from "./cartSync";

const whey = { id: "whey", name: "Whey", price: 100_000, imageUrl: "/whey.webp" };
const creatine = { id: "creatine", name: "Creatine", price: 40_000, imageUrl: "/creatine.webp" };

describe("syncCartItems", () => {
  it("leaves an up-to-date cart as it is", () => {
    const items = [{ ...whey, quantity: 2 }];
    expect(syncCartItems(items, [whey, creatine])).toEqual({ items, pricesChanged: false });
  });

  it("replaces a stale price with the catalog's and keeps the quantity", () => {
    const result = syncCartItems([{ ...whey, price: 90_000, quantity: 3 }], [whey]);
    expect(result).toEqual({ items: [{ ...whey, quantity: 3 }], pricesChanged: true });
  });

  it("drops a product that is no longer in the catalog", () => {
    const result = syncCartItems(
      [
        { ...whey, quantity: 1 },
        { ...creatine, quantity: 1 },
      ],
      [whey]
    );
    expect(result).toEqual({ items: [{ ...whey, quantity: 1 }], pricesChanged: true });
  });

  it("updates a renamed product without reporting a price change", () => {
    const result = syncCartItems([{ ...whey, name: "Old name", quantity: 1 }], [whey]);
    expect(result).toEqual({ items: [{ ...whey, quantity: 1 }], pricesChanged: false });
  });
});
