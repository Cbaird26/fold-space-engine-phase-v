import { describe, expect, it } from "vitest";
import { evaluateConstraints } from "./constraints";

describe("evaluateConstraints", () => {
  it("reports a stable admissible region", () => {
    const report = evaluateConstraints({
      energy: 0.8,
      curvature: 0.7,
      coherence: 0.6,
      instability: 0.2,
      distance: 0.5,
    });

    expect(report.causalitySafe).toBe(true);
    expect(report.energyBudgetPass).toBe(true);
    expect(report.coherenceWindowPass).toBe(true);
    expect(report.topologyStable).toBe(true);
    expect(report.returnPathAvailable).toBe(true);
    expect(report.riskScore).toBeGreaterThanOrEqual(0);
    expect(report.riskScore).toBeLessThanOrEqual(1);
  });
});
