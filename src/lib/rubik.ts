export type Axis = "x" | "y" | "z";
export type Layer = -1 | 0 | 1;

/** One quarter turn of a cube layer: which slice, around which axis, which way. */
export interface CubeMove {
  axis: Axis;
  layer: Layer;
  direction: 1 | -1;
}

const AXES: readonly Axis[] = ["x", "y", "z"];
const LAYERS: readonly Layer[] = [-1, 0, 1];

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.min(Math.floor(random() * items.length), items.length - 1)];
}

/**
 * Picks a random quarter turn for the idle animation. A turn that would just
 * undo the previous one is flipped, so the cube never visibly "rewinds".
 * `random` returns a number in [0, 1), like Math.random (injectable for tests).
 */
export function nextMove(previous: CubeMove | null, random: () => number = Math.random): CubeMove {
  const move: CubeMove = {
    axis: pick(AXES, random),
    layer: pick(LAYERS, random),
    direction: random() < 0.5 ? 1 : -1,
  };

  const undoesPrevious =
    previous !== null &&
    move.axis === previous.axis &&
    move.layer === previous.layer &&
    move.direction !== previous.direction;

  return undoesPrevious ? { ...move, direction: previous.direction } : move;
}
