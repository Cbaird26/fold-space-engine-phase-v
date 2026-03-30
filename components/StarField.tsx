"use client";

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;

export function StarField({ width, height }: { width: number; height: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stars = useRef<{ x: number; y: number; r: number; s: number; p: number }[]>([]);

  useEffect(() => {
    if (!stars.current.length) {
      for (let i = 0; i < 80; i++) {
        stars.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.2 + 0.3,
          s: Math.random() * 0.005 + 0.002,
          p: Math.random() * TAU,
        });
      }
    }
    let frame = 0;
    const draw = (t: number) => {
      const cv = ref.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (const s of stars.current) {
        const a = 0.3 + 0.7 * Math.abs(Math.sin(t * s.s + s.p));
        ctx.fillStyle = `rgba(150,170,220,${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [width, height]);

  return <canvas ref={ref} width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
}
