interface ScoreBreakdownProps {
  scores: {
    volatility: { score: number; weight: number };
    momentum: { score: number; weight: number };
    trend: { score: number; weight: number };
    breadth: { score: number; weight: number };
    macro: { score: number; weight: number };
  };
  total: number;
}

export default function ScoreBreakdown({ scores, total }: ScoreBreakdownProps) {
  const categories = [
    { key: "volatility", label: "VOLATILITY", ...scores.volatility },
    { key: "momentum", label: "MOMENTUM", ...scores.momentum },
    { key: "trend", label: "TREND", ...scores.trend },
    { key: "breadth", label: "BREADTH", ...scores.breadth },
    { key: "macro", label: "MACRO", ...scores.macro },
  ];

  const getColor = (score: number) => {
    if (score >= 70) return "var(--terminal-green)";
    if (score >= 45) return "var(--terminal-amber)";
    return "var(--terminal-red)";
  };

  const totalColor = getColor(total);

  return (
    <div
      data-testid="score-breakdown"
      className="rounded-lg p-3 h-full flex flex-col"
      style={{ 
        background: "var(--terminal-panel)", 
        border: "1px solid var(--terminal-border)" 
      }}
    >
      <div className="text-xs font-semibold mb-3" style={{ color: "var(--terminal-cyan)" }}>
        SCORING BREAKDOWN
      </div>

      <div className="flex-1 space-y-2.5">
        {categories.map(cat => {
          const contribution = Math.round(cat.score * cat.weight / 100);
          const color = getColor(cat.score);
          
          return (
            <div key={cat.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: "hsl(210, 20%, 75%)" }}>{cat.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--terminal-dim)" }}>{cat.weight}%</span>
                  <span className="text-xs font-semibold" style={{ color }}>{cat.score}</span>
                  <span className="text-xs" style={{ color: "var(--terminal-dim)" }}>→ {contribution}</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(216, 18%, 12%)" }}>
                <div className="h-full rounded-full flex">
                  {/* Score fill */}
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.score}%`, background: color, opacity: 0.7 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--terminal-border)" }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: "hsl(210, 20%, 85%)" }}>
            COMPOSITE SCORE
          </span>
          <span className="text-lg font-bold" style={{ color: totalColor }}>{total}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden mt-1" style={{ background: "hsl(216, 18%, 12%)" }}>
          <div 
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${total}%`, background: totalColor }}
          />
        </div>
      </div>
    </div>
  );
}
