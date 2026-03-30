"use client";

import { useEffect, useMemo, useState } from "react";
import presets from "@/data/presets.json";
import { DeviceHeader } from "@/components/DeviceHeader";
import { EqBlock } from "@/components/EqBlock";
import { GlowBox } from "@/components/GlowBox";
import { Knob } from "@/components/Knob";
import { FoldField } from "@/components/FoldField";
import { ConstraintPanel } from "@/components/ConstraintPanel";
import { ExperimentPanel } from "@/components/ExperimentPanel";
import { EngineLog } from "@/components/EngineLog";
import { ParameterSweepPanel } from "@/components/ParameterSweepPanel";
import { computeFoldScoreExtended, computeFoldCost, distance, generateCandidates } from "@/lib/engineCore";
import { computeFoldAperture, computeStability, classifyFold } from "@/lib/foldGeometry";
import { computeProbabilities } from "@/lib/probabilityField";
import { evaluateConstraints } from "@/lib/constraints";
import { mapFields } from "@/lib/toeBridge";
import { computeGammaEffective, computeVisibility } from "@/lib/h2Test";
import { serializeRunArchive } from "@/lib/logging";
import type { FoldMode, LoggedRun, Preset, Vector3 } from "@/lib/types";

const P = {
  void: "#06070c", panel: "#0e1019", border: "#222640", glow: "#00f0ff",
  glow2: "#b374ff", glow3: "#f472b6", gold: "#fbbf24", ember: "#ff9533",
  green: "#3de8a8", text: "#d4d8e8", dim: "#8890b0",
};
const FONT = "'Courier New', 'Lucida Console', monospace";
const MODE_LABELS: Record<FoldMode, string> = {
  SIM: "Simulation",
  RES: "Research",
  EXP: "Experimental",
};

function formatVector(vector: Vector3) {
  return vector.map((value) => value.toFixed(1)).join(", ");
}

function getEngineStatus(foldScore: number, riskScore: number, topologyStable: boolean, returnPathAvailable: boolean) {
  if (!topologyStable || riskScore >= 0.78) {
    return "Abort Window";
  }
  if (foldScore >= 0.74 && returnPathAvailable) {
    return "Stable Corridor";
  }
  if (foldScore >= 0.48) {
    return "Marginal Corridor";
  }
  return "Local Distortion";
}

