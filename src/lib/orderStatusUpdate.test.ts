import { describe, expect, it } from "vitest";
import { adminOrderUpdateSchema, orderStatusUpdate } from "./orderStatusUpdate";

describe("adminOrderUpdateSchema", () => {
  it("accepts a plain status change", () => {
    expect(adminOrderUpdateSchema.parse({ status: "delivered" })).toEqual({ status: "delivered" });
  });

  it("rejects unknown statuses and bodies that aren't objects", () => {
    expect(adminOrderUpdateSchema.safeParse({ status: "refunded" }).success).toBe(false);
    expect(adminOrderUpdateSchema.safeParse({ status: "toString" }).success).toBe(false);
    expect(adminOrderUpdateSchema.safeParse(null).success).toBe(false);
  });

  it("cleans a pasted tracking code: Persian digits, spaces", () => {
    const body = adminOrderUpdateSchema.parse({
      status: "shipped",
      trackingCode: " ۱۲۳۴ ۵۶۷۸ 9012 ",
    });
    expect(body.trackingCode).toBe("123456789012");
  });

  it("allows shipping without a tracking code", () => {
    expect(adminOrderUpdateSchema.parse({ status: "shipped", trackingCode: "  " }).trackingCode).toBe(
      ""
    );
  });

  it("rejects a tracking code with odd characters or the wrong length", () => {
    for (const trackingCode of ["<script>", "12", "1".repeat(41), "abc/123"]) {
      expect(adminOrderUpdateSchema.safeParse({ status: "shipped", trackingCode }).success).toBe(
        false
      );
    }
  });

  it("requires a return to say whether its items go back into stock", () => {
    expect(adminOrderUpdateSchema.safeParse({ status: "returned" }).success).toBe(false);
    expect(adminOrderUpdateSchema.safeParse({ status: "returned", restock: "yes" }).success).toBe(
      false
    );
    expect(adminOrderUpdateSchema.safeParse({ status: "returned", restock: false }).success).toBe(
      true
    );
  });
});

describe("orderStatusUpdate", () => {
  const now = new Date("2026-11-05T10:00:00Z");

  it("dates a shipment and keeps its tracking code", () => {
    expect(orderStatusUpdate({ status: "shipped", trackingCode: "ABC12345" }, now)).toEqual({
      status: "shipped",
      stockReserved: true,
      shippedAt: now,
      shipmentTrackingCode: "ABC12345",
    });
  });

  it("leaves an empty tracking code out", () => {
    expect(orderStatusUpdate({ status: "shipped", trackingCode: "" }, now)).toEqual({
      status: "shipped",
      stockReserved: true,
      shippedAt: now,
    });
  });

  it("dates a delivery", () => {
    expect(orderStatusUpdate({ status: "delivered" }, now)).toEqual({
      status: "delivered",
      stockReserved: true,
      deliveredAt: now,
    });
  });

  it("dates a return and records the restock choice", () => {
    expect(orderStatusUpdate({ status: "returned", restock: false }, now)).toEqual({
      status: "returned",
      stockReserved: false,
      returnedAt: now,
      returnRestocked: false,
    });
  });

  it("ignores a tracking code or restock sent with another status", () => {
    expect(
      orderStatusUpdate({ status: "cancelled", trackingCode: "ABC12345", restock: true }, now)
    ).toEqual({ status: "cancelled", stockReserved: false });
  });
});
