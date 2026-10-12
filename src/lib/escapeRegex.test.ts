import { describe, expect, it } from "vitest";
import { escapeRegex } from "./escapeRegex";

describe("escapeRegex", () => {
  it("leaves plain text (including Persian) unchanged", () => {
    expect(escapeRegex("وی پروتئین")).toBe("وی پروتئین");
  });

  it("escapes every special character", () => {
    expect(escapeRegex(".*+?^${}()|[]\\")).toBe("\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\");
  });

  it("produces a pattern that matches the input literally", () => {
    const input = "Omega (1000mg) + C?";
    const pattern = new RegExp(escapeRegex(input), "i");
    expect(pattern.test("omega (1000MG) + c?")).toBe(true);
    expect(pattern.test("Omega 1000mg")).toBe(false);
  });

  it("turns an invalid pattern into a valid one", () => {
    expect(() => new RegExp("(")).toThrow();
    expect(() => new RegExp(escapeRegex("("))).not.toThrow();
  });
});
