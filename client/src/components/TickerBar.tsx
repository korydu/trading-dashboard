interface Quote {
  price: number;
  change: number;
  changePct: number;
}

interface TickerBarProps {
  quotes: Record<string, Quote>;
}

const TICKERS = [
  { symbol: "SPY", label: "S&P 500" },
  { symbol: "QQQ", label: "NASDAQ" },
  { symbol: "VIX", label: "VIX" },
  { symbol: "DXY", label: "DXY" },
  { symbol: "TNX", label: "10Y" },
  { symbol: "XLK", label: "TECH" },
  { symbol: "XLF", label: "FINL" },
  { symbol: "XLE", label: "ENGY" },
  { symbol: "XLV", label: "HLTH" },
  { symbol: "XLI", label: "INDU" },
  { symbol: "XLY", label: "DISC" },
  { symbol: "XLP", label: "STPL" },
  { symbol: "XLU", label: "UTIL" },
  { symbol: "XLB", label: "MATL" },
  { symbol: "XLRE", label: "RLST" },
  { symbol: "XLC", label: "COMM" },
];

export default function TickerBar({ quotes }: TickerBarProps) {
  const items = TICKERS.map(t => {
    const q = quotes[t.symbol];
    if (!q) return null;
    const isUp = q.changePct >= 0;
    const color = t.symbol === "VIX" 
      ? (q.changePct >= 0 ? "var(--terminal-red)" : "var(--terminal-green)") // VIX inverse
      : (isUp ? "var(--terminal-green)" : "var(--terminal-red)");
    const arrow = isUp ? "▲" : "▼";
    return (
      <span key={t.symbol} className="inline-flex items-center gap-2 whitespace-nowrap px-4">
        <span style={{ color: "var(--terminal-dim)" }} className="text-xs">{t.label}</span>
        <span className="text-xs font-semibold" style={{ color: "hsl(210, 20%, 85%)" }}>
          {t.symbol === "TNX" ? q.price.toFixed(2) + "%" : q.price.toFixed(2)}
        </span>
        <span className="text-xs" style={{ color }}>
          {arrow} {Math.abs(q.changePct).toFixed(2)}%
        </span>
      </span>
    );
  }).filter(Boolean);

  return (
    <div className="h-8 overflow-hidden border-b relative"
         style={{ borderColor: "var(--terminal-border)", background: "var(--terminal-surface)" }}
         data-testid="ticker-bar">
      <div className="flex items-center h-full ticker-scroll" style={{ width: "max-content" }}>
        {items}
        {items}
      </div>
    </div>
  );
}
