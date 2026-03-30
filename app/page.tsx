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
import { serializeRunArchive } from "@/lib/logging";
import {
  DEFAULT_DECISION_OPTIONS,
  DEFAULT_INTENT_SCENARIO,
  DEFAULT_MANUAL_CONTROLS,
  evaluateDecisionOptions,
  evaluateEngineControls,
  evaluateIntentScenario,
  mapPracticalInputsToEngine,
} from "@/lib/productModel";
import { savePersistedProductState, loadPersistedProductState } from "@/lib/persistence";
import { computeFoldScoreExtended } from "@/lib/engineCore";
import type {
  DecisionOption,
  EngineControls,
  EngineMode,
  IntentScenario,
  LoggedRun,
  PersistedProductState,
  Preset,
  PracticalInputs,
  ScenarioEvaluation,
  Vector3,
} from "@/lib/types";

const P = {
  panel: "#0e1019",
  border: "#222640",
  glow: "#00f0ff",
  glow2: "#b374ff",
  glow3: "#f472b6",
  gold: "#fbbf24",
  ember: "#ff9533",
  green: "#3de8a8",
  text: "#d4d8e8",
  dim: "#8890b0",
  ink: "#080914",
};
const FONT = "'Courier New', 'Lucida Console', monospace";
const MODE_LABELS: Record<EngineMode, string> = {
  DECISION: "Decision",
  INTENT: "Intent",
  NAVIGATION: "Navigation",
  RESEARCH: "Research",
};
const MODE_SUBTITLES: Record<EngineMode, string> = {
  DECISION: "Compare future paths under shared constraints and see which option carries the strongest viability profile.",
  INTENT: "Map one desired outcome into a constrained viability state, then tighten it through guided inputs or raw overrides.",
  NAVIGATION: "Preserve the corridor-style fold-space view for destination tuning and path exploration.",
  RESEARCH: "Expose the raw fold/research surface with detailed controls, sweep behavior, logging, and experiment-facing outputs.",
};
const MODE_NOTES: Record<EngineMode, string> = {
  DECISION: "The fold field stays visible, but the product now leads with option comparison instead of raw tuning.",
  INTENT: "Outcome modeling stays grounded: viability is comparative and constrained, not predictive.",
  NAVIGATION: "This mode keeps the original fold-space feel for direct path and target exploration.",
  RESEARCH: "Research mode preserves the technical surface and keeps the reduced model visible.",
};
const RAW_CONTROL_CONFIG: Array<{
  key: Exclude<keyof EngineControls, "target">;
  label: string;
  min: number;
  max: number;
  step?: number;
  color: string;
}> = [
  { key: "energy", label: "Energy Density", min: 0, max: 1, color: P.glow },
  { key: "curvature", label: "Curvature", min: 0, max: 1, color: P.glow2 },
  { key: "coherence", label: "Coherence", min: 0, max: 1, color: P.glow3 },
  { key: "ethics", label: "Alignment Bias", min: -1, max: 1, color: P.green },
  { key: "instability", label: "Instability", min: 0, max: 1, color: P.ember },
  { key: "eta", label: "η Selection Bias", min: -1.5, max: 1.5, color: P.gold },
];

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ color: P.dim, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.06em", marginBottom: 5, fontFamily: FONT }}>
        {label}
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          border: `1px solid ${P.border}`,
          background: P.ink,
          color: P.text,
          borderRadius: 8,
          padding: "10px 12px",
          fontFamily: FONT,
          fontSize: 13,
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatVector(vector: Vector3) {
  return vector.map((value) => value.toFixed(1)).join(", ");
}

