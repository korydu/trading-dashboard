import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CategoryPanelProps {
  title: string;
  score: number;
  weight: number;
  details: any;
  type: "volatility" | "trend" | "breadth" | "momentum" | "macro";
}

function getInterpretation(score: number): { text: string; color: string } {
  if (score >= 70) return { text: "HEALTHY", color: "var(--terminal-green)" };
  if (score >= 45) return { text: "MIXED", color: "var(--terminal-amber)" };
  return { text: "RISK-OFF", color: "var(--terminal-red)" };
}

function DirectionIcon({ value }: { value: number }) {
  if (value > 0.5) return <TrendingUp className="w-3 h-3" style={{ color: "var(--terminal-green)" }} />;
  if (value < -0.5) return <TrendingDown className="w-3 h-3" style={{ color: "var(--terminal-red)" }} />;
  return <Minus className="w-3 h-3" style={{ color: "var(--terminal-amber)" }} />;
}

function MetricRow({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs" style={{ color: "var(--terminal-dim)" }}>{label}</span>
      <div className="text-right">
        <span className="text-xs font-medium" style={{ color: "hsl(210, 20%, 85%)" }}>{value}</span>
        {subtext && <span className="text-xs ml-1" style={{ color: "var(--terminal-dim)" }}>{subtext}</span>}
      </div>
    </div>
  );
}

function VolatilityDetails({ details }: { details: any }) {
  return (
    <>
      <MetricRow label="VIX" value={details.vix?.toFixed(1)} />
      <MetricRow label="5D SLOPE" value={details.vix5dSlope > 0 ? `+${details.vix5dSlope}` : `${details.vix5dSlope}`} />
      <MetricRow label="1Y %ILE" value={`${details.vixPercentile}%`} />
      <MetricRow label="P/C EST" value={details.putCallEstimate?.toFixed(2)} />
    </>
  );
}

function TrendDetails({ details }: { details: any }) {
  const boolLabel = (v: boolean) => v ? "ABOVE" : "BELOW";
  return (
    <>
      <MetricRow label="SPY" value={`$${details.spyPrice?.toFixed(2)}`} />
      <MetricRow label="vs 20D" value={boolLabel(details.aboveSma20)} />
      <MetricRow label="vs 50D" value={boolLabel(details.aboveSma50)} />
      <MetricRow label="vs 200D" value={boolLabel(details.aboveSma200)} />
      <MetricRow label="RSI(14)" value={details.rsi?.toFixed(1)} />
      <MetricRow label="REGIME" value={details.regime?.toUpperCase()} />
    </>
  );
}

function BreadthDetails({ details }: { details: any }) {
  return (
    <>
      <MetricRow label=">20D MA" value={`${details.pctAbove20d}%`} />
      <MetricRow label=">50D MA" value={`${details.pctAbove50d}%`} />
      <MetricRow label=">200D MA" value={`${details.pctAbove200d}%`} />
      <MetricRow label="A/D RATIO" value={details.adRatio?.toFixed(2)} />
      <MetricRow label="UP SECTORS" value={`${details.positiveCount}/11`} />
    </>
  );
}

function MomentumDetails({ details }: { details: any }) {
  return (
    <>
      <MetricRow label="RS SPREAD" value={`${details.relStrengthSpread?.toFixed(2)}%`} />
      <MetricRow label="VOL RATIO" value={details.volumeRatio?.toFixed(2)} />
      {details.top3?.map((s: any) => (
        <MetricRow key={s.symbol} label={s.symbol} value={`${s.changePct >= 0 ? '+' : ''}${s.changePct?.toFixed(2)}%`} />
      ))}
    </>
  );
}

function MacroDetails({ details }: { details: any }) {
  return (
    <>
      <MetricRow label="10Y YIELD" value={`${details.tnx?.toFixed(2)}%`} />
      <MetricRow label="DXY" value={details.dxy?.toFixed(2)} />
      <MetricRow label="FED" value={details.fedStance?.toUpperCase()} />
      <MetricRow label="FOMC" value={details.fomcSoon ? "IMMINENT" : "CLEAR"} />
    </>
  );
}

export default function CategoryPanel({ title, score, weight, details, type }: CategoryPanelProps) {
  const interp = getInterpretation(score);
  const scoreColor = score >= 70 ? "var(--terminal-green)" : score >= 45 ? "var(--terminal-amber)" : "var(--terminal-red)";

  const renderDetails = () => {
    switch (type) {
      case "volatility": return <VolatilityDetails details={details} />;
      case "trend": return <TrendDetails details={details} />;
      case "breadth": return <BreadthDetails details={details} />;
      case "momentum": return <MomentumDetails details={details} />;
      case "macro": return <MacroDetails details={details} />;
    }
  };

  return (
    <div
      data-testid={`category-${type}`}
      className="rounded-lg p-3 flex flex-col"
      style={{ 
        background: "var(--terminal-panel)", 
        border: "1px solid var(--terminal-border)" 
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: "var(--terminal-cyan)" }}>{title}</span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ 
            background: `${interp.color}15`, 
            color: interp.color,
            fontSize: "10px"
          }}>
            {interp.text}
          </span>
        </div>
        <DirectionIcon value={score - 50} />
      </div>

      {/* Score + Weight */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xl font-bold" style={{ color: scoreColor }}>{score}</span>
        <span className="text-xs" style={{ color: "var(--terminal-dim)" }}>/ 100</span>
        <span className="text-xs ml-auto" style={{ color: "var(--terminal-dim)" }}>{weight}% wt</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: "hsl(216, 18%, 14%)" }}>
        <div 
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: scoreColor }}
        />
      </div>

      {/* Details */}
      <div className="flex-1 space-y-0">
        {renderDetails()}
      </div>
    </div>
  );
}
