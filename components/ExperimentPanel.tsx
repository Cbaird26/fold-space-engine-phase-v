import { GlowBox } from "./GlowBox";

const P = { gold: "#fbbf24" };

export function ExperimentPanel({ visibility, gammaEff }: { visibility: number; gammaEff: number }) {
  return (
    <GlowBox color={P.gold} glow>
      <div><strong>EXPERIMENTAL VISIBILITY:</strong> {visibility.toFixed(6)}</div>
      <div><strong>LOSS:</strong> {(1 - visibility).toExponential(2)}</div>
      <div><strong>Γ_eff:</strong> {gammaEff.toExponential(3)}</div>
      <div><strong>MODEL:</strong> V/V₀ = exp(-Γ T Δx²)</div>
    </GlowBox>
  );
}
