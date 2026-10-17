import { describe, expect, it } from "vitest";
import { groupIntoSlides } from "./slides";

describe("groupIntoSlides", () => {
  it("splits an even list into full slides", () => {
    expect(groupIntoSlides([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it("tops up a short last slide from the start of the list", () => {
    expect(groupIntoSlides([1, 2, 3, 4, 5], 2)).toEqual([
      [1, 2],
      [3, 4],
      [5, 1],
    ]);
    expect(groupIntoSlides([1, 2, 3, 4], 3)).toEqual([
      [1, 2, 3],
      [4, 1, 2],
    ]);
  });

  it("leaves a single short slide alone", () => {
    expect(groupIntoSlides([1], 2)).toEqual([[1]]);
  });

  it("returns no slides for an empty list", () => {
    expect(groupIntoSlides([], 2)).toEqual([]);
  });

  it("rejects a size below 1", () => {
    expect(() => groupIntoSlides([1, 2], 0)).toThrow(RangeError);
  });
});
