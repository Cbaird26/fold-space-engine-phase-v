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
        padding: "18px 20px",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
        boxShadow: "0 28px 60px rgba(0,0,0,0.22)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: "0 0 14px " + color + "80" }} />
        <span style={{ fontSize: 11, color: color, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: FONT, fontWeight: 700 }}>
          Live Public Demo
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
    </div>
  );
}
