import { describe, expect, it } from "vitest";
import { cutoutBounds } from "./cutout";

/** A width×height RGBA image, transparent except for the given opaque pixels. */
function image(width: number, height: number, opaque: [number, number][]) {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (const [x, y] of opaque) rgba[(y * width + x) * 4 + 3] = 255;
  return rgba;
}

describe("cutoutBounds", () => {
  it("finds the box around the visible pixels", () => {
    const rgba = image(6, 5, [
      [2, 1],
      [3, 3],
    ]);
    expect(cutoutBounds(rgba, 6, 5)).toEqual({ left: 2, top: 1, right: 4, bottom: 4 });
  });

  it("ignores nearly transparent pixels such as faint edge noise", () => {
    const rgba = image(4, 4, [[1, 1]]);
    rgba[(3 * 4 + 3) * 4 + 3] = 5;
    expect(cutoutBounds(rgba, 4, 4)).toEqual({ left: 1, top: 1, right: 2, bottom: 2 });
  });

  it("rejects a photo with a solid background", () => {
    const rgba = image(3, 3, [[0, 0]]);
    expect(cutoutBounds(rgba, 3, 3)).toBeNull();
  });

  it("rejects an empty image", () => {
    expect(cutoutBounds(image(3, 3, []), 3, 3)).toBeNull();
  });
});
