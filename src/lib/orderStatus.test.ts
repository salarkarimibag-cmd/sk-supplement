import { describe, expect, it } from "vitest";
import { adminSourcesFor, allowedAdminTransitions, isOrderStatus } from "./orderStatus";

describe("allowedAdminTransitions", () => {
  it("lets a paid order be shipped or cancelled", () => {
    expect(allowedAdminTransitions("paid")).toEqual(["shipped", "cancelled"]);
  });

  it("allows nothing from states owned by the payment flow or already final", () => {
    expect(allowedAdminTransitions("pending")).toEqual([]);
    expect(allowedAdminTransitions("failed")).toEqual([]);
    expect(allowedAdminTransitions("shipped")).toEqual([]);
    expect(allowedAdminTransitions("cancelled")).toEqual([]);
  });
});

describe("adminSourcesFor", () => {
  it("lists the statuses an admin can reach a target from", () => {
    expect(adminSourcesFor("shipped")).toEqual(["paid"]);
    expect(adminSourcesFor("cancelled")).toEqual(["paid"]);
    expect(adminSourcesFor("paid")).toEqual([]);
  });
});

describe("isOrderStatus", () => {
  it("accepts known statuses and rejects anything else", () => {
    expect(isOrderStatus("shipped")).toBe(true);
    expect(isOrderStatus("refunded")).toBe(false);
    expect(isOrderStatus("toString")).toBe(false);
    expect(isOrderStatus(42)).toBe(false);
  });
});
