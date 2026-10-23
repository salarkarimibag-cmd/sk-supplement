import { describe, expect, it } from "vitest";
import { bulge, cutoutBounds, traceSilhouette } from "./cutout";

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

/** A filled rectangle from (left, top) to (right, bottom), exclusive, in a transparent image. */
function rect(width: number, height: number, left: number, top: number, right: number, bottom: number) {
  const opaque: [number, number][] = [];
  for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) opaque.push([x, y]);
  return image(width, height, opaque);
}

describe("traceSilhouette", () => {
  it("records where the pack starts and ends in each row and column of the crop", () => {
    // An L shape: a 1-pixel-wide stem with a 3-pixel foot.
    const rgba = image(5, 5, [
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
    const bounds = cutoutBounds(rgba, 5, 5)!;
    expect(traceSilhouette(rgba, 5, bounds)).toEqual({
      width: 3,
      height: 3,
      rows: [
        [0, 1],
        [0, 1],
        [0, 3],
      ],
      columns: [
        [0, 3],
        [2, 3],
        [2, 3],
      ],
    });
  });
});

describe("bulge", () => {
  const rgba = rect(102, 102, 1, 1, 101, 101);
  const silhouette = traceSilhouette(rgba, 102, cutoutBounds(rgba, 102, 102)!);

  it("is a half circle across each row: deepest in the middle, as deep as half the width", () => {
    expect(bulge(silhouette, 0.5, 0.5)).toBeCloseTo(0.5);
    // At a quarter of the way across, a circle of radius ½ is √(½² − ¼²) deep.
    expect(bulge(silhouette, 0.25, 0.5)).toBeCloseTo(Math.sqrt(0.25 - 0.0625));
  });

  it("is flat at the sides and eases to flat at the top and bottom", () => {
    expect(bulge(silhouette, 0, 0.5)).toBe(0);
    expect(bulge(silhouette, 1, 0.5)).toBe(0);
    expect(bulge(silhouette, 0.5, 0)).toBe(0);
    expect(bulge(silhouette, 0.5, 0.01)).toBeLessThan(bulge(silhouette, 0.5, 0.5));
  });

  it("is flat outside the pack", () => {
    const narrow = rect(10, 10, 4, 0, 6, 10);
    const shape = traceSilhouette(narrow, 10, { left: 0, top: 0, right: 10, bottom: 10 });
    expect(bulge(shape, 0.1, 0.5)).toBe(0);
    expect(bulge(shape, 0.5, 0.5)).toBeGreaterThan(0);
  });
});
