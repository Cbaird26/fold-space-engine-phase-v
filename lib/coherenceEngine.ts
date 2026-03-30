import type { CoherenceHoldMode } from "./types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export type CoherenceWarpCoreState = {
  targetCoherence: number;
  holdBand: number;
  lockStrength: number;
  maintainability: number;
  phase: "BUILD" | "RAMP" | "LOCKED";
  guidance: string;
  projectedCurve: number[];
};

export type CoherenceSequenceState = {
  loopProgress: number;
  stage: "ENGAGE" | "WARP" | "CLEAR" | "COHERENT";
  sequenceLabel: string;
  clearScreenWhiteout: number;
  coherentGlow: number;
};

export function computeCoherenceSequence({
  lockStrength,
  t,
}: {
  lockStrength: number;
  t: number;
}): CoherenceSequenceState {
  const loopProgress = (t * 0.2 + lockStrength * 0.08) % 1;
  const stage =
    loopProgress < 0.24
      ? "ENGAGE"
      : loopProgress < 0.74
        ? "WARP"
        : loopProgress < 0.9
          ? "CLEAR"
          : "COHERENT";
  const sequenceLabel =
    stage === "ENGAGE"
      ? "ENGAGE (INTENTION)"
      : stage === "WARP"
        ? "WARP"
        : stage === "CLEAR"
          ? "ARRIVED / CLEAR SCREEN"
          : "COHERENT";
  const clearScreenWhiteout = Math.max(0, 1 - Math.abs(loopProgress - 0.82) / 0.11);
  const coherentGlow = Math.max(0, 1 - Math.abs(loopProgress - 0.95) / 0.05);

  return {
    loopProgress,
    stage,
    sequenceLabel,
    clearScreenWhiteout,
    coherentGlow,
  };
}

export function computeCoherenceWarpCore({
  coherence,
  stability,
  foldScore,
  riskScore,
  holdMode,
}: {
  coherence: number;
  stability: number;
  foldScore: number;
  riskScore: number;
  holdMode: CoherenceHoldMode;
}): CoherenceWarpCoreState {
  const targetCoherence = clamp(
    Math.max(coherence, holdMode === "INDEFINITE" ? 0.94 : 0.58 + foldScore * 0.32),
    0.62,
    0.97,
  );
  const holdBand = holdMode === "INDEFINITE" ? 0.025 : 0.035;
  const lockStrength = clamp(0.45 * coherence + 0.35 * stability + 0.2 * (1 - riskScore), 0, 1);
  const maintainability = clamp(0.35 * stability + 0.35 * coherence + 0.3 * (1 - riskScore), 0, 1);
  const gap = Math.max(targetCoherence - coherence, 0);
  const phase =
    coherence >= targetCoherence - holdBand
      ? "LOCKED"
      : coherence >= targetCoherence * 0.82
        ? "RAMP"
        : "BUILD";

  const guidance =
    phase === "LOCKED"
      ? holdMode === "INDEFINITE"
        ? "Warp core locked. Stay in the band to sustain indefinite coherence hold."
        : "Coherence locked. Hold the band until the fold-state arrives."
      : phase === "RAMP"
        ? "Coherence is rising into the lock window. Keep stability high to complete the hold."
        : "Cohere up. Increase stability and alignment until the warp core reaches the lock window.";

  const projectedCurve = Array.from({ length: 56 }, (_, index) => {
    const progress = index / 55;
    const lift = 1 - Math.exp(-(2.6 + lockStrength * 2.2) * progress);
    const wobble = Math.sin(progress * Math.PI * 5) * (1 - maintainability) * 0.035;
    const value = coherence + gap * lift + wobble;
    return clamp(value, 0, 1);
  });

  return {
    targetCoherence,
    holdBand,
    lockStrength,
    maintainability,
    phase,
    guidance,
    projectedCurve,
  };
}
