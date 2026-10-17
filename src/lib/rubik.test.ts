import { describe, expect, it } from "vitest";
import { nextMove, type CubeMove } from "./rubik";

/** A fake Math.random that returns the given values in order. */
function sequence(...values: number[]) {
  let index = 0;
  return () => values[index++ % values.length];
}

describe("nextMove", () => {
  it("maps random values to an axis, a layer and a direction", () => {
    expect(nextMove(null, sequence(0, 0, 0))).toEqual({ axis: "x", layer: -1, direction: 1 });
    expect(nextMove(null, sequence(0.5, 0.5, 0.9))).toEqual({ axis: "y", layer: 0, direction: -1 });
    expect(nextMove(null, sequence(0.99, 0.99, 0.1))).toEqual({ axis: "z", layer: 1, direction: 1 });
  });

  it("never undoes the previous turn", () => {
    const previous: CubeMove = { axis: "x", layer: -1, direction: 1 };
    // These values would pick x / -1 / -1, the exact reverse of `previous`.
    expect(nextMove(previous, sequence(0, 0, 0.9))).toEqual(previous);
  });

  it("allows the reverse direction on a different layer", () => {
    const previous: CubeMove = { axis: "x", layer: -1, direction: 1 };
    expect(nextMove(previous, sequence(0, 0.5, 0.9))).toEqual({ axis: "x", layer: 0, direction: -1 });
  });

  it("always returns a valid move with Math.random", () => {
    let previous: CubeMove | null = null;
    for (let i = 0; i < 200; i++) {
      const move = nextMove(previous);
      expect(["x", "y", "z"]).toContain(move.axis);
      expect([-1, 0, 1]).toContain(move.layer);
      expect([1, -1]).toContain(move.direction);
      previous = move;
    }
  });
});
