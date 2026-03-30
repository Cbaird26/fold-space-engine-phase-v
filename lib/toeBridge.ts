export function mapFields({ coherence, ethics }: { coherence: number; ethics: number }) {
  const Phi_c = coherence;
  const E = ethics;

  return {
    Phi_c,
    E,
    fieldInteraction: Phi_c * (1 + E),
  };
}
