import { describe, expect, it } from "vitest";
import { isCronAuthorized } from "./cronAuth";

describe("isCronAuthorized", () => {
  it("accepts the secret as a bearer token", () => {
    expect(isCronAuthorized("Bearer s3cret", "s3cret")).toBe(true);
  });

  it("rejects a missing or wrong header", () => {
    expect(isCronAuthorized(null, "s3cret")).toBe(false);
    expect(isCronAuthorized("Bearer wrong", "s3cret")).toBe(false);
    expect(isCronAuthorized("s3cret", "s3cret")).toBe(false);
  });

  it("stays closed when no secret is configured", () => {
    expect(isCronAuthorized("Bearer undefined", undefined)).toBe(false);
    expect(isCronAuthorized("Bearer ", "")).toBe(false);
    expect(isCronAuthorized(null, undefined)).toBe(false);
  });
});
