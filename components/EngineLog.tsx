import type { LoggedRun } from "@/lib/types";

const P = { border: "#222640", text: "#d4d8e8", faint: "#5c6488" };
const FONT = "'Courier New', 'Lucida Console', monospace";

export function EngineLog({ logs }: { logs: LoggedRun[] }) {
  return (
    <div style={{ border: `1px solid ${P.border}`, borderRadius: 8, padding: 12, background: "#0b0d16", color: P.text, fontFamily: FONT }}>
      <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ color: P.faint, textTransform: "uppercase", fontSize: 12, letterSpacing: "0.08em" }}>Engine Log</div>
        <div style={{ color: P.faint, fontSize: 11 }}>{logs.length} recorded run{logs.length === 1 ? "" : "s"}</div>
      </div>
      <div style={{ maxHeight: 250, overflow: "auto", fontSize: 11, lineHeight: 1.6 }}>
        {logs.length === 0 ? (
          <div style={{ color: P.faint }}>No recorded runs yet.</div>
        ) : logs.slice().reverse().map((log, idx) => (
          <div key={idx} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px dashed ${P.border}` }}>
            <div>{log.timestamp} — {log.mode}</div>
            <div>{log.label}</div>
            <div>Future Viability {(log.outputs.foldScore * 100).toFixed(1)}% | {log.outputs.foldClass}</div>
            <div>Experimental Visibility {log.outputs.visibility.toFixed(6)} | Risk {(log.constraints.riskScore * 100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
