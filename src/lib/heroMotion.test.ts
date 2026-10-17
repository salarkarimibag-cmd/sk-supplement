import { describe, expect, it } from "vitest";
import { LID_PHASES, easeInOutCubic, lidOpenness, pulse } from "./heroMotion";

const { closed, opening, open, closing } = LID_PHASES;
const cycle = closed + opening + open + closing;

describe("easeInOutCubic", () => {
  it("starts at 0, ends at 1 and passes through the middle", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(1)).toBe(1);
  });
});

describe("lidOpenness", () => {
  it("rests closed at the start of each loop", () => {
    expect(lidOpenness(0)).toBe(0);
    expect(lidOpenness(closed - 0.01)).toBe(0);
  });

  it("is fully open while holding", () => {
    expect(lidOpenness(closed + opening + open / 2)).toBe(1);
  });

  it("is halfway at the middle of opening and closing", () => {
    expect(lidOpenness(closed + opening / 2)).toBeCloseTo(0.5);
    expect(lidOpenness(closed + opening + open + closing / 2)).toBeCloseTo(0.5);
  });

  it("repeats every cycle and handles negative time", () => {
    expect(lidOpenness(cycle + closed + opening / 2)).toBeCloseTo(0.5);
    expect(lidOpenness(-cycle + closed + opening + open / 2)).toBe(1);
  });

  it("never jumps between frames", () => {
    for (let t = 0; t < cycle * 2; t += 1 / 60) {
      expect(Math.abs(lidOpenness(t + 1 / 60) - lidOpenness(t))).toBeLessThan(0.05);
    }
  });
});

describe("pulse", () => {
  it("is 0 outside its window and peaks at 1 in the middle", () => {
    expect(pulse(0, 6, 1)).toBe(0);
    expect(pulse(0.5, 6, 1)).toBeCloseTo(1);
    expect(pulse(3, 6, 1)).toBe(0);
  });

  it("shifts by the offset and repeats every period", () => {
    expect(pulse(2.5, 6, 1, 2)).toBeCloseTo(1);
    expect(pulse(8.5, 6, 1, 2)).toBeCloseTo(1);
  });
});
