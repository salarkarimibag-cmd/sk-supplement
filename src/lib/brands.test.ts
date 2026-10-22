import { describe, expect, it } from "vitest";
import { brandLabel } from "./brands";

describe("brandLabel", () => {
  it("returns the Persian name of a known brand", () => {
    expect(brandLabel("Optimum Nutrition")).toBe("اپتیموم نوتریشن");
  });

  it("falls back to the stored name for an unknown brand", () => {
    expect(brandLabel("New Brand")).toBe("New Brand");
  });
});
