import { describe, expect, it } from "vitest";
import { computeProbabilities } from "./probabilityField";

describe("computeProbabilities", () => {
  it("normalizes path weights", () => {
    const futures = computeProbabilities(
      [
        { amp2: 0.5, dE: -1, id: "a" },
        { amp2: 0.5, dE: 1, id: "b" },
      ],
      0.5,
    );
    const total = futures.reduce((sum, future) => sum + future.p, 0);
    expect(total).toBeCloseTo(1, 12);
  });

  it("favors higher dE under positive eta", () => {
    const futures = computeProbabilities(
      [
        { amp2: 0.5, dE: -1, id: "a" },
        { amp2: 0.5, dE: 1, id: "b" },
      ],
      0.8,
    );
    expect(futures[1].p).toBeGreaterThan(futures[0].p);
  });

  it("stays numerically stable for large magnitudes", () => {
    const futures = computeProbabilities(
      [
        { amp2: 0.5, dE: -400, id: "a" },
        { amp2: 0.5, dE: 400, id: "b" },
      ],
      2,
    );
    const total = futures.reduce((sum, future) => sum + future.p, 0);
    expect(total).toBeCloseTo(1, 12);
    expect(futures.every((future) => Number.isFinite(future.p))).toBe(true);
  });
});
