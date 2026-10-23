// Helpers for product photos that are "cutouts": the pack on a transparent
// background. Pure functions over raw RGBA pixels (as canvas getImageData
// returns them), so they're easy to test without a browser.

/** A rectangle of pixels; `right` and `bottom` are exclusive. */
export interface PixelBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Where the pack starts and ends along one row or column (end exclusive), or null where it's empty. */
export type Span = [start: number, end: number] | null;

/** The pack's outline inside its cropped bounds, row by row and column by column. */
export interface Silhouette {
  width: number;
  height: number;
  rows: Span[];
  columns: Span[];
}

/** Alpha (0–255) below which a pixel counts as empty background. */
const EMPTY_ALPHA = 16;

/**
 * How close to its top or bottom edge (as a fraction of the pack's height)
 * the surface starts curving back, so the ends look rounded, not cut off.
 */
const EDGE_ROUND = 0.04;

function alphaAt(rgba: ArrayLike<number>, width: number, x: number, y: number) {
  return rgba[(y * width + x) * 4 + 3];
}

/**
 * The smallest rectangle holding every visible pixel of a cutout, so the
 * transparent margin around the pack can be cropped away. Returns null when
 * the photo isn't a cutout (its top-left corner isn't transparent, so it has
 * a solid background) or when it's entirely empty.
 */
export function cutoutBounds(
  rgba: ArrayLike<number>,
  width: number,
  height: number
): PixelBounds | null {
  if (alphaAt(rgba, width, 0, 0) >= EMPTY_ALPHA) return null;

  let left = width;
  let top = height;
  let right = 0;
  let bottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (alphaAt(rgba, width, x, y) < EMPTY_ALPHA) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x + 1);
      bottom = Math.max(bottom, y + 1);
    }
  }
  return right > left ? { left, top, right, bottom } : null;
}

/**
 * Traces the pack's outline inside `bounds` (as found by cutoutBounds).
 * Positions in the result are relative to the bounds' top-left corner.
 */
export function traceSilhouette(
  rgba: ArrayLike<number>,
  width: number,
  bounds: PixelBounds
): Silhouette {
  const cropWidth = bounds.right - bounds.left;
  const cropHeight = bounds.bottom - bounds.top;
  const isVisible = (x: number, y: number) =>
    alphaAt(rgba, width, bounds.left + x, bounds.top + y) >= EMPTY_ALPHA;

  function span(length: number, visibleAt: (i: number) => boolean): Span {
    let start = -1;
    let end = -1;
    for (let i = 0; i < length; i++) {
      if (!visibleAt(i)) continue;
      if (start === -1) start = i;
      end = i + 1;
    }
    return start === -1 ? null : [start, end];
  }

  return {
    width: cropWidth,
    height: cropHeight,
    rows: Array.from({ length: cropHeight }, (_, y) => span(cropWidth, (x) => isVisible(x, y))),
    columns: Array.from({ length: cropWidth }, (_, x) => span(cropHeight, (y) => isVisible(x, y))),
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * How far the pack's surface comes toward the viewer at (u, v), fractions
 * across the silhouette (v counted from the top), in units of the
 * silhouette's width. Each row is taken as the front half of a circle as
 * wide as the pack is in that row, which is exactly right for a round tub
 * and gives bags a soft, pillowy shape. Near the top and bottom edges the
 * depth eases to 0, so the ends are rounded. 0 outside the pack.
 */
export function bulge(silhouette: Silhouette, u: number, v: number): number {
  const { width, height, rows, columns } = silhouette;
  const x = u * width;
  const y = v * height;
  const row = rows[clamp(Math.floor(y), 0, height - 1)];
  const column = columns[clamp(Math.floor(x), 0, width - 1)];
  if (!row || !column) return 0;

  const radius = (row[1] - row[0]) / 2;
  const offset = x - (row[0] + radius);
  if (Math.abs(offset) >= radius) return 0;
  const depth = Math.sqrt(radius * radius - offset * offset);

  // A quarter circle from 0 at the edge to 1 at EDGE_ROUND inside it.
  const fromEdge = Math.min(y - column[0], column[1] - y) / (EDGE_ROUND * height);
  const rounding = Math.sqrt(1 - (1 - clamp(fromEdge, 0, 1)) ** 2);

  return (depth * rounding) / width;
}
