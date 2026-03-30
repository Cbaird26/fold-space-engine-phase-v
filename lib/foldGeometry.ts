export function computeFoldAperture(score: number, coherence: number) {
  return score * coherence;
}

export function computeStability(score: number, instability: number) {
  return score * (1 - instability);
}

export function classifyFold(score: number) {
  if (score < 0.3) return "NO FOLD";
  if (score < 0.6) return "LOCAL DISTORTION";
  if (score < 0.85) return "STABLE CORRIDOR";
  return "FULL FOLD";
}
