interface ScorePanelProps {
  marketQuality: number;
  executionWindow: number;
}

function ScoreRing({ value, label, size = 130 }: { value: number; label: string; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const offset = circumference - progress;
  
  const getColor = (v: number) => {
    if (v >= 80) return "var(--terminal-green)";
    if (v >= 60) return "var(--terminal-amber)";
    return "var(--terminal-red)";
  };

  const color = getColor(value);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(216, 18%, 14%)"
          strokeWidth="6"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring"
          style={{ 
            transform: "rotate(-90deg)", 
            transformOrigin: "center",
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />
        {/* Center text */}
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize="28"
          fontWeight="700"
          fontFamily="var(--font-mono)"
        >
          {value}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 18}
          textAnchor="middle"
          dominantBaseline="central"
          fill="hsl(210, 10%, 55%)"
          fontSize="9"
          fontFamily="var(--font-mono)"
        >
          / 100
        </text>
      </svg>
      <div className="text-xs mt-1 text-center" style={{ color: "var(--terminal-dim)" }}>{label}</div>
    </div>
  );
}

export default function ScorePanel({ marketQuality, executionWindow }: ScorePanelProps) {
  return (
    <div
      data-testid="score-panel"
      className="rounded-lg p-4 h-full flex items-center justify-around"
      style={{ 
        background: "var(--terminal-panel)", 
        border: "1px solid var(--terminal-border)" 
      }}
    >
      <ScoreRing value={marketQuality} label="MARKET QUALITY" size={140} />
      <div className="w-px h-20" style={{ background: "var(--terminal-border)" }} />
      <ScoreRing value={executionWindow} label="EXECUTION WINDOW" size={140} />
    </div>
  );
}
