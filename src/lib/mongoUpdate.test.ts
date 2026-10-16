import { describe, expect, it } from "vitest";
import { toSetAndUnset } from "./mongoUpdate";

describe("toSetAndUnset", () => {
  it("puts defined values in $set and undefined ones in $unset", () => {
    expect(toSetAndUnset({ name: "وی", flavor: undefined, stock: 0 })).toEqual({
      $set: { name: "وی", stock: 0 },
      $unset: { flavor: "" },
    });
  });

  it("keeps falsy but defined values like 0, false and empty arrays in $set", () => {
    expect(toSetAndUnset({ stock: 0, approved: false, tags: [] }).$set).toEqual({
      stock: 0,
      approved: false,
      tags: [],
    });
  });

  it("returns empty operators for an empty update", () => {
    expect(toSetAndUnset({})).toEqual({ $set: {}, $unset: {} });
  });
});
