import { describe, expect, it } from "vitest";
import { computeCoherenceSequence, computeCoherenceWarpCore } from "./coherenceEngine";

describe("coherence warp core", () => {
  it("returns bounded coherence targets and curve values", () => {
    const state = computeCoherenceWarpCore({
      coherence: 0.6,
      stability: 0.7,
      foldScore: 0.65,
      riskScore: 0.2,
      holdMode: "ARRIVAL",
    });

    expect(state.targetCoherence).toBeGreaterThanOrEqual(0.62);
    expect(state.targetCoherence).toBeLessThanOrEqual(0.97);
    expect(state.projectedCurve).toHaveLength(56);
    expect(state.projectedCurve.every((value) => value >= 0 && value <= 1)).toBe(true);
  });

  it("reports locked guidance for strong indefinite holds", () => {
    const state = computeCoherenceWarpCore({
      coherence: 0.95,
      stability: 0.92,
      foldScore: 0.76,
      riskScore: 0.16,
      holdMode: "INDEFINITE",
    });

    expect(state.phase).toBe("LOCKED");
    expect(state.guidance).toContain("indefinite");
  });

  it("emits clear and coherent stages on the coherence loop", () => {
    const clearState = computeCoherenceSequence({
      lockStrength: 0.8,
      t: 4.0,
    });
    const coherentState = computeCoherenceSequence({
      lockStrength: 0.8,
      t: 4.43,
    });

    expect(clearState.stage).toBe("CLEAR");
    expect(clearState.clearScreenWhiteout).toBeGreaterThan(0.5);
    expect(coherentState.stage).toBe("COHERENT");
    expect(coherentState.coherentGlow).toBeGreaterThan(0.5);
  });
});
