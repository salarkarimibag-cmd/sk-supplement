import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "./safeRedirect";

const FALLBACK = "/account/profile";

describe("getSafeRedirectPath", () => {
  it("allows same-site paths", () => {
    expect(getSafeRedirectPath("/blogs/my-post", FALLBACK)).toBe("/blogs/my-post");
    expect(getSafeRedirectPath("/search?q=creatine", FALLBACK)).toBe("/search?q=creatine");
  });

  it("falls back when missing or not a string", () => {
    expect(getSafeRedirectPath(undefined, FALLBACK)).toBe(FALLBACK);
    expect(getSafeRedirectPath(["/a", "/b"], FALLBACK)).toBe(FALLBACK);
    expect(getSafeRedirectPath("", FALLBACK)).toBe(FALLBACK);
  });

  it("rejects external and protocol-relative URLs", () => {
    expect(getSafeRedirectPath("https://evil.com", FALLBACK)).toBe(FALLBACK);
    expect(getSafeRedirectPath("//evil.com", FALLBACK)).toBe(FALLBACK);
    expect(getSafeRedirectPath("/\\evil.com", FALLBACK)).toBe(FALLBACK);
    expect(getSafeRedirectPath("javascript:alert(1)", FALLBACK)).toBe(FALLBACK);
  });
});
