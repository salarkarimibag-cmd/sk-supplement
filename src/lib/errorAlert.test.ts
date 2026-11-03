import { describe, expect, it } from "vitest";
import { buildErrorAlert, errorAlertKey, shouldSendAlert } from "./errorAlert";

const error = {
  message: "connection refused",
  digest: "123",
  path: "/products/dy3",
  method: "GET",
  routePath: "/products/[id]",
  routeType: "render",
};
const HOUR = 60 * 60 * 1000;

describe("shouldSendAlert", () => {
  it("allows the first alert, then one per hour", () => {
    const sent = new Map<string, number>();
    expect(shouldSendAlert("a", 0, sent)).toBe(true);
    expect(shouldSendAlert("a", HOUR - 1, sent)).toBe(false);
    expect(shouldSendAlert("a", HOUR, sent)).toBe(true);
  });

  it("counts each error on its own", () => {
    const sent = new Map<string, number>();
    expect(shouldSendAlert("a", 0, sent)).toBe(true);
    expect(shouldSendAlert("b", 1, sent)).toBe(true);
  });
});

describe("errorAlertKey", () => {
  it("treats every product page failing the same way as one error", () => {
    expect(errorAlertKey({ ...error, path: "/products/on1", digest: "456" })).toBe(
      errorAlertKey(error)
    );
  });

  it("tells different failures of a page apart", () => {
    expect(errorAlertKey({ ...error, message: "timeout" })).not.toBe(errorAlertKey(error));
  });
});

describe("buildErrorAlert", () => {
  it("names the failing page and the error", () => {
    const alert = buildErrorAlert(error, "https://example.com");
    expect(alert.subject).toContain("/products/[id]");
    expect(alert.text).toContain("GET /products/dy3");
    expect(alert.text).toContain("connection refused");
    expect(alert.text).toContain("123");
  });

  it("leaves out the query string, which can carry a reset token", () => {
    const alert = buildErrorAlert(
      { ...error, path: "/account/reset-password?token=secret" },
      "https://example.com"
    );
    expect(alert.text).not.toContain("secret");
    expect(alert.html).not.toContain("secret");
  });

  it("escapes the error text in the html", () => {
    const { html } = buildErrorAlert({ ...error, message: "<script>" }, "https://example.com");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
