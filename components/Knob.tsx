type KnobProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  color?: string;
};

const P = {
  dim: "#8890b0",
  border: "#222640",
};

const FONT = "'Courier New', 'Lucida Console', monospace";

export function Knob({ label, value, onChange, min, max, step = 0.01, color = "#00f0ff" }: KnobProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: FONT, marginBottom: 3 }}>
        <span style={{ color: P.dim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ color, fontWeight: 600 }}>
          {Math.abs(value) < 0.001 && value !== 0 ? value.toExponential(1) : value.toFixed(step < 0.01 ? 4 : 2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: color, height: 4, background: P.border, borderRadius: 2, cursor: "pointer" }}
      />
    </div>
  );
}