export default function FoldEnginePage() {
  const presetList = presets as Preset[];
  const [mode, setMode] = useState<FoldMode>("SIM");
  const [origin] = useState<Vector3>([0, 0, 0]);
  const [target, setTarget] = useState<Vector3>([10, 2, -4]);
  const [energy, setEnergy] = useState(0.5);
  const [curvature, setCurvature] = useState(0.5);
  const [coherence, setCoherence] = useState(0.5);
  const [ethics, setEthics] = useState(0.0);
  const [instability, setInstability] = useState(0.2);
  const [eta, setEta] = useState(0.3);
  const [t, setT] = useState(0);
  const [logs, setLogs] = useState<LoggedRun[]>([]);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setT((p) => p + 0.03), 30);
    return () => clearInterval(id);
  }, []);

  const targetDistance = distance(origin, target);
  const fields = mapFields({ coherence, ethics });
  const foldScore = computeFoldScoreExtended({ curvature, energy, coherence, ethics, instability });
  const aperture = computeFoldAperture(foldScore, coherence);
  const stability = computeStability(foldScore, instability);
  const foldClass = classifyFold(foldScore);

  const candidates = useMemo(() => {
    const raw = generateCandidates(target, 24).map((c) => {
      const d = distance(origin, c.offset);
      const cost = computeFoldCost({
        distance: d,
        curvature,
        energy,
        coherence,
        instability,
      });
      return { ...c, cost };
    });

    return computeProbabilities(
      raw.map((r) => ({
        amp2: 1 / raw.length,
        dE: -r.cost,
        data: r,
      })),
      eta,
    );
  }, [target, origin, curvature, energy, coherence, instability, eta]);

  const chosen = [...candidates].sort((a, b) => b.p - a.p)[0]?.data;
  const chosenProbability = [...candidates].sort((a, b) => b.p - a.p)[0]?.p ?? 0;
  const constraints = evaluateConstraints({ energy, curvature, coherence, instability, distance: targetDistance });
  const gammaEff = computeGammaEffective({ instability, coherence, aperture });
  const visibility = computeVisibility({ Gamma: gammaEff, T: 1e-6, dx: aperture * 1e-3 });
  const engineStatus = getEngineStatus(foldScore, constraints.riskScore, constraints.topologyStable, constraints.returnPathAvailable);
  const statusColor = engineStatus === "Stable Corridor" ? P.green : engineStatus === "Marginal Corridor" ? P.gold : P.ember;

  const sweepRows = useMemo(() => {
    return [0.25, 0.45, 0.65, 0.85].flatMap((c) =>
      [0.15, 0.35].map((i) => ({
        coherence: c,
        instability: i,
        score: computeFoldScoreExtended({ curvature, energy, coherence: c, ethics, instability: i }),
      })),
    );
  }, [curvature, energy, ethics]);

  const applyPreset = (index: number) => {
    const preset = presetList[index];
    if (!preset) return;
    setSelectedPresetIndex(index);
    setEnergy(preset.energy);
    setCurvature(preset.curvature);
    setCoherence(preset.coherence);
    setEthics(preset.ethics);
    setInstability(preset.instability);
    setEta(preset.eta);
    setTarget(preset.target as Vector3);
  };

  const recordRun = () => {
    if (!chosen) return;
    const run: LoggedRun = {
      timestamp: new Date().toISOString(),
      mode,
      params: { energy, curvature, coherence, ethics, instability, eta, target },
      outputs: {
        foldScore,
        aperture,
        stability,
        visibility,
        foldClass,
        chosenCost: chosen.cost,
      },
      constraints,
    };
    setLogs((prev) => [...prev, run]);
  };

  const exportRuns = () => {
    if (logs.length === 0) return;
    const payload = serializeRunArchive(logs);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fold-space-engine-runs.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #111522 0%, #06070c 55%)", color: P.text, fontFamily: FONT, padding: 24 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <DeviceHeader
          name="Fold-Space Engine"
          subtitle="Constrained fold-space simulation with coherence-weighted path selection and visibility mapping"
          color={P.glow}
          classification="Constrained Demo"
        />

        <EqBlock>{"F = αK + βρ + χΦc + ε(Φc·E) − δI"}</EqBlock>
        <EqBlock color={P.glow2}>{"P(i) ∝ |c_i|² exp(η ΔE_i)"}</EqBlock>
        <EqBlock color={P.gold}>{"V / V0 = exp(-Γ T Δx²)"}</EqBlock>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, margin: "18px 0 20px" }}>
          {[
            { label: "Engine Status", value: engineStatus, accent: statusColor },
            { label: "Mode", value: MODE_LABELS[mode], accent: P.glow },
            { label: "Target Vector", value: formatVector(target), accent: P.glow2 },
            { label: "Branch Confidence", value: `${(chosenProbability * 100).toFixed(1)}%`, accent: P.gold },
            { label: "Preset", value: selectedPresetIndex === null ? "Custom" : presetList[selectedPresetIndex].name, accent: P.green },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                border: `1px solid ${item.accent}30`,
                background: `${item.accent}10`,
                borderRadius: 12,
                padding: "14px 16px",
                boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ color: P.dim, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", marginBottom: 8 }}>{item.label}</div>
              <div style={{ color: item.accent, fontSize: item.label === "Target Vector" ? 15 : 18, fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0 20px" }}>
          {(["SIM", "RES", "EXP"] as FoldMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                border: `1px solid ${mode === m ? P.glow : P.border}`,
                background: mode === m ? `${P.glow}14` : P.panel,
                color: mode === m ? P.glow : P.text,
                padding: "10px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
          <button
            onClick={recordRun}
            style={{ border: `1px solid ${P.gold}`, background: `${P.gold}14`, color: P.gold, padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontFamily: FONT }}
          >
            Record Run
          </button>
          <button
            onClick={exportRuns}
            disabled={logs.length === 0}
            style={{
              border: `1px solid ${logs.length === 0 ? P.border : P.green}`,
              background: logs.length === 0 ? P.panel : `${P.green}14`,
              color: logs.length === 0 ? P.dim : P.green,
              padding: "10px 14px",
              borderRadius: 8,
              cursor: logs.length === 0 ? "not-allowed" : "pointer",
              fontFamily: FONT,
            }}
          >
            Export JSON Logs
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, alignItems: "start" }}>
          <div>
            <FoldField aperture={aperture} stability={stability} t={t} chosenTarget={chosen?.offset ?? target} />
            <div style={{ marginTop: 12, color: P.dim, fontSize: 12, lineHeight: 1.7 }}>
              This public build exposes the constrained simulation surface: corridor score, path weighting, topology checks, and the visibility/dephasing bridge.
            </div>
          </div>
          <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <Knob label="Energy Density" value={energy} onChange={(value) => { setSelectedPresetIndex(null); setEnergy(value); }} min={0} max={1} />
                <Knob label="Curvature" value={curvature} onChange={(value) => { setSelectedPresetIndex(null); setCurvature(value); }} min={0} max={1} color={P.glow2} />
                <Knob label="Φc Coherence" value={coherence} onChange={(value) => { setSelectedPresetIndex(null); setCoherence(value); }} min={0} max={1} color={P.glow3} />
                <Knob label="Ethical Bias" value={ethics} onChange={(value) => { setSelectedPresetIndex(null); setEthics(value); }} min={-1} max={1} color={P.green} />
                <Knob label="Instability" value={instability} onChange={(value) => { setSelectedPresetIndex(null); setInstability(value); }} min={0} max={1} color={P.ember} />
                <Knob label="η Selection Bias" value={eta} onChange={(value) => { setSelectedPresetIndex(null); setEta(value); }} min={-1.5} max={1.5} color={P.gold} />
              </div>
              <div>
                <Knob label="Target X" value={target[0]} onChange={(v) => { setSelectedPresetIndex(null); setTarget([v, target[1], target[2]]); }} min={-20} max={20} step={0.1} />
                <Knob label="Target Y" value={target[1]} onChange={(v) => { setSelectedPresetIndex(null); setTarget([target[0], v, target[2]]); }} min={-20} max={20} step={0.1} color={P.glow2} />
                <Knob label="Target Z" value={target[2]} onChange={(v) => { setSelectedPresetIndex(null); setTarget([target[0], target[1], v]); }} min={-20} max={20} step={0.1} color={P.glow3} />
                <div style={{ marginTop: 12 }}>
                  <div style={{ color: P.dim, fontSize: 12, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Presets</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {presetList.map((preset, idx) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(idx)}
                        style={{
                          textAlign: "left",
                          border: `1px solid ${selectedPresetIndex === idx ? P.glow : P.border}`,
                          background: selectedPresetIndex === idx ? `${P.glow}14` : "#0b0d16",
                          color: P.text,
                          padding: "8px 10px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontFamily: FONT,
                        }}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <GlowBox color={P.glow} glow>
              <div><strong>Target Distance:</strong> {targetDistance.toFixed(2)}</div>
              <div><strong>Optimal Path Cost:</strong> {chosen?.cost.toFixed(3) ?? "—"}</div>
              <div><strong>Fold Score:</strong> {foldScore.toFixed(3)}</div>
              <div><strong>Classification:</strong> {foldClass}</div>
              <div><strong>Aperture:</strong> {aperture.toFixed(3)}</div>
              <div><strong>Stability:</strong> {stability.toFixed(3)}</div>
            </GlowBox>

            <GlowBox color={P.glow2}>
              <div><strong>Φc:</strong> {fields.Phi_c.toFixed(3)}</div>
              <div><strong>E:</strong> {fields.E.toFixed(3)}</div>
              <div><strong>Field Interaction:</strong> {fields.fieldInteraction.toFixed(3)}</div>
            </GlowBox>

            <ConstraintPanel constraints={constraints} />
            <ExperimentPanel visibility={visibility} gammaEff={gammaEff} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
          <ParameterSweepPanel rows={sweepRows} />
          <EngineLog logs={logs} />
        </div>
      </div>
    </main>
  );
}