export default function FoldEnginePage() {
  const presetList = presets as Preset[];
  const [mode, setMode] = useState<EngineMode>("DECISION");
  const [manualControls, setManualControls] = useState<EngineControls>(DEFAULT_MANUAL_CONTROLS);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);
  const [decisionOptions, setDecisionOptions] = useState<DecisionOption[]>(DEFAULT_DECISION_OPTIONS);
  const [selectedDecisionId, setSelectedDecisionId] = useState(DEFAULT_DECISION_OPTIONS[0].id);
  const [intentScenario, setIntentScenario] = useState<IntentScenario>(DEFAULT_INTENT_SCENARIO);
  const [advancedOpen, setAdvancedOpen] = useState({ decision: false, intent: false });
  const [logs, setLogs] = useState<LoggedRun[]>([]);
  const [t, setT] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setT((previous) => previous + 0.03), 30);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const persisted = loadPersistedProductState();
    if (persisted) {
      setMode(persisted.mode);
      setDecisionOptions(persisted.decisionOptions);
      setSelectedDecisionId(persisted.selectedDecisionId);
      setIntentScenario(persisted.intentScenario);
      setAdvancedOpen(persisted.advancedOpen);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!decisionOptions.some((option) => option.id === selectedDecisionId) && decisionOptions[0]) {
      setSelectedDecisionId(decisionOptions[0].id);
    }
  }, [decisionOptions, selectedDecisionId]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const state: PersistedProductState = {
      mode,
      decisionOptions,
      selectedDecisionId,
      intentScenario,
      advancedOpen,
    };

    savePersistedProductState(state);
  }, [advancedOpen, decisionOptions, hydrated, intentScenario, mode, selectedDecisionId]);

  const selectedDecisionOption = useMemo(
    () => decisionOptions.find((option) => option.id === selectedDecisionId) ?? decisionOptions[0],
    [decisionOptions, selectedDecisionId],
  );

  const decisionRankings = useMemo(() => evaluateDecisionOptions(decisionOptions), [decisionOptions]);
  const winningDecision = decisionRankings[0];
  const selectedDecisionEvaluation = useMemo(
    () => decisionRankings.find((entry) => entry.id === selectedDecisionOption?.id) ?? decisionRankings[0],
    [decisionRankings, selectedDecisionOption],
  );
  const intentEvaluation = useMemo(() => evaluateIntentScenario(intentScenario), [intentScenario]);
  const manualEvaluation = useMemo(
    () => evaluateEngineControls(mode === "RESEARCH" ? "Research Corridor" : "Navigation Corridor", manualControls),
    [manualControls, mode],
  );

  const displayEvaluation: ScenarioEvaluation =
    mode === "DECISION"
      ? selectedDecisionEvaluation?.evaluation ?? winningDecision.evaluation
      : mode === "INTENT"
        ? intentEvaluation
        : manualEvaluation;

  const selectedDecisionBase = selectedDecisionOption
    ? mapPracticalInputsToEngine(selectedDecisionOption.inputs)
    : null;
  const intentBase = mapPracticalInputsToEngine(intentScenario.inputs);

  const sweepRows = useMemo(() => {
    return [0.25, 0.45, 0.65, 0.85].flatMap((coherence) =>
      [0.15, 0.35].map((instability) => ({
        coherence,
        instability,
        score: computeFoldScoreExtended({
          curvature: manualControls.curvature,
          energy: manualControls.energy,
          coherence,
          ethics: manualControls.ethics,
          instability,
        }),
      })),
    );
  }, [manualControls.curvature, manualControls.energy, manualControls.ethics]);

  const summaryCards = useMemo(() => {
    const statusColor =
      displayEvaluation.engineStatus === "Aligned"
        ? P.green
        : displayEvaluation.engineStatus === "Possible"
          ? P.gold
          : P.ember;

    const leadingLabel =
      mode === "DECISION"
        ? selectedDecisionEvaluation?.name ?? "Option"
        : mode === "INTENT"
          ? intentScenario.label || "Outcome"
          : formatVector(manualControls.target);

    const leadingTitle =
      mode === "DECISION"
        ? "Current Option"
        : mode === "INTENT"
          ? "Outcome"
          : "Target Vector";

    const cards = [
      { label: "Mode", value: MODE_LABELS[mode], accent: P.glow2 },
      { label: leadingTitle, value: leadingLabel, accent: P.glow },
      { label: "Engine Status", value: displayEvaluation.engineStatus, accent: statusColor },
      { label: "Future Viability", value: formatPercent(displayEvaluation.foldScore), accent: P.green },
      { label: "Coherence Stability", value: formatPercent(displayEvaluation.stability), accent: P.glow3 },
      { label: "Instability Risk", value: formatPercent(displayEvaluation.constraints.riskScore), accent: P.ember },
      { label: "Experimental Visibility", value: displayEvaluation.visibility.toFixed(6), accent: P.gold },
    ];

    if (mode === "DECISION" && winningDecision) {
      cards.splice(2, 0, { label: "Best Option", value: winningDecision.name, accent: P.gold });
    }

    return cards;
  }, [displayEvaluation, intentScenario.label, manualControls.target, mode, selectedDecisionEvaluation, winningDecision]);

  const updateManualControl = <K extends keyof EngineControls>(key: K, value: EngineControls[K]) => {
    setSelectedPresetIndex(null);
    setManualControls((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const applyPreset = (index: number) => {
    const preset = presetList[index];
    if (!preset) {
      return;
    }

    setSelectedPresetIndex(index);
    setManualControls({
      energy: preset.energy,
      curvature: preset.curvature,
      coherence: preset.coherence,
      ethics: preset.ethics,
      instability: preset.instability,
      eta: preset.eta,
      target: preset.target as Vector3,
    });
  };

  const updateDecisionOption = (id: string, updater: (option: DecisionOption) => DecisionOption) => {
    setDecisionOptions((previous) => previous.map((option) => (option.id === id ? updater(option) : option)));
  };

  const updateDecisionInput = (field: keyof PracticalInputs, value: number) => {
    if (!selectedDecisionOption) {
      return;
    }

    updateDecisionOption(selectedDecisionOption.id, (option) => ({
      ...option,
      inputs: {
        ...option.inputs,
        [field]: value,
      },
    }));
  };

  const updateDecisionOverride = (field: Exclude<keyof EngineControls, "target">, value: number) => {
    if (!selectedDecisionOption) {
      return;
    }

    updateDecisionOption(selectedDecisionOption.id, (option) => ({
      ...option,
      overrides: {
        ...option.overrides,
        [field]: value,
      },
    }));
  };

  const resetDecisionOverrides = () => {
    if (!selectedDecisionOption) {
      return;
    }

    updateDecisionOption(selectedDecisionOption.id, (option) => ({
      ...option,
      overrides: undefined,
    }));
  };

  const updateIntentInput = (field: keyof PracticalInputs, value: number) => {
    setIntentScenario((previous) => ({
      ...previous,
      inputs: {
        ...previous.inputs,
        [field]: value,
      },
    }));
  };

  const updateIntentOverride = (field: Exclude<keyof EngineControls, "target">, value: number) => {
    setIntentScenario((previous) => ({
      ...previous,
      overrides: {
        ...previous.overrides,
        [field]: value,
      },
    }));
  };

  const resetIntentOverrides = () => {
    setIntentScenario((previous) => ({
      ...previous,
      overrides: undefined,
    }));
  };

  const recordRun = () => {
    const run: LoggedRun = {
      timestamp: new Date().toISOString(),
      mode,
      label:
        mode === "DECISION"
          ? selectedDecisionEvaluation?.name ?? "Decision Option"
          : mode === "INTENT"
            ? intentScenario.label || "Outcome"
            : displayEvaluation.label,
      practicalInputs:
        mode === "DECISION"
          ? selectedDecisionOption?.inputs
          : mode === "INTENT"
            ? intentScenario.inputs
            : undefined,
      params: displayEvaluation.params,
      outputs: {
        foldScore: displayEvaluation.foldScore,
        aperture: displayEvaluation.aperture,
        stability: displayEvaluation.stability,
        visibility: displayEvaluation.visibility,
        foldClass: displayEvaluation.foldClass,
        chosenCost: displayEvaluation.chosenCost,
        chosenProbability: displayEvaluation.chosenProbability,
        insight: displayEvaluation.insight,
      },
      constraints: displayEvaluation.constraints,
      comparison:
        mode === "DECISION"
          ? decisionRankings.map((entry) => ({
              label: entry.name,
              decisionScore: entry.evaluation.decisionScore,
              foldScore: entry.evaluation.foldScore,
              riskScore: entry.evaluation.constraints.riskScore,
            }))
          : undefined,
    };

    setLogs((previous) => [...previous, run]);
  };

  const exportRuns = () => {
    if (logs.length === 0) {
      return;
    }

    const payload = serializeRunArchive(logs);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fold-space-engine-runs.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderAdvancedControls = (
    controls: EngineControls,
    onChange: (field: Exclude<keyof EngineControls, "target">, value: number) => void,
    onReset: () => void,
  ) => (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${P.border}` }}>
      <div style={{ color: P.dim, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Advanced Controls
      </div>
      {RAW_CONTROL_CONFIG.map((control) => (
        <Knob
          key={control.key}
          label={control.label}
          value={controls[control.key]}
          onChange={(value) => onChange(control.key, value)}
          min={control.min}
          max={control.max}
          step={control.step}
          color={control.color}
        />
      ))}
      <button
        onClick={onReset}
        style={{
          border: `1px solid ${P.border}`,
          background: P.ink,
          color: P.dim,
          padding: "8px 10px",
          borderRadius: 8,
          cursor: "pointer",
          fontFamily: FONT,
        }}
      >
        Reset to Guided Mapping
      </button>
    </div>
  );

  const renderDecisionControls = () => {
    if (!selectedDecisionOption || !selectedDecisionBase) {
      return null;
    }

    const overrideControls = {
      ...selectedDecisionBase,
      ...selectedDecisionOption.overrides,
    };

    return (
      <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ color: P.dim, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 12, marginBottom: 10 }}>Decision Inputs</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {decisionOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedDecisionId(option.id)}
              style={{
                border: `1px solid ${selectedDecisionId === option.id ? P.glow : P.border}`,
                background: selectedDecisionId === option.id ? `${P.glow}14` : P.ink,
                color: selectedDecisionId === option.id ? P.glow : P.text,
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: FONT,
                fontSize: 12,
              }}
            >
              {option.name}
            </button>
          ))}
        </div>

        <TextField
          label="Option Name"
          value={selectedDecisionOption.name}
          onChange={(value) =>
            updateDecisionOption(selectedDecisionOption.id, (option) => ({
              ...option,
              name: value,
            }))
          }
          placeholder="Name this path"
        />

        <Knob label="Alignment" value={selectedDecisionOption.inputs.alignment} onChange={(value) => updateDecisionInput("alignment", value)} min={0} max={1} color={P.glow3} />
        <Knob label="Complexity" value={selectedDecisionOption.inputs.complexity} onChange={(value) => updateDecisionInput("complexity", value)} min={0} max={1} color={P.glow} />
        <Knob label="Time Horizon" value={selectedDecisionOption.inputs.timeHorizon} onChange={(value) => updateDecisionInput("timeHorizon", value)} min={0} max={1} color={P.glow2} />
        <Knob label="Stability" value={selectedDecisionOption.inputs.stability} onChange={(value) => updateDecisionInput("stability", value)} min={0} max={1} color={P.green} />

        <button
          onClick={() => setAdvancedOpen((previous) => ({ ...previous, decision: !previous.decision }))}
          style={{
            border: `1px solid ${advancedOpen.decision ? P.gold : P.border}`,
            background: advancedOpen.decision ? `${P.gold}14` : P.ink,
            color: advancedOpen.decision ? P.gold : P.text,
            padding: "9px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: FONT,
            width: "100%",
            marginTop: 8,
          }}
        >
          {advancedOpen.decision ? "Hide Advanced Controls" : "Show Advanced Controls"}
        </button>

        {advancedOpen.decision && renderAdvancedControls(overrideControls, updateDecisionOverride, resetDecisionOverrides)}
      </div>
    );
  };

  const renderIntentControls = () => {
    const overrideControls = {
      ...intentBase,
      ...intentScenario.overrides,
    };

    return (
      <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ color: P.dim, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 12, marginBottom: 10 }}>Intent Inputs</div>
        <TextField
          label="Outcome Label"
          value={intentScenario.label}
          onChange={(value) => setIntentScenario((previous) => ({ ...previous, label: value }))}
          placeholder="Describe the target outcome"
        />

        <Knob label="Alignment" value={intentScenario.inputs.alignment} onChange={(value) => updateIntentInput("alignment", value)} min={0} max={1} color={P.glow3} />
        <Knob label="Complexity" value={intentScenario.inputs.complexity} onChange={(value) => updateIntentInput("complexity", value)} min={0} max={1} color={P.glow} />
        <Knob label="Time Horizon" value={intentScenario.inputs.timeHorizon} onChange={(value) => updateIntentInput("timeHorizon", value)} min={0} max={1} color={P.glow2} />
        <Knob label="Stability" value={intentScenario.inputs.stability} onChange={(value) => updateIntentInput("stability", value)} min={0} max={1} color={P.green} />

        <button
          onClick={() => setAdvancedOpen((previous) => ({ ...previous, intent: !previous.intent }))}
          style={{
            border: `1px solid ${advancedOpen.intent ? P.gold : P.border}`,
            background: advancedOpen.intent ? `${P.gold}14` : P.ink,
            color: advancedOpen.intent ? P.gold : P.text,
            padding: "9px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: FONT,
            width: "100%",
            marginTop: 8,
          }}
        >
          {advancedOpen.intent ? "Hide Advanced Controls" : "Show Advanced Controls"}
        </button>

        {advancedOpen.intent && renderAdvancedControls(overrideControls, updateIntentOverride, resetIntentOverrides)}
      </div>
    );
  };

  const renderManualControls = (showResearchNote: boolean) => (
    <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ color: P.dim, textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 12, marginBottom: 10 }}>
        {showResearchNote ? "Research Controls" : "Navigation Controls"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <Knob label="Energy Density" value={manualControls.energy} onChange={(value) => updateManualControl("energy", value)} min={0} max={1} color={P.glow} />
          <Knob label="Curvature" value={manualControls.curvature} onChange={(value) => updateManualControl("curvature", value)} min={0} max={1} color={P.glow2} />
          <Knob label="Coherence" value={manualControls.coherence} onChange={(value) => updateManualControl("coherence", value)} min={0} max={1} color={P.glow3} />
          <Knob label="Alignment Bias" value={manualControls.ethics} onChange={(value) => updateManualControl("ethics", value)} min={-1} max={1} color={P.green} />
          <Knob label="Instability" value={manualControls.instability} onChange={(value) => updateManualControl("instability", value)} min={0} max={1} color={P.ember} />
          <Knob label="η Selection Bias" value={manualControls.eta} onChange={(value) => updateManualControl("eta", value)} min={-1.5} max={1.5} color={P.gold} />
        </div>
        <div>
          <Knob label="Target X" value={manualControls.target[0]} onChange={(value) => updateManualControl("target", [value, manualControls.target[1], manualControls.target[2]])} min={-20} max={20} step={0.1} color={P.glow} />
          <Knob label="Target Y" value={manualControls.target[1]} onChange={(value) => updateManualControl("target", [manualControls.target[0], value, manualControls.target[2]])} min={-20} max={20} step={0.1} color={P.glow2} />
          <Knob label="Target Z" value={manualControls.target[2]} onChange={(value) => updateManualControl("target", [manualControls.target[0], manualControls.target[1], value])} min={-20} max={20} step={0.1} color={P.glow3} />
          <div style={{ marginTop: 12 }}>
            <div style={{ color: P.dim, fontSize: 12, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Presets</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {presetList.map((preset, index) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(index)}
                  style={{
                    textAlign: "left",
                    border: `1px solid ${selectedPresetIndex === index ? P.glow : P.border}`,
                    background: selectedPresetIndex === index ? `${P.glow}14` : P.ink,
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
    </div>
  );

  const renderModeSpecificBottom = () => {
    if (mode === "DECISION") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)", gap: 20, marginTop: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {decisionRankings.map((entry) => {
              const winner = winningDecision?.id === entry.id;
              const selected = selectedDecisionId === entry.id;

              return (
                <button
                  key={entry.id}
                  onClick={() => setSelectedDecisionId(entry.id)}
                  style={{
                    textAlign: "left",
                    border: `1px solid ${winner ? P.green : selected ? P.glow : P.border}`,
                    background: winner ? `${P.green}12` : selected ? `${P.glow}10` : P.panel,
                    color: P.text,
                    padding: 14,
                    borderRadius: 12,
                    cursor: "pointer",
                    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{entry.name}</div>
                    {winner && <span style={{ color: P.green, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Best</span>}
                  </div>
                  <div style={{ color: P.dim, fontSize: 12, marginBottom: 8 }}>Future Viability {formatPercent(entry.evaluation.foldScore)}</div>
                  <div style={{ color: P.dim, fontSize: 12, marginBottom: 8 }}>Instability Risk {formatPercent(entry.evaluation.constraints.riskScore)}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6 }}>{entry.evaluation.insight}</div>
                </button>
              );
            })}
          </div>
          <EngineLog logs={logs} />
        </div>
      );
    }

    if (mode === "INTENT") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
          <GlowBox color={P.glow2}>
            <div><strong>Derived Energy:</strong> {intentEvaluation.params.energy.toFixed(3)}</div>
            <div><strong>Derived Curvature:</strong> {intentEvaluation.params.curvature.toFixed(3)}</div>
            <div><strong>Derived Coherence:</strong> {intentEvaluation.params.coherence.toFixed(3)}</div>
            <div><strong>Derived Target:</strong> {formatVector(intentEvaluation.params.target)}</div>
          </GlowBox>
          <EngineLog logs={logs} />
        </div>
      );
    }

    if (mode === "NAVIGATION") {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
          <GlowBox color={P.glow2}>
            <div><strong>Target Distance:</strong> {displayEvaluation.targetDistance.toFixed(2)}</div>
            <div><strong>Optimal Path Cost:</strong> {displayEvaluation.chosenCost.toFixed(3)}</div>
            <div><strong>Field Interaction:</strong> {displayEvaluation.fields.fieldInteraction.toFixed(3)}</div>
            <div><strong>Target Vector:</strong> {formatVector(displayEvaluation.params.target)}</div>
          </GlowBox>
          <EngineLog logs={logs} />
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
        <ParameterSweepPanel rows={sweepRows} />
        <GlowBox color={P.glow2}>
          <div><strong>Φc:</strong> {displayEvaluation.fields.Phi_c.toFixed(3)}</div>
          <div><strong>E:</strong> {displayEvaluation.fields.E.toFixed(3)}</div>
          <div><strong>Field Interaction:</strong> {displayEvaluation.fields.fieldInteraction.toFixed(3)}</div>
          <div><strong>Target Distance:</strong> {displayEvaluation.targetDistance.toFixed(2)}</div>
        </GlowBox>
        <EngineLog logs={logs} />
      </div>
    );
  };

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #111522 0%, #06070c 55%)", color: P.text, fontFamily: FONT, padding: 24 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <DeviceHeader
          name="Fold-Space Engine"
          subtitle={MODE_SUBTITLES[mode]}
          color={mode === "DECISION" ? P.green : mode === "INTENT" ? P.glow3 : mode === "NAVIGATION" ? P.glow : P.gold}
          classification="Practical Demo"
        />

        {mode === "RESEARCH" ? (
          <>
            <EqBlock>{"F = αK + βρ + χΦc + ε(Φc·E) − δI"}</EqBlock>
            <EqBlock color={P.glow2}>{"P(i) ∝ |c_i|² exp(η ΔE_i)"}</EqBlock>
            <EqBlock color={P.gold}>{"V / V0 = exp(-Γ T Δx²)"}</EqBlock>
          </>
        ) : (
          <GlowBox color={P.glow}>
            Compare future viability under explicit constraints. The fold field stays visible, but the user journey now starts with outcomes and tradeoffs.
          </GlowBox>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, margin: "18px 0 20px" }}>
          {summaryCards.map((item) => (
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
              <div style={{ color: item.accent, fontSize: 18, fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0 20px" }}>
          {(Object.keys(MODE_LABELS) as EngineMode[]).map((nextMode) => (
            <button
              key={nextMode}
              onClick={() => setMode(nextMode)}
              style={{
                border: `1px solid ${mode === nextMode ? P.glow : P.border}`,
                background: mode === nextMode ? `${P.glow}14` : P.panel,
                color: mode === nextMode ? P.glow : P.text,
                padding: "10px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              {MODE_LABELS[nextMode]}
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

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 20, alignItems: "start" }}>
          <div>
            <FoldField aperture={displayEvaluation.aperture} stability={displayEvaluation.stability} t={t} chosenTarget={displayEvaluation.chosenTarget} />
            <div style={{ marginTop: 12, color: P.dim, fontSize: 12, lineHeight: 1.7 }}>{MODE_NOTES[mode]}</div>

            <GlowBox color={P.glow} glow>
              <div><strong>Future Viability:</strong> {formatPercent(displayEvaluation.foldScore)}</div>
              <div><strong>Coherence Stability:</strong> {formatPercent(displayEvaluation.stability)}</div>
              <div><strong>Corridor Aperture:</strong> {displayEvaluation.aperture.toFixed(3)}</div>
              <div><strong>Chosen Path Confidence:</strong> {formatPercent(displayEvaluation.chosenProbability)}</div>
            </GlowBox>

            <GlowBox color={P.glow3} glow>
              <div><strong>Insight:</strong> {displayEvaluation.insight}</div>
            </GlowBox>

            <ConstraintPanel constraints={displayEvaluation.constraints} />
            <ExperimentPanel visibility={displayEvaluation.visibility} gammaEff={displayEvaluation.gammaEff} />
          </div>

          <div>
            {mode === "DECISION" && renderDecisionControls()}
            {mode === "INTENT" && renderIntentControls()}
            {mode === "NAVIGATION" && renderManualControls(false)}
            {mode === "RESEARCH" && renderManualControls(true)}
          </div>
        </div>

        {renderModeSpecificBottom()}
      </div>
    </main>
  );
}
