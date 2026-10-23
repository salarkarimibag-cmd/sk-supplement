// Timing curves for the home hero's 3D scene. They're plain functions of time
// (in seconds) so the animation is easy to test and never drifts.

/** Seconds spent in each phase of the tub lid's loop, in order. */
export const LID_PHASES = { closed: 2.8, opening: 1.2, open: 0.9, closing: 1.2 } as const;

const LID_CYCLE =
  LID_PHASES.closed + LID_PHASES.opening + LID_PHASES.open + LID_PHASES.closing;

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * How far the tub's lid is unscrewed at `time`, from 0 (closed) to 1 (fully
 * open). It rests closed, eases open, holds, eases shut, and repeats.
 */
export function lidOpenness(time: number): number {
  let t = ((time % LID_CYCLE) + LID_CYCLE) % LID_CYCLE;

  if (t < LID_PHASES.closed) return 0;
  t -= LID_PHASES.closed;
  if (t < LID_PHASES.opening) return easeInOutCubic(t / LID_PHASES.opening);
  t -= LID_PHASES.opening;
  if (t < LID_PHASES.open) return 1;
  t -= LID_PHASES.open;
  return 1 - easeInOutCubic(t / LID_PHASES.closing);
}

/**
 * A smooth bump that rises from 0 to 1 and back once every `period` seconds,
 * lasting `duration` seconds, starting `offset` seconds into each period.
 * Used to pop each capsule open now and then, at different moments.
 */
export function pulse(time: number, period: number, duration: number, offset = 0): number {
  const t = (((time - offset) % period) + period) % period;
  if (t >= duration) return 0;
  return Math.sin((t / duration) * Math.PI) ** 2;
}

/** Seconds each product stays on show before it flips to the next. */
export const PRODUCT_CYCLE = 6;
/** Seconds a flip takes, from facing front through edge-on and back. */
export const FLIP_DURATION = 1;

/**
 * Which product shows at `time` and how far it's turned. `step` counts up by
 * one per product (wrap it with % to index a list); `turn` is the rotation
 * around the vertical axis in radians: 0 while facing the viewer. A flip
 * speeds up into edge-on (+π/2), where the next product is swapped in unseen,
 * then slows down out of the other edge (−π/2) back to 0. At time 0 the
 * first product faces the viewer, so a still scene shows it front on.
 */
export function productFlip(time: number): { step: number; turn: number } {
  const half = FLIP_DURATION / 2;
  // Shifted by half a flip: each step begins with the second half of a flip,
  // which time 0 skips, so the first product starts out facing the viewer.
  const shifted = time + half;
  const step = Math.floor(shifted / PRODUCT_CYCLE);
  const t = shifted - step * PRODUCT_CYCLE;

  let turn = 0;
  if (t < half) {
    const arriving = t / half;
    turn = -((1 - arriving) ** 2) * (Math.PI / 2);
  } else if (t > PRODUCT_CYCLE - half) {
    const leaving = (t - (PRODUCT_CYCLE - half)) / half;
    turn = leaving ** 2 * (Math.PI / 2);
  }
  return { step, turn };
}
