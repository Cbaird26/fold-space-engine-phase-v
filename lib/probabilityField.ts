export function computeProbabilities<T extends { amp2: number; dE: number }>(futures: T[], eta: number) {
  const scaled = futures.map((f) => eta * f.dE);
  const maxScaled = scaled.reduce((max, value) => Math.max(max, value), Number.NEGATIVE_INFINITY);
  const weights = futures.map((f, index) => f.amp2 * Math.exp(scaled[index] - maxScaled));
  const sum = weights.reduce((a, b) => a + b, 0) || 1;

  return futures.map((f, i) => ({
    ...f,
    p: weights[i] / sum,
  }));
}
