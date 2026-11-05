import { describe, expect, it } from "vitest";
import { adminSourcesFor, allowedAdminTransitions, holdsStock, isOrderStatus } from "./orderStatus";

describe("allowedAdminTransitions", () => {
  it("lets a paid order be shipped or cancelled, whatever the payment method", () => {
    expect(allowedAdminTransitions("paid", "zarinpal")).toEqual(["shipped", "cancelled"]);
    expect(allowedAdminTransitions("paid", "card")).toEqual(["shipped", "cancelled"]);
  });

  it("lets an admin confirm or reject a card-to-card transfer", () => {
    expect(allowedAdminTransitions("awaiting_verification", "card")).toEqual(["paid", "failed"]);
  });

  it("never lets an admin mark a ZarinPal order paid", () => {
    expect(allowedAdminTransitions("pending", "zarinpal")).toEqual([]);
    expect(allowedAdminTransitions("awaiting_verification", "zarinpal")).toEqual([]);
    expect(adminSourcesFor("paid", "zarinpal")).toEqual([]);
  });

  it("lets a shipped order be delivered or come back, and a delivered one be returned", () => {
    for (const method of ["zarinpal", "card"] as const) {
      expect(allowedAdminTransitions("shipped", method)).toEqual(["delivered", "returned"]);
      expect(allowedAdminTransitions("delivered", method)).toEqual(["returned"]);
    }
  });

  it("allows nothing from final states", () => {
    for (const method of ["zarinpal", "card"] as const) {
      expect(allowedAdminTransitions("failed", method)).toEqual([]);
      expect(allowedAdminTransitions("returned", method)).toEqual([]);
      expect(allowedAdminTransitions("cancelled", method)).toEqual([]);
    }
  });
});

describe("adminSourcesFor", () => {
  it("lists the statuses an admin can reach a target from", () => {
    expect(adminSourcesFor("shipped", "zarinpal")).toEqual(["paid"]);
    expect(adminSourcesFor("cancelled", "card")).toEqual(["paid"]);
    expect(adminSourcesFor("paid", "card")).toEqual(["awaiting_verification"]);
    expect(adminSourcesFor("failed", "card")).toEqual(["awaiting_verification"]);
    expect(adminSourcesFor("delivered", "card")).toEqual(["shipped"]);
    expect(adminSourcesFor("returned", "zarinpal")).toEqual(["shipped", "delivered"]);
  });
});

describe("isOrderStatus", () => {
  it("accepts known statuses and rejects anything else", () => {
    expect(isOrderStatus("shipped")).toBe(true);
    expect(isOrderStatus("awaiting_verification")).toBe(true);
    expect(isOrderStatus("refunded")).toBe(false);
    expect(isOrderStatus("toString")).toBe(false);
    expect(isOrderStatus(42)).toBe(false);
  });
});

describe("holdsStock", () => {
  it("keeps the stock of a paid, shipped or delivered order", () => {
    expect(holdsStock("paid")).toBe(true);
    expect(holdsStock("shipped")).toBe(true);
    expect(holdsStock("delivered")).toBe(true);
  });

  it("no longer holds stock once an order fails, is cancelled or is returned", () => {
    expect(holdsStock("failed")).toBe(false);
    expect(holdsStock("cancelled")).toBe(false);
    expect(holdsStock("returned")).toBe(false);
  });
});
