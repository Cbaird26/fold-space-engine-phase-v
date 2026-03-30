const P = { text: "#d4d8e8" };
const FONT = "'Courier New', 'Lucida Console', monospace";

export function GlowBox({ color, children, glow = false }: { color: string; children: React.ReactNode; glow?: boolean }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: color + "0a",
        borderRadius: 7,
        border: "1px solid " + color + "30",
        fontSize: 12,
        color: P.text,
        lineHeight: 1.8,
        fontFamily: FONT,
        position: "relative",
        overflow: "hidden",
        marginTop: 12,
      }}
    >
      {glow && (
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 60,
            height: 60,
            background: "radial-gradient(circle, " + color + "18, transparent)",
            borderRadius: "50%",
          }}
        />
      )}
      {children}
    </div>
  );
}
