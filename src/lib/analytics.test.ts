import { describe, expect, it } from "vitest";
import { sanitizeAnalyticsUrl } from "./analytics";

describe("sanitizeAnalyticsUrl", () => {
  it("keeps ordinary pages, query string included", () => {
    expect(sanitizeAnalyticsUrl("https://shop.example/search?q=whey")).toBe(
      "https://shop.example/search?q=whey"
    );
  });

  it("removes the reset token from the reset-password page", () => {
    expect(
      sanitizeAnalyticsUrl(`https://shop.example/account/reset-password?token=${"a".repeat(64)}`)
    ).toBe("https://shop.example/account/reset-password");
  });

  it("removes the payment authority from the checkout callback", () => {
    expect(
      sanitizeAnalyticsUrl("https://shop.example/checkout/callback?Authority=A000123&Status=OK")
    ).toBe("https://shop.example/checkout/callback");
  });

  it("drops admin page views entirely", () => {
    expect(sanitizeAnalyticsUrl("https://shop.example/admin")).toBeNull();
    expect(sanitizeAnalyticsUrl("https://shop.example/admin/orders?status=paid")).toBeNull();
  });

  it("doesn't mistake a lookalike path for an admin page", () => {
    expect(sanitizeAnalyticsUrl("https://shop.example/administration-tips")).toBe(
      "https://shop.example/administration-tips"
    );
  });
});
