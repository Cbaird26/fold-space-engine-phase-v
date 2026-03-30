"use client";

import { useEffect, useRef } from "react";
import { computeCoherenceWarpCore } from "@/lib/coherenceEngine";
import type { CoherenceHoldMode } from "@/lib/types";

const P = {
  border: "#222640",
  panel: "#0b0d16",
  text: "#d4d8e8",
  dim: "#8890b0",
  glow: "#00f0ff",
  glow2: "#b374ff",
  green: "#3de8a8",
  gold: "#fbbf24",
};
const FONT = "'Courier New', 'Lucida Console', monospace";

export function CoherenceWarpCore({
  coherence,
  stability,
  foldScore,
  riskScore,
  holdMode,
  t,
}: {
  coherence: number;
  stability: number;
  foldScore: number;
  riskScore: number;
  holdMode: CoherenceHoldMode;
  t: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const state = computeCoherenceWarpCore({
    coherence,
    stability,
    foldScore,
    riskScore,
    holdMode,
  });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2 - 30;
    const targetRadius = 42 + state.targetCoherence * 84;
    const currentRadius = 32 + coherence * 88 + Math.sin(t * 5) * state.lockStrength * 2;
    const bandRadius = state.holdBand * 120;
    const baseColor =
      state.phase === "LOCKED"
        ? P.green
        : state.phase === "RAMP"
          ? P.gold
          : P.glow;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, width, height);

    const radial = ctx.createRadialGradient(centerX, centerY, 18, centerX, centerY, targetRadius + 40);
    radial.addColorStop(0, "rgba(0,240,255,0.16)");
    radial.addColorStop(0.4, "rgba(179,116,255,0.10)");
    radial.addColorStop(1, "rgba(5,6,10,0)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, targetRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `${baseColor}55`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, targetRadius - bandRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `${baseColor}22`;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, targetRadius + bandRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `${baseColor}22`;
    ctx.lineWidth = 5;
    ctx.stroke();

    for (let ring = 0; ring < 3; ring += 1) {
      const orbitRadius = currentRadius + ring * 20 + Math.sin(t * (2 + ring)) * 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = ring === 0 ? "rgba(0,240,255,0.35)" : ring === 1 ? "rgba(179,116,255,0.25)" : "rgba(61,232,168,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 28 + state.lockStrength * 12, 0, Math.PI * 2);
    const core = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, 42);
    core.addColorStop(0, "rgba(255,255,255,0.95)");
    core.addColorStop(0.25, "rgba(0,240,255,0.92)");
    core.addColorStop(0.7, "rgba(179,116,255,0.35)");
    core.addColorStop(1, "rgba(179,116,255,0)");
    ctx.fillStyle = core;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, currentRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * coherence);
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    const graphLeft = 28;
    const graphTop = height - 86;
    const graphWidth = width - graphLeft * 2;
    const graphHeight = 54;
    const targetY = graphTop + (1 - state.targetCoherence) * graphHeight;

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(graphLeft, graphTop, graphWidth, graphHeight);

    ctx.beginPath();
    ctx.moveTo(graphLeft, targetY);
    ctx.lineTo(graphLeft + graphWidth, targetY);
    ctx.strokeStyle = `${baseColor}55`;
    ctx.stroke();

    ctx.beginPath();
    state.projectedCurve.forEach((point, index) => {
      const x = graphLeft + (graphWidth * index) / (state.projectedCurve.length - 1);
      const y = graphTop + (1 - point) * graphHeight;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = P.glow;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [coherence, foldScore, holdMode, riskScore, stability, state.holdBand, state.lockStrength, state.phase, state.projectedCurve, state.targetCoherence, t]);

  return (
    <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, padding: 14, background: P.panel }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ color: P.text, fontWeight: 700, fontSize: 15 }}>Coherence Engine Warp Core</div>
        <div style={{ color: state.phase === "LOCKED" ? P.green : state.phase === "RAMP" ? P.gold : P.glow, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {state.phase}
        </div>
      </div>

      <canvas
        ref={ref}
        width={440}
        height={320}
        style={{ width: "100%", maxWidth: 440, borderRadius: 10, border: `1px solid ${P.border}`, background: "#05060a", display: "block" }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 12, color: P.text, fontFamily: FONT, fontSize: 11, lineHeight: 1.6 }}>
        <div><strong>Current Coherence:</strong> {coherence.toFixed(3)}</div>
        <div><strong>Target Lock:</strong> {state.targetCoherence.toFixed(3)}</div>
        <div><strong>Lock Strength:</strong> {(state.lockStrength * 100).toFixed(1)}%</div>
        <div><strong>Maintainability:</strong> {(state.maintainability * 100).toFixed(1)}%</div>
        <div><strong>Hold Mode:</strong> {holdMode === "INDEFINITE" ? "Indefinite Hold" : "Until Fold-State"}</div>
        <div><strong>Lock Band:</strong> ±{state.holdBand.toFixed(3)}</div>
      </div>

      <div style={{ marginTop: 12, color: P.dim, fontFamily: FONT, fontSize: 12, lineHeight: 1.7 }}>
        {state.guidance}
      </div>
    </div>
  );
}
