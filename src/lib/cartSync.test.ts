import { describe, expect, it } from "vitest";
import { syncCartItems } from "./cartSync";

const whey = { id: "whey", name: "Whey", price: 100_000, imageUrl: "/whey.webp", stock: 10 };
const creatine = {
  id: "creatine",
  name: "Creatine",
  price: 40_000,
  imageUrl: "/creatine.webp",
  stock: 10,
};

describe("syncCartItems", () => {
  it("leaves an up-to-date cart as it is", () => {
    const items = [{ ...whey, quantity: 2 }];
    expect(syncCartItems(items, [whey, creatine])).toEqual({
      items,
      pricesChanged: false,
      quantitiesChanged: false,
    });
  });

  it("replaces a stale price with the catalog's and keeps the quantity", () => {
    const result = syncCartItems([{ ...whey, price: 90_000, quantity: 3 }], [whey]);
    expect(result).toEqual({
      items: [{ ...whey, quantity: 3 }],
      pricesChanged: true,
      quantitiesChanged: false,
    });
  });

  it("drops a product that is no longer in the catalog", () => {
    const result = syncCartItems(
      [
        { ...whey, quantity: 1 },
        { ...creatine, quantity: 1 },
      ],
      [whey]
    );
    expect(result).toEqual({
      items: [{ ...whey, quantity: 1 }],
      pricesChanged: false,
      quantitiesChanged: true,
    });
  });

  it("drops a product that sold out", () => {
    const result = syncCartItems([{ ...whey, quantity: 1 }], [{ ...whey, stock: 0 }]);
    expect(result).toEqual({ items: [], pricesChanged: false, quantitiesChanged: true });
  });

  it("lowers a quantity above the stock to the stock", () => {
    const result = syncCartItems([{ ...whey, quantity: 5 }], [{ ...whey, stock: 2 }]);
    expect(result).toEqual({
      items: [{ ...whey, stock: 2, quantity: 2 }],
      pricesChanged: false,
      quantitiesChanged: true,
    });
  });

  it("records the stock on a line saved before carts kept it", () => {
    const { stock, ...withoutStock } = whey;
    const result = syncCartItems([{ ...withoutStock, quantity: 1 }], [whey]);
    expect(result.items).toEqual([{ ...whey, stock, quantity: 1 }]);
  });

  it("updates a renamed product without reporting a change", () => {
    const result = syncCartItems([{ ...whey, name: "Old name", quantity: 1 }], [whey]);
    expect(result).toEqual({
      items: [{ ...whey, quantity: 1 }],
      pricesChanged: false,
      quantitiesChanged: false,
    });
  });
});
