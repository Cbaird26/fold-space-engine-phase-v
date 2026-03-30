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
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: "0 0 14px " + color + "80" }} />
        <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Georgia', serif" }}>{name}</span>
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
      <div style={{ fontSize: 13, color: P.dim, fontFamily: FONT, fontStyle: "italic", lineHeight: 1.5 }}>{subtitle}</div>
    </div>
  );
}
