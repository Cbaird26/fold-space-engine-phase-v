import { describe, expect, it } from "vitest";
import { DEFAULT_DECISION_OPTIONS, DEFAULT_INTENT_SCENARIO, evaluateDecisionOptions, generateInsight, mapPracticalInputsToEngine } from "./productModel";

describe("productModel", () => {
  it("maps practical inputs into bounded engine controls", () => {
    const controls = mapPracticalInputsToEngine({
      alignment: 0.7,
      complexity: 0.6,
      timeHorizon: 0.4,
      stability: 0.8,
    });

    expect(controls.coherence).toBeGreaterThanOrEqual(0);
    expect(controls.coherence).toBeLessThanOrEqual(1);
    expect(controls.energy).toBeGreaterThanOrEqual(0);
    expect(controls.energy).toBeLessThanOrEqual(1);
    expect(controls.curvature).toBeGreaterThanOrEqual(0);
    expect(controls.curvature).toBeLessThanOrEqual(1);
    expect(controls.ethics).toBeGreaterThanOrEqual(-1);
    expect(controls.ethics).toBeLessThanOrEqual(1);
    expect(controls.instability).toBeGreaterThanOrEqual(0);
    expect(controls.instability).toBeLessThanOrEqual(1);
  });

  it("ranks decision options by comparative viability", () => {
    const evaluations = evaluateDecisionOptions(DEFAULT_DECISION_OPTIONS);

    expect(evaluations).toHaveLength(3);
    expect(evaluations[0].evaluation.decisionScore).toBeGreaterThanOrEqual(evaluations[1].evaluation.decisionScore);
    expect(evaluations[1].evaluation.decisionScore).toBeGreaterThanOrEqual(evaluations[2].evaluation.decisionScore);
  });

  it("returns grounded insight text for stronger scenarios", () => {
    expect(
      generateInsight({
        foldScore: 0.82,
        stability: 0.73,
        riskScore: 0.18,
        constraints: {
          topologyStable: true,
          returnPathAvailable: true,
        },
      }),
    ).toContain("aligned");
  });

  it("evaluates the default intent scenario", () => {
    const intent = DEFAULT_INTENT_SCENARIO;
    const controls = mapPracticalInputsToEngine(intent.inputs);
    expect(controls.target).toHaveLength(3);
  });
});
