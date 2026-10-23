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

/** Alpha (0–255) below which a pixel counts as empty background. */
const EMPTY_ALPHA = 16;

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
  const alphaAt = (x: number, y: number) => rgba[(y * width + x) * 4 + 3];
  if (alphaAt(0, 0) >= EMPTY_ALPHA) return null;

  let left = width;
  let top = height;
  let right = 0;
  let bottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (alphaAt(x, y) < EMPTY_ALPHA) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x + 1);
      bottom = Math.max(bottom, y + 1);
    }
  }
  return right > left ? { left, top, right, bottom } : null;
}
