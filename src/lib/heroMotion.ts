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
