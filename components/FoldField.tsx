"use client";

import { useEffect, useRef } from "react";

export function FoldField({
  aperture,
  stability,
  t,
  chosenTarget,
}: {
  aperture: number;
  stability: number;
  t: number;
  chosenTarget: [number, number, number];
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let frame = 0;
    const draw = () => {
      const cv = ref.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      const W = cv.width;
      const H = cv.height;
      const backdrop = ctx.createLinearGradient(0, 0, W, H);
      backdrop.addColorStop(0, "#04060d");
      backdrop.addColorStop(0.5, "#08111a");
      backdrop.addColorStop(1, "#04050a");
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, W, H);
      const spacing = 20;
      const strength = aperture * 50;
      const oscillation = Math.sin(t * 2) * (1 - stability);
      const cx = W / 2;
      const cy = H / 2;
      const tx = cx + chosenTarget[0] * 8;
      const ty = cy + chosenTarget[1] * 12;
      const sweepX = ((t * 90) % (W + 120)) - 60;

      const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
      glow.addColorStop(0, "rgba(0,240,255,0.14)");
      glow.addColorStop(0.4, "rgba(179,116,255,0.08)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      for (let star = 0; star < 32; star += 1) {
        const seed = star * 19.19;
        const x = (Math.sin(seed) * 0.5 + 0.5) * W;
        const y = ((Math.cos(seed * 1.7 + t * 0.2) * 0.5 + 0.5) * H * 0.85) + 10;
        const length = 4 + aperture * 12 + ((star % 4) * 3);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - length, y);
        ctx.strokeStyle = star % 3 === 0 ? "rgba(255,255,255,0.45)" : "rgba(0,240,255,0.22)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(0,240,255,0.3)";
      ctx.lineWidth = 1;

      for (let x = 0; x < W; x += spacing) {
        ctx.beginPath();
        for (let y = 0; y < H; y += 5) {
          const dx = Math.sin(y * 0.02 + t) * strength + oscillation * 20;
          ctx.lineTo(x + dx, y);
        }
        ctx.stroke();
      }

      for (let y = 0; y < H; y += spacing) {
        ctx.beginPath();
        for (let x = 0; x < W; x += 5) {
          const dy = Math.cos(x * 0.02 + t) * strength + oscillation * 20;
          ctx.lineTo(x, y + dy);
        }
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 40 + aperture * 60, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168,85,247,${0.3 + aperture})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(tx, ty, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(tx, ty, 18 + Math.sin(t * 3) * 4, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(tx - 18, ty);
      ctx.lineTo(tx + 18, ty);
      ctx.moveTo(tx, ty - 18);
      ctx.lineTo(tx, ty + 18);
      ctx.strokeStyle = "rgba(255,255,255,0.72)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fillRect(sweepX, 0, 48, H);

      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(16, 16, W - 32, H - 32);

      const brackets = [
        [22, 22, 50, 22, 22, 50],
        [W - 22, 22, W - 50, 22, W - 22, 50],
        [22, H - 22, 50, H - 22, 22, H - 50],
        [W - 22, H - 22, W - 50, H - 22, W - 22, H - 50],
      ];

      ctx.strokeStyle = "rgba(0,240,255,0.55)";
      ctx.lineWidth = 2;
      brackets.forEach(([x1, y1, x2, y2, x3, y3]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.stroke();
      });

      ctx.fillStyle = "rgba(212,216,232,0.8)";
      ctx.font = "11px 'Courier New', 'Lucida Console', monospace";
      ctx.fillText("ZORAASI BRIDGE VIEWFINDER", 28, 34);
      ctx.fillText("TARGET LOCK", W - 104, 34);
      ctx.fillText(`VECTOR ${chosenTarget.map((value) => value.toFixed(1)).join(" / ")}`, 28, H - 22);

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [aperture, stability, t, chosenTarget]);

  return <canvas ref={ref} width={440} height={380} style={{ width: "100%", maxWidth: 440, borderRadius: 16, border: "1px solid rgba(105,124,182,0.28)", background: "#05060a", boxShadow: "0 26px 60px rgba(0,0,0,0.28)" }} />;
}
