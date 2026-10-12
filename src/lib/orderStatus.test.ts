import { describe, expect, it } from "vitest";
import { adminSourcesFor, allowedAdminTransitions, isOrderStatus } from "./orderStatus";

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

  it("allows nothing from final states", () => {
    for (const method of ["zarinpal", "card"] as const) {
      expect(allowedAdminTransitions("failed", method)).toEqual([]);
      expect(allowedAdminTransitions("shipped", method)).toEqual([]);
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
