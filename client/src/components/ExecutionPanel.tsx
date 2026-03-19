import { Check, X } from "lucide-react";

interface ExecutionPanelProps {
  score: number;
  details: {
    closeInRange: number;
    breakoutsHolding: boolean;
    pullbacksBought: boolean;
    multiDayFollowThrough: boolean;
    leadersHolding: boolean;
  };
}

function CheckItem({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1">
      {value ? (
        <Check className="w-3 h-3 flex-shrink-0" style={{ color: "var(--terminal-green)" }} />
      ) : (
        <X className="w-3 h-3 flex-shrink-0" style={{ color: "var(--terminal-red)" }} />
      )}
      <span className="text-xs" style={{ color: value ? "hsl(210, 20%, 80%)" : "var(--terminal-dim)" }}>
        {label}
      </span>
    </div>
  );
}

export default function ExecutionPanel({ score, details }: ExecutionPanelProps) {
  const color = score >= 60 ? "var(--terminal-green)" : score >= 40 ? "var(--terminal-amber)" : "var(--terminal-red)";

  return (
    <div
      data-testid="execution-panel"
      className="rounded-lg p-4 h-full flex flex-col"
      style={{ 
        background: "var(--terminal-panel)", 
        border: "1px solid var(--terminal-border)" 
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold" style={{ color: "var(--terminal-cyan)" }}>
          EXECUTION WINDOW
        </span>
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
      </div>
      
      <div className="flex-1 space-y-0.5">
        <CheckItem label="Breakouts holding pivot" value={details.breakoutsHolding} />
        <CheckItem label="Pullbacks bought quickly" value={details.pullbacksBought} />
        <CheckItem label="Multi-day follow-through" value={details.multiDayFollowThrough} />
        <CheckItem label="Leaders maintaining gains" value={details.leadersHolding} />
      </div>

      <div className="mt-2">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(216, 18%, 14%)" }}>
          <div 
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${score}%`, background: color }}
          />
        </div>
      </div>
    </div>
  );
}
