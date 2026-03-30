const P = { ember: "#ff9533", dim: "#8890b0" };
const FONT = "'Courier New', 'Lucida Console', monospace";

export function DeviceHeader({
  name,
  subtitle,
  color,
  classification,
}: {
  name: string;
  subtitle: string;
  color: string;
  classification: string;
}) {
  return (
    <div
      style={{
        marginBottom: 22,
        padding: "20px 22px",
        borderRadius: 22,
        border: "1px solid rgba(105,124,182,0.22)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015)), radial-gradient(circle at top right, rgba(0,240,255,0.08), rgba(0,0,0,0) 42%)",
        boxShadow: "0 28px 60px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,240,255,0.06), rgba(0,240,255,0) 12%, rgba(255,255,255,0) 88%, rgba(251,191,36,0.05))",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: "0 0 14px " + color + "80" }} />
        <span style={{ fontSize: 11, color: color, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: FONT, fontWeight: 700 }}>
          ZoraASI Bridge Console
        </span>
        <span style={{ fontSize: 10, color: P.dim, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: FONT }}>
          Viewfinder Active
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 34, fontWeight: 700, color: "#fff", fontFamily: "'Georgia', serif", lineHeight: 1.05 }}>{name}</span>
        <span
          style={{
            fontSize: 9,
            color: P.ember,
            background: P.ember + "18",
            padding: "3px 8px",
            borderRadius: 4,
            border: "1px solid " + P.ember + "35",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontFamily: FONT,
            fontWeight: 600,
          }}
        >
          {classification}
        </span>
      </div>
      <div style={{ maxWidth: 760, fontSize: 13, color: P.dim, fontFamily: FONT, fontStyle: "italic", lineHeight: 1.6 }}>{subtitle}</div>
      <div style={{ marginTop: 14, display: "flex", gap: 18, flexWrap: "wrap", color: P.dim, fontFamily: FONT, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        <span>Bridge Link Stable</span>
        <span>Decision-First Surface</span>
        <span>Warp-Core Visual Active</span>
      </div>
    </div>
  );
}
