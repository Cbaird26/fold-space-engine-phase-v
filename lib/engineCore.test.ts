import { describe, expect, it } from "vitest";
import {
  computeFoldCost,
  computeFoldScoreExtended,
  distance,
  generateCandidates,
} from "./engineCore";

describe("engineCore", () => {
  it("bounds fold score to [0, 1]", () => {
    expect(
      computeFoldScoreExtended({
        curvature: 10,
        energy: 10,
        coherence: 1,
        ethics: 1,
        instability: 0,
      }),
    ).toBe(1);
    expect(
      computeFoldScoreExtended({
        curvature: 0,
        energy: 0,
        coherence: 0,
        ethics: -1,
        instability: 1,
      }),
    ).toBe(0);
  });

  it("computes Euclidean distance", () => {
    expect(distance([0, 0, 0], [3, 4, 0])).toBeCloseTo(5, 12);
  });

  it("assigns lower fold cost to easier paths", () => {
    const easy = computeFoldCost({
      distance: 2,
      curvature: 0.9,
      energy: 0.9,
      coherence: 0.8,
      instability: 0.1,
    });
    const hard = computeFoldCost({
      distance: 8,
      curvature: 0.2,
      energy: 0.2,
      coherence: 0.3,
      instability: 0.7,
    });
    expect(easy).toBeLessThan(hard);
  });

  it("generates the requested number of candidates", () => {
    const candidates = generateCandidates([10, 2, -4], 8);
    expect(candidates).toHaveLength(8);
    expect(candidates.every((candidate) => candidate.offset.length === 3)).toBe(true);
  });

  it("generates stable candidates for the same target", () => {
    const first = generateCandidates([10, 2, -4], 4);
    const second = generateCandidates([10, 2, -4], 4);
    expect(second).toEqual(first);
  });
});
