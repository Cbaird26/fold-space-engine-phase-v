export function computeProbabilities<T extends { amp2: number; dE: number }>(futures: T[], eta: number) {
  const weights = futures.map((f) => f.amp2 * Math.exp(eta * f.dE));
  const sum = weights.reduce((a, b) => a + b, 0) || 1;

  return futures.map((f, i) => ({
    ...f,
    p: weights[i] / sum,
  }));
}
