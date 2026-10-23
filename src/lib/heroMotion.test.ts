import { describe, expect, it } from "vitest";
import {
  FLIP_DURATION,
  LID_PHASES,
  PRODUCT_CYCLE,
  easeInOutCubic,
  lidOpenness,
  productFlip,
  pulse,
} from "./heroMotion";

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

describe("productFlip", () => {
  // The first flip's edge-on moment: the swap from product 0 to product 1.
  const firstSwap = PRODUCT_CYCLE - FLIP_DURATION / 2;

  it("starts on the first product, facing the viewer", () => {
    expect(productFlip(0)).toEqual({ step: 0, turn: 0 });
  });

  it("swaps products while edge-on, so the swap can't be seen", () => {
    expect(productFlip(firstSwap - 0.0001).step).toBe(0);
    expect(productFlip(firstSwap - 0.0001).turn).toBeCloseTo(Math.PI / 2);
    expect(productFlip(firstSwap).step).toBe(1);
    expect(productFlip(firstSwap).turn).toBeCloseTo(-Math.PI / 2);
  });

  it("faces the viewer again once the flip is over", () => {
    expect(productFlip(firstSwap + FLIP_DURATION / 2)).toEqual({ step: 1, turn: 0 });
    expect(productFlip(firstSwap + PRODUCT_CYCLE).step).toBe(2);
  });

  it("never jumps between frames, apart from the edge-on swap", () => {
    for (let t = 0; t < PRODUCT_CYCLE * 2; t += 1 / 60) {
      const now = productFlip(t);
      const next = productFlip(t + 1 / 60);
      if (next.step !== now.step) continue;
      expect(Math.abs(next.turn - now.turn)).toBeLessThan(0.15);
    }
  });
});
