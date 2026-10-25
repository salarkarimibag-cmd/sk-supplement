import { describe, expect, it } from "vitest";
import { getPaginationItems } from "./pagination";

describe("getPaginationItems", () => {
  it("returns a single page when there is nothing to paginate", () => {
    expect(getPaginationItems(1, 1)).toEqual([1]);
    expect(getPaginationItems(1, 0)).toEqual([1]);
  });

  it("shows every page when they all fit in the item budget", () => {
    expect(getPaginationItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationItems(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(getPaginationItems(7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("collapses the far pages into an ellipsis near the start", () => {
    expect(getPaginationItems(1, 12)).toEqual([1, 2, "ellipsis", 12]);
    expect(getPaginationItems(2, 12)).toEqual([1, 2, 3, "ellipsis", 12]);
  });

  it("collapses the far pages into an ellipsis near the end", () => {
    expect(getPaginationItems(12, 12)).toEqual([1, "ellipsis", 11, 12]);
  });

  it("puts an ellipsis on both sides of a middle page", () => {
    expect(getPaginationItems(6, 12)).toEqual([1, "ellipsis", 5, 6, 7, "ellipsis", 12]);
  });

  it("shows a single skipped page instead of an ellipsis", () => {
    // 2 sits between 1 and 3, so it is shown rather than hidden behind "…".
    expect(getPaginationItems(4, 12)).toEqual([1, 2, 3, 4, 5, "ellipsis", 12]);
    expect(getPaginationItems(5, 12)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 12]);
  });

  it("never returns more than 5 + 2 × siblings items", () => {
    for (let current = 1; current <= 50; current++) {
      expect(getPaginationItems(current, 50).length).toBeLessThanOrEqual(7);
    }
  });

  it("widens the window with more siblings", () => {
    expect(getPaginationItems(10, 20, 2)).toEqual([1, "ellipsis", 8, 9, 10, 11, 12, "ellipsis", 20]);
  });
});
