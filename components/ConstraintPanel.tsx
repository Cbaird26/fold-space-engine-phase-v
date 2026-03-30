import { GlowBox } from "./GlowBox";
import type { ConstraintReport } from "@/lib/types";

const P = { green: "#3de8a8", ember: "#ff9533", glow: "#00f0ff" };

export function ConstraintPanel({ constraints }: { constraints: ConstraintReport }) {
  return (
    <GlowBox color={constraints.causalitySafe ? P.green : P.ember} glow>
      <div><strong>CAUSALITY:</strong> {constraints.causalitySafe ? "SAFE" : "VIOLATION"}</div>
      <div><strong>TOPOLOGY:</strong> {constraints.topologyStable ? "STABLE" : "UNSTABLE"}</div>
      <div><strong>ENERGY:</strong> {constraints.energyBudgetPass ? "PASS" : "LOW"}</div>
      <div><strong>COHERENCE WINDOW:</strong> {constraints.coherenceWindowPass ? "PASS" : "OUT OF RANGE"}</div>
      <div><strong>RETURN PATH:</strong> {constraints.returnPathAvailable ? "YES" : "NO"}</div>
      <div><strong>INSTABILITY RISK:</strong> {(constraints.riskScore * 100).toFixed(1)}%</div>
    </GlowBox>
  );
}
