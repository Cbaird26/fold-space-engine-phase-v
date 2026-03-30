const FONT = "'Courier New', 'Lucida Console', monospace";

export function EqBlock({ children, color = "#00f0ff" }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: 13,
        color,
        background: color + "0a",
        padding: "8px 12px",
        borderRadius: 5,
        border: "1px solid " + color + "20",
        marginBottom: 6,
        letterSpacing: "0.01em",
        overflowX: "auto",
      }}
    >
      {children}
    </div>
  );
}
