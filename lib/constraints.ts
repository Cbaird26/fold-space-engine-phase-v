import type { ConstraintReport } from "./types";

export function evaluateConstraints({
  energy,
  curvature,
  coherence,
  instability,
  distance,
}: {
  energy: number;
  curvature: number;
  coherence: number;
  instability: number;
  distance: number;
}): ConstraintReport {
  const energyBudget = energy * curvature;
  const coherenceWindow = coherence > 0.2 && coherence < 0.95;
  const topologyStable = instability < 0.6;
  const causalitySafe = energyBudget < 1.5;
  const returnPathAvailable = coherence * (1 - instability) > 0.25;
  const distancePressure = Math.min(1, distance / 18);
  const energyPressure = Math.max(0, 0.35 - energyBudget) / 0.35;
  const coherencePressure = 1 - coherence;
  const riskScore =
    0.3 * instability +
    0.24 * coherencePressure +
    0.22 * distancePressure +
    0.16 * Math.min(1, energyPressure) +
    (topologyStable ? 0 : 0.05) +
    (returnPathAvailable ? 0 : 0.03);

  return {
    causalitySafe,
    energyBudgetPass: energyBudget > 0.1,
    coherenceWindowPass: coherenceWindow,
    topologyStable,
    returnPathAvailable,
    riskScore: Math.min(1, Math.max(0, riskScore)),
  };
}
