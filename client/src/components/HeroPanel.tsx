interface HeroPanelProps {
  decision: "YES" | "CAUTION" | "NO";
  decisionText: string;
  marketQuality: number;
  mode: "swing" | "day";
}

export default function HeroPanel({ decision, decisionText, marketQuality, mode }: HeroPanelProps) {
  const colors = {
    YES: { bg: "rgba(0, 210, 106, 0.12)", border: "rgba(0, 210, 106, 0.3)", text: "var(--terminal-green)", glow: "0 0 30px rgba(0, 210, 106, 0.15)" },
    CAUTION: { bg: "rgba(255, 165, 2, 0.12)", border: "rgba(255, 165, 2, 0.3)", text: "var(--terminal-amber)", glow: "0 0 30px rgba(255, 165, 2, 0.15)" },
    NO: { bg: "rgba(255, 71, 87, 0.12)", border: "rgba(255, 71, 87, 0.3)", text: "var(--terminal-red)", glow: "0 0 30px rgba(255, 71, 87, 0.15)" },
  };

  const c = colors[decision];

  return (
    <div
      data-testid="hero-panel"
      className="rounded-lg p-5 h-full flex flex-col items-center justify-center text-center"
      style={{ 
        background: c.bg, 
        border: `1px solid ${c.border}`,
        boxShadow: c.glow,
      }}
    >
      <div className="text-xs mb-2" style={{ color: "var(--terminal-dim)" }}>
        SHOULD I BE TRADING? — {mode === "swing" ? "SWING" : "DAY"} MODE
      </div>
      
      <div 
        className="text-4xl font-bold tracking-wider mb-2"
        style={{ color: c.text }}
        data-testid="decision-badge"
      >
        {decision}
      </div>

      <div className="text-xs mb-3" style={{ color: c.text, opacity: 0.8 }}>
        {decisionText}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold" style={{ color: c.text }}>
          {marketQuality}
        </span>
        <span className="text-sm" style={{ color: "var(--terminal-dim)" }}>/ 100</span>
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--terminal-dim)" }}>
        MARKET QUALITY SCORE
      </div>
    </div>
  );
}
