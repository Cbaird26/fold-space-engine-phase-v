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
  const riskScore =
    0.4 * instability +
    0.3 * Math.max(0, distance - energyBudget) +
    0.3 * (1 - coherence);

  return {
    causalitySafe,
    energyBudgetPass: energyBudget > 0.1,
    coherenceWindowPass: coherenceWindow,
    topologyStable,
    returnPathAvailable,
    riskScore: Math.min(1, Math.max(0, riskScore)),
  };
}
