import { Brain } from "lucide-react";

interface AnalysisPanelProps {
  analysis: string;
  sentiment: string;
}

export default function AnalysisPanel({ analysis, sentiment }: AnalysisPanelProps) {
  const sentimentColor = 
    sentiment === "bullish" ? "var(--terminal-green)" : 
    sentiment === "bearish" ? "var(--terminal-red)" : 
    "var(--terminal-amber)";

  return (
    <div
      data-testid="analysis-panel"
      className="rounded-lg p-3 h-full flex flex-col"
      style={{ 
        background: "var(--terminal-panel)", 
        border: "1px solid var(--terminal-border)" 
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-3.5 h-3.5" style={{ color: "var(--terminal-cyan)" }} />
        <span className="text-xs font-semibold" style={{ color: "var(--terminal-cyan)" }}>
          TERMINAL ANALYSIS
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs" style={{ color: "var(--terminal-dim)" }}>SENTIMENT</span>
        <span 
          className="text-xs font-semibold px-2 py-0.5 rounded"
          style={{ 
            color: sentimentColor, 
            background: `${sentimentColor}15`,
          }}
        >
          {sentiment.toUpperCase()}
        </span>
      </div>

      <div 
        className="flex-1 text-xs leading-relaxed"
        style={{ color: "hsl(210, 20%, 70%)" }}
      >
        {analysis}
      </div>

      <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--terminal-border)" }}>
        <span className="text-xs" style={{ color: "var(--terminal-dim)", fontSize: "10px" }}>
          Analysis generated from live market data
        </span>
      </div>
    </div>
  );
}
