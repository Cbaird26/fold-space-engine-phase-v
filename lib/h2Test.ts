export function computeVisibility({
  Gamma,
  T,
  dx,
}: {
  Gamma: number;
  T: number;
  dx: number;
}) {
  return Math.exp(-Gamma * T * dx * dx);
}

export function computeGammaEffective({
  instability,
  coherence,
  aperture,
}: {
  instability: number;
  coherence: number;
  aperture: number;
}) {
  const A = 1.0e9;
  const B = 2.5e8;
  const C = 1.5e8;
  return A * instability + B * (1 - coherence) + C * aperture;
}
