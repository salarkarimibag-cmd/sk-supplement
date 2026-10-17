/**
 * Splits items into slides of `size` for a carousel. If the last slide would
 * come up short, it's topped up from the start of the list, so every slide is
 * full and the layout doesn't jump: [1, 2, 3, 4, 5] by 2 → [1, 2] [3, 4] [5, 1].
 */
export function groupIntoSlides<T>(items: T[], size: number): T[][] {
  if (size < 1) throw new RangeError("size must be at least 1");

  const slides: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    slides.push(items.slice(start, start + size));
  }

  const last = slides.at(-1);
  if (last && slides.length > 1) {
    for (let i = 0; last.length < size; i++) {
      last.push(items[i]);
    }
  }

  return slides;
}
