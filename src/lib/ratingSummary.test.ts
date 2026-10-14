import { describe, expect, it } from "vitest";
import { toRatingSummary } from "./ratingSummary";

describe("toRatingSummary", () => {
  it("gives no rating when the product has no approved reviews", () => {
    expect(toRatingSummary(undefined)).toEqual({ rating: 0, reviewCount: 0 });
    expect(toRatingSummary({ average: 0, count: 0 })).toEqual({ rating: 0, reviewCount: 0 });
  });

  it("rounds the average to one decimal", () => {
    expect(toRatingSummary({ average: 13 / 3, count: 3 })).toEqual({ rating: 4.3, reviewCount: 3 });
    expect(toRatingSummary({ average: 4.75, count: 4 })).toEqual({ rating: 4.8, reviewCount: 4 });
  });

  it("keeps whole ratings as they are", () => {
    expect(toRatingSummary({ average: 5, count: 1 })).toEqual({ rating: 5, reviewCount: 1 });
  });
});
