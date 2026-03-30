const P = { border: "#222640", text: "#d4d8e8", glow: "#00f0ff" };
const FONT = "'Courier New', 'Lucida Console', monospace";

export function ParameterSweepPanel({ rows }: { rows: Array<{ coherence: number; instability: number; score: number }> }) {
  const bestScore = rows.reduce((max, row) => Math.max(max, row.score), Number.NEGATIVE_INFINITY);

  return (
    <div style={{ border: `1px solid ${P.border}`, borderRadius: 8, padding: 12, background: "#0b0d16", color: P.text, fontFamily: FONT }}>
      <div style={{ marginBottom: 10, color: P.glow, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em" }}>Quick Sweep</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", paddingBottom: 6 }}>Φc</th>
            <th style={{ textAlign: "left", paddingBottom: 6 }}>I</th>
            <th style={{ textAlign: "left", paddingBottom: 6 }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} style={r.score === bestScore ? { background: `${P.glow}12` } : undefined}>
              <td style={{ padding: "4px 6px 4px 0" }}>{r.coherence.toFixed(2)}</td>
              <td>{r.instability.toFixed(2)}</td>
              <td style={{ color: r.score === bestScore ? P.glow : P.text }}>{r.score.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
