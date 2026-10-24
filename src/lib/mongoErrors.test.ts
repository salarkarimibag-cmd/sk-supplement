import { describe, expect, it } from "vitest";
import { isDuplicateKeyError } from "./mongoErrors";

describe("isDuplicateKeyError", () => {
  it("recognizes MongoDB's duplicate key error", () => {
    expect(isDuplicateKeyError({ code: 11000, message: "E11000 duplicate key" })).toBe(true);
  });

  it("is false for other errors and non-errors", () => {
    expect(isDuplicateKeyError({ code: 121 })).toBe(false);
    expect(isDuplicateKeyError(new Error("boom"))).toBe(false);
    expect(isDuplicateKeyError(null)).toBe(false);
    expect(isDuplicateKeyError("11000")).toBe(false);
  });
});
