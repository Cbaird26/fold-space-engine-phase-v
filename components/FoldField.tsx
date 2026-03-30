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
      ctx.fillStyle = "#05060a";
      ctx.fillRect(0, 0, W, H);
      const spacing = 20;
      const strength = aperture * 50;
      const oscillation = Math.sin(t * 2) * (1 - stability);
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

      const cx = W / 2;
      const cy = H / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 40 + aperture * 60, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168,85,247,${0.3 + aperture})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      const tx = cx + chosenTarget[0] * 8;
      const ty = cy + chosenTarget[1] * 12;
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

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [aperture, stability, t, chosenTarget]);

  return <canvas ref={ref} width={440} height={380} style={{ width: "100%", maxWidth: 440, borderRadius: 8, border: "1px solid #222640", background: "#05060a" }} />;
}
