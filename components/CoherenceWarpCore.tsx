"use client";

import { useEffect, useRef } from "react";
import { computeCoherenceSequence, computeCoherenceWarpCore } from "@/lib/coherenceEngine";
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
  const sequence = computeCoherenceSequence({
    lockStrength: state.lockStrength,
    t,
  });
  const { loopProgress, sequenceLabel } = sequence;

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
    const focusX = width * 0.72;
    const focusY = height * 0.42;
    const chamberX = 64;
    const chamberY = 54;
    const chamberWidth = 78;
    const chamberHeight = 128;
    const tunnelPulse = Math.sin(t * 4) * 6;
    const sequenceProgress = loopProgress;
    const clearScreenWhiteout = sequence.clearScreenWhiteout;
    const coherentGlow = sequence.coherentGlow;
    const whiteoutStage =
      sequence.stage === "CLEAR" || sequence.stage === "COHERENT";
    const warpDrift = 0.55 + state.lockStrength * 0.85;
    const baseColor =
      state.phase === "LOCKED"
        ? P.green
        : state.phase === "RAMP"
          ? P.gold
          : P.glow;

    ctx.clearRect(0, 0, width, height);
    const backdrop = ctx.createLinearGradient(0, 0, width, height);
    backdrop.addColorStop(0, "#04060d");
    backdrop.addColorStop(0.45, "#07111c");
    backdrop.addColorStop(1, "#030409");
    ctx.fillStyle = backdrop;
    ctx.fillRect(0, 0, width, height);

    const tunnelGlow = ctx.createRadialGradient(focusX, focusY, 18, focusX, focusY, 220);
    tunnelGlow.addColorStop(0, `${baseColor}33`);
    tunnelGlow.addColorStop(0.35, "rgba(0,240,255,0.14)");
    tunnelGlow.addColorStop(0.7, "rgba(179,116,255,0.08)");
    tunnelGlow.addColorStop(1, "rgba(5,6,10,0)");
    ctx.fillStyle = tunnelGlow;
    ctx.fillRect(0, 0, width, height);

    if (clearScreenWhiteout > 0.02) {
      const arrivalWash = ctx.createRadialGradient(focusX, focusY, 12, focusX, focusY, 300);
      arrivalWash.addColorStop(0, `rgba(255,255,255,${0.92 + clearScreenWhiteout * 0.08})`);
      arrivalWash.addColorStop(0.25, `rgba(255,255,255,${0.52 + clearScreenWhiteout * 0.28})`);
      arrivalWash.addColorStop(0.55, `rgba(225,245,255,${0.18 + clearScreenWhiteout * 0.22})`);
      arrivalWash.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = arrivalWash;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = `rgba(255,255,255,${0.16 + clearScreenWhiteout * 0.32})`;
      ctx.fillRect(0, 0, width, height);
    }

    if (coherentGlow > 0.02) {
      const coherentWash = ctx.createRadialGradient(focusX, focusY, 18, focusX, focusY, 360);
      coherentWash.addColorStop(0, "rgba(255,255,255,1)");
      coherentWash.addColorStop(0.18, `rgba(255,255,255,${0.9 + coherentGlow * 0.1})`);
      coherentWash.addColorStop(0.4, `rgba(255,244,214,${0.48 + coherentGlow * 0.32})`);
      coherentWash.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = coherentWash;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = `rgba(255,255,255,${0.28 + coherentGlow * 0.52})`;
      ctx.fillRect(0, 0, width, height);
    }

    if (whiteoutStage) {
      ctx.fillStyle = sequence.stage === "COHERENT" ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.96)";
      ctx.fillRect(0, 0, width, height);
    }

    for (let ring = 0; ring < 8; ring += 1) {
      const progress = ((ring / 8) + (t * 0.12 * warpDrift)) % 1;
      const radiusX = 34 + progress * 180 + tunnelPulse;
      const radiusY = 14 + progress * 72 + tunnelPulse * 0.35;
      const alpha = 0.08 + (1 - progress) * 0.2;
      ctx.beginPath();
      ctx.ellipse(focusX, focusY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = state.phase === "LOCKED" ? `rgba(61,232,168,${alpha})` : `rgba(0,240,255,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    for (let streak = 0; streak < 28; streak += 1) {
      const seed = streak * 17.173;
      const lane = (Math.sin(seed) * 0.5 + 0.5) * 1.4 - 0.7;
      const progress = (t * (0.22 + state.lockStrength * 0.4 + clearScreenWhiteout * 0.35 + coherentGlow * 0.45) + streak * 0.113) % 1;
      const startX = focusX - progress * 300;
      const startY = focusY + lane * (22 + progress * 110);
      const length = 14 + progress * 60 * (0.6 + state.lockStrength);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX - length, startY + lane * 6);
      ctx.strokeStyle = streak % 3 === 0 ? "rgba(255,255,255,0.55)" : streak % 2 === 0 ? "rgba(0,240,255,0.42)" : "rgba(179,116,255,0.28)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(9,12,22,0.95)";
    ctx.fillRect(chamberX, chamberY, chamberWidth, chamberHeight);
    ctx.strokeStyle = "rgba(179,116,255,0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(chamberX, chamberY, chamberWidth, chamberHeight);

    const plasma = ctx.createLinearGradient(chamberX + chamberWidth / 2, chamberY, chamberX + chamberWidth / 2, chamberY + chamberHeight);
    plasma.addColorStop(0, "rgba(179,116,255,0)");
    plasma.addColorStop(0.2, "rgba(179,116,255,0.5)");
    plasma.addColorStop(0.5, "rgba(0,240,255,0.95)");
    plasma.addColorStop(0.8, "rgba(179,116,255,0.5)");
    plasma.addColorStop(1, "rgba(179,116,255,0)");
    ctx.fillStyle = plasma;
    ctx.fillRect(chamberX + 30, chamberY + 8, 18, chamberHeight - 16);

    ctx.beginPath();
    ctx.moveTo(chamberX + chamberWidth, focusY - 30);
    ctx.quadraticCurveTo(focusX - 88, focusY - 44 - state.holdBand * 120, width - 34, focusY - 18);
    ctx.strokeStyle = "rgba(0,240,255,0.28)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(chamberX + chamberWidth, focusY + 30);
    ctx.quadraticCurveTo(focusX - 88, focusY + 44 + state.holdBand * 120, width - 34, focusY + 18);
    ctx.strokeStyle = "rgba(0,240,255,0.28)";
    ctx.lineWidth = 3;
    ctx.stroke();

    const beam = ctx.createLinearGradient(chamberX + chamberWidth, focusY, focusX - 16, focusY);
    beam.addColorStop(0, "rgba(0,240,255,0.85)");
    beam.addColorStop(0.35, "rgba(179,116,255,0.55)");
    beam.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.moveTo(chamberX + chamberWidth, focusY);
    ctx.lineTo(focusX - 18, focusY);
    ctx.strokeStyle = beam;
    ctx.lineWidth = 8 + state.lockStrength * 4 + clearScreenWhiteout * 8 + coherentGlow * 12;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(focusX, focusY, 18 + state.lockStrength * 9, 0, Math.PI * 2);
    const focusCore = ctx.createRadialGradient(focusX, focusY, 2, focusX, focusY, 36);
    focusCore.addColorStop(0, "rgba(255,255,255,0.98)");
    focusCore.addColorStop(0.35, "rgba(0,240,255,0.9)");
    focusCore.addColorStop(0.7, `${baseColor}88`);
    focusCore.addColorStop(1, `${baseColor}00`);
    ctx.fillStyle = focusCore;
    ctx.fill();

    if (clearScreenWhiteout > 0.02) {
      ctx.beginPath();
      ctx.arc(focusX, focusY, 36 + clearScreenWhiteout * 46, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.24 + clearScreenWhiteout * 0.46})`;
      ctx.fill();
    }

    if (coherentGlow > 0.02) {
      ctx.beginPath();
      ctx.arc(focusX, focusY, 56 + coherentGlow * 72, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,248,230,${0.36 + coherentGlow * 0.5})`;
      ctx.fill();
    }

    ctx.font = "700 11px 'Courier New', 'Lucida Console', monospace";
    ctx.textBaseline = "middle";
    ctx.fillStyle = sequenceProgress < 0.24 ? "rgba(255,255,255,0.96)" : "rgba(212,216,232,0.62)";
    ctx.fillText("ENGAGE (INTENTION)", chamberX - 4, chamberY - 18);
    ctx.fillStyle =
      sequenceProgress >= 0.24 && sequenceProgress < 0.74
        ? "rgba(255,255,255,0.96)"
        : "rgba(212,216,232,0.62)";
    ctx.fillText("WARP", focusX - 20, focusY - 50);
    ctx.fillStyle =
      sequenceProgress >= 0.74 && sequenceProgress < 0.9
        ? `rgba(255,255,255,${0.78 + clearScreenWhiteout * 0.22})`
        : "rgba(212,216,232,0.62)";
    ctx.fillText("ARRIVAL / CLEAR SCREEN", focusX - 80, focusY + 48);
    ctx.fillStyle = sequenceProgress >= 0.9 ? `rgba(255,255,255,${0.82 + coherentGlow * 0.18})` : "rgba(212,216,232,0.62)";
    ctx.fillText("COHERENT", focusX - 28, focusY + 68);

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

    const sequenceY = graphTop - 18;
    const sequenceLeft = graphLeft;
    const sequenceWidth = graphWidth;
    const steps = [
      { label: "ENGAGE", active: sequenceProgress < 0.24, x: sequenceLeft + sequenceWidth * 0.06 },
      { label: "WARP", active: sequenceProgress >= 0.24 && sequenceProgress < 0.74, x: sequenceLeft + sequenceWidth * 0.34 },
      { label: "CLEAR", active: sequenceProgress >= 0.74 && sequenceProgress < 0.9, x: sequenceLeft + sequenceWidth * 0.64 },
      { label: "COHERENT", active: sequenceProgress >= 0.9, x: sequenceLeft + sequenceWidth * 0.8 },
    ];

    steps.forEach((step, index) => {
      ctx.beginPath();
      ctx.arc(step.x, sequenceY, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = step.active ? (index >= 2 ? `rgba(255,255,255,${0.72 + clearScreenWhiteout * 0.16 + coherentGlow * 0.12})` : baseColor) : "rgba(255,255,255,0.14)";
      ctx.fill();
      ctx.fillStyle = step.active ? "rgba(255,255,255,0.9)" : "rgba(212,216,232,0.55)";
      ctx.font = "10px 'Courier New', 'Lucida Console', monospace";
      ctx.fillText(step.label, step.x + 10, sequenceY);
    });
  }, [coherence, foldScore, holdMode, loopProgress, riskScore, sequence.clearScreenWhiteout, sequence.coherentGlow, stability, state.holdBand, state.lockStrength, state.phase, state.projectedCurve, state.targetCoherence, t]);

  return (
    <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, padding: 14, background: P.panel }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ color: P.text, fontWeight: 700, fontSize: 15 }}>Coherence Engine Warp Core</div>
        <div style={{ color: sequenceLabel === "ARRIVAL / CLEAR SCREEN" || sequenceLabel === "COHERENT" ? "#ffffff" : state.phase === "LOCKED" ? P.green : state.phase === "RAMP" ? P.gold : P.glow, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {sequenceLabel}
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

      <div style={{ marginTop: 8, color: P.text, fontFamily: FONT, fontSize: 11, lineHeight: 1.6 }}>
        Loop: Engage (Intention) - Warp - Arrival / Clear Screen - Coherent - Re-engage
      </div>
    </div>
  );
}
