const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const normalizedHash = (seed: number) => {
  const raw = Math.sin(seed) * 43758.5453123;
  return raw - Math.floor(raw);
};

export function computeFoldScoreExtended({
  curvature,
  energy,
  coherence,
  ethics,
  instability,
}: {
  curvature: number;
  energy: number;
  coherence: number;
  ethics: number;
  instability: number;
}) {
  const raw =
    0.25 * curvature +
    0.25 * energy +
    0.2 * coherence +
    0.15 * (coherence * ethics) -
    0.3 * instability;

  return clamp(raw, 0, 1);
}

export function distance(a: [number, number, number], b: [number, number, number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

export function computeFoldCost({
  distance,
  curvature,
  energy,
  coherence,
  instability,
}: {
  distance: number;
  curvature: number;
  energy: number;
  coherence: number;
  instability: number;
}) {
  return distance / (curvature * energy * coherence + 0.001) + instability * 5;
}

export function generateCandidates(target: [number, number, number], n = 24) {
  return Array.from({ length: n }, (_, index) => {
    const seed = target[0] * 12.9898 + target[1] * 78.233 + target[2] * 37.719 + index * 19.19;

    return {
      offset: [
        target[0] + (normalizedHash(seed) - 0.5) * 2,
        target[1] + (normalizedHash(seed + 1.234) - 0.5) * 2,
        target[2] + (normalizedHash(seed + 2.468) - 0.5) * 2,
      ] as [number, number, number],
    };
  });
}
